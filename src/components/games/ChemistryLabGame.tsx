import { useEffect, useRef, useState } from 'react';
import { FlaskConical, RotateCcw, Sparkles, CheckCircle2, Play, Lightbulb, Volume2, VolumeX } from 'lucide-react';
import {
  ATOMS_CATALOG,
  AtomSymbol,
  CHEMICAL_RECIPES,
  ChemicalRecipe,
  evaluateMoleculeMix,
  formatFormulaPreview,
} from '../../games/gameLogic';
import { gameSfx } from '../../games/soundEffects';

export default function ChemistryLabGame({ articleTitle }: { articleTitle: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [phase, setPhase] = useState<'title' | 'playing' | 'victory'>('title');
  const [flaskAtoms, setFlaskAtoms] = useState<Partial<Record<AtomSymbol, number>>>({});
  const [discoveredIds, setDiscoveredIds] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [missionIdx, setMissionIdx] = useState(0);
  const [feedback, setFeedback] = useState<{
    kind: 'neutral' | 'success' | 'error' | 'hint';
    title: string;
    detail: string;
  }>({
    kind: 'neutral',
    title: 'Bancada Pronta',
    detail: 'Adicione átomos ao frasco (ex.: 2 Hidrogênios + 1 Oxigênio = H₂O) e clique em Sintetizar.',
  });
  const [liquidColor, setLiquidColor] = useState('#0EA5E9');
  const [muted, setMuted] = useState(false);

  const liquidColorRef = useRef('#0EA5E9');
  const totalCountRef = useRef(0);

  const currentMission = CHEMICAL_RECIPES[missionIdx % CHEMICAL_RECIPES.length];

  useEffect(() => {
    liquidColorRef.current = liquidColor;
  }, [liquidColor]);

  useEffect(() => {
    totalCountRef.current = Object.values(flaskAtoms).reduce((acc, v) => acc + (v || 0), 0);
  }, [flaskAtoms]);

  useEffect(() => {
    document.body.dataset.state = phase === 'victory' ? 'gameover' : phase;
    return () => {
      delete document.body.dataset.state;
    };
  }, [phase]);

  // Lightweight bubbling Erlenmeyer flask & orbiting electrons animation on Canvas2D
  useEffect(() => {
    let rafId = 0;
    const bubbles = Array.from({ length: 18 }, (_, i) => ({
      x: 110 + ((i * 37) % 100),
      y: 165 + ((i * 23) % 50),
      r: 2 + (i % 4),
      vy: 18 + (i % 5) * 8,
    }));

    let last = performance.now();
    const render = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;
          ctx.clearRect(0, 0, w, h);

          // Dark laboratory background
          ctx.fillStyle = '#081224';
          ctx.fillRect(0, 0, w, h);

          // Subtle grid lines
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
          ctx.lineWidth = 1;
          for (let gx = 0; gx < w; gx += 28) {
            ctx.beginPath();
            ctx.moveTo(gx, 0);
            ctx.lineTo(gx, h);
            ctx.stroke();
          }
          for (let gy = 0; gy < h; gy += 28) {
            ctx.beginPath();
            ctx.moveTo(0, gy);
            ctx.lineTo(w, gy);
            ctx.stroke();
          }

          // Flask silhouette & glowing chemical liquid
          const atomCount = totalCountRef.current;
          const fillRatio = Math.min(0.85, 0.22 + atomCount * 0.11);

          ctx.save();
          // Flask outline path
          ctx.beginPath();
          ctx.moveTo(w / 2 - 22, 34);
          ctx.lineTo(w / 2 + 22, 34);
          ctx.lineTo(w / 2 + 22, 82);
          ctx.lineTo(w / 2 + 78, 198);
          ctx.quadraticCurveTo(w / 2 + 86, 218, w / 2 + 64, 224);
          ctx.lineTo(w / 2 - 64, 224);
          ctx.quadraticCurveTo(w / 2 - 86, 218, w / 2 - 78, 198);
          ctx.lineTo(w / 2 - 22, 82);
          ctx.closePath();
          ctx.clip();

          // Liquid wave inside flask
          const topLiquidY = 224 - 130 * fillRatio;
          ctx.fillStyle = liquidColorRef.current;
          ctx.globalAlpha = atomCount === 0 ? 0.28 : 0.85;
          ctx.beginPath();
          ctx.moveTo(0, topLiquidY);
          for (let lx = 0; lx <= w; lx += 12) {
            const wave = Math.sin(now * 0.005 + lx * 0.06) * 4;
            ctx.lineTo(lx, topLiquidY + wave);
          }
          ctx.lineTo(w, h);
          ctx.lineTo(0, h);
          ctx.closePath();
          ctx.fill();

          // Rising bubbles inside liquid
          ctx.globalAlpha = 0.72;
          ctx.fillStyle = '#E0F2FE';
          for (const b of bubbles) {
            b.y -= (b.vy + atomCount * 6) * dt;
            if (b.y < topLiquidY + 6) {
              b.y = 216;
            }
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();

          // Crisp glass stroke
          ctx.strokeStyle = '#94A3B8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(w / 2 - 26, 34);
          ctx.lineTo(w / 2 + 26, 34);
          ctx.moveTo(w / 2 - 22, 34);
          ctx.lineTo(w / 2 - 22, 82);
          ctx.lineTo(w / 2 - 78, 198);
          ctx.quadraticCurveTo(w / 2 - 86, 218, w / 2 - 64, 224);
          ctx.lineTo(w / 2 + 64, 224);
          ctx.quadraticCurveTo(w / 2 + 86, 218, w / 2 + 78, 198);
          ctx.lineTo(w / 2 + 22, 82);
          ctx.lineTo(w / 2 + 22, 34);
          ctx.stroke();

          // Orbiting electron sparkles
          for (let e = 0; e < Math.min(atomCount, 6); e++) {
            const ang = now * 0.002 + (e * Math.PI * 2) / Math.max(1, Math.min(atomCount, 6));
            const rx = w / 2 + Math.cos(ang) * 98;
            const ry = 136 + Math.sin(ang) * 34;
            ctx.fillStyle = '#F5B731';
            ctx.beginPath();
            ctx.arc(rx, ry, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const totalAtoms = Object.values(flaskAtoms).reduce((acc, v) => acc + (v || 0), 0);
  const formulaPreview = formatFormulaPreview(flaskAtoms);

  const addAtom = (symbol: AtomSymbol) => {
    if (phase !== 'playing') return;
    if (totalAtoms >= 8) {
      setFeedback({
        kind: 'hint',
        title: 'Frasco no Limite (8 átomos)',
        detail: 'Clique em Sintetizar Fórmula ou Esvaziar Frasco para começar outra reação.',
      });
      return;
    }
    gameSfx.playPop(420 + totalAtoms * 45);
    setFlaskAtoms((prev) => ({
      ...prev,
      [symbol]: (prev[symbol] || 0) + 1,
    }));
  };

  const clearFlask = () => {
    setFlaskAtoms({});
    setLiquidColor('#0EA5E9');
    gameSfx.playPop(260);
  };

  const handleSynthesize = () => {
    if (phase !== 'playing' || totalAtoms === 0) return;
    const match: ChemicalRecipe | null = evaluateMoleculeMix(flaskAtoms);

    if (match) {
      gameSfx.playSuccess();
      setLiquidColor(match.liquidColor);
      const isNew = !discoveredIds.includes(match.id);
      const isMissionTarget = match.id === currentMission.id;
      const bonus = isMissionTarget ? 100 : 0;
      const pts = (isNew ? match.points : 40) + bonus;
      setScore((s) => s + pts);

      if (isNew) {
        const nextDiscovered = [...discoveredIds, match.id];
        setDiscoveredIds(nextDiscovered);
        if (nextDiscovered.length >= CHEMICAL_RECIPES.length) {
          setPhase('victory');
        }
      }
      if (isMissionTarget) {
        setMissionIdx((i) => i + 1);
      }

      setFeedback({
        kind: 'success',
        title: `${match.formula} — ${match.name}! (+${pts} pts)`,
        detail: match.fact,
      });
      setFlaskAtoms({});
    } else {
      gameSfx.playDamage();
      setFeedback({
        kind: 'error',
        title: `Combinação Instável (${formulaPreview})`,
        detail: 'Esses átomos não formaram uma molécula catalogada aqui. Tente por exemplo 2 H + 1 O para Água (H₂O) ou peça uma Dica!',
      });
    }
  };

  const showHint = () => {
    const parts = Object.entries(currentMission.atoms)
      .map(([sym, qty]) => `${qty}× ${sym}`)
      .join(' + ');
    gameSfx.playPop(620);
    setFeedback({
      kind: 'hint',
      title: `Dica da Missão: ${currentMission.name}`,
      detail: `Misture exatamente ${parts} no frasco para sintetizar ${currentMission.formula}.`,
    });
  };

  const startBench = () => {
    setPhase('playing');
    setFlaskAtoms({});
    setDiscoveredIds([]);
    setScore(0);
    setMissionIdx(0);
    setLiquidColor('#0EA5E9');
    setFeedback({
      kind: 'neutral',
      title: 'Desafio 1: Forme Água Pura (H₂O)',
      detail: 'Clique duas vezes em H (Hidrogênio) e uma vez em O (Oxigênio), depois clique em Sintetizar!',
    });
    gameSfx.playPop(540);
  };

  return (
    <div className="select-none bg-white dark:bg-[#050C18]">
      {/* Top HUD */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#081224] text-[#F4F0E6] border-b border-[#1B3358] text-[11px] sm:text-xs font-mono">
        <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1">
          <span>
            PONTOS: <strong className="text-[#F5B731] text-xs sm:text-sm tabular-nums">{score}</strong>
          </span>
          <span>
            DESCOBERTAS: <strong className="text-sky-400">{discoveredIds.length}/{CHEMICAL_RECIPES.length}</strong>
          </span>
          <span>
            MISSÃO: <strong className="text-emerald-400">{currentMission.formula} ({currentMission.name})</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
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

      <div className="relative p-3 sm:p-6">
        {/* Title Overlay */}
        {phase === 'title' && (
          <div className="absolute inset-0 z-10 bg-[#081224]/95 flex flex-col items-center justify-start pt-8 sm:justify-center sm:pt-6 p-5 sm:p-6 text-center text-[#F4F0E6]">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-sky-400 mb-2">
              <FlaskConical size={14} />
              <span>Laboratório · {articleTitle}</span>
            </div>
            <h4 className="font-display font-black text-2xl sm:text-3xl uppercase text-white mb-2">
              Alquimia das Fórmulas
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mb-5 leading-relaxed">
              Misture átomos da Tabela Periódica (como <strong>H + H + O → H₂O Água</strong> ou <strong>C + O₂ → CO₂</strong>) para aprender e colecionar todas as 12 moléculas!
            </p>
            <button
              type="button"
              data-start="true"
              onClick={startBench}
              className="px-6 py-3 min-h-[44px] rounded-xl md:rounded-sm bg-[#F5B731] hover:bg-[#E09F1F] text-[#081224] font-display font-black text-sm uppercase tracking-wider cursor-pointer inline-flex items-center gap-2"
            >
              <Play size={16} />
              <span>Abrir Bancada Química</span>
            </button>
          </div>
        )}

        {/* Victory Overlay */}
        {phase === 'victory' && (
          <div className="absolute inset-0 z-10 bg-[#081224]/95 flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-1">
              Enciclopédia Completa!
            </div>
            <h4 className="font-display font-black text-2xl sm:text-3xl uppercase mb-2">
              Mestre da Química!
            </h4>
            <p className="text-sm text-slate-300 mb-5">
              Você descobriu todas as {CHEMICAL_RECIPES.length} fórmulas com <strong className="text-[#F5B731] font-mono">{score} pts</strong>!
            </p>
            <button
              type="button"
              onClick={startBench}
              className="px-6 py-3 min-h-[44px] rounded-xl md:rounded-sm bg-[#F5B731] text-[#081224] font-display font-black text-sm uppercase tracking-wider cursor-pointer inline-flex items-center gap-2"
            >
              <RotateCcw size={15} />
              <span>Jogar Novamente</span>
            </button>
          </div>
        )}

        {/* Main Chemistry Interactive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          {/* Left: Flask Canvas & Formula Controls */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full rounded-2xl md:rounded-sm overflow-hidden border border-stone-200 dark:border-[#1B3358] bg-[#081224] flex justify-center">
              <canvas
                ref={canvasRef}
                width={320}
                height={240}
                className="w-full max-w-[300px] sm:max-w-none h-auto block"
              />
            </div>

            <div className="w-full mt-3 p-3.5 rounded-2xl md:rounded-sm bg-[#F4F1E8] dark:bg-[#0B1930] border border-stone-200 dark:border-[#1B3358] flex items-center justify-between gap-2">
              <div>
                <div className="text-[10px] font-mono uppercase text-stone-500 dark:text-slate-400">
                  Mistura no Frasco ({totalAtoms}/8)
                </div>
                <div className="font-display font-black text-lg sm:text-xl text-[#081224] dark:text-[#F5B731]">
                  {formulaPreview}
                </div>
              </div>
              <button
                type="button"
                onClick={clearFlask}
                disabled={totalAtoms === 0}
                className="px-3.5 py-2 min-h-[38px] rounded-xl md:rounded-sm border border-stone-300 dark:border-[#1B3358] text-xs font-semibold text-stone-700 dark:text-slate-300 hover:border-rose-500 disabled:opacity-40 cursor-pointer"
              >
                Esvaziar
              </button>
            </div>

            <div className="w-full mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleSynthesize}
                disabled={totalAtoms === 0}
                className="py-2.5 px-3 min-h-[44px] rounded-xl md:rounded-sm bg-[#0EA5E9] hover:bg-[#0284C7] disabled:opacity-45 text-white font-display font-extrabold text-xs uppercase tracking-wider cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <Sparkles size={14} />
                <span>Sintetizar Fórmula</span>
              </button>
              <button
                type="button"
                onClick={showHint}
                className="py-2.5 px-3 min-h-[44px] rounded-xl md:rounded-sm bg-[#F5B731] hover:bg-[#E09F1F] text-[#081224] font-display font-extrabold text-xs uppercase tracking-wider cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <Lightbulb size={14} />
                <span>Dica ({currentMission.formula})</span>
              </button>
            </div>
          </div>

          {/* Right: Element Tiles + Reaction Feedback + Encyclopedia */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500 dark:text-slate-400 mb-2">
                Clique nos Átomos para Adicionar ao Frasco
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ATOMS_CATALOG.map((atom) => {
                  const qty = flaskAtoms[atom.symbol] || 0;
                  return (
                    <button
                      key={atom.symbol}
                      type="button"
                      onClick={() => addAtom(atom.symbol)}
                      className="relative p-2.5 rounded-2xl md:rounded-sm border border-stone-200 dark:border-[#1B3358] hover:border-[#F5B731] bg-[#F4F1E8] dark:bg-[#0B1930] text-left transition-transform active:scale-95 cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-stone-500 dark:text-slate-400">
                          {atom.atomicNumber}
                        </span>
                        {qty > 0 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-lg md:rounded-sm bg-[#081224] text-[#F5B731] dark:bg-[#F5B731] dark:text-[#081224]">
                            ×{qty}
                          </span>
                        )}
                      </div>
                      <div
                        className="w-8 h-8 rounded-xl md:rounded-sm flex items-center justify-center font-display font-black text-base mb-1"
                        style={{ backgroundColor: atom.color, color: atom.textColor }}
                      >
                        {atom.symbol}
                      </div>
                      <div className="text-[11px] font-bold text-[#081224] dark:text-white truncate">
                        {atom.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Educational Reaction Feedback Card */}
            <div
              className={`p-3.5 rounded-2xl md:rounded-sm border text-xs leading-relaxed ${
                feedback.kind === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/35 border-emerald-400 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100'
                  : feedback.kind === 'error'
                    ? 'bg-rose-50 dark:bg-rose-950/35 border-rose-400 dark:border-rose-700 text-rose-950 dark:text-rose-100'
                    : 'bg-[#F4F1E8] dark:bg-[#0B1930] border-stone-200 dark:border-[#1B3358] text-[#081224] dark:text-slate-200'
              }`}
            >
              <div className="font-display font-extrabold uppercase text-xs mb-1">
                {feedback.title}
              </div>
              <p>{feedback.detail}</p>
            </div>

            {/* Encyclopedia Checklist */}
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500 dark:text-slate-400 mb-2">
                Enciclopédia de Compostos Descobertos ({discoveredIds.length}/{CHEMICAL_RECIPES.length})
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {CHEMICAL_RECIPES.map((rec) => {
                  const found = discoveredIds.includes(rec.id);
                  return (
                    <div
                      key={rec.id}
                      className={`px-2.5 py-2 rounded-xl md:rounded-sm border text-[11px] flex items-center justify-between gap-1 ${
                        found
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-[#081224] dark:text-emerald-200 font-semibold'
                          : 'bg-stone-100 dark:bg-[#0B1930]/60 border-stone-200 dark:border-[#1B3358] text-stone-500 dark:text-slate-400'
                      }`}
                    >
                      <span className="truncate">
                        {rec.formula} · {found ? rec.name.split(' ')[0] : '???'}
                      </span>
                      {found && <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
