import { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCcw, Play, Pause, Volume2, VolumeX, Crosshair } from 'lucide-react';
import { gameSfx } from '../../games/soundEffects';

type GamePhase = 'title' | 'playing' | 'paused' | 'victory' | 'gameover';
type VillainKind = 'pistoleiro' | 'dinamiteiro' | 'blindado';

interface SpawnSpot {
  id: number;
  x: number;
  y: number;
  label: string;
  heightLimit: number;
}

interface ActiveVillain {
  id: number;
  spotId: number;
  kind: VillainKind;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  timer: number;
  telegraphAt: number;
  attackAt: number;
  hitFlash: number;
  popOffset: number;
}

interface DynamiteStick {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  fuse: number;
}

interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface FloatingText {
  active: boolean;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

const LOGICAL_W = 800;
const LOGICAL_H = 460;

const SPOTS: SpawnSpot[] = [
  { id: 0, x: 110, y: 185, label: 'Telhado Esq', heightLimit: 72 },
  { id: 1, x: 395, y: 155, label: 'Sacada Saloon', heightLimit: 74 },
  { id: 2, x: 675, y: 188, label: 'Caixa d’Água', heightLimit: 72 },
  { id: 3, x: 185, y: 325, label: 'Barril', heightLimit: 78 },
  { id: 4, x: 400, y: 315, label: 'Porta Saloon', heightLimit: 82 },
  { id: 5, x: 615, y: 328, label: 'Carroça', heightLimit: 78 },
];

export default function WesternShooterGame({
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
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [ammo, setAmmo] = useState(6);
  const [wave, setWave] = useState(1);
  const [combo, setCombo] = useState(0);
  const [reloading, setReloading] = useState(false);
  const [muted, setMuted] = useState(false);

  const phaseRef = useRef<GamePhase>('title');
  const stateRef = useRef({
    score: 0,
    lives: 5,
    ammo: 6,
    wave: 1,
    killsInWave: 0,
    killsTarget: 8,
    combo: 0,
    reloadingTimer: 0,
    spawnCooldown: 0.6,
    hitstopTimer: 0,
    shakeTimer: 0,
    muzzleFlash: 0,
    damageFlash: 0,
    mouseX: LOGICAL_W / 2,
    mouseY: LOGICAL_H / 2,
    nextId: 1,
    tumbleX: -40,
    villains: [] as ActiveVillain[],
    dynamite: { active: false, x: 0, y: 0, vx: 0, vy: 0, rot: 0, fuse: 0 } as DynamiteStick,
    particles: Array.from({ length: 48 }, (): Particle => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 1,
      color: '#F5B731',
      size: 4,
    })),
    floaters: Array.from({ length: 14 }, (): FloatingText => ({
      active: false,
      x: 0,
      y: 0,
      text: '',
      color: '#FFFFFF',
      life: 0,
    })),
  });

  useEffect(() => {
    phaseRef.current = phase;
    document.body.dataset.state =
      phase === 'victory' || phase === 'gameover' ? 'gameover' : phase;
    return () => {
      delete document.body.dataset.state;
    };
  }, [phase]);

  const spawnBurst = (x: number, y: number, color: string, count = 10) => {
    const pool = stateRef.current.particles;
    let spawned = 0;
    for (let i = 0; i < pool.length && spawned < count; i++) {
      if (!pool[i].active) {
        const angle = (Math.PI * 2 * spawned) / count + Math.random() * 0.4;
        const speed = 75 + Math.random() * 140;
        pool[i].active = true;
        pool[i].x = x;
        pool[i].y = y;
        pool[i].vx = Math.cos(angle) * speed;
        pool[i].vy = Math.sin(angle) * speed - 35;
        pool[i].life = 0.42;
        pool[i].maxLife = 0.42;
        pool[i].color = color;
        pool[i].size = 3 + Math.random() * 4;
        spawned++;
      }
    }
  };

  const spawnFloater = (x: number, y: number, text: string, color: string) => {
    const pool = stateRef.current.floaters;
    for (let i = 0; i < pool.length; i++) {
      if (!pool[i].active) {
        pool[i].active = true;
        pool[i].x = x;
        pool[i].y = y;
        pool[i].text = text;
        pool[i].color = color;
        pool[i].life = 0.75;
        break;
      }
    }
  };

  const startGame = useCallback(() => {
    const s = stateRef.current;
    s.score = 0;
    s.lives = 5;
    s.ammo = 6;
    s.wave = 1;
    s.killsInWave = 0;
    s.killsTarget = 8;
    s.combo = 0;
    s.reloadingTimer = 0;
    s.spawnCooldown = 0.45;
    s.hitstopTimer = 0;
    s.shakeTimer = 0;
    s.muzzleFlash = 0;
    s.damageFlash = 0;
    s.villains = [];
    s.dynamite.active = false;
    s.particles.forEach((p) => (p.active = false));
    s.floaters.forEach((f) => (f.active = false));

    setScore(0);
    setLives(5);
    setAmmo(6);
    setWave(1);
    setCombo(0);
    setReloading(false);
    setPhase('playing');
    gameSfx.playPop(540);
  }, []);

  const triggerReload = useCallback(() => {
    const s = stateRef.current;
    if (phaseRef.current !== 'playing' || s.reloadingTimer > 0 || s.ammo === 6) return;
    s.reloadingTimer = 0.7;
    setReloading(true);
    gameSfx.playPop(280);
  }, []);

  const screenToWorld = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: LOGICAL_W / 2, y: LOGICAL_H / 2 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * LOGICAL_W,
      y: ((clientY - rect.top) / rect.height) * LOGICAL_H,
    };
  };

  const handleCanvasShoot = (clientX: number, clientY: number) => {
    if (phaseRef.current !== 'playing') return;
    const s = stateRef.current;
    const { x, y } = screenToWorld(clientX, clientY);
    s.mouseX = x;
    s.mouseY = y;

    if (s.reloadingTimer > 0) return;
    if (s.ammo <= 0) {
      triggerReload();
      return;
    }

    s.ammo -= 1;
    setAmmo(s.ammo);
    s.muzzleFlash = 0.1;
    s.shakeTimer = 0.08;
    gameSfx.playShot();

    // Check dynamite intercept first
    if (s.dynamite.active) {
      const dx = x - s.dynamite.x;
      const dy = y - s.dynamite.y;
      if (dx * dx + dy * dy <= 34 * 34) {
        s.dynamite.active = false;
        s.score += 200;
        s.combo += 1;
        setScore(s.score);
        setCombo(s.combo);
        spawnBurst(s.dynamite.x, s.dynamite.y, '#F97316', 14);
        spawnFloater(s.dynamite.x, s.dynamite.y - 14, 'BOMBA! +200', '#FBBF24');
        gameSfx.playHit();
        if (s.ammo === 0) triggerReload();
        return;
      }
    }

    // Check villains top-to-bottom
    let hitSomeone = false;
    for (let i = s.villains.length - 1; i >= 0; i--) {
      const v = s.villains[i];
      const halfW = v.width / 2 + 8;
      const topY = v.y - v.height + v.popOffset;
      const bottomY = v.y + 8;
      if (x >= v.x - halfW && x <= v.x + halfW && y >= topY && y <= bottomY) {
        hitSomeone = true;
        v.hp -= 1;
        v.hitFlash = 0.14;
        s.hitstopTimer = 0.032;
        gameSfx.playHit();
        spawnBurst(x, y, v.hp <= 0 ? '#F59E0B' : '#CBD5E1', v.hp <= 0 ? 12 : 6);

        if (v.hp <= 0) {
          s.combo += 1;
          const mult = Math.min(3, 1 + Math.floor(s.combo / 4));
          const basePts = v.kind === 'blindado' ? 220 : v.kind === 'dinamiteiro' ? 160 : 100;
          const earned = basePts * mult;
          s.score += earned;
          s.killsInWave += 1;
          setScore(s.score);
          setCombo(s.combo);
          spawnFloater(v.x, topY - 6, `+${earned}${mult > 1 ? ` x${mult}` : ''}`, '#FDE047');
          s.villains.splice(i, 1);

          if (s.killsInWave >= s.killsTarget) {
            if (s.wave < 3) {
              s.wave += 1;
              s.killsInWave = 0;
              s.killsTarget = s.wave === 2 ? 10 : 12;
              setWave(s.wave);
              spawnFloater(LOGICAL_W / 2, 130, `ONDA ${s.wave}!`, '#38BDF8');
              gameSfx.playSuccess();
            } else {
              setPhase('victory');
              gameSfx.playSuccess();
              onScoreRecordRef.current?.(s.score);
            }
          }
        } else {
          spawnFloater(v.x, topY - 6, 'BLINDAGEM!', '#E2E8F0');
        }
        break;
      }
    }

    if (!hitSomeone) {
      s.combo = 0;
      setCombo(0);
      spawnBurst(x, y, '#A8A29E', 4);
    }

    if (s.ammo === 0) {
      triggerReload();
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        triggerReload();
      } else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (phaseRef.current === 'playing') setPhase('paused');
        else if (phaseRef.current === 'paused') setPhase('playing');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [triggerReload]);

  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();

    const drawPixelCloud = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) => {
      ctx.fillStyle = 'rgba(254, 243, 199, 0.72)';
      ctx.fillRect(x, y, 48 * scale, 14 * scale);
      ctx.fillRect(x + 10 * scale, y - 10 * scale, 26 * scale, 12 * scale);
    };

    const drawVillain = (ctx: CanvasRenderingContext2D, v: ActiveVillain) => {
      const topY = v.y - v.height + v.popOffset;
      const cx = v.x;
      ctx.save();
      if (v.hitFlash > 0) {
        ctx.filter = 'brightness(1.8)';
      }

      // Telegraph ! badge
      const isTelegraphing = v.timer >= v.telegraphAt;
      if (isTelegraphing) {
        const pulse = Math.sin(v.timer * 24) > 0;
        ctx.fillStyle = pulse ? '#EF4444' : '#FACC15';
        ctx.fillRect(cx - 10, topY - 26, 20, 18);
        ctx.fillStyle = '#081224';
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('!', cx, topY - 12);
      }

      // Hat (16-bit SNES style crisp rectangles)
      const hatColor =
        v.kind === 'blindado' ? '#334155' : v.kind === 'dinamiteiro' ? '#7C2D12' : '#451A03';
      ctx.fillStyle = hatColor;
      ctx.fillRect(cx - 18, topY + 8, 36, 5);
      ctx.fillRect(cx - 11, topY, 22, 9);

      // Head + bandana
      ctx.fillStyle = '#FDBA74';
      ctx.fillRect(cx - 9, topY + 13, 18, 15);
      // Eyes
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(cx - 5, topY + 17, 3, 3);
      ctx.fillRect(cx + 2, topY + 17, 3, 3);
      // Bandana
      ctx.fillStyle = v.kind === 'dinamiteiro' ? '#EA580C' : v.kind === 'blindado' ? '#64748B' : '#DC2626';
      ctx.fillRect(cx - 9, topY + 21, 18, 7);

      // Poncho / Armor torso
      ctx.fillStyle =
        v.kind === 'blindado' ? '#475569' : v.kind === 'dinamiteiro' ? '#9A3412' : '#78350F';
      ctx.fillRect(cx - 15, topY + 28, 30, 32);

      // Sheriff Bandido / Chest detail
      if (v.kind === 'blindado') {
        ctx.fillStyle = '#94A3B8';
        ctx.fillRect(cx - 12, topY + 30, 24, 22);
        ctx.fillStyle = '#E2E8F0';
        ctx.fillRect(cx - 10, topY + 32, 6, 6);
      } else {
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(cx - 3, topY + 34, 6, 6);
      }

      // Gun / Dynamite arm
      ctx.fillStyle = v.kind === 'dinamiteiro' ? '#EF4444' : '#1E293B';
      ctx.fillRect(cx + 12, topY + 32, 12, 6);
      if (v.kind === 'dinamiteiro') {
        ctx.fillStyle = '#FACC15';
        ctx.fillRect(cx + 22, topY + 28, 4, 4);
      }

      ctx.restore();
    };

    const tick = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05);
      const s = stateRef.current;

      if (phaseRef.current === 'playing') {
        if (s.hitstopTimer > 0) {
          s.hitstopTimer -= dt;
        } else {
          if (s.shakeTimer > 0) s.shakeTimer -= dt;
          if (s.muzzleFlash > 0) s.muzzleFlash -= dt;
          if (s.damageFlash > 0) s.damageFlash -= dt;

          s.tumbleX += 48 * dt;
          if (s.tumbleX > LOGICAL_W + 45) s.tumbleX = -45;

          if (s.reloadingTimer > 0) {
            s.reloadingTimer -= dt;
            if (s.reloadingTimer <= 0) {
              s.reloadingTimer = 0;
              s.ammo = 6;
              setAmmo(6);
              setReloading(false);
            }
          }

          // Spawn villains based on wave
          const maxConcurrent = s.wave === 1 ? 2 : s.wave === 2 ? 3 : 4;
          s.spawnCooldown -= dt;
          if (s.villains.length < maxConcurrent && s.spawnCooldown <= 0) {
            const occupied = new Set(s.villains.map((v) => v.spotId));
            const available = SPOTS.filter((sp) => !occupied.has(sp.id));
            if (available.length > 0) {
              const spot = available[Math.floor(Math.random() * available.length)];
              const roll = Math.random();
              const kind: VillainKind =
                s.wave >= 3 && roll > 0.68
                  ? 'blindado'
                  : s.wave >= 2 && roll > 0.45
                    ? 'dinamiteiro'
                    : 'pistoleiro';

              const speedFactor = s.wave === 1 ? 1 : s.wave === 2 ? 0.85 : 0.72;
              const telegraphAt = 1.15 * speedFactor;
              const attackAt = 2.05 * speedFactor;

              s.villains.push({
                id: s.nextId++,
                spotId: spot.id,
                kind,
                x: spot.x,
                y: spot.y,
                width: 40,
                height: 62,
                hp: kind === 'blindado' ? 2 : 1,
                maxHp: kind === 'blindado' ? 2 : 1,
                timer: 0,
                telegraphAt,
                attackAt,
                hitFlash: 0,
                popOffset: 24,
              });
            }
            s.spawnCooldown = s.wave === 1 ? 1.0 : s.wave === 2 ? 0.78 : 0.62;
          }

          // Update villains
          for (let i = s.villains.length - 1; i >= 0; i--) {
            const v = s.villains[i];
            v.timer += dt;
            v.popOffset = Math.max(0, v.popOffset - 160 * dt);
            if (v.hitFlash > 0) v.hitFlash -= dt;

            if (v.timer >= v.attackAt) {
              if (v.kind === 'dinamiteiro' && !s.dynamite.active) {
                // Lob dynamite toward player foreground
                s.dynamite.active = true;
                s.dynamite.x = v.x;
                s.dynamite.y = v.y - 38;
                s.dynamite.vx = (LOGICAL_W / 2 - v.x) * 0.65;
                s.dynamite.vy = -190;
                s.dynamite.rot = 0;
                s.dynamite.fuse = 1.45;
              } else {
                // Villain shoots player
                s.lives = Math.max(0, s.lives - 1);
                s.combo = 0;
                s.damageFlash = 0.25;
                s.shakeTimer = 0.18;
                setLives(s.lives);
                setCombo(0);
                gameSfx.playDamage();
                spawnFloater(v.x, v.y - 68, 'TIRO RECEBIDO!', '#FCA5A5');
                if (s.lives <= 0) {
                  setPhase('gameover');
                  onScoreRecordRef.current?.(s.score);
                }
              }
              s.villains.splice(i, 1);
            }
          }

          // Update dynamite
          if (s.dynamite.active) {
            s.dynamite.x += s.dynamite.vx * dt;
            s.dynamite.y += s.dynamite.vy * dt;
            s.dynamite.vy += 310 * dt;
            s.dynamite.rot += 8 * dt;
            s.dynamite.fuse -= dt;
            if (s.dynamite.fuse <= 0) {
              s.dynamite.active = false;
              s.lives = Math.max(0, s.lives - 1);
              s.combo = 0;
              s.damageFlash = 0.28;
              s.shakeTimer = 0.22;
              setLives(s.lives);
              setCombo(0);
              gameSfx.playDamage();
              spawnBurst(s.dynamite.x, s.dynamite.y, '#EF4444', 18);
              if (s.lives <= 0) {
                setPhase('gameover');
                onScoreRecordRef.current?.(s.score);
              }
            }
          }
        }
      }

      // Particles & floaters always animate smoothly
      for (const p of s.particles) {
        if (!p.active) continue;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 320 * dt;
        p.life -= dt;
        if (p.life <= 0) p.active = false;
      }
      for (const f of s.floaters) {
        if (!f.active) continue;
        f.y -= 38 * dt;
        f.life -= dt;
        if (f.life <= 0) f.active = false;
      }

      // --- Render SNES Western Saloon Town ---
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.save();
          if (s.shakeTimer > 0) {
            const mag = 5;
            ctx.translate((Math.random() - 0.5) * mag * 2, (Math.random() - 0.5) * mag * 2);
          }

          // Sunset gradient sky
          const sky = ctx.createLinearGradient(0, 0, 0, 290);
          sky.addColorStop(0, '#451A03');
          sky.addColorStop(0.55, '#D97706');
          sky.addColorStop(1, '#FDE68A');
          ctx.fillStyle = sky;
          ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

          // Desert sun
          ctx.fillStyle = '#FEF08A';
          ctx.beginPath();
          ctx.arc(620, 105, 42, 0, Math.PI * 2);
          ctx.fill();

          drawPixelCloud(ctx, 130, 58, 1.1);
          drawPixelCloud(ctx, 430, 44, 0.9);

          // Distant Mesas
          ctx.fillStyle = '#92400E';
          ctx.beginPath();
          ctx.moveTo(0, 245);
          ctx.lineTo(80, 165);
          ctx.lineTo(205, 165);
          ctx.lineTo(260, 245);
          ctx.lineTo(440, 245);
          ctx.lineTo(500, 152);
          ctx.lineTo(660, 152);
          ctx.lineTo(740, 245);
          ctx.lineTo(LOGICAL_W, 245);
          ctx.lineTo(LOGICAL_W, 300);
          ctx.lineTo(0, 300);
          ctx.closePath();
          ctx.fill();

          // Upper villains (roof/balcony layer)
          for (const v of s.villains) {
            if (v.spotId <= 2) drawVillain(ctx, v);
          }

          // Saloon & Old West Facades
          // Left Sheriff Cabin
          ctx.fillStyle = '#78350F';
          ctx.fillRect(35, 185, 150, 135);
          ctx.fillStyle = '#451A03';
          ctx.fillRect(28, 175, 164, 14);
          ctx.fillStyle = '#FDE047';
          ctx.fillRect(72, 212, 76, 20);
          ctx.fillStyle = '#451A03';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('XERIFE', 110, 226);

          // Center Grand Saloon
          ctx.fillStyle = '#9A3412';
          ctx.fillRect(280, 155, 235, 165);
          ctx.fillStyle = '#431407';
          ctx.fillRect(272, 144, 251, 16);
          ctx.fillStyle = '#FBBF24';
          ctx.fillRect(338, 168, 118, 24);
          ctx.fillStyle = '#451A03';
          ctx.font = 'bold 13px monospace';
          ctx.fillText('SALOON 1885', 397, 184);
          // Saloon swinging doors frame
          ctx.fillStyle = '#290F05';
          ctx.fillRect(355, 228, 88, 92);

          // Right Water Tower / General Store
          ctx.fillStyle = '#713F12';
          ctx.fillRect(598, 188, 162, 132);
          ctx.fillStyle = '#422006';
          ctx.fillRect(590, 178, 178, 14);

          // Sandy Main Street Floor
          ctx.fillStyle = '#D97706';
          ctx.fillRect(0, 315, LOGICAL_W, 145);
          ctx.fillStyle = '#B45309';
          ctx.fillRect(0, 315, LOGICAL_W, 8);

          // Foreground villains (cover layer)
          for (const v of s.villains) {
            if (v.spotId >= 3) drawVillain(ctx, v);
          }

          // Foreground cover props (Barrel, Porch Rail, Wagon)
          // Left barrel
          ctx.fillStyle = '#78350F';
          ctx.fillRect(150, 326, 70, 56);
          ctx.fillStyle = '#1E293B';
          ctx.fillRect(150, 336, 70, 5);
          ctx.fillRect(150, 366, 70, 5);

          // Center porch rail
          ctx.fillStyle = '#451A03';
          ctx.fillRect(352, 316, 94, 48);
          ctx.fillStyle = '#92400E';
          ctx.fillRect(356, 320, 86, 8);

          // Right wagon crate
          ctx.fillStyle = '#854D0E';
          ctx.fillRect(574, 328, 84, 54);
          ctx.strokeStyle = '#422006';
          ctx.lineWidth = 3;
          ctx.strokeRect(574, 328, 84, 54);

          // Drifting tumbleweed
          ctx.save();
          ctx.translate(s.tumbleX, 412 + Math.sin(s.tumbleX * 0.08) * 6);
          ctx.rotate(s.tumbleX * 0.06);
          ctx.strokeStyle = '#78350F';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 12, 0, Math.PI * 2);
          ctx.moveTo(-10, -4);
          ctx.lineTo(10, 4);
          ctx.moveTo(-4, 10);
          ctx.lineTo(4, -10);
          ctx.stroke();
          ctx.restore();

          // Flying Dynamite
          if (s.dynamite.active) {
            ctx.save();
            ctx.translate(s.dynamite.x, s.dynamite.y);
            ctx.rotate(s.dynamite.rot);
            ctx.fillStyle = '#DC2626';
            ctx.fillRect(-12, -5, 24, 10);
            ctx.fillStyle = '#FACC15';
            ctx.beginPath();
            ctx.arc(14, -4, 6 + Math.random() * 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          // Particles
          for (const p of s.particles) {
            if (!p.active) continue;
            ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
          }
          ctx.globalAlpha = 1;

          // Floaters
          for (const f of s.floaters) {
            if (!f.active) continue;
            ctx.fillStyle = f.color;
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(f.text, f.x, f.y);
          }

          // Damage vignette flash
          if (s.damageFlash > 0) {
            ctx.fillStyle = `rgba(220, 38, 38, ${s.damageFlash * 1.4})`;
            ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
          }

          // Muzzle Flash & Pistol Barrel Silhouette tracking mouse
          const gunPivotX = LOGICAL_W * 0.52 + (s.mouseX - LOGICAL_W / 2) * 0.35;
          if (s.muzzleFlash > 0) {
            ctx.fillStyle = '#FEF08A';
            ctx.beginPath();
            ctx.arc(gunPivotX, LOGICAL_H - 42, 22, 0, Math.PI * 2);
            ctx.fill();
          }

          // Simple SNES Revolver Silhouette at bottom edge
          ctx.fillStyle = '#1E293B';
          ctx.fillRect(gunPivotX - 9, LOGICAL_H - 48, 18, 48);
          ctx.fillStyle = '#475569';
          ctx.fillRect(gunPivotX - 5, LOGICAL_H - 52, 10, 32);

          // Crosshair Reticle
          if (phaseRef.current === 'playing') {
            ctx.strokeStyle = '#FEF08A';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(s.mouseX, s.mouseY, 15, 0, Math.PI * 2);
            ctx.moveTo(s.mouseX - 22, s.mouseY);
            ctx.lineTo(s.mouseX - 8, s.mouseY);
            ctx.moveTo(s.mouseX + 8, s.mouseY);
            ctx.lineTo(s.mouseX + 22, s.mouseY);
            ctx.moveTo(s.mouseX, s.mouseY - 22);
            ctx.lineTo(s.mouseX, s.mouseY - 8);
            ctx.moveTo(s.mouseX, s.mouseY + 8);
            ctx.lineTo(s.mouseX, s.mouseY + 22);
            ctx.stroke();

            ctx.fillStyle = '#EF4444';
            ctx.beginPath();
            ctx.arc(s.mouseX, s.mouseY, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    gameSfx.muted = next;
  };

  return (
    <div className="select-none">
      {/* Compact Top Arcade HUD */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#081224] text-[#F4F0E6] border-b border-[#1B3358] text-[11px] sm:text-xs font-mono">
        <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-2.5 sm:gap-x-4 gap-y-1">
          <span>
            PONTOS: <strong className="text-[#F5B731] text-xs sm:text-sm tabular-nums">{score}</strong>
          </span>
          <span>
            ONDA: <strong className="text-sky-400">{wave}/3</strong>
          </span>
          <span>
            VIDAS:{' '}
            <strong className="text-rose-400">
              {'★'.repeat(lives)}
              {'☆'.repeat(Math.max(0, 5 - lives))}
            </strong>
          </span>
          <span>
            BALAS:{' '}
            <strong className={reloading ? 'text-amber-300 animate-pulse' : 'text-emerald-400'}>
              {reloading ? 'RECARREGANDO...' : `${ammo}/6`}
            </strong>
          </span>
          {combo >= 2 && <span className="text-amber-300 font-bold">COMBO x{Math.min(3, 1 + Math.floor(combo / 4))}</span>}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {phase === 'playing' && (
            <>
              <button
                type="button"
                onClick={triggerReload}
                className="hidden sm:inline-flex px-2.5 py-1 rounded-xl md:rounded-sm bg-[#1B3358] hover:bg-[#27477A] text-[#F5B731] text-[11px] font-bold uppercase cursor-pointer"
              >
                Recarregar (R)
              </button>
              <button
                type="button"
                onClick={() => setPhase('paused')}
                aria-label="Pausar jogo"
                className="p-2 sm:p-1.5 rounded-xl md:rounded-sm bg-[#1B3358] hover:bg-[#27477A] text-white cursor-pointer"
              >
                <Pause size={14} />
              </button>
            </>
          )}
          {phase === 'paused' && (
            <button
              type="button"
              onClick={() => setPhase('playing')}
              className="px-2.5 py-1.5 rounded-xl md:rounded-sm bg-emerald-600 text-white text-[11px] font-bold uppercase cursor-pointer inline-flex items-center gap-1"
            >
              <Play size={12} /> Continuar
            </button>
          )}
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? 'Ativar som' : 'Silenciar som'}
            className="p-2 sm:p-1.5 rounded-xl md:rounded-sm bg-[#1B3358] hover:bg-[#27477A] text-white cursor-pointer"
          >
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>
      </div>

      {/* Canvas Arena Container */}
      <div className="relative w-full aspect-[16/11] sm:aspect-[800/460] bg-[#1C1917] overflow-hidden">
        <canvas
          ref={canvasRef}
          width={LOGICAL_W}
          height={LOGICAL_H}
          onMouseMove={(e) => {
            const pt = screenToWorld(e.clientX, e.clientY);
            stateRef.current.mouseX = pt.x;
            stateRef.current.mouseY = pt.y;
          }}
          onMouseDown={(e) => handleCanvasShoot(e.clientX, e.clientY)}
          onTouchStart={(e) => {
            if (e.touches[0]) {
              handleCanvasShoot(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          className={`w-full h-full block touch-none ${phase === 'playing' ? 'cursor-crosshair' : 'cursor-default'}`}
        />

        {/* Title Overlay (Zero backdrop-filter over canvas) */}
        {phase === 'title' && (
          <div className="absolute inset-0 bg-[#081224]/88 flex flex-col items-center justify-center p-4 sm:p-6 text-center text-[#F4F0E6]">
            <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-[#F5B731] mb-1.5 sm:mb-2 max-w-full truncate">
              <Crosshair size={13} className="shrink-0" />
              <span className="truncate">Faroeste 16-Bit · {articleTitle}</span>
            </div>
            <h4 className="font-display font-black text-xl sm:text-3xl uppercase tracking-tight text-white mb-1.5 sm:mb-2">
              Bangue-Bangue Faroeste
            </h4>
            <p className="text-[11px] sm:text-sm text-slate-300 max-w-md mb-3.5 sm:mb-5 leading-snug sm:leading-relaxed">
              Toque ou clique rápido para derrubar pistoleiros, dinamites no ar e bandidos blindados!
            </p>
            <button
              type="button"
              data-start="true"
              onClick={startGame}
              className="min-h-[44px] px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl md:rounded-sm bg-[#F5B731] hover:bg-[#E09F1F] text-[#081224] font-display font-black text-xs sm:text-sm uppercase tracking-wider cursor-pointer transition-colors inline-flex items-center gap-2 whitespace-nowrap"
            >
              <Play size={16} />
              <span>Sacar Pistola e Jogar</span>
            </button>
          </div>
        )}

        {/* Pause Overlay */}
        {phase === 'paused' && (
          <div className="absolute inset-0 bg-[#081224]/85 flex flex-col items-center justify-center p-4 sm:p-6 text-center text-white">
            <h4 className="font-display font-black text-xl sm:text-2xl uppercase mb-4">Duelo Pausado</h4>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPhase('playing')}
                className="min-h-[44px] px-5 py-2.5 rounded-xl md:rounded-sm bg-[#F5B731] text-[#081224] font-display font-extrabold text-xs uppercase cursor-pointer"
              >
                Retomar Duelo
              </button>
              <button
                type="button"
                onClick={startGame}
                className="min-h-[44px] px-4 py-2.5 rounded-xl md:rounded-sm bg-[#1B3358] text-white font-display font-bold text-xs uppercase cursor-pointer"
              >
                Reiniciar
              </button>
            </div>
          </div>
        )}

        {/* Victory / Game Over Overlay */}
        {(phase === 'victory' || phase === 'gameover') && (
          <div className="absolute inset-0 bg-[#081224]/90 flex flex-col items-center justify-center p-4 sm:p-6 text-center text-white">
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#F5B731] mb-1">
              {phase === 'victory' ? 'Cidade Salva!' : 'Fim do Duelo'}
            </div>
            <h4 className="font-display font-black text-xl sm:text-3xl uppercase mb-1.5 sm:mb-2">
              {phase === 'victory' ? 'Xerife Lendário!' : 'Os Bandidos Venceram'}
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 mb-4 sm:mb-5">
              Pontuação Final: <strong className="text-[#F5B731] font-mono">{score} pts</strong> · Onda {wave}/3
            </p>
            <button
              type="button"
              onClick={startGame}
              className="min-h-[44px] px-6 py-3 rounded-xl md:rounded-sm bg-[#F5B731] hover:bg-[#E09F1F] text-[#081224] font-display font-black text-xs sm:text-sm uppercase tracking-wider cursor-pointer inline-flex items-center gap-2 whitespace-nowrap"
            >
              <RotateCcw size={15} />
              <span>Jogar Novamente</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Mobile Thumb Control Bar */}
      <div className="sm:hidden flex items-center justify-between gap-2 px-3 py-2.5 bg-[#F4F1E8] dark:bg-[#0B1930] border-t border-stone-200 dark:border-[#1B3358]">
        <span className="text-[11px] font-mono text-stone-600 dark:text-slate-300">
          Toque direto nos bandidos para atirar
        </span>
        <button
          type="button"
          onClick={triggerReload}
          disabled={phase !== 'playing' || reloading || ammo === 6}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-[#081224] dark:bg-[#1B3358] disabled:opacity-45 text-[#F5B731] text-xs font-display font-extrabold uppercase tracking-wider cursor-pointer shrink-0 whitespace-nowrap"
        >
          {reloading ? 'Recarregando...' : `Recarregar (${ammo}/6)`}
        </button>
      </div>
    </div>
  );
}
