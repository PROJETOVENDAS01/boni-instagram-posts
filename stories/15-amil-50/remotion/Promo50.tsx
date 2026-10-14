import React from 'react';
import {AbsoluteFill, Audio, Freeze, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, random} from 'remotion';
import words50 from '../public/words50.json';

const F = 'Poppins';
const FONTS = `
@font-face{font-family:Poppins;font-weight:800;src:url(${staticFile('Poppins-Bold.ttf')})}
@font-face{font-family:Poppins;font-weight:500;src:url(${staticFile('Poppins-Medium.ttf')})}
@font-face{font-family:Poppins;font-weight:400;src:url(${staticFile('Poppins-Regular.ttf')})}`;

// Extruded 3D text: stacked layers in Z give real depth when the group rotates.
export const Gold3D: React.FC<{text: string; size: number; rotY: number; rotX?: number; depth?: number; sweep: number}> = ({text, size, rotY, rotX = 0, depth = 26, sweep}) => {
  const layers = Array.from({length: depth}, (_, i) => i);
  const base: React.CSSProperties = {position: 'absolute', left: 0, top: 0, fontFamily: F, fontWeight: 800, fontSize: size, lineHeight: 1, letterSpacing: -size * 0.03, whiteSpace: 'nowrap'};
  return (
    <div style={{position: 'relative', transformStyle: 'preserve-3d', transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`}}>
      <span style={{...base, position: 'relative', visibility: 'hidden'}}>{text}</span>
      {layers.map((i) => (
        <span key={i} style={{...base, transform: `translateZ(${-i * 1.6}px)`, color: `rgb(${120 - i * 2},${78 - i * 1.5},${18})`}}>{text}</span>
      ))}
      <span
        style={{
          ...base,
          transform: 'translateZ(1px)',
          backgroundImage: `linear-gradient(115deg, #7a4f12 0%, #f7d77a 22%, #fff6cf ${sweep - 6}%, #ffffff ${sweep}%, #fff6cf ${sweep + 6}%, #d9a53c 70%, #8a5a14 100%)`,
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          filter: 'drop-shadow(0 0 18px rgba(255,200,90,.55))',
        }}
      >
        {text}
      </span>
    </div>
  );
};

const Particles: React.FC<{frame: number; start: number; n?: number; cx: number; cy: number}> = ({frame, start, n = 70, cx, cy}) => {
  const t = frame - start;
  if (t < 0) return null;
  return (
    <>
      {Array.from({length: n}, (_, i) => {
        const a = random(`a${i}`) * Math.PI * 2;
        const sp = 6 + random(`s${i}`) * 22;
        const life = 30 + random(`l${i}`) * 40;
        const p = t / life;
        if (p > 1) return null;
        const x = cx + Math.cos(a) * sp * t;
        const y = cy + Math.sin(a) * sp * t + 0.25 * t * t * 0.3;
        const s = (2 + random(`z${i}`) * 6) * (1 - p);
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: s, background: '#ffe39a', boxShadow: '0 0 12px #ffcf5a', opacity: 1 - p}} />;
      })}
    </>
  );
};

const Dust: React.FC<{frame: number}> = ({frame}) => (
  <>
    {Array.from({length: 40}, (_, i) => {
      const x = random(`dx${i}`) * 1080;
      const y = (random(`dy${i}`) * 1920 - frame * (0.6 + random(`dv${i}`) * 1.2) + 1920) % 1920;
      const s = 2 + random(`ds${i}`) * 4;
      return <div key={i} style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: s, background: '#f5d27a', opacity: 0.25 + random(`do${i}`) * 0.4, filter: 'blur(1px)'}} />;
    })}
  </>
);

