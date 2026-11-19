export type AtomSymbol = 'H' | 'O' | 'C' | 'N' | 'Na' | 'Cl' | 'Fe' | 'Ca';

export interface AtomDefinition {
  symbol: AtomSymbol;
  name: string;
  atomicNumber: number;
  color: string;
  textColor: string;
  groupLabel: string;
}

export const ATOMS_CATALOG: AtomDefinition[] = [
  { symbol: 'H', name: 'Hidrogênio', atomicNumber: 1, color: '#38BDF8', textColor: '#082F49', groupLabel: 'Não-metal' },
  { symbol: 'O', name: 'Oxigênio', atomicNumber: 8, color: '#F43F5E', textColor: '#FFFFFF', groupLabel: 'Calcogênio' },
  { symbol: 'C', name: 'Carbono', atomicNumber: 6, color: '#334155', textColor: '#FFFFFF', groupLabel: 'Orgânico' },
  { symbol: 'N', name: 'Nitrogênio', atomicNumber: 7, color: '#6366F1', textColor: '#FFFFFF', groupLabel: 'Gás Atmosférico' },
  { symbol: 'Na', name: 'Sódio', atomicNumber: 11, color: '#F59E0B', textColor: '#451A03', groupLabel: 'Metal Alcalino' },
  { symbol: 'Cl', name: 'Cloro', atomicNumber: 17, color: '#10B981', textColor: '#022C22', groupLabel: 'Halogênio' },
  { symbol: 'Fe', name: 'Ferro', atomicNumber: 26, color: '#B45309', textColor: '#FFFFFF', groupLabel: 'Metal de Transição' },
  { symbol: 'Ca', name: 'Cálcio', atomicNumber: 20, color: '#94A3B8', textColor: '#0F172A', groupLabel: 'Alcalino Terroso' },
];

export interface ChemicalRecipe {
  id: string;
  formula: string;
  name: string;
  atoms: Partial<Record<AtomSymbol, number>>;
  liquidColor: string;
  fact: string;
  points: number;
}

