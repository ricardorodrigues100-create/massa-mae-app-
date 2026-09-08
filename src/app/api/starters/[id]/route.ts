import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getDiaRelativo, getTarefaDoDia } from '@/lib/schedule';

function mensagemErro(err: unknown) {
  return err instanceof Error ? err.message : 'Erro desconhecido no servidor';
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseServerClient();
    const { data: starter, error } = await supabase
      .from('massamae_starters')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !starter) return NextResponse.json({ error: 'Não encontrada' }, { status: 404 });

    const hoje = new Date().toISOString().slice(0, 10);
    const dia = getDiaRelativo(starter.data_inicio, hoje);
    const tarefaHoje = getTarefaDoDia({
      dataInicio: starter.data_inicio,
      dataReferencia: hoje,
      storageMode: starter.storage_mode,
      ultimaAlimentacaoEm: starter.ultima_alimentacao_em,
    });

    return NextResponse.json({ starter, diaRelativo: dia, tarefaHoje });
  } catch (err) {
    console.error('Erro ao carregar starter:', err);
    return NextResponse.json({ error: mensagemErro(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const supabase = getSupabaseServerClient();

    const atualizacoes: Record<string, unknown> = {};
    if (body.storage_mode) atualizacoes.storage_mode = body.storage_mode;
    if (body.status) atualizacoes.status = body.status;
    if (body.marcar_alimentada) {
      atualizacoes.ultima_alimentacao_em = new Date().toISOString().slice(0, 10);
    }
    if (body.reiniciar) {
      atualizacoes.data_inicio = new Date().toISOString().slice(0, 10);
      atualizacoes.storage_mode = 'pending';
      atualizacoes.ultima_alimentacao_em = null;
      atualizacoes.status = 'ativa';
    }

    const { data, error } = await supabase
      .from('massamae_starters')
      .update(atualizacoes)
      .eq('id', params.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ starter: data });
  } catch (err) {
    console.error('Erro ao atualizar starter:', err);
    return NextResponse.json({ error: mensagemErro(err) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from('massamae_starters').delete().eq('id', params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Erro ao apagar starter:', err);
    return NextResponse.json({ error: mensagemErro(err) }, { status: 500 });
  }
}