export const Promo50Test: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  // 0-30 beam reveals Amil logo; 30+ the 50% bursts in and spins over the "hand" spot
  const beamX = interpolate(frame, [0, 26], [-400, 1480], {extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const logoOp = interpolate(frame, [8, 20, 34, 42], [0, 1, 1, 0.9], {extrapolateRight: 'clamp'});
  const logoScale = interpolate(frame, [8, 42], [0.92, 1], {extrapolateRight: 'clamp'});
  const logoY = interpolate(frame, [34, 48], [760, 300], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const logoW = interpolate(frame, [34, 48], [620, 300], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const pop = spring({frame: frame - 36, fps, config: {damping: 9, stiffness: 120}});
  const rot = interpolate(frame, [36, 100], [-260, 20], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)}) + Math.sin(frame / 12) * 6;
  const sweep = ((frame * 2.2) % 140) - 20;
  const flash = interpolate(frame, [36, 38, 44], [0, 0.6, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const shock = interpolate(frame, [36, 60], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const camZoom = interpolate(frame, [0, 100], [1.12, 1.0]);
  const subOp = interpolate(frame, [58, 70], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cx = 540, cy = 1060;
  return (
    <AbsoluteFill style={{background: '#050403', overflow: 'hidden'}}>
      <style>{FONTS}</style>
      <AbsoluteFill style={{transform: `scale(${camZoom})`}}>
        <Img src={staticFile('cafe.png')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: `brightness(${interpolate(frame, [20, 50], [0.15, 0.55], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}) sepia(.3) saturate(1.1) blur(${interpolate(frame, [36, 60], [10, 3], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}px)`}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 30%, rgba(0,0,0,.85) 100%)'}} />
      <Dust frame={frame} />
      {/* light beam */}
      <div style={{position: 'absolute', top: -200, left: beamX - 160, width: 320, height: 2400, transform: 'rotate(18deg)', background: 'linear-gradient(90deg, transparent, rgba(255,214,120,.55), rgba(255,250,230,.9), rgba(255,214,120,.55), transparent)', filter: 'blur(18px)', opacity: interpolate(frame, [0, 4, 26, 30], [0, 1, 1, 0], {extrapolateRight: 'clamp'}), mixBlendMode: 'screen'}} />
      {/* Amil logo */}
      <div style={{position: 'absolute', left: 540 - logoW / 2, top: logoY - logoW * 0.18, width: logoW, opacity: logoOp, transform: `scale(${logoScale})`, filter: 'drop-shadow(0 0 24px rgba(255,210,120,.6))'}}>
        <Img src={staticFile('amil-branca.png')} style={{width: '100%'}} />
      </div>
      {/* shockwave */}
      {frame >= 36 && <div style={{position: 'absolute', left: cx - 600 * shock, top: cy - 600 * shock, width: 1200 * shock, height: 1200 * shock, borderRadius: '50%', border: `${8 * (1 - shock)}px solid rgba(255,215,120,${1 - shock})`, boxShadow: `0 0 60px rgba(255,200,90,${0.6 * (1 - shock)})`}} />}
      <Particles frame={frame} start={36} cx={cx} cy={cy} />
      {/* glow pad (where the hand will be) */}
      <div style={{position: 'absolute', left: cx - 260, top: cy + 150, width: 520, height: 90, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,200,90,.55), transparent 70%)', opacity: pop, filter: 'blur(6px)'}} />
      {/* 50% */}
      <div style={{position: 'absolute', left: 0, top: cy - 170, width: 1080, display: 'flex', justifyContent: 'center', perspective: 1400, transform: `scale(${pop})`, opacity: frame < 36 ? 0 : 1}}>
        <Gold3D text="50%" size={330} rotY={rot} rotX={-8} sweep={sweep} />
      </div>
      <div style={{position: 'absolute', left: 0, width: 1080, top: cy + 260, textAlign: 'center', fontFamily: F, fontWeight: 800, fontSize: 58, color: '#fff', letterSpacing: 2, opacity: subOp, textShadow: '0 4px 20px rgba(0,0,0,.8)'}}>
        1ª e 2ª <span style={{color: '#f3c969'}}>MENSALIDADE</span>
      </div>
      <AbsoluteFill style={{background: '#fff4d6', opacity: flash, mixBlendMode: 'screen'}} />
      <Audio src={staticFile('whoosh.wav')} />
      <Sequence from={36}><Audio src={staticFile('boom.wav')} /></Sequence>
    </AbsoluteFill>
  );
};

// ================= Full Story/ad: Amil PME 50% =================
const FPS50 = 25;
export const DUR50 = 450; // 16.6s of voice + hold on end card
const VID_END = 414;
const GOLD = '#F5B800', GOLD2 = '#FFD95A', VIO = '#6A3BFF';
type W = {t: string; s: number; e: number; seg: number};
const WS: W[] = (words50 as any).words;
const at = (re: RegExp) => (WS.find((w) => re.test(w.t)) as W).s;
const fr = (s: number) => Math.round(s * FPS50);
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const spr = (f: number, t: number, d = 14, st = 170) => spring({frame: f - fr(t), fps: FPS50, config: {damping: d, stiffness: st}});
const T = {
  palm: 0.36, cinq: at(/^cinquenta/), desc: at(/^de$/), mens: at(/^na$/), out: 4.3,
  cnpj: at(/^CNPJ/), duas: at(/^duas/), mei: at(/^MEI/), resg: 9.72, odonto: at(/^odonto/), todos: at(/^todos/),
  tempo: 11.74, end: 12.95,
};
// right palm raised in the HeyGen take (measured on frames): time, x, y of palm centre
const PALM: [number, number, number][] = [[0.33, 312, 880], [0.5, 280, 920], [0.67, 320, 880], [0.83, 320, 900], [1.0, 300, 960], [1.12, 330, 1000]];
const palmAt = (t: number) => {
  const ts = PALM.map((p) => p[0]);
  return [interpolate(t, ts, PALM.map((p) => p[1]), cl), interpolate(t, ts, PALM.map((p) => p[2]), cl)];
};
const CAM: [number, number, boolean][] = [[0, 1.12, false], [0.75, 1.06, false], [T.cinq, 1.0, true], [T.mens, 1.08, true], [4.69, 1.0, false], [T.resg, 1.05, true], [T.tempo, 1.1, true], [T.end, 1.0, false]];

const glass: React.CSSProperties = {background: 'rgba(12,9,4,.62)', border: '2px solid rgba(245,184,0,.75)', backdropFilter: 'blur(14px)', borderRadius: 30, boxShadow: '0 10px 40px rgba(0,0,0,.5), 0 0 30px rgba(245,184,0,.25)'};
const txt = (size: number, color = '#fff', weight = 800): React.CSSProperties => ({fontFamily: F, fontWeight: weight, fontSize: size, color, lineHeight: 1.05, textShadow: '0 3px 14px rgba(0,0,0,.8)'});

const ICON: Record<string, string[]> = {
  ambulance: ['M8 30 h52 v42 h-52 z', 'M60 44 h18 l14 16 v12 h-32', 'M34 40 v24 M22 52 h24', 'M22 80 a8 8 0 1 0 .1 0', 'M74 80 a8 8 0 1 0 .1 0'],
  tooth: ['M30 18 c-16 0 -20 16 -16 30 c3 10 6 16 8 30 c1 7 9 7 11 0 l6 -16 c1 -3 6 -3 7 0 l6 16 c2 7 10 7 11 0 c2 -14 5 -20 8 -30 c4 -14 0 -30 -16 -30 c-8 0 -11 4 -20 4 c-9 0 -12 -4 -20 -4 z'],
  clock: ['M50 14 a36 36 0 1 0 .1 0', 'M50 28 v24 l16 10'],
  chat: ['M15 20 h70 v45 h-40 l-18 16 v-16 h-12 z'],
};
const Icon: React.FC<{name: string; p: number; size: number; color?: string}> = ({name, p, size, color = GOLD2}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    {ICON[name].map((d, i) => <path key={i} d={d} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - interpolate(p, [i * 0.12, i * 0.12 + 0.6], [0, 1], cl)} style={{filter: `drop-shadow(0 0 8px ${GOLD})`}} />)}
  </svg>
);

const WHIP: [number, number][] = [[6.42, 6.82], [7.64, 7.98]];

const Camera50: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  let s = CAM[0][1];
  for (let i = 1; i < CAM.length; i++) s += (CAM[i][1] - CAM[i - 1][1]) * spr(f, CAM[i][0], CAM[i][2] ? 18 : 30, CAM[i][2] ? 260 : 60);
  s += interpolate(f, [0, DUR50], [0, 0.04]);
  // whip-blur over the abrupt hand rise/drop around the 'two fingers' (HeyGen motion, can't be smoothed at source)
  const t = f / FPS50;
  const whip = Math.max(0, ...WHIP.map(([a, b]) => interpolate(t, [a, (a + b) / 2, b], [0, 1, 0], cl)));
  s += 0.07 * whip;
  const blur = Math.max(whip * 24, ...CAM.filter((c) => c[2]).map((c) => interpolate(f - fr(c[0]), [0, 2, 7], [0, 5, 0], cl)));
  return <AbsoluteFill style={{transform: `scale(${s})`, transformOrigin: '540px 700px', filter: `blur(${blur}px)`}}>{children}</AbsoluteFill>;
};

const Fifty: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS50;
  if (t < T.cinq - 0.05) return null;
  const pop = spr(f, T.cinq - 0.05, 9, 140);
  const toT = interpolate(t, [T.out, T.out + 0.45], [0, 1], {...cl, easing: Easing.inOut(Easing.cubic)});
  // on the palm -> centre stage -> small badge top-right
  let x = 540, y = 1060, s = pop;
  x = interpolate(toT, [0, 1], [x, 930]); y = interpolate(toT, [0, 1], [y, 350]); s = interpolate(toT, [0, 1], [s, 0.24]);
  const spin = interpolate(t, [T.cinq, T.cinq + 1.1], [-360, 0], {...cl, easing: Easing.out(Easing.cubic)}) + interpolate(t, [T.mens, T.mens + 0.8], [360, 0], {...cl, easing: Easing.out(Easing.cubic)});
  const rotY = spin + Math.sin(f / 10) * (toT > 0.5 ? 25 : 10);
  const sweep = ((f * 2.4) % 140) - 20;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s})`, perspective: 1400}}>
      <div style={{position: 'absolute', left: '50%', top: '50%', width: 760, height: 420, transform: 'translate(-50%,-50%)', background: 'radial-gradient(ellipse, rgba(255,190,60,.45), transparent 65%)', filter: 'blur(10px)'}} />
      <Gold3D text="50%" size={320} rotY={rotY} rotX={-8} sweep={sweep} />
    </div>
  );
};

// gold '2' next to his two raised fingers (6.7s-7.7s, hand at ~x 270)
const Two: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS50;
  if (t < 6.7 || t > 7.95) return null;
  const p = spr(f, 6.72, 10, 160);
  const out = interpolate(t, [7.55, 7.7], [1, 0], cl);
  return (
    <div style={{position: 'absolute', left: 185, top: 475, transform: `translate(-50%,-50%) scale(${p * 0.55})`, opacity: out, perspective: 1200}}>
      <div style={{position: 'absolute', left: '50%', top: '50%', width: 420, height: 420, transform: 'translate(-50%,-50%)', background: 'radial-gradient(circle, rgba(255,190,60,.45), transparent 65%)', filter: 'blur(10px)'}} />
      <Gold3D text="2" size={300} rotY={interpolate(t, [6.72, 7.3], [-180, 0], {...cl, easing: Easing.out(Easing.cubic)}) + Math.sin(f / 8) * 8} rotX={-6} sweep={((f * 2.4) % 140) - 20} />
    </div>
  );
};

const Shock: React.FC<{t0: number; cx: number; cy: number; r?: number}> = ({t0, cx, cy, r = 600}) => {
  const f = useCurrentFrame();
  const k = interpolate(f - fr(t0), [0, 22], [0, 1], cl);
  if (f < fr(t0) || k >= 1) return null;
  return <div style={{position: 'absolute', left: cx - r * k, top: cy - r * k, width: 2 * r * k, height: 2 * r * k, borderRadius: '50%', border: `${8 * (1 - k)}px solid rgba(255,215,120,${1 - k})`, boxShadow: `0 0 60px rgba(255,200,90,${0.6 * (1 - k)})`}} />;
};

const AmilLogo: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS50;
  const reveal = interpolate(t, [0.05, 0.75], [0, 1], {...cl, easing: Easing.out(Easing.cubic)});
  const mv = interpolate(t, [1.1, 1.55], [0, 1], {...cl, easing: Easing.inOut(Easing.cubic)});
  const w = interpolate(mv, [0, 1], [600, 270]), x = interpolate(mv, [0, 1], [240, 60]), y = interpolate(mv, [0, 1], [1110, 290]);
  const sweep = ((f * 3) % 160) - 30;
  const endFade = interpolate(t, [T.end, T.end + 0.3], [1, 0], cl);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: w * 576 / 1616, opacity: endFade, WebkitMaskImage: `linear-gradient(100deg, #000 ${reveal * 120 - 20}%, transparent ${reveal * 120}%)`}}>
      <Img src={staticFile('amil-branca.png')} style={{width: '100%', height: '100%', filter: `drop-shadow(0 0 18px ${VIO}) drop-shadow(0 2px 8px #000)`}} />
      <div style={{position: 'absolute', inset: 0, WebkitMaskImage: `url(${staticFile('amil-branca.png')})`, WebkitMaskSize: '100% 100%', background: `linear-gradient(100deg, transparent ${sweep - 10}%, rgba(255,240,200,.9) ${sweep}%, transparent ${sweep + 10}%)`}} />
    </div>
  );
};

