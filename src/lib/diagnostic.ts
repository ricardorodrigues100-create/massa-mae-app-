// Motor de decisão do questionário de diagnóstico.
// Recebe respostas codificadas e devolve um estado + recomendação em português.

export interface DiagnosticoRespostas {
  manchasOuPelos: 'sim' | 'nao';
  cheiro: 'agradavel' | 'forte' | 'mofo' | 'nenhum';
  bolhas: 'muitas' | 'poucas' | 'nenhumas';
  cresceu: 'duplicou' | 'um_pouco' | 'nada';
  liquidoEscuro: 'sim' | 'nao';
  diasDesdeAlimentacao: 'hoje_ontem' | '2_3_dias' | '4_mais_dias' | 'mais_1_semana';
}

export type EstadoMassa = 'perigo' | 'fome' | 'fraca' | 'moderada' | 'otima';

export interface DiagnosticoResultado {
  estado: EstadoMassa;
  titulo: string;
  recomendacao: string;
  passos: string[];
}

export function diagnosticar(respostas: DiagnosticoRespostas): DiagnosticoResultado {
  // 1. Sinais de perigo têm sempre prioridade — mofo/pelos ou cheiro a podre.
  if (respostas.manchasOuPelos === 'sim' || respostas.cheiro === 'mofo') {
    return {
      estado: 'perigo',
      titulo: 'Deve ser descartada',
      recomendacao:
        'Manchas de cor (rosa, laranja, verde ou preto), pelos, ou cheiro a mofo/podre são sinais de contaminação — não é seguro tentar salvar. É melhor deitar fora e começar uma nova.',
      passos: [
        'Deita fora toda a massa e lava bem o frasco com água quente.',
        'Começa uma nova massa mãe do zero.',
      ],
    };
  }

  // 2. Muito enfraquecida: sem atividade há mais de uma semana.
  if (
    respostas.diasDesdeAlimentacao === 'mais_1_semana' &&
    respostas.bolhas === 'nenhumas' &&
    respostas.cresceu === 'nada'
  ) {
    return {
      estado: 'fraca',
      titulo: 'Muito enfraquecida, mas recuperável',
      recomendacao:
        'Passou muito tempo sem alimentação e não há sinais de atividade. Ainda é normalmente recuperável com alimentações seguidas.',
      passos: [
        'Descarta a maior parte (fica só com 1-2 colheres de sopa).',
        'Alimenta 1:1:1 duas vezes por dia durante 2-3 dias.',
        'Deixa num sítio mais quente de casa, se possível.',
        'Volta a fazer este diagnóstico depois das primeiras alimentações.',
      ],
    };
  }

  // 3. Está com fome: hooch ou cheiro forte a álcool/acetona, mas sem sinais de perigo.
  if (respostas.liquidoEscuro === 'sim' || respostas.cheiro === 'forte') {
    return {
      estado: 'fome',
      titulo: 'Está com fome',
      recomendacao:
        'Líquido escuro por cima ou cheiro forte a álcool/acetona são só sinal de fome, não de problema. Alimenta e volta ao ritmo habitual.',
      passos: [
        'Mistura ou escorre o líquido escuro por cima.',
        'Descarta metade e alimenta 1:1:1.',
        'Da próxima vez, tenta alimentar um pouco mais cedo.',
      ],
    };
  }

  // 4. Ótimo estado.
  if (respostas.bolhas === 'muitas' && respostas.cresceu === 'duplicou') {
    return {
      estado: 'otima',
      titulo: 'Em ótimo estado',
      recomendacao: 'Bolhas por toda a massa e duplicou de volume — está ativa e pronta a usar.',
      passos: [
        'Podes usá-la agora para fazer pão (teste da flutuação para confirmar).',
        'Se não fores usar já, continua a rotina normal de alimentação.',
      ],
    };
  }

  // 5. Estado moderado — nem em perigo, nem ótima.
  return {
    estado: 'moderada',
    titulo: 'Estável, mas ainda a ganhar força',
    recomendacao:
      'Não há sinais de problema, mas a atividade ainda está abaixo do ideal. É normal, especialmente em dias mais frios.',
    passos: [
      'Alimenta no horário habitual, 1:1:1.',
      'Se puder, deixa num sítio ligeiramente mais quente (perto de 24-27ºC é o ideal).',
      'Volta a verificar depois da próxima alimentação.',
    ],
  };
}
