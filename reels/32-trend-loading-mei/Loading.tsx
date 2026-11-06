import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing, random} from 'remotion';

const FPS = 30;
const GOLD = '#F5B800';
const GOLD2 = '#FFE08A';
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const T_DROP = 4.0; // segundo do "drop" da trilha (ajustado pela batida real)
const fr = (s: number) => Math.round(s * FPS);
export const DUR_LOADING = fr(8.0);
const fontCss = `
@font-face{font-family:Poppins;font-weight:800;src:url(${staticFile('Poppins-Bold.ttf')})}
@font-face{font-family:Poppins;font-weight:500;src:url(${staticFile('Poppins-Medium.ttf')})}`;
const card: React.CSSProperties = {padding: '22px 34px', borderRadius: 28, fontFamily: 'Poppins', fontWeight: 800, fontSize: 54, lineHeight: 1.15, textAlign: 'center', color: '#111', background: '#fff', boxShadow: '0 12px 40px rgba(0,0,0,.45)'};

const Texto: React.FC<{at: number; children: React.ReactNode; dark?: boolean}> = ({at, children, dark}) => {
  const f = useCurrentFrame();
  const p = spring({frame: f - at, fps: FPS, config: {damping: 14, stiffness: 200}});
  return (
    <div style={{position: 'absolute', top: 1000, left: 60, right: 60, display: 'flex', justifyContent: 'center', transform: `scale(${0.7 + 0.3 * p})`, opacity: Math.min(1, p * 2)}}>
      <div style={{...card, ...(dark ? {background: 'rgba(10,8,2,.88)', color: '#fff', border: `3px solid ${GOLD}`} : {})}}>{children}</div>
    </div>
  );
};

const Barra: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const ok = t >= T_DROP;
  const pct = ok ? 100 : interpolate(t, [0.3, 2.6, 3.4, T_DROP], [0, 61, 87, 87], {...cl, easing: Easing.out(Easing.quad)});
  const travado = !ok && t > 3.2;
  const pisca = travado && Math.floor(f / 6) % 2 === 0;
  const pop = ok ? spring({frame: f - fr(T_DROP), fps: FPS, config: {damping: 10, stiffness: 220}}) : 1;
  return (
    <div style={{position: 'absolute', left: 110, right: 110, top: 1330, fontFamily: 'Poppins', transform: `scale(${ok ? 0.85 + 0.15 * pop : 1})`}}>
      <div style={{fontSize: 38, fontWeight: 800, letterSpacing: 4, marginBottom: 14, textAlign: 'center', color: ok ? GOLD2 : '#fff', textShadow: '0 2px 12px #000', opacity: pisca ? 0.35 : 1}}>
        {ok ? 'PLANO IDEAL ENCONTRADO ✓' : `CARREGANDO PLANO… ${Math.round(pct)}%`}
      </div>
      <div style={{height: 34, borderRadius: 17, background: 'rgba(0,0,0,.55)', border: `3px solid ${ok ? GOLD : '#fff'}`, overflow: 'hidden'}}>
        <div style={{width: `${pct}%`, height: '100%', background: ok ? `linear-gradient(90deg, ${GOLD}, ${GOLD2})` : '#9aa0a6', boxShadow: ok ? `0 0 24px ${GOLD}` : undefined}} />
      </div>
    </div>
  );
};

const Confete: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: 70}).map((_, i) => {
        const x0 = 540 + (random('x' + i) - 0.5) * 300, vx = (random('vx' + i) - 0.5) * 34, vy = -18 - random('vy' + i) * 26;
        const x = x0 + vx * f, y = 1000 + vy * f + 0.9 * f * f;
        if (y > 2000) return null;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: 14, height: 22, background: i % 3 ? GOLD : '#fff', transform: `rotate(${f * 12 + i * 40}deg)`, opacity: interpolate(f, [30, 60], [1, 0], cl)}} />;
      })}
    </AbsoluteFill>
  );
};

export const Loading: React.FC = () => {
  const f = useCurrentFrame();
  const d = f - fr(T_DROP);
  const flash = d >= 0 && d < 10 ? interpolate(d, [0, 10], [0.9, 0], cl) : 0;
  const punch = d >= 0 ? interpolate(d, [0, 8], [1.18, 1.04], {...cl, easing: Easing.out(Easing.cubic)}) : interpolate(f, [0, fr(T_DROP)], [1.0, 1.08]);
  const shake = d >= 0 && d < 8 ? (8 - d) * 2.5 : 0;
  const sx = shake * (random('sx' + f) - 0.5) * 2, sy = shake * (random('sy' + f) - 0.5) * 2;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <style>{fontCss}</style>
      <AbsoluteFill style={{transform: `translate(${sx}px,${sy}px) scale(${punch})`, transformOrigin: '50% 25%'}}>
        {/* antes: cansado, cor acinzentada; congela nos últimos quadros antes do drop */}
        <Sequence durationInFrames={fr(T_DROP) - 8}>
          <OffthreadVideo src={staticFile('loading/a-cansado.mp4')} muted startFrom={9} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(.25) brightness(.85) contrast(1.05)'}} />
        </Sequence>
        <Sequence from={fr(T_DROP) - 8} durationInFrames={8}>
          <Img src={staticFile('loading/a-freeze.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(.1) brightness(.7) contrast(1.2)'}} />
        </Sequence>
        {/* depois: confiante, dourado */}
        <Sequence from={fr(T_DROP)}>
          <OffthreadVideo src={staticFile('loading/b-confiante.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.15) contrast(1.05)'}} />
          <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%, rgba(245,184,0,.18), rgba(0,0,0,0) 60%)', mixBlendMode: 'screen'}} />
        </Sequence>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)'}} />
      <Sequence durationInFrames={fr(T_DROP)}>
        <Texto at={4}>Eu achando que plano de saúde é caro demais 😩</Texto>
      </Sequence>
      <Sequence from={fr(T_DROP)}>
        <Confete />
        <Texto at={2} dark>Até descobrir que MEI faz plano <span style={{color: GOLD}}>empresarial</span> com 1 vida 😎</Texto>
      </Sequence>
      <Barra />
      <AbsoluteFill style={{background: `rgba(255,240,190,${flash})`, mixBlendMode: 'screen'}} />
      <Audio src={staticFile('loading/trilha.mp3')} startFrom={fr(2.4)} volume={(fr_) => interpolate(fr_, [DUR_LOADING - 12, DUR_LOADING], [1, 0], cl)} />
    </AbsoluteFill>
  );
};
