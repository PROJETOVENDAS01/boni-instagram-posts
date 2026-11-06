import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing, random} from 'remotion';

const FPS = 30;
const GOLD = '#F5B800';
const GOLD2 = '#FFE08A';
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const fr = (s: number) => Math.round(s * FPS);
const fontCss = `
@font-face{font-family:Poppins;font-weight:800;src:url(${staticFile('Poppins-Bold.ttf')})}
@font-face{font-family:Poppins;font-weight:500;src:url(${staticFile('Poppins-Medium.ttf')})}`;

export type BTProps = {
  look: string;        // cafe | corredor | reuniao | escritorio
  falaDur: number;     // segundos do clipe da fala
  fala: string;        // legenda da fala
  hookA: string;       // linha 1 do gancho
  hookDestaque: string;// palavra em bloco dourado
  hookB: string;       // linha 3 do gancho
  sub: string;         // complemento
  palavra: string;     // CTA: Comenta PALAVRA
};

// tempos (segundos)
const T_TOQUE = 2.3;          // clipe do toque: 0.6s..2.9s do original
const T_HOOK = 3.8;
const T_APONTA = 3.3;         // clipe apontando: a partir de 1.8s do original
export const durBT = (p: BTProps) => fr(T_TOQUE) + fr(p.falaDur) + fr(T_HOOK) + fr(T_APONTA);

const cover: React.CSSProperties = {width: '100%', height: '100%', objectFit: 'cover'};

const Legenda: React.FC<{text: string; top: number; size?: number; dark?: boolean}> = ({text, top, size = 64, dark}) => {
  const f = useCurrentFrame();
  const p = spring({frame: f, fps: FPS, config: {damping: 12, stiffness: 220}});
  return (
    <div style={{position: 'absolute', top, left: 70, right: 70, display: 'flex', justifyContent: 'center', transform: `scale(${0.6 + 0.4 * p})`, opacity: Math.min(1, p * 2)}}>
      <div style={{padding: '18px 34px', borderRadius: 26, fontFamily: 'Poppins', fontWeight: 800, fontSize: size, lineHeight: 1.12, textAlign: 'center',
        background: dark ? 'rgba(10,8,2,.86)' : '#fff', color: dark ? '#fff' : '#111', border: dark ? `3px solid ${GOLD}` : undefined, boxShadow: '0 12px 40px rgba(0,0,0,.45)'}}>{text}</div>
    </div>
  );
};

const Hook: React.FC<BTProps> = (p) => {
  const f = useCurrentFrame();
  const a = (d: number) => spring({frame: f - d, fps: FPS, config: {damping: 13, stiffness: 180}});
  const l1 = a(4), l2 = a(12), l3 = a(20), l4 = a(34);
  const zoom = interpolate(f, [0, fr(T_HOOK)], [1.04, 1.14]);
  const line = (v: number): React.CSSProperties => ({opacity: Math.min(1, v * 1.6), transform: `translateY(${(1 - v) * 60}px)`});
  return (
    <AbsoluteFill>
      <Img src={staticFile(`bt/bt-v-${p.look}.png`)} style={{...cover, transform: `scale(${zoom})`, filter: 'brightness(.55) saturate(.9)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,.55) 45%, rgba(0,0,0,.35))'}} />
      <div style={{position: 'absolute', top: 470, left: 70, right: 70, textAlign: 'center', fontFamily: 'Poppins', fontWeight: 800, color: '#fff', textShadow: '0 4px 24px rgba(0,0,0,.7)'}}>
        <div style={{fontSize: 76, lineHeight: 1.1, textTransform: 'uppercase', ...line(l1)}}>{p.hookA}</div>
        <div style={{margin: '26px 0', ...line(l2)}}>
          <span style={{display: 'inline-block', background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, color: '#111', fontSize: 96, padding: '6px 34px', borderRadius: 18, textTransform: 'uppercase', textShadow: 'none', boxShadow: `0 0 50px rgba(245,184,0,.45)`}}>{p.hookDestaque}</span>
        </div>
        <div style={{fontSize: 76, lineHeight: 1.1, textTransform: 'uppercase', ...line(l3)}}>{p.hookB}</div>
        <div style={{marginTop: 44, fontSize: 48, fontWeight: 500, color: GOLD2, ...line(l4)}}>{p.sub}</div>
      </div>
    </AbsoluteFill>
  );
};

