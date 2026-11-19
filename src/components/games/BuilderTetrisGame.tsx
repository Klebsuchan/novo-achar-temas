import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  RotateCw,
  Building2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  ActivePiece,
  BuildingCell,
  PIECE_SHAPES,
  PieceType,
  TETRIS_COLS,
  TETRIS_ROWS,
  createEmptyBoard,
  getBuildingRankLabel,
  isValidPosition,
  lockPieceAndClearLines,
  rotateMatrixCW,
} from '../../games/gameLogic';
import { gameSfx } from '../../games/soundEffects';

type GamePhase = 'title' | 'playing' | 'paused' | 'gameover';

const CELL_SIZE = 24;
const BOARD_W = TETRIS_COLS * CELL_SIZE; // 240
const BOARD_H = TETRIS_ROWS * CELL_SIZE; // 432
const PIECE_TYPES: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

function randomPieceType(): PieceType {
  return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
}

function createPiece(type: PieceType): ActivePiece {
  const matrix = PIECE_SHAPES[type].map((r) => [...r]);
  const col = Math.floor((TETRIS_COLS - matrix[0].length) / 2);
  return { type, matrix, row: 0, col };
}

function drawArchitecturalCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  style: BuildingCell['style'],
  isGhost = false
) {
  if (isGhost) {
    ctx.strokeStyle = 'rgba(245, 183, 49, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
    return;
  }

  const palette: Record<BuildingCell['style'], { fill: string; trim: string; window: string }> = {
    concrete: { fill: '#64748B', trim: '#94A3B8', window: '#E2E8F0' },
    brick: { fill: '#B45309', trim: '#D97706', window: '#FEF3C7' },
    glass: { fill: '#0284C7', trim: '#38BDF8', window: '#BAE6FD' },
    timber: { fill: '#15803D', trim: '#22C55E', window: '#DCFCE7' },
    masonry: { fill: '#D97706', trim: '#F59E0B', window: '#FFFBEB' },
    pillar: { fill: '#4338CA', trim: '#6366F1', window: '#E0E7FF' },
    balcony: { fill: '#DC2626', trim: '#F87171', window: '#FEE2E2' },
  };
  const colors = palette[style];

  ctx.fillStyle = colors.fill;
  ctx.fillRect(x + 1, y + 1, size - 2, size - 2);

  // Structural trim top edge
  ctx.fillStyle = colors.trim;
  ctx.fillRect(x + 1, y + 1, size - 2, 4);

  // Lit building window panes inside each architectural block
  ctx.fillStyle = colors.window;
  ctx.fillRect(x + 5, y + 8, 5, 6);
  ctx.fillRect(x + size - 10, y + 8, 5, 6);
  ctx.fillRect(x + 5, y + 16, size - 10, 3);
}