export const CHEMICAL_RECIPES: ChemicalRecipe[] = [
  {
    id: 'water',
    formula: 'H₂O',
    name: 'Água Pura',
    atoms: { H: 2, O: 1 },
    liquidColor: '#0EA5E9',
    fact: 'Dois átomos de Hidrogênio e um de Oxigênio formam a molécula essencial à vida e que cobre cerca de 71% da Terra.',
    points: 150,
  },
  {
    id: 'co2',
    formula: 'CO₂',
    name: 'Gás Carbônico (Dióxido de Carbono)',
    atoms: { C: 1, O: 2 },
    liquidColor: '#94A3B8',
    fact: 'Formado por 1 Carbono e 2 Oxigênios, é usado pelas plantas na fotossíntese para produzir energia e oxigênio.',
    points: 160,
  },
  {
    id: 'salt',
    formula: 'NaCl',
    name: 'Sal de Cozinha (Cloreto de Sódio)',
    atoms: { Na: 1, Cl: 1 },
    liquidColor: '#E2E8F0',
    fact: 'A união do Sódio reativo com o Cloro forma cristais seguros e indispensáveis ao equilíbrio hídrico humano.',
    points: 150,
  },
  {
    id: 'oxygen',
    formula: 'O₂',
    name: 'Gás Oxigênio',
    atoms: { O: 2 },
    liquidColor: '#38BDF8',
    fact: 'Compõe cerca de 21% da atmosfera terrestre e alimenta a respiração celular de quase todos os seres vivos.',
    points: 120,
  },
  {
    id: 'methane',
    formula: 'CH₄',
    name: 'Metano',
    atoms: { C: 1, H: 4 },
    liquidColor: '#A855F7',
    fact: 'Hidrocarboneto simples (1 Carbono + 4 Hidrogênios), base do gás natural e importante fonte de energia térmica.',
    points: 200,
  },
  {
    id: 'ammonia',
    formula: 'NH₃',
    name: 'Amônia',
    atoms: { N: 1, H: 3 },
    liquidColor: '#2DD4BF',
    fact: 'Composta por 1 Nitrogênio e 3 Hidrogênios, é fundamental na produção agrícola de fertilizantes nitrogenados.',
    points: 180,
  },
  {
    id: 'peroxide',
    formula: 'H₂O₂',
    name: 'Água Oxigenada (Peróxido de Hidrogênio)',
    atoms: { H: 2, O: 2 },
    liquidColor: '#67E8F9',
    fact: 'Um átomo extra de Oxigênio em relação à água transforma a molécula em antisséptico e oxidante efervescente.',
    points: 190,
  },
  {
    id: 'hcl',
    formula: 'HCl',
    name: 'Ácido Clorídrico',
    atoms: { H: 1, Cl: 1 },
    liquidColor: '#84CC16',
    fact: 'Presente naturalmente no suco gástrico do estômago humano para ajudar na digestão de alimentos e eliminar bactérias.',
    points: 160,
  },
  {
    id: 'rust',
    formula: 'Fe₂O₃',
    name: 'Óxido de Ferro (Ferrugem / Hematita)',
    atoms: { Fe: 2, O: 3 },
    liquidColor: '#C2410C',
    fact: 'A oxidação do ferro pelo oxigênio cria esse composto avermelhado — também responsável pela cor do solo de Marte!',
    points: 240,
  },
  {
    id: 'lime',
    formula: 'CaO',
    name: 'Óxido de Cálcio (Cal Virgem)',
    atoms: { Ca: 1, O: 1 },
    liquidColor: '#F8FAFC',
    fact: 'Muito utilizado desde a Antiguidade na preparação de argamassas, tintas minerais e tratamento de solos.',
    points: 150,
  },
  {
    id: 'nitrous',
    formula: 'N₂O',
    name: 'Óxido Nitroso',
    atoms: { N: 2, O: 1 },
    liquidColor: '#818CF8',
    fact: 'Conhecido na medicina e odontologia histórica por propriedades anestésicas suaves.',
    points: 180,
  },
  {
    id: 'co',
    formula: 'CO',
    name: 'Monóxido de Carbono',
    atoms: { C: 1, O: 1 },
    liquidColor: '#64748B',
    fact: 'Surge na combustão incompleta quando há pouco oxigênio disponível; exige ventilação adequada em ambientes fechados.',
    points: 140,
  },
];

const SUBSCRIPT_DIGITS: Record<string, string> = {
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉',
};

export function toSubscript(num: number): string {
  if (num <= 1) return '';
  return String(num)
    .split('')
    .map((ch) => SUBSCRIPT_DIGITS[ch] || ch)
    .join('');
}

export function formatFormulaPreview(atomCounts: Partial<Record<AtomSymbol, number>>): string {
  const order: AtomSymbol[] = ['C', 'H', 'Na', 'Ca', 'Fe', 'N', 'Cl', 'O'];
  const parts: string[] = [];
  for (const sym of order) {
    const count = atomCounts[sym] || 0;
    if (count > 0) {
      parts.push(`${sym}${toSubscript(count)}`);
    }
  }
  return parts.join('') || 'Frasco Vazio';
}

export function evaluateMoleculeMix(
  atomCounts: Partial<Record<AtomSymbol, number>>
): ChemicalRecipe | null {
  const nonZeroKeys = (Object.keys(atomCounts) as AtomSymbol[]).filter(
    (k) => (atomCounts[k] || 0) > 0
  );
  if (nonZeroKeys.length === 0) return null;

  for (const recipe of CHEMICAL_RECIPES) {
    const recipeKeys = Object.keys(recipe.atoms) as AtomSymbol[];
    if (recipeKeys.length !== nonZeroKeys.length) continue;
    const exactMatch = recipeKeys.every((k) => (atomCounts[k] || 0) === (recipe.atoms[k] || 0));
    if (exactMatch) {
      return recipe;
    }
  }
  return null;
}

// ---------- Architectural Tetris Pure Logic ----------

export const TETRIS_COLS = 10;
export const TETRIS_ROWS = 18;

export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export interface ActivePiece {
  type: PieceType;
  matrix: number[][];
  row: number;
  col: number;
}

