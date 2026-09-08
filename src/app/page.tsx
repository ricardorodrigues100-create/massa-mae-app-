'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Starter } from '@/lib/types';

const PASSOS_CRIACAO = [
  { dia: '1', texto: 'Mistura 50g de farinha integral com 50g de água morna. Tapa sem fechar e deixa à temperatura ambiente.' },
  { dia: '2', texto: 'Não alimentes ainda. Só observa — pode não haver nada visível.' },
  { dia: '3–6', texto: 'Todos os dias: descarta metade e alimenta com 50g de farinha + 50g de água.' },
  { dia: '7', texto: 'Testa se flutua em água. Se duplicar de volume em poucas horas, está pronta.' },
];

export default function HomePage() {
  const [starters, setStarters] = useState<Starter[] | null>(null);
  const [nome, setNome] = useState('Massa Mãe');
  const [dataInicio, setDataInicio] = useState(() => new Date().toISOString().slice(0, 10));
  const [aCriar, setACriar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aConfirmarApagar, setAConfirmarApagar] = useState<string | null>(null);

  async function apagar(id: string) {
    await fetch(`/api/starters/${id}`, { method: 'DELETE' });
    setAConfirmarApagar(null);
    setStarters((atual) => atual?.filter((s) => s.id !== id) ?? null);
  }

  useEffect(() => {
    fetch('/api/starters')
      .then((r) => r.json())
      .then((d) => setStarters(d.starters ?? []));
  }, []);

  async function comecar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setACriar(true);
    try {
      const res = await fetch('/api/starters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, data_inicio: dataInicio }),
      });
      const dados = await res.json().catch(() => null);
      if (!res.ok || !dados?.starter?.id) {
        throw new Error(dados?.error || `Falha ao criar (código ${res.status}). Confirma as variáveis de ambiente do Supabase na Vercel.`);
      }
      window.location.href = `/massa/${dados.starter.id}`;
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro desconhecido.');
      setACriar(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <header className="mb-14">
        <p className="text-seca text-sm mb-3">Um diário para a tua fermentação</p>
        <h1 className="font-display italic text-4xl sm:text-5xl leading-tight text-farinha">
          A massa mãe não precisa de talento.
          <br />
          Precisa de rotina.
        </h1>
        <p className="mt-5 text-farinha/80 leading-relaxed max-w-md">
          Farinha, água e sete dias. Esta app trata dos lembretes — no email e no
          teu Google Calendar — para nunca te esqueceres do dia de alimentar.
        </p>
      </header>

      <section className="mb-14">
        <h2 className="font-display text-xl text-farinha mb-4">Os primeiros 7 dias</h2>
        <ol className="space-y-3">
          {PASSOS_CRIACAO.map((p) => (
            <li key={p.dia} className="flex gap-4 text-sm">
              <span className="text-levain font-display italic w-10 shrink-0">{p.dia}</span>
              <span className="text-farinha/80 leading-relaxed">{p.texto}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-14 border border-farinha/15 rounded-lg p-6">
        <h2 className="font-display text-xl text-farinha mb-4">Começar uma nova massa mãe</h2>
        <form onSubmit={comecar} className="space-y-4">
          <div>
            <label className="block text-sm text-seca mb-1" htmlFor="nome">
              Nome
            </label>
            <input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-transparent border border-farinha/25 rounded-md px-3 py-2 text-farinha focus:border-levain"
            />
          </div>
          <div>
            <label className="block text-sm text-seca mb-1" htmlFor="data">
              Data de início
            </label>
            <input
              id="data"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full bg-transparent border border-farinha/25 rounded-md px-3 py-2 text-farinha focus:border-levain"
            />
          </div>
          <button
            type="submit"
            disabled={aCriar}
            className="bg-levain text-crosta font-medium rounded-md px-5 py-2.5 hover:opacity-90 disabled:opacity-50"
          >
            {aCriar ? 'A começar…' : 'Começar'}
          </button>
          {erro && <p className="text-perigo text-sm">{erro}</p>}
        </form>
        <p className="text-xs text-seca mt-4">
          Ainda não ligaste o Google Calendar?{' '}
          <Link href="/ligar-google" className="text-levain underline">
            Liga aqui
          </Link>{' '}
          para os lembretes aparecerem automaticamente lá.
        </p>
      </section>

      {starters && starters.length > 0 && (
        <section>
          <h2 className="font-display text-xl text-farinha mb-4">As tuas massas mãe</h2>
          <ul className="space-y-2">
            {starters.map((s) => (
              <li key={s.id} className="border border-farinha/15 rounded-md hover:border-levain/60 transition-colors">
                {aConfirmarApagar === s.id ? (
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-farinha/80 text-sm">Apagar "{s.nome}" e todo o seu histórico?</span>
                    <div className="flex gap-2 shrink-0 ml-4">
                      <button
                        onClick={() => apagar(s.id)}
                        className="bg-perigo text-farinha text-sm rounded-md px-3 py-1.5 hover:opacity-90"
                      >
                        Apagar
                      </button>
                      <button
                        onClick={() => setAConfirmarApagar(null)}
                        className="border border-farinha/25 text-sm rounded-md px-3 py-1.5 text-farinha hover:border-levain"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-4 py-3">
                    <Link href={`/massa/${s.id}`} className="flex-1 flex items-center justify-between">
                      <span className="text-farinha">{s.nome}</span>
                      <span className="text-seca text-sm mr-4">
                        desde {new Date(s.data_inicio + 'T00:00:00').toLocaleDateString('pt-PT')}
                      </span>
                    </Link>
                    <button
                      onClick={() => setAConfirmarApagar(s.id)}
                      className="text-seca text-sm hover:text-perigo shrink-0"
                      aria-label={`Apagar ${s.nome}`}
                    >
                      Apagar
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
