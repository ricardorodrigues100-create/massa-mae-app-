'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { DiagnosticoRespostas, DiagnosticoResultado } from '@/lib/diagnostic';

const PERGUNTAS: {
  chave: keyof DiagnosticoRespostas;
  texto: string;
  opcoes: { valor: string; texto: string }[];
}[] = [
  {
    chave: 'manchasOuPelos',
    texto: 'Vês manchas de cor (rosa, laranja, verde, preto) ou pelos na superfície?',
    opcoes: [
      { valor: 'nao', texto: 'Não' },
      { valor: 'sim', texto: 'Sim' },
    ],
  },
  {
    chave: 'cheiro',
    texto: 'Como está o cheiro?',
    opcoes: [
      { valor: 'agradavel', texto: 'Ácido, tipo iogurte — agradável' },
      { valor: 'forte', texto: 'Muito forte, a álcool ou acetona' },
      { valor: 'mofo', texto: 'A mofo ou podre' },
      { valor: 'nenhum', texto: 'Quase sem cheiro' },
    ],
  },
  {
    chave: 'bolhas',
    texto: 'Há bolhas visíveis?',
    opcoes: [
      { valor: 'muitas', texto: 'Muitas, por toda a massa' },
      { valor: 'poucas', texto: 'Algumas' },
      { valor: 'nenhumas', texto: 'Nenhumas' },
    ],
  },
  {
    chave: 'cresceu',
    texto: 'Cresceu desde a última alimentação?',
    opcoes: [
      { valor: 'duplicou', texto: 'Duplicou de volume ou mais' },
      { valor: 'um_pouco', texto: 'Um pouco' },
      { valor: 'nada', texto: 'Não cresceu' },
    ],
  },
  {
    chave: 'liquidoEscuro',
    texto: 'Há líquido escuro por cima?',
    opcoes: [
      { valor: 'nao', texto: 'Não' },
      { valor: 'sim', texto: 'Sim' },
    ],
  },
  {
    chave: 'diasDesdeAlimentacao',
    texto: 'Há quanto tempo foi a última alimentação?',
    opcoes: [
      { valor: 'hoje_ontem', texto: 'Hoje ou ontem' },
      { valor: '2_3_dias', texto: '2 a 3 dias' },
      { valor: '4_mais_dias', texto: '4 dias ou mais' },
      { valor: 'mais_1_semana', texto: 'Mais de uma semana' },
    ],
  },
];

export default function DiagnosticoPage({ params }: { params: { id: string } }) {
  const [respostas, setRespostas] = useState<Partial<DiagnosticoRespostas>>({});
  const [resultado, setResultado] = useState<DiagnosticoResultado | null>(null);
  const [aEnviar, setAEnviar] = useState(false);

  const completo = PERGUNTAS.every((p) => respostas[p.chave]);

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    if (!completo) return;
    setAEnviar(true);
    const res = await fetch('/api/diagnostico', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ starter_id: params.id, respostas }),
    });
    const { resultado } = await res.json();
    setResultado(resultado);
    setAEnviar(false);
  }

  const corEstado: Record<string, string> = {
    perigo: 'border-perigo/60 text-perigo',
    fome: 'border-levain/60 text-levain',
    fraca: 'border-levain/60 text-levain',
    moderada: 'border-farinha/30 text-farinha',
    otima: 'border-sucesso/60 text-sucesso',
  };

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href={`/massa/${params.id}`} className="text-seca text-sm hover:text-levain">
        ← voltar
      </Link>

      <h1 className="font-display italic text-3xl text-farinha mt-4 mb-10">
        Qual é o estado da tua massa mãe?
      </h1>

      {resultado ? (
        <section className={`border rounded-lg p-6 ${corEstado[resultado.estado]}`}>
          <h2 className="font-display text-2xl mb-2">{resultado.titulo}</h2>
          <p className="text-farinha/80 leading-relaxed mb-5">{resultado.recomendacao}</p>
          <ul className="space-y-2">
            {resultado.passos.map((passo, i) => (
              <li key={i} className="text-farinha/80 text-sm flex gap-2">
                <span className="text-levain">→</span>
                {passo}
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <form onSubmit={submeter} className="space-y-8">
          {PERGUNTAS.map((p) => (
            <fieldset key={p.chave}>
              <legend className="text-farinha mb-3">{p.texto}</legend>
              <div className="flex flex-col gap-2">
                {p.opcoes.map((o) => (
                  <label
                    key={o.valor}
                    className="flex items-center gap-3 border border-farinha/15 rounded-md px-4 py-2.5 cursor-pointer has-[:checked]:border-levain"
                  >
                    <input
                      type="radio"
                      name={p.chave}
                      value={o.valor}
                      checked={respostas[p.chave] === o.valor}
                      onChange={() => setRespostas((r) => ({ ...r, [p.chave]: o.valor }))}
                      className="accent-levain"
                    />
                    <span className="text-farinha/80 text-sm">{o.texto}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}

          <button
            type="submit"
            disabled={!completo || aEnviar}
            className="bg-levain text-crosta font-medium rounded-md px-5 py-2.5 hover:opacity-90 disabled:opacity-40"
          >
            {aEnviar ? 'A analisar…' : 'Ver diagnóstico'}
          </button>
        </form>
      )}
    </main>
  );
}
