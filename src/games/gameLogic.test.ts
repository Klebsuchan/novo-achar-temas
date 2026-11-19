import test from 'node:test';
import assert from 'node:assert/strict';
import allPostsData from '../data/posts.json';
import { Post } from '../utils/blogLogic';
import { getAllGameTypes, getGameConfigForPost, getGameTypeForPost } from './gameRegistry';
import {
  CHEMICAL_RECIPES,
  TETRIS_COLS,
  TETRIS_ROWS,
  createEmptyBoard,
  evaluateMoleculeMix,
  formatFormulaPreview,
  getBuildingRankLabel,
  isValidPosition,
  lockPieceAndClearLines,
  rotateMatrixCW,
  rankLeaderboardEntries,
  PIECE_SHAPES,
} from './gameLogic';

test('all 36 articles map deterministically to valid editorial mini-games', () => {
  const validTypes = new Set(getAllGameTypes());
  assert.equal(validTypes.size, 5);

  const counts: Record<string, number> = {};
  for (const post of allPostsData as Post[]) {
    const type = getGameTypeForPost(post);
    assert.ok(validTypes.has(type), `Invalid game type ${type} for post ${post.id}`);
    counts[type] = (counts[type] || 0) + 1;

    const cfg = getGameConfigForPost(post);
    assert.ok(cfg.title.length > 3);
    assert.ok(cfg.articleMission.length > 10);
  }

  // Ensure every requested game genre is represented across the blog
  for (const t of validTypes) {
    assert.ok((counts[t] || 0) > 0, `Expected at least 1 post mapped to game ${t}`);
  }

  // Verify pillar spot checks matching user prompt
  const postById = (id: number) => (allPostsData as Post[]).find((p) => p.id === id)!;
  assert.equal(getGameTypeForPost(postById(685)), 'western'); // História & Cultura
  assert.equal(getGameTypeForPost(postById(666)), 'chemistry'); // Ciência & Natureza
  assert.equal(getGameTypeForPost(postById(560)), 'ocean-paint'); // Arte & Curiosidades
  assert.equal(getGameTypeForPost(postById(462)), 'athletics'); // Saúde & Esporte
  assert.equal(getGameTypeForPost(postById(183)), 'builder-tetris'); // Casa & Construção
});

test('chemistry formula engine evaluates H2O, CO2, NaCl and formats subscripts accurately', () => {
  assert.equal(formatFormulaPreview({ H: 2, O: 1 }), 'H₂O');
  const water = evaluateMoleculeMix({ H: 2, O: 1 });
  assert.ok(water);
  assert.equal(water?.formula, 'H₂O');
  assert.equal(water?.name, 'Água Pura');

  const co2 = evaluateMoleculeMix({ C: 1, O: 2 });
  assert.equal(co2?.id, 'co2');

  const nacl = evaluateMoleculeMix({ Na: 1, Cl: 1 });
  assert.equal(nacl?.id, 'salt');

  assert.equal(evaluateMoleculeMix({ H: 5, O: 5 }), null);
  assert.ok(CHEMICAL_RECIPES.length >= 10);
});

test('architectural Tetris engine handles rotation, collision, row clearing, and building rank', () => {
  const board = createEmptyBoard();
  assert.equal(board.length, TETRIS_ROWS);
  assert.equal(board[0].length, TETRIS_COLS);

  const rotatedT = rotateMatrixCW(PIECE_SHAPES.T);
  assert.equal(rotatedT[0][1], 1);
  assert.equal(rotatedT[1][2], 1);

  assert.equal(isValidPosition(board, PIECE_SHAPES.O, 0, 4), true);
  assert.equal(isValidPosition(board, PIECE_SHAPES.O, 0, 9), false);

  for (let c = 0; c < TETRIS_COLS; c++) {
    if (c < 4 || c > 5) {
      board[TETRIS_ROWS - 1][c] = { type: 'I', style: 'concrete' };
    }
  }
  const result = lockPieceAndClearLines(board, {
    type: 'O',
    matrix: PIECE_SHAPES.O,
    row: TETRIS_ROWS - 2,
    col: 4,
  });
  assert.equal(result.clearedLines, 1);
  assert.equal(getBuildingRankLabel(0), 'Fundação em Obras');
  assert.equal(getBuildingRankLabel(6), 'Sobrado Moderno');
  assert.equal(getBuildingRankLabel(20), 'Arranha-Céu Metropolitano');
});

test('rankLeaderboardEntries deduplicates players, ignores negative scores, and sorts descending', () => {
  const ranked = rankLeaderboardEntries(
    [
      { userUid: 'u1', playerName: 'Ana', playerPhotoUrl: '', gameType: 'western', bestScore: 900, updatedAtIso: '2026-01-01' },
      { userUid: 'u1', playerName: 'Ana', playerPhotoUrl: '', gameType: 'western', bestScore: 1500, updatedAtIso: '2026-01-02' },
      { userUid: 'u2', playerName: 'Beto', playerPhotoUrl: '', gameType: 'western', bestScore: 2100, updatedAtIso: '2026-01-02' },
      { userUid: 'u3', playerName: 'Carlos', playerPhotoUrl: '', gameType: 'western', bestScore: -10, updatedAtIso: '2026-01-02' },
    ],
    5
  );
  assert.equal(ranked.length, 2);
  assert.equal(ranked[0].userUid, 'u2');
  assert.equal(ranked[1].userUid, 'u1');
  assert.equal(ranked[1].bestScore, 1500);
});
