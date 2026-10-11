import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import words from '../public/words.json';

const GOLD = '#F5B800';
const FONT = 'Poppins';
type V = 'A' | 'B' | 'C';
type W = {t: string; s: number; e: number; seg: number};
const W_: W[] = (words as any).words;
const SEGS: {t: string; s: number; e: number}[] = (words as any).segs;
const KEY = /mei|empresarial|pme|vida|180|dias|cnpj|link|bio|comenta|sozinho|você/i;

const fontCss = `
@font-face{font-family:Poppins;font-weight:700;src:url(${staticFile('Poppins-Bold.ttf')})}
@font-face{font-family:Poppins;font-weight:500;src:url(${staticFile('Poppins-Medium.ttf')})}
@font-face{font-family:Poppins;font-weight:400;src:url(${staticFile('Poppins-Regular.ttf')})}`;

// cutaways: [start s, end s, image, what the phrase says]
const CUTS: [number, number, string][] = [
  [1.9, 3.45, '11s1-mesa-mei'],
  [5.0, 6.7, '11s3-cartao-um'],
  [7.75, 9.8, '11s4-sozinho'],
  [10.3, 13.4, 'agenda-data-circulada'],
  [13.95, 16.65, 'pastas-diferentes'],
];

const ease = Easing.bezier(0.22, 1, 0.36, 1);

const Zoom: React.FC<{v: V; children: React.ReactNode}> = ({v, children}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  // slow push-in
  let s = interpolate(t, [0, 19.4], [1.0, v === 'A' ? 1.07 : 1.1]);
  let tx = 0;
  if (v !== 'A') {
    // punch zoom on segment starts (alternate)
    SEGS.forEach((g, i) => {
      if (i % 2 === 1) {
        const p = spring({frame: f - Math.round(g.s * fps), fps, config: {damping: 14, stiffness: 180}});
        const end = i + 1 < SEGS.length ? SEGS[i + 1].s : 99;
        const out = t >= end ? 0 : 1;
        s += p * 0.1 * out * (t >= g.s ? 1 : 0);
      }
    });
    if (v === 'C') {
      tx = Math.sin(t * 0.9) * 10; // handheld drift
      s += Math.sin(t * 1.3) * 0.006;
    }
  }
  return (
    <AbsoluteFill style={{transform: `translateX(${tx}px) scale(${s})`, transformOrigin: '50% 38%'}}>{children}</AbsoluteFill>
  );
};

const Captions: React.FC<{v: V}> = ({v}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const idx = SEGS.findIndex((g, i) => t >= g.s - 0.05 && t < (i + 1 < SEGS.length ? SEGS[i + 1].s - 0.05 : 99));
  if (idx < 0) return null;
  const g = SEGS[idx];
  const ws = W_.filter((w) => w.seg === idx);
  const inP = spring({frame: f - Math.round((g.s - 0.05) * fps), fps, config: {damping: 16, stiffness: 200}});
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top: idx === SEGS.length - 1 ? 960 : 1170, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 0', transform: `translateY(${(1 - inP) * 40}px) scale(${0.9 + inP * 0.1})`, opacity: inP}}>
      {ws.map((w, i) => {
        const active = t >= w.s - 0.02 && t < w.e + 0.1;
        const past = t >= w.e + 0.1;
        const key = KEY.test(w.t);
        const col = key && (active || past) ? GOLD : '#fff';
        const pop = active ? 1.12 : 1;
        return (
          <span key={i} style={{fontFamily: FONT, fontWeight: 700, fontSize: 84, lineHeight: 1.12, textTransform: 'uppercase', color: col, opacity: active || past ? 1 : 0.45, transform: `scale(${pop})`, display: 'inline-block', margin: '0 24px', textShadow: '0 4px 0 rgba(0,0,0,.85), 0 0 28px rgba(0,0,0,.8)', WebkitTextStroke: '2px rgba(0,0,0,.55)'}}>
            {w.t}
          </span>
        );
      })}
    </div>
  );
};

