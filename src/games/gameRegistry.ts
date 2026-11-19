import { Post, getPillarForPost, stripHtmlTags } from '../utils/blogLogic';

export type GameType =
  | 'western'
  | 'chemistry'
  | 'ocean-paint'
  | 'athletics'
  | 'builder-tetris';

export interface GameConfig {
  gameType: GameType;
  badge: string;
  title: string;
  subtitle: string;
  controlsHint: string;
  articleMission: string;
  accentHex: string;
}

const GAME_CATALOG: Record<GameType, Omit<GameConfig, 'articleMission'>> = {
  western: {
    gameType: 'western',
    badge: 'Arcade SNES · História & Cultura',
    title: 'Bangue-Bangue Faroeste',
    subtitle: 'Use o mouse como pistola e neutralize os bandidos do velho oeste em 3 ondas de ação.',
    controlsHint: 'Mouse mira · Clique atira · R recarrega · P pausa',
    accentHex: '#D97706',
  },
  chemistry: {
    gameType: 'chemistry',
    badge: 'Laboratório Educativo · Ciência & Natureza',
    title: 'Alquimia das Fórmulas',
    subtitle: 'Combine átomos como H + H + O → H₂O para descobrir moléculas reais e curiosidades científicas.',
    controlsHint: 'Clique nos átomos para adicionar · Clique em Sintetizar Fórmula',
    accentHex: '#0EA5E9',
  },
  'ocean-paint': {
    gameType: 'ocean-paint',
    badge: 'Ateliê Interativo · Arte & Curiosidades',
    title: 'Pintura do Oceano Vivo',
    subtitle: 'Pinte a baleia, os peixinhos e os corais com balde de tinta ou pincel e dê vida ao fundo do mar.',
    controlsHint: 'Escolha a cor · Clique para preencher regiões ou pinte livremente',
    accentHex: '#0284C7',
  },
  athletics: {
    gameType: 'athletics',
    badge: 'Pista Olímpica · Saúde & Esporte',
    title: 'Corrida de Superação',
    subtitle: 'Troque de raia, hidrate-se, desvie de obstáculos e ultrapasse os adversários até o 1º lugar.',
    controlsHint: '↑ ↓ ou W S mudam de raia · Espaço dá Turbo · P pausa',
    accentHex: '#10B981',
  },
  'builder-tetris': {
    gameType: 'builder-tetris',
    badge: 'Engenharia Modular · Casa & Construção',
    title: 'Tetris Construtor',
    subtitle: 'Encaixe módulos de tijolos, vidro e concreto para erguer andares completos de casas e prédios.',
    controlsHint: '← → movem · ↑ gira · Espaço cai rápido · C guarda peça',
    accentHex: '#F59E0B',
  },
};

export function getGameCatalogItem(gameType: GameType): Omit<GameConfig, 'articleMission'> {
  return GAME_CATALOG[gameType];
}

export function getAllGameTypes(): GameType[] {
  return ['western', 'chemistry', 'ocean-paint', 'athletics', 'builder-tetris'];
}

/**
 * Deterministic mapper ensuring EVERY article in Achar Temas (all 36 posts)
 * launches the exact mini-game matching its editorial category/theme.
 */
export function getGameTypeForPost(post: Post): GameType {
  // Specific theme overrides inside Cotidiano & Mobilidade (pillar 4)
  if (post.id === 497) return 'chemistry'; // Comidas Típicas do RS (combinar ingredientes/fórmulas)
  if (post.id === 508) return 'ocean-paint'; // Moda Sustentável (design, cores e preservação marinha)
  if (post.id === 554 || post.id === 543 || post.id === 536) return 'athletics'; // Mobilidade / Velocidade

  const pillar = getPillarForPost(post);
  switch (pillar.id) {
    case 'historia-cultura':
      return 'western';
    case 'ciencia-biodiversidade':
      return 'chemistry';
    case 'arte-curiosidades':
      return 'ocean-paint';
    case 'saude-esporte':
      return 'athletics';
    case 'arquitetura-casa':
      return 'builder-tetris';
    default:
      return 'western';
  }
}

export function getGameConfigForPost(post: Post): GameConfig {
  const gameType = getGameTypeForPost(post);
  const base = GAME_CATALOG[gameType];
  const cleanTitle = stripHtmlTags(post.title.rendered);

  const missionPrefix: Record<GameType, string> = {
    western: `Desafio temático inspirado em "${cleanTitle}": defenda a cidade histórica e alcance pontuação máxima!`,
    chemistry: `Experimento conectado ao artigo "${cleanTitle}": descubra moléculas fundamentais combinando os elementos.`,
    'ocean-paint': `Momento criativo inspirado em "${cleanTitle}": solte a imaginação pintando o oceano em cores vibrantes.`,
    athletics: `Treino temático de "${cleanTitle}": controle o ritmo, hidrate-se na pista e conquiste a medalha de ouro.`,
    'builder-tetris': `Obra inspirada em "${cleanTitle}": organize os blocos estruturais e construa um edifício sólido.`,
  };

  return {
    ...base,
    articleMission: missionPrefix[gameType],
  };
}
