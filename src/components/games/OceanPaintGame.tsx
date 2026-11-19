import { useEffect, useRef, useState, useCallback } from 'react';
import { PaintBucket, Paintbrush, Eraser, Undo2, RotateCcw, Download, Sparkles, Play } from 'lucide-react';
import { gameSfx } from '../../games/soundEffects';

type ToolMode = 'bucket' | 'brush' | 'eraser';
type OceanScene = 'baleia' | 'tartaruga';

const CANVAS_W = 720;
const CANVAS_H = 440;

const PALETTE = [
  '#0EA5E9', // Azul oceano
  '#0369A1', // Azul profundo
  '#38BDF8', // Turquesa claro
  '#F59E0B', // Dourado coral
  '#F97316', // Laranja peixe-palhaço
  '#EF4444', // Coral vermelho
  '#EC4899', // Rosa anêmona
  '#10B981', // Verde alga
  '#84CC16', // Verde-limão
  '#FACC15', // Amarelo sol
  '#A855F7', // Roxo estrela-do-mar
  '#FDE68A', // Areia do fundo
];

function hexToRgba(hex: string): [number, number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return [r, g, b, 255];
}

function drawLineArtTemplate(ctx: CanvasRenderingContext2D, scene: OceanScene) {
  ctx.save();
  ctx.strokeStyle = '#081224';
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Water surface waves
  ctx.beginPath();
  ctx.moveTo(0, 48);
  for (let x = 0; x <= CANVAS_W; x += 45) {
    ctx.quadraticCurveTo(x + 22, 34, x + 45, 48);
  }
  ctx.stroke();

  // Seabed sand line
  ctx.beginPath();
  ctx.moveTo(0, 382);
  ctx.bezierCurveTo(180, 355, 420, 405, CANVAS_W, 372);
  ctx.stroke();

  // Left swaying seaweeds (closed shapes for easy bucket fill)
  const drawSeaweed = (baseX: number, baseY: number, h: number) => {
    ctx.beginPath();
    ctx.moveTo(baseX - 10, baseY);
    ctx.quadraticCurveTo(baseX - 24, baseY - h * 0.5, baseX - 2, baseY - h);
    ctx.quadraticCurveTo(baseX + 20, baseY - h * 0.5, baseX + 10, baseY);
    ctx.closePath();
    ctx.stroke();
  };
  drawSeaweed(52, 384, 128);
  drawSeaweed(86, 382, 92);
  drawSeaweed(655, 378, 134);
  drawSeaweed(686, 376, 86);

  // Coral reef cluster on right/bottom
  ctx.beginPath();
  ctx.moveTo(510, 382);
  ctx.lineTo(500, 336);
  ctx.arc(492, 332, 12, 0, Math.PI, false);
  ctx.lineTo(514, 342);
  ctx.lineTo(526, 310);
  ctx.arc(538, 308, 13, Math.PI, 0, false);
  ctx.lineTo(548, 342);
  ctx.lineTo(568, 326);
  ctx.arc(576, 332, 11, Math.PI * 1.3, 0.3, false);
  ctx.lineTo(560, 382);
  ctx.closePath();
  ctx.stroke();

  if (scene === 'baleia') {
    // Giant Smiling Whale (Center)
    ctx.beginPath();
    ctx.moveTo(150, 210);
    ctx.bezierCurveTo(155, 118, 330, 102, 430, 178);
    ctx.bezierCurveTo(465, 205, 500, 195, 526, 172);
    // Tail fluke
    ctx.quadraticCurveTo(545, 132, 576, 136);
    ctx.quadraticCurveTo(562, 175, 545, 192);
    ctx.quadraticCurveTo(576, 206, 586, 240);
    ctx.quadraticCurveTo(545, 236, 522, 212);
    // Belly sweep
    ctx.bezierCurveTo(460, 276, 230, 294, 150, 210);
    ctx.closePath();
    ctx.stroke();

    // Whale Belly Stripe
    ctx.beginPath();
    ctx.moveTo(160, 224);
    ctx.bezierCurveTo(230, 228, 340, 240, 412, 250);
    ctx.stroke();

    // Whale pectoral fin
    ctx.beginPath();
    ctx.moveTo(275, 248);
    ctx.quadraticCurveTo(260, 300, 310, 286);
    ctx.quadraticCurveTo(324, 266, 308, 248);
    ctx.closePath();
    ctx.stroke();

    // Whale eye & smile
    ctx.fillStyle = '#081224';
    ctx.beginPath();
    ctx.arc(204, 192, 6, 0, Math.PI * 2);
    ctx.fill();

    // Tropical Fish 1 (top left)
    ctx.beginPath();
    ctx.ellipse(104, 115, 28, 17, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(76, 115);
    ctx.lineTo(54, 100);
    ctx.lineTo(54, 130);
    ctx.closePath();
    ctx.stroke();

    // Tropical Fish 2 (lower left)
    ctx.beginPath();
    ctx.ellipse(215, 326, 34, 20, -0.1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(182, 330);
    ctx.lineTo(156, 314);
    ctx.lineTo(158, 346);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(212, 308);
    ctx.lineTo(212, 344);
    ctx.stroke();

    // Tropical Fish 3 (right)
    ctx.beginPath();
    ctx.ellipse(602, 268, 26, 16, 0.1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(628, 268);
    ctx.lineTo(648, 254);
    ctx.lineTo(646, 284);
    ctx.closePath();
    ctx.stroke();
  } else {
    // Sea Turtle Scene
    // Shell
    ctx.beginPath();
    ctx.ellipse(340, 210, 96, 62, -0.1, 0, Math.PI * 2);
    ctx.stroke();
    // Shell hexagons / pattern
    ctx.beginPath();
    ctx.ellipse(340, 210, 48, 30, -0.1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(294, 188);
    ctx.lineTo(260, 170);
    ctx.moveTo(384, 196);
    ctx.lineTo(426, 185);
    ctx.moveTo(334, 240);
    ctx.lineTo(328, 272);
    ctx.stroke();

    // Turtle head
    ctx.beginPath();
    ctx.ellipse(222, 194, 34, 24, 0.1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#081224';
    ctx.beginPath();
    ctx.arc(208, 188, 5, 0, Math.PI * 2);
    ctx.fill();

    // Flippers
    ctx.beginPath();
    ctx.ellipse(295, 282, 22, 46, 0.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(418, 262, 18, 34, 0.5, 0, Math.PI * 2);
    ctx.stroke();

    // Starfish on sand
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 32 : 13;
      const a = (Math.PI * i) / 5 - Math.PI / 2;
      const sx = 240 + Math.cos(a) * r;
      const sy = 376 + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    ctx.stroke();

    // School of fish
    [
      { x: 540, y: 140 },
      { x: 615, y: 176 },
      { x: 132, y: 295 },
    ].forEach((f) => {
      ctx.beginPath();
      ctx.ellipse(f.x, f.y, 26, 15, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(f.x + 26, f.y);
      ctx.lineTo(f.x + 44, f.y - 12);
      ctx.lineTo(f.x + 44, f.y + 12);
      ctx.closePath();
      ctx.stroke();
    });
  }

  ctx.restore();
}

export default function OceanPaintGame({ articleTitle }: { articleTitle: string }) {
  const paintCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lineCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [started, setStarted] = useState(false);
  const [scene, setScene] = useState<OceanScene>('baleia');
  const [tool, setTool] = useState<ToolMode>('bucket');
  const [brushSize, setBrushSize] = useState(14);
  const [selectedColor, setSelectedColor] = useState(PALETTE[0]);
  const [animateOcean, setAnimateOcean] = useState(true);
  const [strokesCount, setStrokesCount] = useState(0);

  const isDrawingRef = useRef(false);
  const lastPtRef = useRef<{ x: number; y: number } | null>(null);
  const historyRef = useRef<ImageData[]>([]);

  const initScene = useCallback((targetScene: OceanScene) => {
    const paintCanvas = paintCanvasRef.current;
    const lineCanvas = lineCanvasRef.current;
    if (!paintCanvas || !lineCanvas) return;

    const pCtx = paintCanvas.getContext('2d', { willReadFrequently: true });
    const lCtx = lineCanvas.getContext('2d', { willReadFrequently: true });
    if (!pCtx || !lCtx) return;

    pCtx.fillStyle = '#FFFFFF';
    pCtx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    historyRef.current = [];

    lCtx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    drawLineArtTemplate(lCtx, targetScene);
    setStrokesCount(0);
  }, []);

  useEffect(() => {
    initScene(scene);
  }, [scene, initScene]);

  useEffect(() => {
    document.body.dataset.state = started ? 'playing' : 'title';
    return () => {
      delete document.body.dataset.state;
    };
  }, [started]);

  // Ambient underwater animated overlay (bubbles + tiny shimmer fish)
  useEffect(() => {
    let rafId = 0;
    const bubbles = Array.from({ length: 14 }, (_, i) => ({
      x: 40 + ((i * 53) % (CANVAS_W - 80)),
      y: CANVAS_H - ((i * 39) % CANVAS_H),
      r: 3 + (i % 4) * 1.5,
      speed: 22 + (i % 4) * 9,
    }));
    const tinyFish = Array.from({ length: 4 }, (_, i) => ({
      x: (i * 190) % CANVAS_W,
      y: 78 + i * 74,
      speed: 36 + i * 11,
    }));

    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const canvas = animCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
          if (animateOcean) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
            ctx.fillStyle = 'rgba(224, 242, 254, 0.25)';
            ctx.lineWidth = 1.5;
            for (const b of bubbles) {
              b.y -= b.speed * dt;
              if (b.y < 52) b.y = CANVAS_H - 18;
              ctx.beginPath();
              ctx.arc(b.x + Math.sin(now * 0.002 + b.x) * 4, b.y, b.r, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
            }

            ctx.fillStyle = 'rgba(14, 165, 233, 0.28)';
            for (const f of tinyFish) {
              f.x += f.speed * dt;
              if (f.x > CANVAS_W + 30) f.x = -30;
              ctx.beginPath();
              ctx.ellipse(f.x, f.y + Math.sin(now * 0.003 + f.y) * 5, 10, 5, 0, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [animateOcean]);

  const saveUndoSnapshot = () => {
    const paintCanvas = paintCanvasRef.current;
    if (!paintCanvas) return;
    const ctx = paintCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    if (historyRef.current.length >= 12) historyRef.current.shift();
    historyRef.current.push(ctx.getImageData(0, 0, CANVAS_W, CANVAS_H));
  };

  const handleUndo = () => {
    const paintCanvas = paintCanvasRef.current;
    if (!paintCanvas || historyRef.current.length === 0) return;
    const ctx = paintCanvas.getContext('2d', { willReadFrequently: true });
    const prev = historyRef.current.pop();
    if (ctx && prev) {
      ctx.putImageData(prev, 0, 0);
      gameSfx.playPop(340);
    }
  };

  const floodFillAt = (startX: number, startY: number, fillHex: string) => {
    const paintCanvas = paintCanvasRef.current;
    const lineCanvas = lineCanvasRef.current;
    if (!paintCanvas || !lineCanvas) return;
    const pCtx = paintCanvas.getContext('2d', { willReadFrequently: true });
    const lCtx = lineCanvas.getContext('2d', { willReadFrequently: true });
    if (!pCtx || !lCtx) return;

    const sx = Math.floor(startX);
    const sy = Math.floor(startY);
    if (sx < 0 || sx >= CANVAS_W || sy < 0 || sy >= CANVAS_H) return;

    const pImg = pCtx.getImageData(0, 0, CANVAS_W, CANVAS_H);
    const lImg = lCtx.getImageData(0, 0, CANVAS_W, CANVAS_H);
    const pData = pImg.data;
    const lData = lImg.data;

    const idx0 = (sy * CANVAS_W + sx) * 4;
    // Ignore click directly on black outline wall
    if (lData[idx0 + 3] > 120) return;

    const targetR = pData[idx0];
    const targetG = pData[idx0 + 1];
    const targetB = pData[idx0 + 2];
    const [fillR, fillG, fillB, fillA] = hexToRgba(fillHex);

    if (
      Math.abs(targetR - fillR) < 8 &&
      Math.abs(targetG - fillG) < 8 &&
      Math.abs(targetB - fillB) < 8
    ) {
      return;
    }

    saveUndoSnapshot();

    const visited = new Uint8Array(CANVAS_W * CANVAS_H);
    const stack = new Int32Array(CANVAS_W * CANVAS_H);
    let sp = 0;
    stack[sp++] = sy * CANVAS_W + sx;
    visited[sy * CANVAS_W + sx] = 1;

    while (sp > 0) {
      const pos = stack[--sp];
      const pi = pos * 4;
      pData[pi] = fillR;
      pData[pi + 1] = fillG;
      pData[pi + 2] = fillB;
      pData[pi + 3] = fillA;

      const x = pos % CANVAS_W;
      const y = (pos - x) / CANVAS_W;

      const neighbors = [
        x > 0 ? pos - 1 : -1,
        x < CANVAS_W - 1 ? pos + 1 : -1,
        y > 0 ? pos - CANVAS_W : -1,
        y < CANVAS_H - 1 ? pos + CANVAS_W : -1,
      ];

      for (let k = 0; k < 4; k++) {
        const nPos = neighbors[k];
        if (nPos < 0 || visited[nPos]) continue;
        const ni = nPos * 4;
        if (lData[ni + 3] > 110) continue; // boundary line-art
        if (
          Math.abs(pData[ni] - targetR) <= 28 &&
          Math.abs(pData[ni + 1] - targetG) <= 28 &&
          Math.abs(pData[ni + 2] - targetB) <= 28
        ) {
          visited[nPos] = 1;
          stack[sp++] = nPos;
        }
      }
    }

    pCtx.putImageData(pImg, 0, 0);
    setStrokesCount((c) => c + 1);
    gameSfx.playPop(520);
  };

  const getCoords = (clientX: number, clientY: number) => {
    const canvas = paintCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * CANVAS_W,
      y: ((clientY - rect.top) / rect.height) * CANVAS_H,
    };
  };

  const drawBrushSegment = (x1: number, y1: number, x2: number, y2: number) => {
    const canvas = paintCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : selectedColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  const handlePointerDown = (clientX: number, clientY: number) => {
    if (!started) return;
    const pt = getCoords(clientX, clientY);
    if (tool === 'bucket') {
      floodFillAt(pt.x, pt.y, selectedColor);
    } else {
      saveUndoSnapshot();
      isDrawingRef.current = true;
      lastPtRef.current = pt;
      drawBrushSegment(pt.x, pt.y, pt.x + 0.1, pt.y + 0.1);
      setStrokesCount((c) => c + 1);
    }
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!started || !isDrawingRef.current || tool === 'bucket') return;
    const pt = getCoords(clientX, clientY);
    if (lastPtRef.current) {
      drawBrushSegment(lastPtRef.current.x, lastPtRef.current.y, pt.x, pt.y);
    }
    lastPtRef.current = pt;
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
    lastPtRef.current = null;
  };

  const handleDownloadPng = () => {
    const paintCanvas = paintCanvasRef.current;
    const lineCanvas = lineCanvasRef.current;
    if (!paintCanvas || !lineCanvas) return;
    const merged = document.createElement('canvas');
    merged.width = CANVAS_W;
    merged.height = CANVAS_H;
    const mCtx = merged.getContext('2d');
    if (!mCtx) return;
    mCtx.drawImage(paintCanvas, 0, 0);
    mCtx.drawImage(lineCanvas, 0, 0);
    const link = document.createElement('a');
    link.download = `pintura-oceano-${scene}.png`;
    link.href = merged.toDataURL('image/png');
    link.click();
    gameSfx.playSuccess();
  };

  return (
    <div className="select-none bg-white dark:bg-[#050C18]">
      {/* Studio Toolbar HUD */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2.5 bg-[#081224] text-[#F4F0E6] border-b border-[#1B3358] text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTool('bucket')}
            className={`min-h-[36px] sm:min-h-0 px-2.5 py-1.5 rounded-xl md:rounded-sm font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
              tool === 'bucket' ? 'bg-[#F5B731] text-[#081224]' : 'bg-[#1B3358] text-white'
            }`}
          >
            <PaintBucket size={13} />
            <span>Balde</span>
          </button>
          <button
            type="button"
            onClick={() => setTool('brush')}
            className={`min-h-[36px] sm:min-h-0 px-2.5 py-1.5 rounded-xl md:rounded-sm font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
              tool === 'brush' ? 'bg-[#F5B731] text-[#081224]' : 'bg-[#1B3358] text-white'
            }`}
          >
            <Paintbrush size={13} />
            <span>Pincel</span>
          </button>
          <button
            type="button"
            onClick={() => setTool('eraser')}
            className={`min-h-[36px] sm:min-h-0 px-2.5 py-1.5 rounded-xl md:rounded-sm font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
              tool === 'eraser' ? 'bg-[#F5B731] text-[#081224]' : 'bg-[#1B3358] text-white'
            }`}
          >
            <Eraser size={13} />
            <span>Borracha</span>
          </button>
          {tool !== 'bucket' && (
            <div className="flex items-center gap-1 ml-1">
              {[8, 14, 24].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setBrushSize(sz)}
                  className={`min-h-[32px] px-2 py-1 rounded-lg md:rounded-sm text-[11px] font-mono cursor-pointer ${
                    brushSize === sz ? 'bg-sky-400 text-[#081224] font-bold' : 'bg-[#1B3358] text-slate-300'
                  }`}
                >
                  {sz}px
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setScene(scene === 'baleia' ? 'tartaruga' : 'baleia')}
            className="min-h-[36px] sm:min-h-0 px-2.5 py-1.5 rounded-xl md:rounded-sm bg-[#1B3358] hover:bg-[#27477A] text-sky-300 font-semibold cursor-pointer"
          >
            Cena: {scene === 'baleia' ? 'Baleia Azul' : 'Tartaruga'}
          </button>
          <button
            type="button"
            onClick={() => setAnimateOcean((v) => !v)}
            className={`min-h-[36px] sm:min-h-0 px-2.5 py-1.5 rounded-xl md:rounded-sm font-semibold inline-flex items-center gap-1 cursor-pointer ${
              animateOcean ? 'bg-emerald-600 text-white' : 'bg-[#1B3358] text-slate-300'
            }`}
          >
            <Sparkles size={13} />
            <span>Oceano Vivo</span>
          </button>
          <button
            type="button"
            onClick={handleUndo}
            aria-label="Desfazer última pintura"
            className="min-h-[36px] min-w-[36px] sm:min-h-0 sm:min-w-0 p-1.5 rounded-xl md:rounded-sm bg-[#1B3358] hover:bg-[#27477A] text-white inline-flex items-center justify-center cursor-pointer"
          >
            <Undo2 size={14} />
          </button>
          <button
            type="button"
            onClick={() => initScene(scene)}
            aria-label="Limpar pintura"
            className="min-h-[36px] min-w-[36px] sm:min-h-0 sm:min-w-0 p-1.5 rounded-xl md:rounded-sm bg-[#1B3358] hover:bg-[#27477A] text-white inline-flex items-center justify-center cursor-pointer"
          >
            <RotateCcw size={14} />
          </button>
          <button
            type="button"
            onClick={handleDownloadPng}
            aria-label="Baixar pintura PNG"
            className="min-h-[36px] sm:min-h-0 px-2.5 py-1.5 rounded-xl md:rounded-sm bg-[#F5B731] text-[#081224] font-bold inline-flex items-center gap-1 cursor-pointer"
          >
            <Download size={13} />
            <span>Salvar</span>
          </button>
        </div>
      </div>

      {/* Layered Canvas Stack (Paint Layer + Protected Black Line Art + Live Ambient Bubbles) */}
      <div className="relative w-full aspect-[720/440] bg-white overflow-hidden">
        <canvas
          ref={paintCanvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="absolute inset-0 w-full h-full block"
        />
        <canvas
          ref={lineCanvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="absolute inset-0 w-full h-full block pointer-events-none"
        />
        <canvas
          ref={animCanvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
          onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={(e) => {
            if (e.touches[0]) handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
          }}
          onTouchMove={(e) => {
            if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
          }}
          onTouchEnd={handlePointerUp}
          className="absolute inset-0 w-full h-full block cursor-crosshair touch-none"
        />

        {!started && (
          <div className="absolute inset-0 bg-[#081224]/90 flex flex-col items-center justify-center p-4 sm:p-6 text-center text-[#F4F0E6]">
            <div className="text-[11px] font-mono uppercase tracking-widest text-sky-400 mb-1.5 line-clamp-1">
              Ateliê Oceânico · {articleTitle}
            </div>
            <h4 className="font-display font-black text-xl sm:text-3xl uppercase text-white mb-2">
              Pintura do Oceano Vivo
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mb-4 sm:mb-5 leading-relaxed">
              Pinte a grande baleia, os peixinhos tropicais, corais e o fundo do mar usando o balde de tinta mágica ou pincel livre!
            </p>
            <button
              type="button"
              data-start="true"
              onClick={() => {
                setStarted(true);
                gameSfx.playPop(540);
              }}
              className="px-5 py-3 min-h-[44px] rounded-xl md:rounded-sm bg-[#F5B731] hover:bg-[#E09F1F] text-[#081224] font-display font-black text-xs sm:text-sm uppercase tracking-wider cursor-pointer inline-flex items-center gap-2"
            >
              <Play size={16} />
              <span>Começar a Pintar</span>
            </button>
          </div>
        )}
      </div>

      {/* Swatch Palette Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 sm:px-4 py-3 bg-[#F4F1E8] dark:bg-[#0B1930] border-t border-stone-300 dark:border-[#1B3358]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono uppercase text-stone-600 dark:text-slate-400 mr-1">
            Cores:
          </span>
          {PALETTE.map((hex) => (
            <button
              key={hex}
              type="button"
              onClick={() => {
                setSelectedColor(hex);
                if (tool === 'eraser') setTool('bucket');
                gameSfx.playPop(600);
              }}
              aria-label={`Cor ${hex}`}
              className={`w-8 h-8 sm:w-7 sm:h-7 rounded-full border-2 transition-transform cursor-pointer ${
                selectedColor === hex && tool !== 'eraser'
                  ? 'scale-115 border-[#081224] dark:border-white ring-2 ring-[#F5B731]'
                  : 'border-white/70 dark:border-slate-700'
              }`}
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
        <div className="text-xs font-mono text-stone-600 dark:text-slate-300">
          Pinceladas: <strong>{strokesCount}</strong>
        </div>
      </div>
    </div>
  );
}
