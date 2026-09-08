import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { criarEventoCalendario, estaGoogleLigado } from '@/lib/google';
import { getDiaRelativo, getTarefaDoDia } from '@/lib/schedule';

export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('massamae_starters')
    .select('*')
    .order('criado_em', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ starters: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const nome: string = body.nome?.trim() || 'Massa Mãe';
  const dataInicio: string = body.data_inicio;

  if (!dataInicio) {
    return NextResponse.json({ error: 'data_inicio é obrigatória (YYYY-MM-DD)' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data: starter, error } = await supabase
    .from('massamae_starters')
    .insert({ nome, data_inicio: dataInicio })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Se o Google Calendar já estiver ligado, cria já os eventos dos dias 0-7
  // (o resto da manutenção é criado pelo cron diário).
  const ligado = await estaGoogleLigado();
  if (ligado) {
    for (let dia = 0; dia <= 7; dia++) {
      const data = new Date(dataInicio + 'T00:00:00Z');
      data.setUTCDate(data.getUTCDate() + dia);
      const dataISO = data.toISOString().slice(0, 10);

      const tarefa = getTarefaDoDia({
        dataInicio,
        dataReferencia: dataISO,
        storageMode: starter.storage_mode,
        ultimaAlimentacaoEm: null,
      });
      if (!tarefa) continue;

      const eventId = await criarEventoCalendario({
        titulo: tarefa.titulo,
        descricao: tarefa.descricao,
        data: dataISO,
      });

      await supabase.from('massamae_lembretes').upsert(
        {
          starter_id: starter.id,
          data: dataISO,
          tipo_tarefa: tarefa.tipo,
          google_event_id: eventId,
        },
        { onConflict: 'starter_id,data' }
      );
    }
    await supabase.from('massamae_starters').update({ google_calendar_ligado: true }).eq('id', starter.id);
  }

  return NextResponse.json({ starter });
}
