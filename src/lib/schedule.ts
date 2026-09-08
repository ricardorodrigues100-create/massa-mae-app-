// Lógica de agendamento da massa mãe: define, para cada dia, qual a tarefa.
// Dias 0-6 (relativos à data de início) são o processo de criação fixo.
// A partir do dia 7, entra-se em modo de manutenção (bancada ou frigorífico).

export type TaskType =
  | 'misturar'
  | 'observar'
  | 'alimentar_criacao'
  | 'verificar_pronta'
  | 'escolher_modo'
  | 'alimentar_manutencao'
  | 'acordar_frigorifico';

export interface StarterTask {
  tipo: TaskType;
  titulo: string;
  descricao: string;
}

export type StorageMode = 'pending' | 'bancada' | 'frigorifico';

const CRIACAO: Record<number, StarterTask> = {
  0: {
    tipo: 'misturar',
    titulo: 'Misturar a massa mãe (Dia 1)',
    descricao:
      'Mistura 50g de farinha integral (centeio ou trigo integral) com 50g de água morna num frasco de vidro. Tapa sem fechar hermeticamente e deixa à temperatura ambiente.',
  },
  1: {
    tipo: 'observar',
    titulo: 'Observar (Dia 2)',
    descricao:
      'Não precisas de alimentar hoje. Verifica se já há pequenas bolhas — se não houver, é normal.',
  },
  2: {
    tipo: 'alimentar_criacao',
    titulo: 'Primeira alimentação (Dia 3)',
    descricao:
      'Deita fora cerca de metade da mistura. Ao que sobrou, junta 50g de farinha e 50g de água morna. Mexe bem.',
  },
  3: {
    tipo: 'alimentar_criacao',
    titulo: 'Alimentar (Dia 4)',
    descricao: 'Repete: descarta metade, junta 50g de farinha e 50g de água. Mexe bem.',
  },
  4: {
    tipo: 'alimentar_criacao',
    titulo: 'Alimentar (Dia 5)',
    descricao:
      'Repete o ciclo. Deves começar a ver a massa a duplicar de volume algumas horas depois de alimentar.',
  },
  5: {
    tipo: 'alimentar_criacao',
    titulo: 'Alimentar (Dia 6)',
    descricao: 'Continua o ciclo diário: descartar metade + alimentar 1:1:1 (massa:farinha:água).',
  },
  6: {
    tipo: 'verificar_pronta',
    titulo: 'Verificar se está pronta (Dia 7)',
    descricao:
      'Faz o teste da flutuação: uma colher pequena de massa num copo de água deve flutuar. Se duplicar de volume em 4-8h após alimentar, está pronta a usar.',
  },
  7: {
    tipo: 'escolher_modo',
    titulo: 'Escolher modo de manutenção',
    descricao:
      'A partir de agora escolhe: manter na bancada (alimentar todos os dias) ou no frigorífico (alimentar uma vez por semana). Define isso na app.',
  },
};

export function getDiaRelativo(dataInicio: string, dataReferencia: string): number {
  const inicio = new Date(dataInicio + 'T00:00:00Z');
  const ref = new Date(dataReferencia + 'T00:00:00Z');
  const diffMs = ref.getTime() - inicio.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Devolve a tarefa do dia para um starter, ou null se não houver nada a fazer
 * nesse dia (ex.: modo frigorífico fora do dia de alimentação).
 */
export function getTarefaDoDia(params: {
  dataInicio: string;
  dataReferencia: string;
  storageMode: StorageMode;
  ultimaAlimentacaoEm: string | null;
}): StarterTask | null {
  const { dataInicio, dataReferencia, storageMode, ultimaAlimentacaoEm } = params;
  const dia = getDiaRelativo(dataInicio, dataReferencia);

  if (dia < 0) return null;
  if (dia <= 7) return CRIACAO[dia] ?? null;

  // Modo manutenção
  if (storageMode === 'bancada') {
    return {
      tipo: 'alimentar_manutencao',
      titulo: 'Alimentar a massa mãe',
      descricao:
        'Descarta metade e alimenta na proporção 1:1:1 (massa:farinha:água). Deixa à temperatura ambiente.',
    };
  }

  if (storageMode === 'frigorifico') {
    if (!ultimaAlimentacaoEm) return null;
    const diasDesde = getDiaRelativo(ultimaAlimentacaoEm, dataReferencia);
    if (diasDesde >= 7) {
      return {
        tipo: 'acordar_frigorifico',
        titulo: 'Alimentar a massa mãe (semanal)',
        descricao:
          'Tira do frigorífico, descarta metade, alimenta 1:1:1 e deixa 1-2h fora antes de voltar a guardar. Se fores usar para pão, faz 1-2 alimentações seguidas fora do frigorífico primeiro.',
      };
    }
    return null;
  }

  // storage_mode ainda não escolhido — repete o lembrete do dia 7
  return CRIACAO[7];
}
