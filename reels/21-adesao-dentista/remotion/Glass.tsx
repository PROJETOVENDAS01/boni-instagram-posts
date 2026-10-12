import React from 'react';
import {Img, interpolate, staticFile, Easing} from 'remotion';

// Vidro em camadas: sombra, espessura (lâminas empilhadas), placa fosca, foto flutuando, selo, brilho especular e reflexo.
export const GlassCard: React.FC<{f: number; a: number; b: number; img: string; label: string; tag?: string; accent: string; gold?: string; w?: number; h?: number; side?: 'L' | 'R'; icon?: React.ReactNode}> = ({f, a, b, img, label, tag, accent, gold = '#F5B800', w = 330, h = 400, side = 'R', icon}) => {
  if (f < a - 2 || f > b + 10) return null;
  const k = f - a;
  const pin = interpolate(k, [0, 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.4))});
  const out = interpolate(f, [b, b + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
  const dir = side === 'R' ? 1 : -1;
  const ry = dir * (-32 + 8 * Math.sin(k / 30)) + (1 - pin) * dir * -70 + out * dir * 60;
  const rx = 10 + 4 * Math.cos(k / 36);
  const tz = (1 - pin) * -500 - out * 300;
  const sweep = interpolate(k % 70, [6, 40], [-60, 160], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const kb = interpolate(k, [0, 150], [1.06, 1.2], {extrapolateRight: 'clamp'});
  const slabs = Array.from({length: 7});
  return (
    <div style={{position: 'absolute', width: w, height: h, perspective: 1300, opacity: (1 - out) * Math.min(1, pin * 1.4)}}>
      <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `translateZ(${tz}px) rotateX(${rx}deg) rotateY(${ry}deg)`}}>
        {/* sombra projetada */}
        <div style={{position: 'absolute', left: 20, right: -10, top: 40, bottom: -30, borderRadius: 34, background: 'rgba(0,0,0,.65)', filter: 'blur(28px)', transform: 'translateZ(-60px)'}} />
        {/* espessura do vidro: lâminas empilhadas */}
        {slabs.map((_, i) => (
          <div key={i} style={{position: 'absolute', inset: 0, borderRadius: 30, border: `2px solid ${i < 3 ? accent : 'rgba(255,255,255,.35)'}`, opacity: 0.18 + i * 0.05, transform: `translateZ(${-36 + i * 6}px)`, background: i === 0 ? 'rgba(10,20,22,.35)' : 'transparent'}} />
        ))}
        {/* placa fosca */}
        <div style={{position: 'absolute', inset: 0, borderRadius: 30, overflow: 'hidden', background: 'linear-gradient(150deg, rgba(255,255,255,.38), rgba(255,255,255,.12) 45%, rgba(255,255,255,.04))', backdropFilter: 'blur(18px) saturate(1.6)', border: '1.5px solid rgba(255,255,255,.55)', boxShadow: `inset 0 1px 0 rgba(255,255,255,.7), inset 0 -24px 50px rgba(0,0,0,.35), 0 0 40px ${accent}55`}}>
          {/* borda de luz que gira */}
          <div style={{position: 'absolute', inset: -2, borderRadius: 32, padding: 2, background: `conic-gradient(from ${k * 3}deg, ${gold}, ${accent}, rgba(255,255,255,.9), ${gold})`, WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', opacity: 0.9}} />
        </div>
        {/* foto flutuando acima do vidro */}
        <div style={{position: 'absolute', left: 16, right: 16, top: tag ? 56 : 16, height: h - (tag ? 56 : 16) - 84, borderRadius: 20, overflow: 'hidden', transform: 'translateZ(40px)', boxShadow: '0 26px 50px rgba(0,0,0,.6)'}}>
          <Img src={staticFile(`img/${img}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${kb})`}} />
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,.5))'}} />
        </div>
        {tag && <div style={{position: 'absolute', left: 22, top: 16, transform: 'translateZ(50px)', fontFamily: 'Poppins', fontWeight: 800, fontSize: 22, letterSpacing: 3, color: '#fff', textShadow: `0 0 14px ${accent}`}}>{tag}</div>}
        {/* rótulo em vidro mais à frente */}
        <div style={{position: 'absolute', left: 18, right: 18, bottom: 16, height: 60, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transform: 'translateZ(75px)', background: 'rgba(8,14,16,.55)', backdropFilter: 'blur(10px)', border: `1.5px solid ${gold}`, boxShadow: `0 10px 24px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.35)`}}>
          {icon}
          <span style={{fontFamily: 'Poppins', fontWeight: 800, fontSize: label.length > 12 ? 24 : 30, color: '#fff', whiteSpace: 'nowrap'}}>{label}</span>
        </div>
        {/* brilho especular por cima de tudo */}
        <div style={{position: 'absolute', inset: 0, borderRadius: 30, overflow: 'hidden', transform: 'translateZ(90px)', pointerEvents: 'none'}}>
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(125deg, rgba(255,255,255,.35) 0%, rgba(255,255,255,0) 28%)'}} />
          <div style={{position: 'absolute', top: '-20%', bottom: '-20%', left: `${sweep}%`, width: '22%', background: 'linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,.45), rgba(255,255,255,0))', transform: 'skewX(-16deg)', mixBlendMode: 'screen'}} />
        </div>
      </div>
    </div>
  );
};
