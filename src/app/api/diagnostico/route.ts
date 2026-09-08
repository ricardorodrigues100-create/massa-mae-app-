import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { diagnosticar, type DiagnosticoRespostas } from '@/lib/diagnostic';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const starterId: string = body.starter_id;
  const respostas: DiagnosticoRespostas = body.respostas;

  if (!starterId || !respostas) {
    return NextResponse.json({ error: 'starter_id e respostas são obrigatórios' }, { status: 400 });
  }

  const resultado = diagnosticar(respostas);

  const supabase = getSupabaseServerClient();
  await supabase.from('massamae_diagnosticos').insert({
    starter_id: starterId,
    respostas,
    estado: resultado.estado,
    recomendacao: resultado.recomendacao,
  });

  // Se o diagnóstico indicar perigo, marca a massa como descartada automaticamente.
  if (resultado.estado === 'perigo') {
    await supabase.from('massamae_starters').update({ status: 'descartada' }).eq('id', starterId);
  }

  return NextResponse.json({ resultado });
}
