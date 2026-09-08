import { google } from 'googleapis';
import { getSupabaseServerClient } from './supabase';

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI // ex: https://teu-dominio.vercel.app/api/google/callback
  );
}

/** URL para o Ricardo abrir e autorizar a app a aceder ao seu Google Calendar. */
export function getAuthUrl() {
  const client = getOAuthClient();
  return client.generateAuthUrl({
    access_type: 'offline', // necessário para obter refresh_token
    prompt: 'consent', // força devolver sempre o refresh_token
    scope: SCOPES,
  });
}

/** Troca o código devolvido pelo Google por tokens e guarda-os no Supabase. */
export async function guardarTokensAPartirDeCode(code: string) {
  const client = getOAuthClient();
  const { tokens } = await client.getToken(code);

  const supabase = getSupabaseServerClient();
  await supabase.from('massamae_google_tokens').upsert({
    id: 1,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date,
    atualizado_em: new Date().toISOString(),
  });
}

/** Devolve um cliente OAuth já autenticado, renovando o access_token se preciso. */
async function getClienteAutenticado() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('massamae_google_tokens')
    .select('*')
    .eq('id', 1)
    .single();

  if (error || !data?.refresh_token) {
    throw new Error('Google Calendar ainda não está ligado. Liga a conta primeiro em /ligar-google.');
  }

  const client = getOAuthClient();
  client.setCredentials({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expiry_date: data.expiry_date,
  });

  // Se o access_token expirou, a biblioteca renova-o automaticamente no
  // próximo pedido; guardamos o novo token quando isso acontecer.
  client.on('tokens', async (tokens) => {
    await supabase
      .from('massamae_google_tokens')
      .update({
        access_token: tokens.access_token ?? data.access_token,
        expiry_date: tokens.expiry_date ?? data.expiry_date,
        atualizado_em: new Date().toISOString(),
      })
      .eq('id', 1);
  });

  return client;
}

/** Cria um evento de dia inteiro no Google Calendar para a tarefa do dia. */
export async function criarEventoCalendario(params: {
  titulo: string;
  descricao: string;
  data: string; // YYYY-MM-DD
}) {
  const auth = await getClienteAutenticado();
  const calendar = google.calendar({ version: 'v3', auth });

  const amanha = new Date(params.data + 'T00:00:00Z');
  amanha.setUTCDate(amanha.getUTCDate() + 1);
  const dataFim = amanha.toISOString().slice(0, 10);

  const evento = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: `🍞 ${params.titulo}`,
      description: params.descricao,
      start: { date: params.data },
      end: { date: dataFim },
      reminders: {
        useDefault: false,
        overrides: [{ method: 'popup', minutes: 8 * 60 }], // lembrete 8h antes
      },
    },
  });

  return evento.data.id ?? null;
}

export async function estaGoogleLigado() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from('massamae_google_tokens')
    .select('refresh_token')
    .eq('id', 1)
    .maybeSingle();
  return Boolean(data?.refresh_token);
}
