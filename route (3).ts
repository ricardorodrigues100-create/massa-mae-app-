import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getDiaRelativo, getTarefaDoDia } from '@/lib/schedule';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
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
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const supabase = getSupabaseServerClient();

  const atualizacoes: Record<string, unknown> = {};
  if (body.storage_mode) atualizacoes.storage_mode = body.storage_mode;
  if (body.status) atualizacoes.status = body.status;
  if (body.marcar_alimentada) {
    atualizacoes.ultima_alimentacao_em = new Date().toISOString().slice(0, 10);
  }

  const { data, error } = await supabase
    .from('massamae_starters')
    .update(atualizacoes)
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ starter: data });
}