export const BateTela: React.FC<BTProps> = (p) => {
  const f = useCurrentFrame();
  const s1 = fr(T_TOQUE), s2 = s1 + fr(p.falaDur), s3 = s2 + fr(T_HOOK), total = durBT(p);
  // "batidas" na tela: tremor + zoom no 1.4s e 1.63s do vídeo
  const knock = (t: number) => { const d = f - fr(t); return d >= 0 && d < 6 ? (6 - d) / 6 : 0; };
  const k = Math.max(knock(1.4), knock(1.63));
  const sx = k * 22 * (random('x' + f) - 0.5), sy = k * 22 * (random('y' + f) - 0.5);
  // flashes nas trocas
  const flashAt = (at: number) => { const d = f - at; return d >= 0 && d < 7 ? interpolate(d, [0, 7], [0.85, 0]) : 0; };
  const flash = Math.max(flashAt(s2), flashAt(s3));
  // CTA
  const cta = spring({frame: f - (s3 + 18), fps: FPS, config: {damping: 11, stiffness: 200}});
  const pulse = 1 + 0.04 * Math.sin((f - s3) / 4);
  const music = (fr_: number) => {
    const base = fr_ >= s1 && fr_ < s2 ? 0.18 : 0.42;
    return base * interpolate(fr_, [total - 15, total], [1, 0], cl);
  };
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <style>{fontCss}</style>
      {/* 1. toque na tela */}
      <Sequence durationInFrames={s1}>
        <AbsoluteFill style={{transform: `translate(${sx}px,${sy}px) scale(${1 + k * 0.06})`, transformOrigin: '50% 35%'}}>
          <OffthreadVideo src={staticFile(`bt/${p.look}-toque.mp4`)} muted startFrom={fr(0.6)} style={cover} />
        </AbsoluteFill>
      </Sequence>
      {/* 2. fala */}
      <Sequence from={s1} durationInFrames={s2 - s1}>
        <AbsoluteFill style={{transform: `scale(${interpolate(f - s1, [0, fr(p.falaDur)], [1.0, 1.06])})`, transformOrigin: '50% 30%'}}>
          <OffthreadVideo src={staticFile(`bt/${p.look}-fala.mp4`)} style={cover} />
        </AbsoluteFill>
        <Legenda text={p.fala} top={1240} />
      </Sequence>
      {/* 3. ele saiu: cenário vazio + gancho */}
      <Sequence from={s2} durationInFrames={s3 - s2}>
        <Hook {...p} />
      </Sequence>
      {/* 4. volta e aponta pro CTA */}
      <Sequence from={s3}>
        <OffthreadVideo src={staticFile(`bt/${p.look}-aponta.mp4`)} muted startFrom={fr(1.8)} style={cover} />
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 80%)'}} />
        <div style={{position: 'absolute', top: 1190, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${(0.5 + 0.5 * cta) * pulse})`, opacity: Math.min(1, cta * 2)}}>
          <div style={{fontFamily: 'Poppins', fontWeight: 800, fontSize: 70, padding: '20px 46px', borderRadius: 30, background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, color: '#111', boxShadow: `0 0 60px rgba(245,184,0,.55)`}}>
            Comenta {p.palavra} 👇
          </div>
        </div>
        <div style={{position: 'absolute', top: 1350, left: 90, right: 90, textAlign: 'center', fontFamily: 'Poppins', fontWeight: 500, fontSize: 30, color: '#fff', opacity: Math.min(1, cta), textShadow: '0 2px 10px #000'}}>
          Carências, rede e valores variam por operadora e produto.
        </div>
      </Sequence>
      <AbsoluteFill style={{background: `rgba(255,244,210,${flash})`, pointerEvents: 'none'}} />
      <Sequence from={fr(1.4)} durationInFrames={20}><Audio src={staticFile('bt/knock.wav')} /></Sequence>
      <Audio src={staticFile('bt/bt-trilha.mp3')} volume={music} />
    </AbsoluteFill>
  );
};