const Kinetic: React.FC<{from: number; to: number; lines: string[]; v: V; top?: number; big?: string}> = ({from, to, lines, v, top = 880, big}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = Math.round(from * fps), b = Math.round(to * fps);
  if (f < a || f > b) return null;
  const p = spring({frame: f - a, fps, config: {damping: 15, stiffness: 160}});
  const o = interpolate(f, [b - 6, b], [1, 0], {extrapolateLeft: 'clamp'});
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top, textAlign: 'center', opacity: o * p, transform: `translateY(${(1 - p) * -60}px)`}}>
      {big && <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 220, color: GOLD, lineHeight: 1, textShadow: '0 6px 0 rgba(0,0,0,.8), 0 0 40px rgba(245,184,0,.5)'}}>{big}</div>}
      {lines.map((l, i) => (
        <div key={i} style={{display: 'inline-block', margin: '6px 0', padding: '8px 30px', fontFamily: FONT, fontWeight: 700, fontSize: 58, letterSpacing: 4, color: i === 0 ? '#000' : '#fff', background: i === 0 ? GOLD : 'rgba(0,0,0,.65)', borderRadius: 14, transform: `scaleX(${interpolate(p, [0, 1], [0.6, 1])})`}}>
          {l}
        </div>
      )).reduce((acc: any[], el, i) => (acc.push(el, <br key={'b' + i} />), acc), [])}
    </div>
  );
};

const Counter: React.FC<{from: number; to: number}> = ({from, to}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = Math.round(from * fps), b = Math.round(to * fps);
  if (f < a || f > b) return null;
  const n = Math.round(interpolate(f, [a, a + 40], [0, 180], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)}));
  const o = interpolate(f, [b - 6, b], [1, 0], {extrapolateLeft: 'clamp'});
  const p = spring({frame: f - a, fps});
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 790, textAlign: 'center', opacity: o, transform: `scale(${0.7 + 0.3 * p})`}}>
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 230, color: GOLD, lineHeight: 1, textShadow: '0 8px 0 rgba(0,0,0,.85), 0 0 50px rgba(245,184,0,.55)'}}>{n}</div>
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 58, color: '#fff', letterSpacing: 8, textShadow: '0 4px 0 #000'}}>DIAS DE CNPJ</div>
    </div>
  );
};

const Cutaway: React.FC<{from: number; to: number; img: string; v: V; i: number}> = ({from, to, img, v, i}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = Math.round(from * fps), b = Math.round(to * fps);
  if (f < a || f > b) return null;
  const k = f - a, len = b - a;
  const kb = interpolate(k, [0, len], [1.0, 1.14]);
  const dx = (i % 2 ? -1 : 1) * interpolate(k, [0, len], [0, 30]);
  let clip = 'none';
  let tr = 'none';
  if (v === 'C') {
    // gold wipe in, clean wipe out
    const win = interpolate(k, [0, 8], [0, 100], {extrapolateRight: 'clamp', easing: ease});
    const wout = interpolate(k, [len - 8, len], [0, 100], {extrapolateLeft: 'clamp', easing: ease});
    clip = `polygon(${wout * 0.6}% 0, 100% 0, 100% 100%, ${wout * 0.6 - 12}% 100%)`;
    if (k < 8) clip = `polygon(0 0, ${win}% 0, ${win - 12}% 100%, 0 100%)`;
  } else {
    const p = spring({frame: k, fps, config: {damping: 18, stiffness: 220}});
    tr = `scale(${1.25 - 0.25 * p})`;
  }
  const o = v === 'B' ? interpolate(k, [len - 3, len], [1, 0], {extrapolateLeft: 'clamp'}) : 1;
  const wipeBar = v === 'C' && k < 10;
  return (
    <>
      <AbsoluteFill style={{clipPath: clip, opacity: o}}>
        <AbsoluteFill style={{transform: tr}}>
          <Img src={staticFile(`img/${img}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${kb}) translateX(${dx}px)`}} />
        </AbsoluteFill>
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,0) 30%, rgba(0,0,0,.0) 55%, rgba(0,0,0,.7))'}} />
        {v === 'C' && <AbsoluteFill style={{border: `6px solid ${GOLD}`, margin: 24, borderRadius: 30, opacity: 0.9}} />}
      </AbsoluteFill>
      {wipeBar && <AbsoluteFill style={{background: GOLD, clipPath: `polygon(${interpolate(k, [0, 10], [-20, 110])}% 0, ${interpolate(k, [0, 10], [-5, 125])}% 0, ${interpolate(k, [0, 10], [-17, 108])}% 100%, ${interpolate(k, [0, 10], [-32, 93])}% 100%)`}} />}
    </>
  );
};

