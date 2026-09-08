import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getTarefaDoDia } from '@/lib/schedule';
import { criarEventoCalendario, estaGoogleLigado } from '@/lib/google';
import { enviarLembretePorEmail } from '@/lib/resend';
import type { Starter } from '@/lib/types';

// A Vercel chama isto todos os dias (ver vercel.json) com o header
// Authorization: Bearer <CRON_SECRET> definido nas variáveis de ambiente.
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();
  const hoje = new Date().toISOString().slice(0, 10);

  const { data: starters, error } = await supabase
    .from('massamae_starters')
    .select('*')
    .eq('status', 'ativa');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const googleLigado = await estaGoogleLigado();
  const emailDestino = process.env.REMINDER_EMAIL;
  const resultados: string[] = [];

  for (const starter of (starters ?? []) as Starter[]) {
    const tarefa = getTarefaDoDia({
      dataInicio: starter.data_inicio,
      dataReferencia: hoje,
      storageMode: starter.storage_mode,
      ultimaAlimentacaoEm: starter.ultima_alimentacao_em,
    });

    if (!tarefa) {
      resultados.push(`${starter.nome}: sem tarefa hoje`);
      continue;
    }

    // Evita duplicar se o cron correr mais que uma vez no mesmo dia.
    const { data: existente } = await supabase
      .from('massamae_lembretes')
      .select('id')
      .eq('starter_id', starter.id)
      .eq('data', hoje)
      .maybeSingle();
    if (existente) {
      resultados.push(`${starter.nome}: já processado hoje`);
      continue;
    }

    let googleEventId: string | null = null;
    if (googleLigado) {
      googleEventId = await criarEventoCalendario({
        titulo: tarefa.titulo,
        descricao: tarefa.descricao,
        data: hoje,
      });
    }

    if (emailDestino) {
      await enviarLembretePorEmail({
        paraEmail: emailDestino,
        nomeStarter: starter.nome,
        titulo: tarefa.titulo,
        descricao: tarefa.descricao,
      });
    }

    await supabase.from('massamae_lembretes').insert({
      starter_id: starter.id,
      data: hoje,
      tipo_tarefa: tarefa.tipo,
      google_event_id: googleEventId,
      email_enviado: Boolean(emailDestino),
    });

    resultados.push(`${starter.nome}: ${tarefa.titulo} — evento e/ou email criados`);
  }

  return NextResponse.json({ ok: true, data: hoje, resultados });
}
