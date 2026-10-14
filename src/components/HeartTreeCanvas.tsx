import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BlossomHeart, FallingPetal, GroundHeart, InteractiveClickParticle } from '../types';
import { birthdayAudio } from '../utils/audio';
import { Sparkles, Wind, RefreshCw, Volume2, VolumeX, Maximize2, Minimize2, Heart } from 'lucide-react';

interface HeartTreeCanvasProps {
  name?: string;
  onOpenLetter?: () => void;
  onOpenCake?: () => void;
  onOpenWishes?: () => void;
}

// Parametric Heart Formula
function getHeartPoint(t: number, scale: number = 16): { x: number; y: number } {
  // t is in radians [0, 2*PI]
  const x = scale * 16 * Math.pow(Math.sin(t), 3);
  const y = -scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
  return { x, y };
}

// Check if a point is inside the parametric heart
function isInsideHeart(px: number, py: number, scale: number = 16): boolean {
  // Normalize
  const nx = px / (scale * 16);
  const ny = -py / (scale * 16);
  // Classic heart implicit approximation: (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
  const term = nx * nx + ny * ny - 0.75;
  return term * term * term - nx * nx * ny * ny * ny <= 0.05;
}

// Draw a filled stylized 2D heart on canvas
function drawHeartShape(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string,
  alpha: number = 1,
  rotation: number = 0
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.fillStyle = color;

  ctx.beginPath();
  const topCurveHeight = size * 0.35;
  ctx.moveTo(0, topCurveHeight);
  // top left curve
  ctx.bezierCurveTo(
    -size / 2, -size / 2,
    -size, size / 3,
    0, size
  );
  // top right curve
  ctx.bezierCurveTo(
    size, size / 3,
    size / 2, -size / 2,
    0, topCurveHeight
  );
  ctx.closePath();
  ctx.fill();

  // Subtle gloss/sparkle highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.beginPath();
  ctx.arc(-size * 0.22, 0, size * 0.12, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export const HeartTreeCanvas: React.FC<HeartTreeCanvasProps> = ({
  name = 'Myraa',
  onOpenLetter,
  onOpenCake,
  onOpenWishes,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [cleanReelMode, setCleanReelMode] = useState<boolean>(false);
  const [headerStyle, setHeaderStyle] = useState<'myraa' | 'her'>('myraa');
  const [treeStage, setTreeStage] = useState<'growing' | 'blooming' | 'complete'>('growing');
  const [heartsCount, setHeartsCount] = useState<number>(0);

  // Animation internal state refs
  const animationFrameId = useRef<number | null>(null);
  const trunkGrowthRef = useRef<number>(0);
  const blossomsRef = useRef<BlossomHeart[]>([]);
  const fallingPetalsRef = useRef<FallingPetal[]>([]);
  const groundHeartsRef = useRef<GroundHeart[]>([]);
  const clickParticlesRef = useRef<InteractiveClickParticle[]>([]);
  const windForceRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  // Generate Heart Blossom Positions
  const initTreeData = useCallback((width: number, height: number) => {
    trunkGrowthRef.current = 0;
    groundHeartsRef.current = [];
    fallingPetalsRef.current = [];
    clickParticlesRef.current = [];

    // Scale heart size based on viewport
    const minDim = Math.min(width, height);
    const heartScale = Math.max(9, Math.min(22, minDim * 0.024));

    const heartCenterY = height * 0.44;
    const heartCenterX = width / 2;

    // Palette matching the viral Instagram video:
    // vibrant yellow, bright peach, hot pink, rose, baby pink, coral, creamy white
    const colors = [
      '#ffd166', // warm golden yellow
      '#ffbe0b', // vibrant yellow
      '#ffea79', // soft bright yellow
      '#ff758c', // blush pink
      '#ff4b72', // hot pink
      '#ff6584', // punchy pink
      '#ff9a76', // peach
      '#ffa07a', // soft coral
      '#f72585', // deep magenta rose
      '#e63946', // vibrant ruby
      '#fff0f5', // softest lavender white
      '#ffffff', // sparkling white
      '#fca311', // amber orange
    ];

    const blossoms: BlossomHeart[] = [];
    const totalBlossoms = Math.floor(Math.min(950, Math.max(500, (width * height) / 1000)));

    // 1. Boundary hearts along parametric curve
    const perimeterCount = Math.floor(totalBlossoms * 0.38);
    for (let i = 0; i < perimeterCount; i++) {
      const t = (i / perimeterCount) * Math.PI * 2;
      const pt = getHeartPoint(t, heartScale);
      // Small jitter around outline
      const jitter = (Math.random() - 0.5) * (heartScale * 3.5);
      const angleJitter = Math.random() * Math.PI * 2;
      const x = heartCenterX + pt.x + Math.cos(angleJitter) * jitter;
      const y = heartCenterY + pt.y + Math.sin(angleJitter) * jitter;

      blossoms.push({
        id: i,
        x,
        y,
        targetScale: 10 + Math.random() * 12,
        scale: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: (Math.random() - 0.5) * 1.2,
        flutterSpeed: 0.002 + Math.random() * 0.004,
        flutterOffset: Math.random() * Math.PI * 2,
        bloomDelay: 0.4 + (Math.sqrt(pt.x * pt.x + pt.y * pt.y) / (heartScale * 18)) * 0.6,
        bloomed: false,
        alpha: 0,
      });
    }

    // 2. Interior filling hearts
    const interiorCount = totalBlossoms - perimeterCount;
    for (let i = 0; i < interiorCount; i++) {
      // Rejection sampling for uniform organic fill inside heart
      let found = false;
      let x = 0;
      let y = 0;
      let attempts = 0;

      while (!found && attempts < 80) {
        attempts++;
        const rx = (Math.random() - 0.5) * heartScale * 34;
        const ry = (Math.random() - 0.5) * heartScale * 34;
        if (isInsideHeart(rx, ry, heartScale)) {
          x = heartCenterX + rx + (Math.random() - 0.5) * 10;
          y = heartCenterY + ry + (Math.random() - 0.5) * 10;
          found = true;
        }
      }

      if (!found) {
        // Fallback to parametric distribution
        const t = Math.random() * Math.PI * 2;
        const rad = Math.sqrt(Math.random());
        const pt = getHeartPoint(t, heartScale * rad);
        x = heartCenterX + pt.x;
        y = heartCenterY + pt.y;
      }

      const dist = Math.hypot(x - heartCenterX, y - heartCenterY);
      blossoms.push({
        id: perimeterCount + i,
        x,
        y,
        targetScale: 8 + Math.random() * 14,
        scale: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: (Math.random() - 0.5) * 1.4,
        flutterSpeed: 0.002 + Math.random() * 0.004,
        flutterOffset: Math.random() * Math.PI * 2,
        bloomDelay: 0.35 + (dist / (heartScale * 18)) * 0.65,
        bloomed: false,
        alpha: 0,
      });
    }

    blossomsRef.current = blossoms;
    setHeartsCount(blossoms.length);
  }, []);

  // Handle Resize and Canvas Setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      initTreeData(rect.width, rect.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initTreeData]);

  // Main 60fps Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      timeRef.current += dt;
      const time = timeRef.current;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const groundY = height * 0.88;
      const trunkBaseX = width / 2;

      // 1. Dark pitch-black Instagram aesthetic background with gentle soft starlight
      ctx.fillStyle = '#020104';
      ctx.fillRect(0, 0, width, height);

      // Subtle celestial nebula glow behind the heart tree
      const bgGrad = ctx.createRadialGradient(
        width / 2, height * 0.44, 20,
        width / 2, height * 0.44, Math.max(width, height) * 0.6
      );
      bgGrad.addColorStop(0, 'rgba(255, 75, 114, 0.09)');
      bgGrad.addColorStop(0.5, 'rgba(150, 40, 90, 0.04)');
      bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Bottom ground baseline (soft glowing pastel pink line matching viral video)
      ctx.save();
      ctx.shadowColor = 'rgba(255, 182, 193, 0.8)';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = '#f8b4d9';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();
      ctx.restore();

      // 3. Tree Trunk Growth Animation
      if (trunkGrowthRef.current < 1) {
        trunkGrowthRef.current += dt * 0.55;
        if (trunkGrowthRef.current >= 1) {
          trunkGrowthRef.current = 1;
          setTreeStage('blooming');
        }
      }

      const progress = trunkGrowthRef.current;
      const trunkTopY = height * 0.54;
      const currentTrunkY = groundY - (groundY - trunkTopY) * Math.min(1, progress * 1.1);

      // Draw Tree Trunk (Soft pastel pink/wood tone like in the viral video)
      ctx.save();
      const trunkGrad = ctx.createLinearGradient(trunkBaseX - 15, groundY, trunkBaseX + 15, trunkTopY);
      trunkGrad.addColorStop(0, '#fca5a5'); // soft warm pink
      trunkGrad.addColorStop(0.5, '#f472b6'); // vibrant pinkish trunk
      trunkGrad.addColorStop(1, '#fda4af'); // rosewood highlight

      ctx.fillStyle = trunkGrad;

      // Organic tapered trunk with slight curved flare at the base
      ctx.beginPath();
      const baseWidth = 24;
      const topWidth = 14;

      ctx.moveTo(trunkBaseX - baseWidth / 2, groundY);
      // Left edge curving slightly inward
      ctx.quadraticCurveTo(
        trunkBaseX - baseWidth * 0.4,
        (groundY + currentTrunkY) / 2,
        trunkBaseX - topWidth / 2,
        currentTrunkY
      );
      ctx.lineTo(trunkBaseX + topWidth / 2, currentTrunkY);
      // Right edge curving slightly inward
      ctx.quadraticCurveTo(
        trunkBaseX + baseWidth * 0.4,
        (groundY + currentTrunkY) / 2,
        trunkBaseX + baseWidth / 2,
        groundY
      );
      ctx.closePath();
      ctx.fill();

      // Branches branching out into the lobes when trunk is >= 65% grown
      if (progress > 0.6) {
        const branchProgress = Math.min(1, (progress - 0.6) / 0.4);
        ctx.strokeStyle = '#f472b6';
        ctx.lineCap = 'round';

        // Left branch
        ctx.lineWidth = 6 * branchProgress;
        ctx.beginPath();
        ctx.moveTo(trunkBaseX, currentTrunkY + 12);
        ctx.quadraticCurveTo(
          trunkBaseX - 45 * branchProgress,
          currentTrunkY - 20 * branchProgress,
          trunkBaseX - 70 * branchProgress,
          currentTrunkY - 50 * branchProgress
        );
        ctx.stroke();

        // Right branch
        ctx.lineWidth = 6 * branchProgress;
        ctx.beginPath();
        ctx.moveTo(trunkBaseX, currentTrunkY + 8);
        ctx.quadraticCurveTo(
          trunkBaseX + 45 * branchProgress,
          currentTrunkY - 25 * branchProgress,
          trunkBaseX + 75 * branchProgress,
          currentTrunkY - 55 * branchProgress
        );
        ctx.stroke();

        // Center upper branch
        ctx.lineWidth = 5 * branchProgress;
        ctx.beginPath();
        ctx.moveTo(trunkBaseX, currentTrunkY + 6);
        ctx.quadraticCurveTo(
          trunkBaseX - 10 * branchProgress,
          currentTrunkY - 35 * branchProgress,
          trunkBaseX,
          currentTrunkY - 65 * branchProgress
        );
        ctx.stroke();
      }
      ctx.restore();

      // 4. Render Blossom Hearts (The giant heart crown!)
      if (progress > 0.4) {
        const blossoms = blossomsRef.current;
        const globalBloomPhase = (progress - 0.4) / 0.6; // 0 to 1

        for (let i = 0; i < blossoms.length; i++) {
          const b = blossoms[i];

          // Bloom transition
          if (globalBloomPhase >= b.bloomDelay) {
            if (!b.bloomed) {
              b.bloomed = true;
            }
            if (b.scale < b.targetScale) {
              b.scale += (b.targetScale - b.scale) * dt * 4.5;
            }
            if (b.alpha < 1) {
              b.alpha += dt * 3.5;
            }
          }

          if (b.scale > 0.5) {
            // Organic fluttering motion + wind breeze
            const flutter = Math.sin(time * 3 + b.flutterOffset) * 0.08;
            const currentScale = b.scale * (1 + flutter);
            const rot = b.rotation + Math.sin(time * 2 + b.flutterOffset) * 0.15 + windForceRef.current * 0.2;

            drawHeartShape(
              ctx,
              b.x + Math.sin(time + b.flutterOffset) * 2,
              b.y + Math.cos(time + b.flutterOffset) * 2,
              currentScale,
              b.color,
              Math.min(1, b.alpha),
              rot
            );

            // Chance to shed a falling petal once fully bloomed
            if (b.bloomed && Math.random() < 0.00045) {
              fallingPetalsRef.current.push({
                id: Math.random(),
                x: b.x + (Math.random() - 0.5) * 10,
                y: b.y + (Math.random() - 0.5) * 10,
                vx: (Math.random() - 0.5) * 20 + windForceRef.current * 40,
                vy: 25 + Math.random() * 35,
                size: 7 + Math.random() * 7,
                color: b.color,
                rotation: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 2.5,
                alpha: 0.95,
                flutterPhase: Math.random() * Math.PI * 2,
              });
            }
          }
        }
      }

      // Wind force decay
      if (Math.abs(windForceRef.current) > 0.01) {
        windForceRef.current *= 0.985;
      }

      // 5. Render Falling Petals
      const petals = fallingPetalsRef.current;
      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        p.flutterPhase += dt * 3;
        // Swaying drift
        const sway = Math.sin(p.flutterPhase) * 25;
        p.x += (p.vx + sway + windForceRef.current * 50) * dt;
        p.y += p.vy * dt;
        p.rotation += p.vRot * dt;

        drawHeartShape(ctx, p.x, p.y, p.size, p.color, p.alpha, p.rotation);

        // Petal lands on ground line
        if (p.y >= groundY - 4) {
          groundHeartsRef.current.push({
            x: p.x,
            y: groundY - Math.random() * 8,
            size: p.size * 0.85,
            color: p.color,
            rotation: p.rotation,
            alpha: 0.85,
          });
          // Limit ground petals to keep performance fast
          if (groundHeartsRef.current.length > 250) {
            groundHeartsRef.current.shift();
          }
          petals.splice(i, 1);
        }
      }

      // 6. Render Ground Hearts Bed
      const groundPetals = groundHeartsRef.current;
      for (let i = 0; i < groundPetals.length; i++) {
        const gp = groundPetals[i];
        drawHeartShape(ctx, gp.x, gp.y, gp.size, gp.color, gp.alpha, gp.rotation);
      }

      // 7. Render Interactive Click Particles (Sparkling hearts exploding from touch)
      const clicks = clickParticlesRef.current;
      for (let i = clicks.length - 1; i >= 0; i--) {
        const cp = clicks[i];
        cp.x += cp.vx * dt;
        cp.y += cp.vy * dt;
        cp.vy += 20 * dt; // gravity
        cp.alpha -= dt * 0.9;
        cp.rotation += 2 * dt;

        if (cp.alpha <= 0) {
          clicks.splice(i, 1);
        } else {
          drawHeartShape(ctx, cp.x, cp.y, cp.size, cp.color, cp.alpha, cp.rotation);
        }
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // Handle Canvas Tap/Click to Spawn Romantic Hearts + Play Chime
  const handleCanvasInteraction = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    birthdayAudio.playHeartPop();

    // Spawn 8-12 burst hearts
    const colors = ['#ffd166', '#ff4b72', '#ff758c', '#ffbe0b', '#f72585', '#ffffff', '#ff9a76'];
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const speed = 40 + Math.random() * 80;
      clickParticlesRef.current.push({
        id: Math.random(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        size: 9 + Math.random() * 9,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        rotation: Math.random() * Math.PI * 2,
      });
    }

    // Also trigger wind breeze in that direction
    const centerX = rect.width / 2;
    windForceRef.current = (x > centerX ? 1 : -1) * 0.4;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    handleCanvasInteraction(e.clientX, e.clientY);
  };

  // Trigger Breeze
  const handleTriggerBreeze = () => {
    windForceRef.current = (Math.random() > 0.5 ? 1 : -1) * 0.9;
    birthdayAudio.playChime(659.25, 0.8);
    // Spawn 25 extra falling petals
    const blossoms = blossomsRef.current;
    for (let i = 0; i < 25; i++) {
      const b = blossoms[Math.floor(Math.random() * blossoms.length)];
      if (b) {
        fallingPetalsRef.current.push({
          id: Math.random(),
          x: b.x,
          y: b.y,
          vx: windForceRef.current * 100 + (Math.random() - 0.5) * 40,
          vy: 20 + Math.random() * 40,
          size: 8 + Math.random() * 8,
          color: b.color,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 4,
          alpha: 1,
          flutterPhase: Math.random() * Math.PI * 2,
        });
      }
    }
  };

  // Re-grow Tree Animation
  const handleRegrow = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setTreeStage('growing');
    initTreeData(rect.width, rect.height);
    birthdayAudio.playChime(523.25, 1.2);
  };

  // Toggle Music Box
  const handleToggleAudio = () => {
    const isPlaying = birthdayAudio.toggleMelody();
    setIsPlayingAudio(isPlaying);
  };

  return (
    <div className="relative w-full h-full min-h-[560px] md:min-h-[640px] flex flex-col items-center justify-between overflow-hidden bg-black select-none">
      {/* Trending Instagram Header - Exact match to the screenshot */}
      <div className="absolute top-4 sm:top-8 left-0 right-0 z-20 flex flex-col items-center text-center px-4 pointer-events-none">
        <div className="flex items-center gap-2 drop-shadow-[0_0_20px_rgba(255,75,114,0.7)] animate-heart-pulse">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white font-body flex items-center gap-2">
            <span>{headerStyle === 'myraa' ? `Pov:) its ${name}'s` : 'Pov:) its Her'}</span>
            <span className="text-red-500 inline-block animate-bounce">❤️</span>
            <span>Birthday</span>
            <span className="inline-block transform rotate-6">💕</span>
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-pink-300/80 mt-1.5 font-caveat tracking-wider text-shadow">
          Tap anywhere on the tree to blossom love & play music box ✨
        </p>
      </div>

      {/* Floating Audio Controller */}
      <button
        onClick={handleToggleAudio}
        aria-label="Toggle birthday music box"
        className={`fixed top-4 right-4 z-40 flex items-center gap-2.5 px-3.5 py-2 rounded-full border backdrop-blur-md transition-all duration-300 ${
          isPlayingAudio
            ? 'bg-pink-600/30 border-pink-500/60 text-pink-200 shadow-[0_0_15px_rgba(255,105,180,0.5)]'
            : 'bg-black/40 border-white/20 text-white/70 hover:text-white hover:border-pink-500/40'
        }`}
      >
        <span className="relative flex h-3 w-3">
          {isPlayingAudio && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-3 w-3 ${
              isPlayingAudio ? 'bg-pink-500' : 'bg-gray-400'
            }`}
          ></span>
        </span>
        {isPlayingAudio ? <Volume2 size={16} /> : <VolumeX size={16} />}
        <span className="text-xs font-medium tracking-wide">
          {isPlayingAudio ? 'Music Box Playing 🎵' : 'Play Music 🎶'}
        </span>
      </button>

      {/* Clean Reel Mode Toggle (For recording clean Instagram videos like in the viral post) */}
      <button
        onClick={() => setCleanReelMode(!cleanReelMode)}
        title={cleanReelMode ? 'Show Controls' : 'Instagram Reel Mode (Hide UI)'}
        className="fixed top-4 left-4 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 border border-white/20 text-white/80 hover:text-white backdrop-blur-md text-xs transition"
      >
        {cleanReelMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        <span className="hidden sm:inline">{cleanReelMode ? 'Show Controls' : 'Reel Mode 🎬'}</span>
      </button>

      {/* Main Heart Tree Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        className="w-full h-full cursor-pointer touch-none block"
        style={{ minHeight: '520px' }}
      />

      {/* Interactive Floating Action Bar (Hidden in Reel Mode) */}
      {!cleanReelMode && (
        <div className="absolute bottom-5 sm:bottom-7 left-0 right-0 z-30 flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-4 pointer-events-auto">
          {/* Re-bloom / Regrow */}
          <button
            onClick={handleRegrow}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-pink-950/60 hover:bg-pink-900/80 border border-pink-500/40 text-pink-100 backdrop-blur-md text-xs sm:text-sm font-medium transition active:scale-95 shadow-lg shadow-pink-950/50"
          >
            <RefreshCw size={14} className="animate-spin-slow" />
            <span>Re-grow Tree 🌱</span>
          </button>

          {/* Blow Breeze */}
          <button
            onClick={handleTriggerBreeze}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-pink-950/60 hover:bg-pink-900/80 border border-pink-500/40 text-pink-100 backdrop-blur-md text-xs sm:text-sm font-medium transition active:scale-95 shadow-lg shadow-pink-950/50"
          >
            <Wind size={14} />
            <span>Gentle Breeze 🍃</span>
          </button>

          {/* Header Title Switcher */}
          <button
            onClick={() => setHeaderStyle(headerStyle === 'myraa' ? 'her' : 'myraa')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-pink-950/60 hover:bg-pink-900/80 border border-pink-500/40 text-pink-100 backdrop-blur-md text-xs sm:text-sm font-medium transition active:scale-95 shadow-lg shadow-pink-950/50"
          >
            <Heart size={14} className="text-pink-400 fill-pink-400" />
            <span>{headerStyle === 'myraa' ? "Switch to 'Her' 💕" : "Show 'Myraa' ❤️"}</span>
          </button>

          {/* Direct Shortcuts to Other Birthday Surprises */}
          {onOpenCake && (
            <button
              onClick={onOpenCake}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 text-white font-semibold text-xs sm:text-sm shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:brightness-110 active:scale-95 transition"
            >
              <span>🎂 Make a Wish</span>
            </button>
          )}

          {onOpenLetter && (
            <button
              onClick={onOpenLetter}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold text-xs sm:text-sm shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:brightness-110 active:scale-95 transition"
            >
              <span>💌 Myraa's Letter</span>
            </button>
          )}

          {onOpenWishes && (
            <button
              onClick={onOpenWishes}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-pink-950/60 hover:bg-pink-900/80 border border-pink-500/40 text-pink-100 backdrop-blur-md text-xs sm:text-sm font-medium transition active:scale-95 shadow-lg shadow-pink-950/50"
            >
              <Sparkles size={14} className="text-yellow-400" />
              <span>Sky Lantern 🏮</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