const EndCard: React.FC<{v: V}> = ({v}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = Math.round(17.2 * fps);
  if (f < a) return null;
  const p = spring({frame: f - a, fps, config: {damping: 13, stiffness: 150}});
  const pulse = 1 + 0.03 * Math.sin((f - a) / 4);
  return (
    <>
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,${0.85 * p}) 85%)`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1270, textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 80}px) scale(${pulse})`}}>
        <div style={{display: 'inline-block', background: GOLD, color: '#000', fontFamily: FONT, fontWeight: 700, fontSize: 66, padding: '14px 50px', borderRadius: 60, boxShadow: '0 0 50px rgba(245,184,0,.6)'}}>Comenta MEI</div>
        <div style={{fontFamily: FONT, fontWeight: 500, fontSize: 34, color: '#fff', marginTop: 8}}>ou toque no Link na bio ↑</div>
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 1515, textAlign: 'center', fontFamily: FONT, fontWeight: 400, fontSize: 26, color: 'rgba(255,255,255,.8)', opacity: p}}>Carências, rede e valores variam por operadora e produto.</div>
    </>
  );
};

const Brand: React.FC<{v: V}> = ({v}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: f - 2, fps, config: {damping: 16}});
  const prog = interpolate(f, [0, 485], [0, 100]);
  return (
    <>
      <div style={{position: 'absolute', left: 60, top: 150, opacity: p, transform: `translateX(${(1 - p) * -60}px)`, display: 'flex', alignItems: 'center', gap: 16}}>
        <Img src={staticFile('emblema.png')} style={{width: 76, height: 76, objectFit: 'contain'}} />
        {v !== 'A' && <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 30, color: '#fff', lineHeight: 1.1, textShadow: '0 2px 8px #000'}}>BONI<br /><span style={{fontWeight: 400, fontSize: 22, color: GOLD}}>Planos de Saúde</span></div>}
      </div>
      {v === 'C' && <div style={{position: 'absolute', left: 60, right: 60, top: 128, height: 6, background: 'rgba(255,255,255,.25)', borderRadius: 3}}><div style={{width: `${prog}%`, height: '100%', background: GOLD, borderRadius: 3}} /></div>}
    </>
  );
};

const Sfx: React.FC<{v: V}> = ({v}) => {
  if (v === 'A') return null;
  return (
    <>
      {CUTS.map(([a], i) => (
        <Sequence key={i} from={Math.round(a * 25) - 2}><Audio src={staticFile('whoosh.wav')} volume={0.5} /></Sequence>
      ))}
      <Sequence from={Math.round(9.96 * 25)}><Audio src={staticFile('boom.wav')} volume={0.5} /></Sequence>
      <Sequence from={Math.round(17.27 * 25)}><Audio src={staticFile('pop.wav')} volume={0.6} /></Sequence>
    </>
  );
};

export const Reel: React.FC<{variant: V}> = ({variant: v}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <style>{fontCss}</style>
      <Zoom v={v}>
        <OffthreadVideo src={staticFile('avatar.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        {/* legibility grade */}
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)'}} />
        {v === 'C' && <AbsoluteFill style={{boxShadow: 'inset 0 0 260px rgba(0,0,0,.65)'}} />}
      </Zoom>

      {v !== 'A' && CUTS.map(([a, b, img], i) => <Cutaway key={i} from={a} to={b} img={img} v={v} i={i} />)}

      <Brand v={v} />
      {/* motion graphics */}
      <Kinetic from={0.35} to={1.85} lines={['PLANO EMPRESARIAL', 'PARA MEI']} v={v} />
      {v === 'A' && <Kinetic from={5.0} to={7.0} lines={['PME', 'A PARTIR DE 1 VIDA']} v={v} />}
      {v !== 'A' && <Kinetic from={5.05} to={6.7} lines={['A PARTIR DE', '1 VIDA']} v={v} />}
      {v === 'A' && <Kinetic from={7.8} to={9.7} lines={['SÓ VOCÊ', 'SEM FUNCIONÁRIO']} v={v} />}
      <Counter from={10.0} to={13.4} />
      <Kinetic from={13.95} to={16.6} lines={['O RESTO MUDA', 'POR OPERADORA']} v={v} top={880} />

      <Captions v={v} />
      <EndCard v={v} />

      {/* audio */}
      {v !== 'A' && <Audio src={staticFile('music.mp3')} volume={(fr) => interpolate(fr, [0, 15, 450, 485], [0, 0.11, 0.11, 0])} />}
      <Sfx v={v} />
    </AbsoluteFill>
  );
};
