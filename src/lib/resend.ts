import { Resend } from 'resend';

export async function enviarLembretePorEmail(params: {
  paraEmail: string;
  nomeStarter: string;
  titulo: string;
  descricao: string;
}) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'Massa Mãe <onboarding@resend.dev>',
    to: params.paraEmail,
    subject: `🍞 ${params.nomeStarter}: ${params.titulo}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="margin-bottom: 4px;">${params.titulo}</h2>
        <p style="color: #555;">${params.nomeStarter}</p>
        <p style="line-height: 1.5;">${params.descricao}</p>
      </div>
    `,
  });
}