const Beam: React.FC = () => {
  const f = useCurrentFrame();
  const bx = interpolate(f, [0, 20], [-400, 1480], {...cl, easing: Easing.inOut(Easing.cubic)});
  return <div style={{position: 'absolute', top: -200, left: bx - 160, width: 320, height: 2400, transform: 'rotate(18deg)', background: 'linear-gradient(90deg, transparent, rgba(255,214,120,.5), rgba(255,250,230,.85), rgba(255,214,120,.5), transparent)', filter: 'blur(18px)', opacity: interpolate(f, [0, 3, 18, 22], [0, 1, 1, 0], cl), mixBlendMode: 'screen'}} />;
};

const Labels: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS50;
  const pd = spr(f, T.desc, 12, 200), pm = spr(f, T.mens, 11, 180);
  const out = interpolate(t, [T.out, T.out + 0.25], [1, 0], cl);
  if (t < T.desc || out <= 0) return null;
  const tile = (n: string, p: number) => (
    <div style={{...glass, width: 200, height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${p}) rotateY(${(1 - p) * 90}deg)`}}>
      <span style={txt(110, GOLD2)}>{n}</span>
    </div>
  );
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1230, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: out}}>
      {t < T.mens ? (
        <div style={{...txt(78), letterSpacing: 4, transform: `scale(${pd})`}}>DE <span style={{color: GOLD}}>DESCONTO</span></div>
      ) : (
        <>
          <div style={{display: 'flex', alignItems: 'center', gap: 26, perspective: 1000}}>
            {tile('1ª', pm)}
            <span style={{...txt(90, GOLD), opacity: pm}}>+</span>
            {tile('2ª', spr(f, T.mens + 0.35, 11, 180))}
          </div>
          <div style={{...txt(64), letterSpacing: 6, marginTop: 18, opacity: spr(f, T.mens + 0.6)}}>MENSALIDADE</div>
        </>
      )}
    </div>
  );
};

const Chips: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS50;
  const out = interpolate(t, [9.0, 9.3], [1, 0], cl);
  if (t < T.cnpj - 0.1 || out <= 0) return null;
  const items: [number, React.ReactNode][] = [
    [T.cnpj, <>PLANO PELO <span style={{color: GOLD}}>CNPJ</span></>],
    [T.duas, <>A PARTIR DE <span style={{color: GOLD}}>2 VIDAS</span></>],
    [T.mei, <>INCLUSIVE <span style={{color: GOLD}}>MEI</span></>],
  ];
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 970, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, opacity: out}}>
      {items.map(([t0, el], i) => {
        const p = spr(f, t0 - 0.05, 12, 200);
        return t >= t0 - 0.05 ? (
          <div key={i} style={{...glass, padding: '18px 40px', borderRadius: 60, ...txt(54), transform: `translateX(${(1 - p) * (i % 2 ? 700 : -700)}px) rotate(${(1 - p) * (i % 2 ? 8 : -8)}deg)`}}>{el}</div>
        ) : <div key={i} style={{height: 98}} />;
      })}
    </div>
  );
};

const Benefits: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS50;
  const out = interpolate(t, [T.tempo - 0.1, T.tempo + 0.2], [1, 0], cl);
  if (t < T.resg - 0.1 || out <= 0) return null;
  const card = (t0: number, icon: string, a: string, b: string, side: number) => {
    const p = spr(f, t0 - 0.05, 12, 170);
    return (
      <div style={{...glass, width: 430, padding: '26px 10px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: t >= t0 - 0.05 ? 1 : 0, transform: `translateY(${(1 - p) * 300}px) rotateY(${(1 - p) * 70 * side}deg)`}}>
        <Icon name={icon} p={interpolate(t, [t0, t0 + 0.7], [0, 1], cl)} size={120} />
        <div style={{...txt(46), marginTop: 10, textAlign: 'center'}}>{a}<br /><span style={{color: GOLD}}>{b}</span></div>
      </div>
    );
  };
  const pt = spr(f, T.todos - 0.05, 12, 200);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 960, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: out, perspective: 1200}}>
      <div style={{display: 'flex', gap: 40}}>
        {card(T.resg, 'ambulance', 'AMIL', 'RESGATE', -1)}
        {card(T.odonto, 'tooth', 'ODONTO', 'GRÁTIS', 1)}
      </div>
      <div style={{marginTop: 26, padding: '14px 40px', borderRadius: 60, background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, ...txt(46, '#000'), textShadow: 'none', opacity: t >= T.todos - 0.05 ? 1 : 0, transform: `scale(${pt})`, boxShadow: '0 0 40px rgba(245,184,0,.6)'}}>EM TODOS OS PLANOS</div>
    </div>
  );
};

const Tempo: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS50;
  if (t < T.tempo - 0.05) return null;
  const p = spr(f, T.tempo, 10, 160);
  const out = interpolate(t, [T.end - 0.05, T.end + 0.25], [1, 0], cl);
  const pulse = 1 + Math.sin(f / 3) * 0.03;
  // beside his left shoulder, face stays free
  return (
    <div style={{position: 'absolute', left: 850, top: 640, transform: `translate(-50%,-50%) scale(${p * pulse}) rotateY(${(1 - p) * 180}deg)`, opacity: out, ...glass, width: 280, padding: '18px 0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: `3px solid ${GOLD}`}}>
      <Icon name="clock" p={interpolate(t, [T.tempo, T.tempo + 0.6], [0, 1], cl)} size={90} />
      <div style={{...txt(44), textAlign: 'center', marginTop: 6}}>TEMPO<br /><span style={{color: GOLD}}>LIMITADO</span></div>
    </div>
  );
};

const Captions50: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS50;
  const chunks: {ws: W[]; s: number; e: number}[] = [];
  [6, 7, 8, 9, 10, 11].forEach((si) => {
    const ws = WS.filter((w) => w.seg === si);
    for (let i = 0; i < ws.length; i += 3) { const c = ws.slice(i, i + 3); chunks.push({ws: c, s: c[0].s, e: c[c.length - 1].e}); }
  });
  const ci = chunks.findIndex((c, i) => t >= c.s - 0.04 && t < Math.min(c.e + 0.3, chunks[i + 1] ? chunks[i + 1].s - 0.04 : T.tempo - 0.1));
  if (ci < 0) return null;
  const c = chunks[ci];
  const p = spr(f, c.s - 0.04, 12, 260);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 1440, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', opacity: p, transform: `translateY(${(1 - p) * 24}px)`}}>
      {c.ws.map((w, i) => {
        const act = t >= w.s - 0.02 && t < w.e + 0.08;
        const key = /cnpj|vidas|duas|mei|resgate|odonto|grátis|planos/i.test(w.t), am = /amil/i.test(w.t);
        return <span key={i} style={{...txt(58, am ? '#B79BFF' : key ? GOLD : '#fff'), margin: '0 14px', textTransform: 'uppercase', display: 'inline-block', transform: `scale(${act ? 1.1 : 1})`, textShadow: '0 4px 0 rgba(0,0,0,.95), 0 0 24px rgba(0,0,0,.95)'}}>{w.t.replace(/[.,!]$/, '')}</span>;
      })}
    </div>
  );
};

const End50: React.FC = () => {
  const f = useCurrentFrame();
  if (f < fr(T.end)) return null;
  const p = spr(f, T.end, 13, 150);
  const bob = Math.sin((f - fr(T.end)) / 3.5) * 6;
  const sweep = interpolate((f - fr(T.end)) % 30, [0, 18], [-40, 140], cl);
  return (
    <>
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,${0.85 * p}) 72%)`}} />
      <div style={{position: 'absolute', left: 60, right: 60, top: 990, padding: '28px 20px 24px', ...glass, background: 'rgba(14,10,6,.8)', textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 140}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, marginBottom: 16}}>
          <Img src={staticFile('amil-branca.png')} style={{width: 280, height: 280 * 576 / 1616, filter: `drop-shadow(0 0 14px ${VIO})`}} />
          <div style={{width: 2, height: 60, background: 'rgba(255,255,255,.4)'}} />
          <Img src={staticFile('emblema.png')} style={{width: 76, height: 76, objectFit: 'contain'}} />
          <div style={{...txt(30), textAlign: 'left'}}>BONI<br /><span style={{...txt(20, GOLD2, 500)}}>Planos de Saúde</span></div>
        </div>
        <div style={{...txt(52, GOLD2)}}>50% na 1ª e na 2ª mensalidade</div>
        <div style={{position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 14, marginTop: 18, background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, padding: '14px 36px', borderRadius: 60, overflow: 'hidden', transform: `translateY(${bob}px)`, boxShadow: '0 0 50px rgba(245,184,0,.6)'}}>
          <svg width="48" height="48" viewBox="0 0 100 100"><path d={ICON.chat[0]} fill="none" stroke="#000" strokeWidth="9" strokeLinejoin="round" /></svg>
          <span style={{...txt(50, '#000'), textShadow: 'none'}}>Manda AMIL no WhatsApp</span>
          <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep}%`, width: '25%', background: 'linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,.7), rgba(255,255,255,0))'}} />
        </div>
        <div style={{...txt(40), marginTop: 16}}>(21) 96422-5920</div>
        <div style={{...txt(22, 'rgba(255,255,255,.8)', 400), marginTop: 14, lineHeight: 1.35}}>Promoção por tempo limitado, conforme regras da operadora.<br />Carências, rede e valores variam por operadora e produto.</div>
      </div>
    </>
  );
};

const Flash50: React.FC = () => {
  const f = useCurrentFrame();
  const a = Math.max(0, ...[0.75, T.cinq, T.mens, T.tempo, 6.62, 7.81].map((t, i) => interpolate(f - fr(t), [0, 2, 8], [0, i > 3 ? 0.22 : 0.4, 0], cl)));
  return <AbsoluteFill style={{background: '#fff4d6', opacity: a, mixBlendMode: 'screen'}} />;
};

export const Promo50: React.FC = () => {
  const f = useCurrentFrame();
  const vid = <OffthreadVideo src={staticFile('avatar50c.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <style>{FONTS}</style>
      <Camera50>
        <Sequence durationInFrames={VID_END}>{vid}</Sequence>
        <Sequence from={VID_END}><Freeze frame={VID_END - 1}><OffthreadVideo muted src={staticFile('avatar50c.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Freeze></Sequence>
      </Camera50>
      <AbsoluteFill style={{background: '#050403', opacity: interpolate(f, [0, 14, 21], [0.93, 0.93, 0], cl)}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 45%, rgba(0,0,0,.6) 100%)'}} />
      <Dust frame={f} />
      <Beam />
      <AmilLogo />
      <Particles frame={f} start={fr(T.cinq)} n={50} cx={540} cy={1060} />
      <Two />
      <Shock t0={T.cinq + 0.2} cx={540} cy={1060} />
      <Particles frame={f} start={fr(T.mens)} n={60} cx={540} cy={1060} />
      <Labels />
      <Chips />
      <Benefits />
      <Tempo />
      <Fifty />
      <Captions50 />
      <End50 />
      <Flash50 />
      <Audio src={staticFile('music.mp3')} volume={(x) => interpolate(x, [0, 10, DUR50 - 25, DUR50], [0, 0.12, 0.12, 0], cl)} />
      {[0, 1.08, T.out, 6.5, 7.7, T.resg - 0.1, T.end - 0.05].map((t, i) => <Sequence key={'w' + i} from={Math.max(0, fr(t) - 2)}><Audio src={staticFile('whoosh.wav')} volume={0.4} /></Sequence>)}
      {[0.7, T.cinq, T.mens].map((t, i) => <Sequence key={'b' + i} from={fr(t)}><Audio src={staticFile('boom.wav')} volume={0.5} /></Sequence>)}
      {[T.cnpj, T.duas, T.mei, T.resg, T.odonto, T.todos, T.tempo].map((t, i) => <Sequence key={'p' + i} from={fr(t)}><Audio src={staticFile('pop.wav')} volume={0.45} /></Sequence>)}
    </AbsoluteFill>
  );
};
