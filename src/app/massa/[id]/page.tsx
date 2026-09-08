'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import type { Starter } from '@/lib/types';
import type { StarterTask } from '@/lib/schedule';

interface Resposta {
  starter: Starter;
  diaRelativo: number;
  tarefaHoje: StarterTask | null;
}

export default function MassaPage({ params }: { params: { id: string } }) {
  const [dados, setDados] = useState<Resposta | null>(null);
  const [aGuardar, setAGuardar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aConfirmarReinicio, setAConfirmarReinicio] = useState(false);

  const carregar = useCallback(async () => {
    const res = await fetch(`/api/starters/${params.id}`);
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.starter) {
      setErro(json?.error || 'Não foi possível carregar esta massa mãe.');
      return;
    }
    setErro(null);
    setDados(json);
  }, [params.id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function atualizar(body: Record<string, unknown>) {
    setErro(null);
    setAGuardar(true);
    try {
      const res = await fetch(`/api/starters/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || `Falha ao guardar (código ${res.status}).`);
      await carregar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro desconhecido.');
    } finally {
      setAGuardar(false);
    }
  }

  if (!dados?.starter) {
    return <main className="mx-auto max-w-2xl px-6 py-16 text-farinha">A carregar…</main>;
  }

  const { starter, diaRelativo, tarefaHoje } = dados;
  const emCriacao = diaRelativo <= 6;
  const precisaEscolherModo = diaRelativo >= 7 && starter.storage_mode === 'pending';
  const hoje = new Date().toISOString().slice(0, 10);
  const jaFeitoHoje = starter.ultima_alimentacao_em === hoje;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="text-seca text-sm hover:text-levain">
        ← todas as massas
      </Link>

      <header className="mt-4 mb-10">
        <p className="text-seca text-sm mb-2">
          {emCriacao ? `Dia ${diaRelativo + 1} de 7 — criação` : 'Em manutenção'}
        </p>
        <h1 className="font-display italic text-4xl text-farinha">{starter.nome}</h1>
      </header>

      {emCriacao && (
        <div className="flex gap-2 mb-10">
          {[0, 1, 2, 3, 4, 5, 6].map((d) => (
            <span
              key={d}
              className={`h-1.5 flex-1 rounded-full ${
                d <= diaRelativo ? 'bg-levain' : 'bg-farinha/15'
              }`}
            />
          ))}
        </div>
      )}

      {tarefaHoje ? (
        <section className="border border-levain/40 rounded-lg p-6 mb-8">
          <h2 className="font-display text-2xl text-farinha mb-2">{tarefaHoje.titulo}</h2>
          <p className="text-farinha/80 leading-relaxed mb-5">{tarefaHoje.descricao}</p>
          {jaFeitoHoje ? (
            <p className="text-sucesso text-sm flex items-center gap-2">
              <span>✓</span> Já marcaste isto como feito hoje. Volta amanhã.
            </p>
          ) : (
            <button
              onClick={() => atualizar({ marcar_alimentada: true })}
              disabled={aGuardar}
              className="bg-levain text-crosta font-medium rounded-md px-5 py-2.5 hover:opacity-90 disabled:opacity-50"
            >
              {aGuardar ? 'A guardar…' : 'Feito por hoje'}
            </button>
          )}
          {erro && <p className="text-perigo text-sm mt-3">{erro}</p>}
        </section>
      ) : (
        <p className="text-seca mb-8">Sem nada a fazer hoje.</p>
      )}

      {precisaEscolherModo && (
        <section className="border border-farinha/15 rounded-lg p-6 mb-8">
          <h2 className="font-display text-xl text-farinha mb-2">Como vais guardar a partir de agora?</h2>
          <p className="text-farinha/70 text-sm mb-4">
            Bancada: alimentar todos os dias. Frigorífico: alimentar uma vez por semana.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => atualizar({ storage_mode: 'bancada' })}
              className="border border-farinha/25 rounded-md px-4 py-2 text-farinha hover:border-levain"
            >
              Bancada
            </button>
            <button
              onClick={() => atualizar({ storage_mode: 'frigorifico' })}
              className="border border-farinha/25 rounded-md px-4 py-2 text-farinha hover:border-levain"
            >
              Frigorífico
            </button>
          </div>
        </section>
      )}

      <Link
        href={`/diagnostico/${starter.id}`}
        className="block border border-farinha/15 rounded-lg p-6 hover:border-levain/60 transition-colors mb-8"
      >
        <h2 className="font-display text-xl text-farinha mb-1">Não sei em que estado está</h2>
        <p className="text-farinha/70 text-sm">
          Responde a algumas perguntas sobre o aspeto, cheiro e atividade — dizemos-te o que fazer.
        </p>
      </Link>

      <section className="border border-perigo/30 rounded-lg p-6">
        {aConfirmarReinicio ? (
          <>
            <p className="text-farinha mb-4">
              Isto reinicia a contagem a partir de hoje (volta ao Dia 1). O histórico desta massa mãe
              não é apagado, só recomeça o processo de criação.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setAConfirmarReinicio(false);
                  atualizar({ reiniciar: true });
                }}
                disabled={aGuardar}
                className="bg-perigo text-farinha font-medium rounded-md px-4 py-2 hover:opacity-90 disabled:opacity-50"
              >
                Sim, recomeçar
              </button>
              <button
                onClick={() => setAConfirmarReinicio(false)}
                className="border border-farinha/25 rounded-md px-4 py-2 text-farinha hover:border-levain"
              >
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={() => setAConfirmarReinicio(true)}
            className="text-seca text-sm hover:text-perigo underline"
          >
            Estraguei a massa mãe — recomeçar do zero
          </button>
        )}
      </section>
    </main>
  );
}