export default function BuilderTetrisGame({ articleTitle }: { articleTitle: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [phase, setPhase] = useState<GamePhase>('title');
  const [score, setScore] = useState(0);
  const [floors, setFloors] = useState(0);
  const [level, setLevel] = useState(1);
  const [nextType, setNextType] = useState<PieceType>('T');
  const [holdType, setHoldType] = useState<PieceType | null>(null);
  const [muted, setMuted] = useState(false);

  const phaseRef = useRef<GamePhase>('title');
  const boardRef = useRef<(BuildingCell | null)[][]>(createEmptyBoard());
  const activeRef = useRef<ActivePiece>(createPiece('T'));
  const nextTypeRef = useRef<PieceType>('O');
  const holdTypeRef = useRef<PieceType | null>(null);
  const canHoldRef = useRef(true);
  const dropTimerRef = useRef(0);
  const levelRef = useRef(1);
  const floorsRef = useRef(0);
  const scoreRef = useRef(0);

  useEffect(() => {
    phaseRef.current = phase;
    document.body.dataset.state = phase;
    return () => {
      delete document.body.dataset.state;
    };
  }, [phase]);

  const spawnNextPiece = useCallback(() => {
    const incoming = createPiece(nextTypeRef.current);
    const upcoming = randomPieceType();
    nextTypeRef.current = upcoming;
    setNextType(upcoming);
    canHoldRef.current = true;

    if (!isValidPosition(boardRef.current, incoming.matrix, incoming.row, incoming.col)) {
      setPhase('gameover');
      gameSfx.playDamage();
      return;
    }
    activeRef.current = incoming;
  }, []);

  const startGame = useCallback(() => {
    boardRef.current = createEmptyBoard();
    const first = randomPieceType();
    const upcoming = randomPieceType();
    activeRef.current = createPiece(first);
    nextTypeRef.current = upcoming;
    holdTypeRef.current = null;
    canHoldRef.current = true;
    dropTimerRef.current = 0;
    levelRef.current = 1;
    floorsRef.current = 0;
    scoreRef.current = 0;

    setNextType(upcoming);
    setHoldType(null);
    setLevel(1);
    setFloors(0);
    setScore(0);
    setPhase('playing');
    gameSfx.playPop(540);
  }, []);

  const moveHorizontal = useCallback((dx: number) => {
    if (phaseRef.current !== 'playing') return;
    const p = activeRef.current;
    if (isValidPosition(boardRef.current, p.matrix, p.row, p.col + dx)) {
      p.col += dx;
      gameSfx.playPop(360);
    }
  }, []);

  const rotatePiece = useCallback(() => {
    if (phaseRef.current !== 'playing') return;
    const p = activeRef.current;
    const rotated = rotateMatrixCW(p.matrix);
    // Wall kick offsets [0, -1, 1, -2, 2]
    for (const kick of [0, -1, 1, -2, 2]) {
      if (isValidPosition(boardRef.current, rotated, p.row, p.col + kick)) {
        p.matrix = rotated;
        p.col += kick;
        gameSfx.playPop(500);
        return;
      }
    }
  }, []);

  const stepDown = useCallback(
    (isHardDrop = false) => {
      if (phaseRef.current !== 'playing') return;
      const p = activeRef.current;

      if (isHardDrop) {
        while (isValidPosition(boardRef.current, p.matrix, p.row + 1, p.col)) {
          p.row += 1;
          scoreRef.current += 2;
        }
      } else if (isValidPosition(boardRef.current, p.matrix, p.row + 1, p.col)) {
        p.row += 1;
        return;
      }

      // Lock piece & construct floors
      const { nextBoard, clearedLines } = lockPieceAndClearLines(boardRef.current, p);
      boardRef.current = nextBoard;

      if (clearedLines > 0) {
        const bonusTable = [0, 120, 300, 500, 800];
        floorsRef.current += clearedLines;
        scoreRef.current += (bonusTable[clearedLines] || 800) * levelRef.current;
        levelRef.current = 1 + Math.floor(floorsRef.current / 4);
        setFloors(floorsRef.current);
        setLevel(levelRef.current);
        gameSfx.playSuccess();
      } else {
        scoreRef.current += 15;
        gameSfx.playPop(240);
      }
      setScore(scoreRef.current);
      spawnNextPiece();
    },
    [spawnNextPiece]
  );

  const holdCurrentPiece = useCallback(() => {
    if (phaseRef.current !== 'playing' || !canHoldRef.current) return;
    const currentType = activeRef.current.type;
    if (holdTypeRef.current) {
      const swapped = createPiece(holdTypeRef.current);
      holdTypeRef.current = currentType;
      activeRef.current = swapped;
    } else {
      holdTypeRef.current = currentType;
      spawnNextPiece();
    }
    canHoldRef.current = false;
    setHoldType(holdTypeRef.current);
    gameSfx.playPop(420);
  }, [spawnNextPiece]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (phaseRef.current !== 'playing') {
        if ((e.key === 'p' || e.key === 'P') && phaseRef.current === 'paused') {
          setPhase('playing');
        }
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        moveHorizontal(-1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        moveHorizontal(1);
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        rotatePiece();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        stepDown(false);
      } else if (e.key === ' ') {
        e.preventDefault();
        stepDown(true);
      } else if (e.key === 'c' || e.key === 'C') {
        holdCurrentPiece();
      } else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        setPhase('paused');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [moveHorizontal, rotatePiece, stepDown, holdCurrentPiece]);

  useEffect(() => {
    let rafId = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (phaseRef.current === 'playing') {
        const dropInterval = Math.max(0.16, 0.72 - (levelRef.current - 1) * 0.07);
        dropTimerRef.current += dt;
        if (dropTimerRef.current >= dropInterval) {
          dropTimerRef.current = 0;
          stepDown(false);
        }
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#081224';
          ctx.fillRect(0, 0, BOARD_W, BOARD_H);

          // Blueprint construction grid lines
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
          ctx.lineWidth = 1;
          for (let c = 0; c <= TETRIS_COLS; c++) {
            ctx.beginPath();
            ctx.moveTo(c * CELL_SIZE, 0);
            ctx.lineTo(c * CELL_SIZE, BOARD_H);
            ctx.stroke();
          }
          for (let r = 0; r <= TETRIS_ROWS; r++) {
            ctx.beginPath();
            ctx.moveTo(0, r * CELL_SIZE);
            ctx.lineTo(BOARD_W, r * CELL_SIZE);
            ctx.stroke();
          }

          // Locked architectural blocks
          const board = boardRef.current;
          for (let r = 0; r < TETRIS_ROWS; r++) {
            for (let c = 0; c < TETRIS_COLS; c++) {
              const cell = board[r][c];
              if (cell) {
                drawArchitecturalCell(ctx, c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, cell.style);
              }
            }
          }

          // Ghost drop preview & Active Piece
          if (phaseRef.current !== 'title') {
            const p = activeRef.current;
            let ghostRow = p.row;
            while (isValidPosition(board, p.matrix, ghostRow + 1, p.col)) {
              ghostRow++;
            }

            const styleMap: Record<PieceType, BuildingCell['style']> = {
              I: 'concrete',
              O: 'brick',
              T: 'glass',
              S: 'timber',
              Z: 'masonry',
              J: 'pillar',
              L: 'balcony',
            };

            for (let r = 0; r < p.matrix.length; r++) {
              for (let c = 0; c < p.matrix[r].length; c++) {
                if (!p.matrix[r][c]) continue;
                drawArchitecturalCell(
                  ctx,
                  (p.col + c) * CELL_SIZE,
                  (ghostRow + r) * CELL_SIZE,
                  CELL_SIZE,
                  styleMap[p.type],
                  true
                );
                drawArchitecturalCell(
                  ctx,
                  (p.col + c) * CELL_SIZE,
                  (p.row + r) * CELL_SIZE,
                  CELL_SIZE,
                  styleMap[p.type]
                );
              }
            }
          }
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [stepDown]);

  const rankLabel = getBuildingRankLabel(floors);

  return (
    <div className="select-none bg-white dark:bg-[#050C18]">
      {/* Top Construction HUD */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#081224] text-[#F4F0E6] border-b border-[#1B3358] text-[11px] sm:text-xs font-mono">
        <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-2.5 sm:gap-x-4 gap-y-1">
          <span>
            PONTOS: <strong className="text-[#F5B731] text-xs sm:text-sm tabular-nums">{score}</strong>
          </span>
          <span>
            ANDARES: <strong className="text-sky-400">{floors}</strong>
          </span>
          <span>
            OBRA: <strong className="text-emerald-400">{rankLabel}</strong>
          </span>
          <span>
            NÍVEL: <strong>{level}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {phase === 'playing' && (
            <button
              type="button"
              onClick={() => setPhase('paused')}
              aria-label="Pausar obra"
              className="p-2 sm:p-1.5 rounded-xl md:rounded-sm bg-[#1B3358] hover:bg-[#27477A] text-white cursor-pointer"
            >
              <Pause size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              const next = !muted;
              setMuted(next);
              gameSfx.muted = next;
            }}
            aria-label={muted ? 'Ativar som' : 'Silenciar som'}
            className="p-2 sm:p-1.5 rounded-xl md:rounded-sm bg-[#1B3358] hover:bg-[#27477A] text-white cursor-pointer"
          >
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>
      </div>

      {/* Main Playfield + Blueprint Info Panel */}
      <div className="relative p-3 sm:p-6 flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6">
        <div className="relative border-2 border-[#1B3358] rounded-2xl md:rounded-sm overflow-hidden bg-[#081224] shrink-0">
          <canvas ref={canvasRef} width={BOARD_W} height={BOARD_H} className="block w-[216px] sm:w-[240px] h-auto" />

          {phase === 'title' && (
            <div className="absolute inset-0 bg-[#081224]/90 flex flex-col items-center justify-center p-4 text-center text-[#F4F0E6]">
              <Building2 size={24} className="text-[#F5B731] mb-2" />
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#F5B731] mb-1 max-w-full truncate">
                {articleTitle}
              </div>
              <h4 className="font-display font-black text-lg sm:text-xl uppercase text-white mb-2">
                Tetris Construtor
              </h4>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Complete fileiras horizontais de tijolos, concreto e janelas para erguer prédios!
              </p>
              <button
                type="button"
                data-start="true"
                onClick={startGame}
                className="min-h-[44px] px-5 py-2.5 rounded-xl md:rounded-sm bg-[#F5B731] hover:bg-[#E09F1F] text-[#081224] font-display font-black text-xs uppercase tracking-wider cursor-pointer inline-flex items-center gap-1.5"
              >
                <Play size={14} />
                <span>Iniciar Obra</span>
              </button>
            </div>
          )}

          {phase === 'paused' && (
            <div className="absolute inset-0 bg-[#081224]/88 flex flex-col items-center justify-center p-4 text-center text-white">
              <h4 className="font-display font-black text-xl uppercase mb-3">Obra Pausada</h4>
              <button
                type="button"
                onClick={() => setPhase('playing')}
                className="min-h-[44px] px-5 py-2.5 rounded-xl md:rounded-sm bg-[#F5B731] text-[#081224] font-display font-extrabold text-xs uppercase cursor-pointer"
              >
                Retomar
              </button>
            </div>
          )}

          {phase === 'gameover' && (
            <div className="absolute inset-0 bg-[#081224]/92 flex flex-col items-center justify-center p-4 text-center text-white">
              <div className="text-[11px] font-mono uppercase text-[#F5B731] mb-1">
                Obra Concluída
              </div>
              <h4 className="font-display font-black text-xl uppercase mb-2">{rankLabel}</h4>
              <p className="text-xs text-slate-300 mb-4">
                {floors} andares construídos · <strong className="text-[#F5B731]">{score} pts</strong>
              </p>
              <button
                type="button"
                onClick={startGame}
                className="min-h-[44px] px-5 py-2.5 rounded-xl md:rounded-sm bg-[#F5B731] text-[#081224] font-display font-black text-xs uppercase tracking-wider cursor-pointer inline-flex items-center gap-1.5"
              >
                <RotateCcw size={14} />
                <span>Construir de Novo</span>
              </button>
            </div>
          )}
        </div>

        {/* Architectural Blueprint & Touch Controls */}
        <div className="w-full max-w-xs space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl md:rounded-sm bg-[#F4F1E8] dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358]">
              <div className="text-[10px] font-mono uppercase text-stone-500 dark:text-slate-400 mb-1.5">
                Próximo Módulo
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-display font-black text-base text-[#081224] dark:text-[#F5B731]">
                  {nextType}
                </span>
                <div
                  className="grid gap-0.5"
                  style={{
                    gridTemplateColumns: `repeat(${PIECE_SHAPES[nextType][0].length}, 10px)`,
                  }}
                >
                  {PIECE_SHAPES[nextType].flatMap((row, ri) =>
                    row.map((val, ci) => (
                      <div
                        key={`${ri}-${ci}`}
                        className={`w-2.5 h-2.5 rounded-[1px] ${
                          val ? 'bg-[#D97706] dark:bg-[#F5B731]' : 'bg-transparent'
                        }`}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="p-3 rounded-2xl md:rounded-sm bg-[#F4F1E8] dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358]">
              <div className="text-[10px] font-mono uppercase text-stone-500 dark:text-slate-400 mb-1.5">
                Reserva (C)
              </div>
              {holdType ? (
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display font-black text-base text-[#081224] dark:text-sky-400">
                    {holdType}
                  </span>
                  <div
                    className="grid gap-0.5"
                    style={{
                      gridTemplateColumns: `repeat(${PIECE_SHAPES[holdType][0].length}, 10px)`,
                    }}
                  >
                    {PIECE_SHAPES[holdType].flatMap((row, ri) =>
                      row.map((val, ci) => (
                        <div
                          key={`${ri}-${ci}`}
                          className={`w-2.5 h-2.5 rounded-[1px] ${
                            val ? 'bg-sky-500' : 'bg-transparent'
                          }`}
                        />
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="font-display font-bold text-sm text-stone-400 dark:text-slate-500">
                  Vazio
                </div>
              )}
            </div>
          </div>

          <div className="p-3 sm:p-3.5 rounded-2xl md:rounded-sm bg-[#F4F1E8] dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358] space-y-2.5">
            <div className="text-[11px] font-mono uppercase text-stone-600 dark:text-slate-300 font-bold">
              Controles da Grua
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => moveHorizontal(-1)}
                aria-label="Mover peça para esquerda"
                className="min-h-[44px] py-2 rounded-xl md:rounded-sm bg-white dark:bg-[#050C18] border border-stone-200 dark:border-[#1B3358] flex items-center justify-center text-[#081224] dark:text-white cursor-pointer"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                type="button"
                onClick={rotatePiece}
                aria-label="Girar peça"
                className="min-h-[44px] py-2 rounded-xl md:rounded-sm bg-[#F5B731] text-[#081224] font-bold flex items-center justify-center cursor-pointer"
              >
                <RotateCw size={18} />
              </button>
              <button
                type="button"
                onClick={() => moveHorizontal(1)}
                aria-label="Mover peça para direita"
                className="min-h-[44px] py-2 rounded-xl md:rounded-sm bg-white dark:bg-[#050C18] border border-stone-200 dark:border-[#1B3358] flex items-center justify-center text-[#081224] dark:text-white cursor-pointer"
              >
                <ArrowRight size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => stepDown(true)}
                className="min-h-[44px] py-2 px-2.5 rounded-xl md:rounded-sm bg-[#081224] dark:bg-[#1B3358] text-[#F5B731] text-xs font-display font-extrabold uppercase inline-flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <ArrowDown size={14} /> <span>Encaixar</span>
              </button>
              <button
                type="button"
                onClick={holdCurrentPiece}
                className="min-h-[44px] py-2 px-2.5 rounded-xl md:rounded-sm bg-white dark:bg-[#050C18] border border-stone-200 dark:border-[#1B3358] text-xs font-bold text-[#081224] dark:text-slate-200 cursor-pointer whitespace-nowrap"
              >
                Guardar (C)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
