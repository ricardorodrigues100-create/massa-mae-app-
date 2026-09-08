import Link from 'next/link';

export default function LigarGooglePage({
  searchParams,
}: {
  searchParams: { erro?: string };
}) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="text-seca text-sm hover:text-levain">
        ← voltar
      </Link>

      <h1 className="font-display italic text-3xl text-farinha mt-4 mb-4">
        Ligar ao Google Calendar
      </h1>
      <p className="text-farinha/80 leading-relaxed mb-8">
        Ao ligares, a app passa a criar automaticamente um evento no teu
        calendário principal para a tarefa de cada dia — misturar, alimentar,
        verificar. Podes desligar quando quiseres nas definições da tua conta
        Google.
      </p>

      {searchParams.erro && (
        <p className="text-perigo text-sm mb-6">
          Não foi possível ligar ({searchParams.erro}). Tenta outra vez.
        </p>
      )}

      <a
        href="/api/google/connect"
        className="inline-block bg-levain text-crosta font-medium rounded-md px-5 py-2.5 hover:opacity-90"
      >
        Ligar Google Calendar
      </a>
    </main>
  );
}
