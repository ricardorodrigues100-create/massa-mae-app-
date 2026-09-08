import type { StorageMode } from './schedule';

export interface Starter {
  id: string;
  nome: string;
  data_inicio: string; // YYYY-MM-DD
  storage_mode: StorageMode;
  status: 'ativa' | 'pausada' | 'descartada';
  ultima_alimentacao_em: string | null;
  google_calendar_ligado: boolean;
  criado_em: string;
}
