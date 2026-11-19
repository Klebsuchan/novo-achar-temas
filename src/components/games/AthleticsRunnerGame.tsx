import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, Trophy, Volume2, VolumeX, ArrowUp, ArrowDown, Zap } from 'lucide-react';
import { gameSfx } from '../../games/soundEffects';

type GamePhase = 'title' | 'playing' | 'paused' | 'victory' | 'gameover';

interface RivalRunner {
  id: number;
  lane: number;
  relX: number; // relative distance ahead/behind player in track meters
  baseSpeed: number;
  jersey: string;
  overtaken: boolean;
}

interface TrackItem {
  id: number;
  lane: number;
  relX: number;
  kind: 'water' | 'hurdle' | 'boost';
  consumed: boolean;
}

const LOGICAL_W = 800;
const LOGICAL_H = 380;
const RACE_GOAL_METERS = 600;
const LANE_CENTERS = [120, 180, 240, 300];
const PLAYER_SCREEN_X = 165;

export default function AthleticsRunnerGame({
  articleTitle,
  onScoreRecord,
}: {
  articleTitle: string;
  onScoreRecord?: (score: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onScoreRecordRef = useRef(onScoreRecord);
  useEffect(() => {
    onScoreRecordRef.current = onScoreRecord;
  }, [onScoreRecord]);
  const [phase, setPhase] = useState<GamePhase>('title');
  const [distance, setDistance] = useState(0);
  const [positionRank, setPositionRank] = useState(10);
  const [stamina, setStamina] = useState(100);
  const [overtakes, setOvertakes] = useState(0);
  const [muted, setMuted] = useState(false);

  const phaseRef = useRef<GamePhase>('title');
  const keysRef = useRef({ turbo: false });
  const stateRef = useRef({
    distance: 0,
    lane: 1,
    visualY: LANE_CENTERS[1],
    speed: 38,
    stamina: 100,
    invulnTimer: 0,
    boostTimer: 0,
    overtakes: 0,
    stridePhase: 0,
    bannerText: '',
    bannerTimer: 0,
    rivals: [] as RivalRunner[],
    items: [] as TrackItem[],
  });

  useEffect(() => {
    phaseRef.current = phase;
    document.body.dataset.state =
      phase === 'victory' || phase === 'gameover' ? 'gameover' : phase;
    return () => {
      delete document.body.dataset.state;
    };
  }, [phase]);

  const initRace = useCallback(() => {
    const jerseys = ['#EF4444', '#F97316', '#3B82F6', '#A855F7', '#EC4899', '#14B8A6', '#EAB308', '#6366F1', '#F43F5E'];
    const rivals: RivalRunner[] = Array.from({ length: 9 }, (_, i) => ({
      id: i + 1,
      lane: i % 4,
      relX: 35 + i * 52,
      baseSpeed: 31 + (i % 3) * 3.5,
      jersey: jerseys[i % jerseys.length],
      overtaken: false,
    }));

    const items: TrackItem[] = [];
    for (let m = 45; m < RACE_GOAL_METERS - 25; m += 24) {
      const roll = Math.random();
      items.push({
        id: m,
        lane: Math.floor(Math.random() * 4),
        relX: m,
        kind: roll < 0.42 ? 'water' : roll < 0.78 ? 'hurdle' : 'boost',
        consumed: false,
      });
    }

    const s = stateRef.current;
    s.distance = 0;
    s.lane = 1;
    s.visualY = LANE_CENTERS[1];
    s.speed = 38;
    s.stamina = 100;
    s.invulnTimer = 0;
    s.boostTimer = 0;
    s.overtakes = 0;
    s.stridePhase = 0;
    s.bannerText = 'LARGADA!';
    s.bannerTimer = 1.1;
    s.rivals = rivals;
    s.items = items;

    setDistance(0);
    setPositionRank(10);
    setStamina(100);
    setOvertakes(0);
    setPhase('playing');
    gameSfx.playPop(580);
  }, []);

  const changeLane = useCallback((delta: -1 | 1) => {
    if (phaseRef.current !== 'playing') return;
    const s = stateRef.current;
    const next = Math.max(0, Math.min(3, s.lane + delta));
    if (next !== s.lane) {
      s.lane = next;
      gameSfx.playPop(460);
    }
  }, []);

  const triggerTurboPulse = useCallback(() => {
    if (phaseRef.current !== 'playing') return;
    const s = stateRef.current;
    if (s.stamina >= 18) {
      s.boostTimer = Math.max(s.boostTimer, 0.75);
      s.stamina = Math.max(0, s.stamina - 15);
      setStamina(Math.round(s.stamina));
      gameSfx.playPop(680);
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (phaseRef.current !== 'playing') {
        if ((e.key === 'p' || e.key === 'P') && phaseRef.current === 'paused') {
          setPhase('playing');
        }
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        changeLane(-1);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        changeLane(1);
      } else if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        keysRef.current.turbo = true;
      } else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        setPhase('paused');
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.turbo = false;
      }
    };

    const onBlur = () => {
      keysRef.current.turbo = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [changeLane]);

  useEffect(() => {
    let rafId = 0;
    let last = performance.now();

    const drawRunnerSprite = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      jersey: string,
      stride: number,
      isPlayer: boolean,
      hurdleShield: boolean
    ) => {
      ctx.save();
      if (hurdleShield && Math.floor(stride * 3) % 2 === 0) {
        ctx.globalAlpha = 0.55;
      }

      // Ground shadow
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      ctx.beginPath();
      ctx.ellipse(x, y + 18, 16, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Animated running legs
      const legSwing = Math.sin(stride) * 11;
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x - 3, y + 6);
      ctx.lineTo(x - 4 - legSwing, y + 18);
      ctx.moveTo(x + 3, y + 6);
      ctx.lineTo(x + 4 + legSwing, y + 18);
      ctx.stroke();

      // Torso Jersey
      ctx.fillStyle = jersey;
      ctx.beginPath();
      ctx.roundRect(x - 10, y - 12, 20, 20, 5);
      ctx.fill();

      // Head + headband for player
      ctx.fillStyle = '#FDBA74';
      ctx.beginPath();
      ctx.arc(x + 2, y - 19, 8, 0, Math.PI * 2);
      ctx.fill();

      if (isPlayer) {
        ctx.fillStyle = '#F5B731';
        ctx.fillRect(x - 6, y - 24, 16, 4);
      }

      ctx.restore();
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const s = stateRef.current;

      if (phaseRef.current === 'playing') {
        if (s.invulnTimer > 0) s.invulnTimer -= dt;
        if (s.boostTimer > 0) s.boostTimer -= dt;
        if (s.bannerTimer > 0) s.bannerTimer -= dt;

        const targetY = LANE_CENTERS[s.lane];
        s.visualY += (targetY - s.visualY) * Math.min(1, dt * 15);

        const sprinting = (keysRef.current.turbo || s.boostTimer > 0) && s.stamina > 3;
        if (keysRef.current.turbo && s.stamina > 0) {
          s.stamina = Math.max(0, s.stamina - 28 * dt);
        } else {
          s.stamina = Math.min(100, s.stamina + 9 * dt);
        }

        const targetSpeed = s.invulnTimer > 0 ? 25 : sprinting ? 60 : 41;
        s.speed += (targetSpeed - s.speed) * Math.min(1, dt * 7);
        s.distance += s.speed * dt;
        s.stridePhase += s.speed * dt * 0.42;

        // Move rivals forward and check overtakes
        let aheadCount = 0;
        for (const r of s.rivals) {
          r.relX += r.baseSpeed * dt;
          if (r.relX > s.distance) {
            aheadCount += 1;
          } else if (!r.overtaken) {
            r.overtaken = true;
            s.overtakes += 1;
            s.bannerText = `ULTRAPASSOU! (${10 - s.overtakes}º)`;
            s.bannerTimer = 0.9;
            setOvertakes(s.overtakes);
            gameSfx.playSuccess();
          }
        }
        const rank = Math.max(1, aheadCount + 1);
        setPositionRank(rank);
        setDistance(Math.min(RACE_GOAL_METERS, Math.floor(s.distance)));
        setStamina(Math.round(s.stamina));

        // Collisions with items
        for (const item of s.items) {
          if (item.consumed) continue;
          const dxMeters = item.relX - s.distance;
          if (Math.abs(dxMeters) < 3.4 && item.lane === s.lane) {
            item.consumed = true;
            if (item.kind === 'water') {
              s.stamina = Math.min(100, s.stamina + 34);
              s.bannerText = '+HIDRATAÇÃO!';
              s.bannerTimer = 0.7;
              gameSfx.playPop(700);
            } else if (item.kind === 'boost') {
              s.boostTimer = 1.6;
              s.bannerText = 'TURBO OLÍMPICO!';
              s.bannerTimer = 0.85;
              gameSfx.playSuccess();
            } else if (item.kind === 'hurdle' && s.invulnTimer <= 0) {
              s.invulnTimer = 0.85;
              s.stamina = Math.max(0, s.stamina - 18);
              s.bannerText = 'TROPEÇOU NA BARREIRA!';
              s.bannerTimer = 0.85;
              gameSfx.playDamage();
            }
          }
        }

        if (s.distance >= RACE_GOAL_METERS) {
          setPhase('victory');
          gameSfx.playSuccess();
          const finalScore =
            Math.round(RACE_GOAL_METERS) +
            s.overtakes * 150 +
            (rank === 1 ? 500 : rank <= 3 ? 250 : 0);
          onScoreRecordRef.current?.(finalScore);
        }
      }

      // Render Athletics Stadium & Track
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);

          // Stadium stands top backdrop
          ctx.fillStyle = '#081224';
          ctx.fillRect(0, 0, LOGICAL_W, 82);
          // Colorful cheering crowd dots
          for (let cx = 18; cx < LOGICAL_W; cx += 24) {
            ctx.fillStyle = cx % 48 === 18 ? '#F5B731' : cx % 72 === 42 ? '#38BDF8' : '#E2E8F0';
            ctx.fillRect(cx, 28 + ((cx * 7) % 24), 7, 10);
          }

          // Grass infield border
          ctx.fillStyle = '#15803D';
          ctx.fillRect(0, 82, LOGICAL_W, 14);
          ctx.fillRect(0, 336, LOGICAL_W, 44);

          // Clay Tartan 4-Lane Track
          ctx.fillStyle = '#B91C1C';
          ctx.fillRect(0, 96, LOGICAL_W, 240);

          // Lane chalk lines
          ctx.strokeStyle = 'rgba(255,255,255,0.65)';
          ctx.lineWidth = 2;
          for (let l = 0; l <= 4; l++) {
            const ly = 96 + l * 60;
            ctx.beginPath();
            ctx.moveTo(0, ly);
            ctx.lineTo(LOGICAL_W, ly);
            ctx.stroke();
          }

          // Scrolling distance markers (every 10 meters)
          const pxPerMeter = 12;
          const startMeter = Math.floor(s.distance / 10) * 10;
          ctx.fillStyle = 'rgba(255,255,255,0.45)';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center';
          for (let m = startMeter; m <= startMeter + 70; m += 10) {
            const mx = PLAYER_SCREEN_X + (m - s.distance) * pxPerMeter;
            if (mx >= 0 && mx <= LOGICAL_W) {
              ctx.fillRect(mx, 96, 2, 240);
              ctx.fillText(`${m}m`, mx, 355);
            }
          }

          // Finish Line Ribbon
          const finishX = PLAYER_SCREEN_X + (RACE_GOAL_METERS - s.distance) * pxPerMeter;
          if (finishX >= -20 && finishX <= LOGICAL_W + 20) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(finishX - 6, 96, 12, 240);
            ctx.fillStyle = '#F5B731';
            ctx.fillRect(finishX - 2, 96, 4, 240);
          }

          // Draw items on track
          for (const item of s.items) {
            if (item.consumed) continue;
            const ix = PLAYER_SCREEN_X + (item.relX - s.distance) * pxPerMeter;
            if (ix < -30 || ix > LOGICAL_W + 30) continue;
            const iy = LANE_CENTERS[item.lane];
            if (item.kind === 'water') {
              ctx.fillStyle = '#38BDF8';
              ctx.fillRect(ix - 8, iy - 10, 16, 20);
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(ix - 5, iy - 4, 10, 6);
            } else if (item.kind === 'boost') {
              ctx.fillStyle = '#FACC15';
              ctx.beginPath();
              ctx.moveTo(ix - 12, iy - 12);
              ctx.lineTo(ix + 12, iy);
              ctx.lineTo(ix - 12, iy + 12);
              ctx.closePath();
              ctx.fill();
            } else {
              // Hurdle barrier
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(ix - 6, iy - 18, 12, 34);
              ctx.fillStyle = '#EF4444';
              ctx.fillRect(ix - 6, iy - 18, 12, 10);
            }
          }

          // Draw rivals
          for (const r of s.rivals) {
            const rx = PLAYER_SCREEN_X + (r.relX - s.distance) * pxPerMeter;
            if (rx < -40 || rx > LOGICAL_W + 40) continue;
            drawRunnerSprite(
              ctx,
              rx,
              LANE_CENTERS[r.lane],
              r.jersey,
              s.stridePhase + r.id,
              false,
              false
            );
          }

          // Draw Player Athlete
          drawRunnerSprite(
            ctx,
            PLAYER_SCREEN_X,
            s.visualY,
            '#10B981',
            s.stridePhase,
            true,
            s.invulnTimer > 0
          );

          // Banner popup
          if (s.bannerTimer > 0) {
            ctx.fillStyle = '#FDE047';
            ctx.font = 'bold 16px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(s.bannerText, LOGICAL_W / 2, 64);
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="select-none">
      {/* Top Track HUD */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#081224] text-[#F4F0E6] border-b border-[#1B3358] text-[11px] sm:text-xs font-mono">
        <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-2.5 sm:gap-x-4 gap-y-1">
          <span>
            POSIÇÃO: <strong className="text-[#F5B731] text-xs sm:text-sm">{positionRank}º Lugar</strong>
          </span>
          <span>
            DISTÂNCIA: <strong className="text-sky-400 tabular-nums">{distance}/{RACE_GOAL_METERS}m</strong>
          </span>
          <span>
            ENERGIA:{' '}
            <strong className={stamina > 35 ? 'text-emerald-400' : 'text-rose-400'}>
              {stamina}%
            </strong>
          </span>
          <span>
            ULTRAPASS.: <strong className="text-white">{overtakes}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {phase === 'playing' && (
            <button
              type="button"
              onClick={() => setPhase('paused')}
              aria-label="Pausar corrida"
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

      {/* Canvas Container */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[800/380] bg-[#081224] overflow-hidden">
        <canvas
          ref={canvasRef}
          width={LOGICAL_W}
          height={LOGICAL_H}
          onClick={(e) => {
            if (phase !== 'playing') return;
            const rect = e.currentTarget.getBoundingClientRect();
            const relY = ((e.clientY - rect.top) / rect.height) * LOGICAL_H;
            const nearestLane = LANE_CENTERS.reduce(
              (bestIdx, center, idx) =>
                Math.abs(center - relY) < Math.abs(LANE_CENTERS[bestIdx] - relY) ? idx : bestIdx,
              0
            );
            stateRef.current.lane = nearestLane;
          }}
          className="w-full h-full block touch-none cursor-pointer"
        />

        {phase === 'title' && (
          <div className="absolute inset-0 bg-[#081224]/88 flex flex-col items-center justify-center p-4 sm:p-6 text-center text-[#F4F0E6]">
            <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-emerald-400 mb-1.5 sm:mb-2 max-w-full truncate">
              <Trophy size={13} className="shrink-0" />
              <span className="truncate">Pista de Atletismo · {articleTitle}</span>
            </div>
            <h4 className="font-display font-black text-xl sm:text-3xl uppercase text-white mb-1.5 sm:mb-2">
              Corrida de Superação
            </h4>
            <p className="text-[11px] sm:text-sm text-slate-300 max-w-md mb-3.5 sm:mb-5 leading-snug sm:leading-relaxed">
              Troque de raia tocando na pista (ou <strong>↑ / ↓</strong>), pegue água, acione <strong>Turbo</strong> e ultrapasse os rivais!
            </p>
            <button
              type="button"
              data-start="true"
              onClick={initRace}
              className="min-h-[44px] px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl md:rounded-sm bg-[#F5B731] hover:bg-[#E09F1F] text-[#081224] font-display font-black text-xs sm:text-sm uppercase tracking-wider cursor-pointer inline-flex items-center gap-2 whitespace-nowrap"
            >
              <Play size={16} />
              <span>Dar a Largada</span>
            </button>
          </div>
        )}

        {phase === 'paused' && (
          <div className="absolute inset-0 bg-[#081224]/85 flex flex-col items-center justify-center p-4 sm:p-6 text-center text-white">
            <h4 className="font-display font-black text-xl sm:text-2xl uppercase mb-4">Prova Pausada</h4>
            <button
              type="button"
              onClick={() => setPhase('playing')}
              className="min-h-[44px] px-6 py-2.5 rounded-xl md:rounded-sm bg-[#F5B731] text-[#081224] font-display font-extrabold text-xs uppercase cursor-pointer"
            >
              Continuar Corrida
            </button>
          </div>
        )}

        {phase === 'victory' && (
          <div className="absolute inset-0 bg-[#081224]/90 flex flex-col items-center justify-center p-4 sm:p-6 text-center text-white">
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#F5B731] mb-1">
              Linha de Chegada · {RACE_GOAL_METERS}m
            </div>
            <h4 className="font-display font-black text-xl sm:text-3xl uppercase mb-1.5 sm:mb-2">
              Você Terminou em {positionRank}º Lugar!
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 mb-4 sm:mb-5">
              Ultrapassagens: <strong className="text-emerald-400 font-mono">{overtakes} corredores</strong> · Pontuação:{' '}
              <strong className="text-[#F5B731] font-mono">
                {Math.round(RACE_GOAL_METERS) + overtakes * 150 + (positionRank === 1 ? 500 : positionRank <= 3 ? 250 : 0)} pts
              </strong>
            </p>
            <button
              type="button"
              onClick={initRace}
              className="min-h-[44px] px-6 py-3 rounded-xl md:rounded-sm bg-[#F5B731] text-[#081224] font-display font-black text-xs sm:text-sm uppercase tracking-wider cursor-pointer inline-flex items-center gap-2 whitespace-nowrap"
            >
              <RotateCcw size={15} />
              <span>Correr Novamente</span>
            </button>
          </div>
        )}
      </div>

      {/* Tactile Mobile & Desktop Quick Action Strip */}
      <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2.5 bg-[#F4F1E8] dark:bg-[#0B1930] border-t border-stone-200 dark:border-[#1B3358]">
        <button
          type="button"
          onClick={() => changeLane(-1)}
          className="min-h-[44px] px-2.5 sm:px-3 py-2 rounded-xl md:rounded-sm bg-white dark:bg-[#050C18] border border-stone-200 dark:border-[#1B3358] text-xs font-bold text-[#081224] dark:text-white inline-flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
        >
          <ArrowUp size={14} /> <span>Subir</span>
        </button>
        <button
          type="button"
          onClick={() => changeLane(1)}
          className="min-h-[44px] px-2.5 sm:px-3 py-2 rounded-xl md:rounded-sm bg-white dark:bg-[#050C18] border border-stone-200 dark:border-[#1B3358] text-xs font-bold text-[#081224] dark:text-white inline-flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
        >
          <ArrowDown size={14} /> <span>Descer</span>
        </button>
        <button
          type="button"
          onClick={triggerTurboPulse}
          className="min-h-[44px] sm:ml-auto px-3 sm:px-4 py-2 rounded-xl md:rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-display font-extrabold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <Zap size={14} /> <span>Turbo</span>
        </button>
      </div>
    </div>
  );
}
