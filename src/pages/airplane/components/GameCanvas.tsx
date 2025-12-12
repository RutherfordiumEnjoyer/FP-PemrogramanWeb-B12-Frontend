import { useEffect, useRef, useState } from 'react';
import type { Player, Cloud } from '../types';

interface GameCanvasProps {
  player: Player;
  clouds: Cloud[];
  width: number;
  height: number;
  hit: { x: number; y: number; t: number } | null;
  successHit: { x: number; y: number; t: number } | null;
}

const IMG_PLANE = "/assets/game/airplane/airplane.png";
const IMG_CLOUD = "/assets/game/airplane/cloud.png";
const VIDEO_BG = "/assets/game/airplane/sky-bg.mp4";

export const GameCanvas = ({ player, clouds, width, height, hit, successHit }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  const planeImg = useRef<HTMLImageElement>(new Image());
  const cloudImg = useRef<HTMLImageElement>(new Image());

  // HAPUS lastHitRef KARENA TIDAK DIPAKAI LAGI
  const HIT_DURATION = 600;

  useEffect(() => {
    let loadedCount = 0;
    const totalImages = 2;

    const checkLoad = () => {
      loadedCount++;
      if (loadedCount >= totalImages) setImagesLoaded(true);
    };

    planeImg.current.src = IMG_PLANE;
    planeImg.current.onload = checkLoad;
    planeImg.current.onerror = () => { 
        console.warn("Gagal load airplane.png"); 
        checkLoad(); 
    };

    cloudImg.current.src = IMG_CLOUD;
    cloudImg.current.onload = checkLoad;
    cloudImg.current.onerror = () => { 
        console.warn("Gagal load cloud.png"); 
        checkLoad(); 
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const now = performance.now();

    ctx.clearRect(0, 0, width, height);

    // --- DRAW PLAYER ---
    ctx.save();
    const baseTilt = Math.max(Math.min(player.vy * 2, 25), -25) * (Math.PI / 180);
    let extraShakeX = 0;
    let extraShakeY = 0;
    let extraTilt = 0;
    
    // Efek getar hanya jika kena HIT (salah)
    if (hit) {
      const elapsed = now - hit.t;
      if (elapsed < HIT_DURATION) {
        const p = 1 - elapsed / HIT_DURATION;
        const shakeAmp = 6 * p;
        extraShakeX = (Math.random() - 0.5) * shakeAmp;
        extraShakeY = (Math.random() - 0.5) * shakeAmp;
        extraTilt = (Math.sin(elapsed / 30) * 8 * p) * (Math.PI / 180);
      }
    }
    
    ctx.translate(player.x + player.width / 2 + extraShakeX, player.y + player.height / 2 + extraShakeY);
    ctx.rotate(baseTilt + extraTilt);
    
    if (planeImg.current.complete && planeImg.current.naturalWidth > 0) {
        ctx.drawImage(planeImg.current, -player.width / 2, -player.height / 2, player.width, player.height);
    } else {
        ctx.fillStyle = "blue";
        ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
    }
    ctx.restore();

    // --- DRAW CLOUDS ---
    ctx.font = "bold 24px 'Comic Sans MS', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    clouds.forEach(cloud => {
        if (cloudImg.current.complete && cloudImg.current.naturalWidth > 0) {
            ctx.drawImage(cloudImg.current, cloud.x, cloud.y, cloud.width, cloud.height);
        } else {
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.beginPath();
            ctx.ellipse(cloud.x + cloud.width/2, cloud.y + cloud.height/2, cloud.width/2, cloud.height/2, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        
        const textYOffset = 5; 
        ctx.fillStyle = "#333";
        ctx.fillText(cloud.text, cloud.x + cloud.width / 2, cloud.y + cloud.height / 2 + textYOffset);
    });

    // --- DRAW HIT EFFECT SALAH (MERAH) ---
    if (hit) {
      const elapsed = now - hit.t;
      if (elapsed < HIT_DURATION) {
        const p = elapsed / HIT_DURATION;
        
        ctx.save();
        ctx.globalAlpha = 0.35 * (1 - p);
        ctx.fillStyle = "#ff0000"; 
        ctx.fillRect(0, 0, width, height);
        ctx.restore();

        const maxR = Math.max(width, height) * 0.12;
        const r = maxR * p;
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,80,0,${0.9 * (1 - p)})`;
        ctx.arc(hit.x, hit.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    
    // --- DRAW SUCCESS HIT EFFECT BENAR (HIJAU) ---
    if (successHit) {
        const elapsed = now - successHit.t;
        if (elapsed < HIT_DURATION) {
            const p = elapsed / HIT_DURATION;
            
            ctx.save();
            ctx.globalAlpha = 0.35 * (1 - p);
            ctx.fillStyle = "#00ff00"; 
            ctx.fillRect(0, 0, width, height);
            ctx.restore();

            const maxR = Math.max(width, height) * 0.12;
            const r = maxR * p;
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = `rgba(50,255,50,${0.9 * (1 - p)})`;
            ctx.arc(successHit.x, successHit.y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

  }, [player, clouds, imagesLoaded, width, height, hit, successHit]);

  return (
    <div 
        className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-slate-800 cursor-default bg-sky-300"
        style={{ width, height }}
    >
        <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none z-0"
        >
            <source src={VIDEO_BG} type="video/mp4" />
        </video>

        <canvas 
            ref={canvasRef}
            width={width}
            height={height}
            className="relative z-10 block"
        />
        
        {!imagesLoaded && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white z-20">
                Loading Assets...
             </div>
        )}
    </div>
  );
};