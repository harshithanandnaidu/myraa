export interface BlossomHeart {
  id: number;
  x: number;
  y: number;
  targetScale: number;
  scale: number;
  color: string;
  rotation: number;
  flutterSpeed: number;
  flutterOffset: number;
  bloomDelay: number;
  bloomed: boolean;
  alpha: number;
}

export interface FallingPetal {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  alpha: number;
  flutterPhase: number;
}

export interface GroundHeart {
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  alpha: number;
}

export interface InteractiveClickParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
}

export interface WishLantern {
  id: string;
  sender: string;
  message: string;
  x: number;
  y: number;
  speed: number;
  scale: number;
  glowColor: string;
  wobblePhase: number;
}