export interface BuildingCell {
  type: PieceType;
  style: 'concrete' | 'brick' | 'glass' | 'timber' | 'masonry' | 'pillar' | 'balcony';
}

export const PIECE_SHAPES: Record<PieceType, number[][]> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

export const PIECE_STYLES: Record<PieceType, BuildingCell['style']> = {
  I: 'concrete',
  O: 'brick',
  T: 'glass',
  S: 'timber',
  Z: 'masonry',
  J: 'pillar',
  L: 'balcony',
};

export function createEmptyBoard(): (BuildingCell | null)[][] {
  return Array.from({ length: TETRIS_ROWS }, () =>
    Array.from({ length: TETRIS_COLS }, () => null)
  );
}

export function rotateMatrixCW(matrix: number[][]): number[][] {
  const n = matrix.length;
  const result = Array.from({ length: n }, () => Array(n).fill(0));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      result[c][n - 1 - r] = matrix[r][c];
    }
  }
  return result;
}

export function isValidPosition(
  board: (BuildingCell | null)[][],
  matrix: number[][],
  row: number,
  col: number
): boolean {
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (!matrix[r][c]) continue;
      const targetRow = row + r;
      const targetCol = col + c;
      if (targetCol < 0 || targetCol >= TETRIS_COLS || targetRow >= TETRIS_ROWS) {
        return false;
      }
      if (targetRow >= 0 && board[targetRow][targetCol] !== null) {
        return false;
      }
    }
  }
  return true;
}

export function lockPieceAndClearLines(
  board: (BuildingCell | null)[][],
  piece: ActivePiece
): {
  nextBoard: (BuildingCell | null)[][];
  clearedLines: number;
  clearedRowIndices: number[];
} {
  const cloned = board.map((r) => [...r]);
  const style = PIECE_STYLES[piece.type];

  for (let r = 0; r < piece.matrix.length; r++) {
    for (let c = 0; c < piece.matrix[r].length; c++) {
      if (!piece.matrix[r][c]) continue;
      const targetRow = piece.row + r;
      const targetCol = piece.col + c;
      if (targetRow >= 0 && targetRow < TETRIS_ROWS && targetCol >= 0 && targetCol < TETRIS_COLS) {
        cloned[targetRow][targetCol] = { type: piece.type, style };
      }
    }
  }

  const clearedRowIndices: number[] = [];
  const remainingRows: (BuildingCell | null)[][] = [];
  for (let r = 0; r < TETRIS_ROWS; r++) {
    if (cloned[r].every((cell) => cell !== null)) {
      clearedRowIndices.push(r);
    } else {
      remainingRows.push(cloned[r]);
    }
  }

  const clearedLines = clearedRowIndices.length;
  while (remainingRows.length < TETRIS_ROWS) {
    remainingRows.unshift(Array.from({ length: TETRIS_COLS }, () => null));
  }

  return { nextBoard: remainingRows, clearedLines, clearedRowIndices };
}

export function getBuildingRankLabel(floorsBuilt: number): string {
  if (floorsBuilt >= 20) return 'Arranha-Céu Metropolitano';
  if (floorsBuilt >= 12) return 'Edifício Residencial';
  if (floorsBuilt >= 6) return 'Sobrado Moderno';
  if (floorsBuilt >= 2) return 'Casa Térrea';
  return 'Fundação em Obras';
}

export interface LeaderboardEntry {
  userUid: string;
  playerName: string;
  playerPhotoUrl: string;
  gameType: string;
  bestScore: number;
  updatedAtIso: string;
}

export function rankLeaderboardEntries(
  entries: LeaderboardEntry[],
  limit = 10
): LeaderboardEntry[] {
  const bestByUid = new Map<string, LeaderboardEntry>();
  for (const item of entries) {
    if (!item || typeof item.bestScore !== 'number' || item.bestScore < 0) continue;
    const prev = bestByUid.get(item.userUid);
    if (!prev || item.bestScore > prev.bestScore) {
      bestByUid.set(item.userUid, item);
    }
  }
  return Array.from(bestByUid.values())
    .sort((a, b) => b.bestScore - a.bestScore)
    .slice(0, Math.max(1, limit));
}
