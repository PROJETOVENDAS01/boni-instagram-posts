import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing, random} from 'remotion';
import words from '../public/words14.json';

const FPS = 25;
const GOLD = '#F5B800';
const GOLD2 = '#FFD95A';
const F = 'Poppins';
type W = {t: string; s: number; e: number; seg: number};
const WS: W[] = (words as any).words;
const SEGS: {t: string; s: number; e: number}[] = (words as any).segs;
const KEY = /2011|rio|plano|entender|operadoras|rede|carência|bolso|simples|família|empresa|mei|link|bio/i;
const fr = (s: number) => Math.round(s * FPS);
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const sp = (f: number, at: number, d = 14, st = 170) => spring({frame: f - fr(at), fps: FPS, config: {damping: d, stiffness: st}});

const fontCss = `
@font-face{font-family:Poppins;font-weight:800;src:url(${staticFile('Poppins-Bold.ttf')})}
@font-face{font-family:Poppins;font-weight:700;src:url(${staticFile('Poppins-Bold.ttf')})}
@font-face{font-family:Poppins;font-weight:500;src:url(${staticFile('Poppins-Medium.ttf')})}
@font-face{font-family:Poppins;font-weight:400;src:url(${staticFile('Poppins-Regular.ttf')})}`;

// camera keyframes: time, scale, rotate(deg), punch(flash+blur)
const CAM: [number, number, number, boolean][] = [
  [0, 1.0, 0, false], [0.3, 1.18, 0, true], [1.6, 1.04, 0, false], [4.02, 1.12, -1, true], [5.78, 1.24, 0, true], [7.46, 1.06, 0, true],
  [9.9, 1.0, 0, false], [14.5, 1.14, 0, true], [16.93, 1.0, 0, false], [19.36, 1.2, 0, true], [20.3, 1.06, 0, false],
];
const PUNCH = CAM.filter((c) => c[3]).map((c) => c[0]);

const Camera: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  let s = CAM[0][1], r = 0;
  for (let i = 1; i < CAM.length; i++) {
    const p = sp(f, CAM[i][0], CAM[i][3] ? 18 : 30, CAM[i][3] ? 260 : 60);
    s += (CAM[i][1] - CAM[i - 1][1]) * p;
    r += (CAM[i][2] - CAM[i - 1][2]) * p;
  }
  s += interpolate(f, [0, 575], [0, 0.05]); // constant slow drift
  // shake at 180 dias
  const k = f - fr(19.36);
  const sh = k >= 0 && k < 10 ? (10 - k) * 1.2 : 0;
  const sx = sh * (random('x' + f) - 0.5) * 2, sy = sh * (random('y' + f) - 0.5) * 2;
  let blur = 0;
  PUNCH.forEach((t) => { const d = f - fr(t); if (d >= 0 && d < 5) blur = Math.max(blur, (5 - d) * 2.2); });
  return (
    <AbsoluteFill style={{transform: `translate(${sx}px,${sy}px) scale(${s}) rotate(${r}deg)`, transformOrigin: '50% 30%', filter: blur ? `blur(${blur}px)` : undefined}}>
      {children}
    </AbsoluteFill>
  );
};

const Flash: React.FC = () => {
  const f = useCurrentFrame();
  let o = 0;
  PUNCH.forEach((t) => { const d = f - fr(t); if (d >= -1 && d < 7) o = Math.max(o, interpolate(d, [-1, 0, 7], [0.15, 0.5, 0], cl)); });
  return <AbsoluteFill style={{background: `radial-gradient(circle at 50% 35%, rgba(255,236,170,${o}) 0%, rgba(245,184,0,${o * 0.6}) 35%, rgba(0,0,0,0) 75%)`, mixBlendMode: 'screen'}} />;
};

const Atmosphere: React.FC = () => {
  const f = useCurrentFrame();
  const lx = 50 + Math.sin(f / 40) * 40, ly = 20 + Math.cos(f / 55) * 15;
  return (
    <>
      <AbsoluteFill style={{background: `radial-gradient(circle at ${lx}% ${ly}%, rgba(245,184,0,.18), rgba(0,0,0,0) 45%)`, mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.5) 0%, rgba(0,0,0,0) 16%, rgba(0,0,0,0) 45%, rgba(0,0,0,.55) 62%, rgba(0,0,0,.85) 100%)'}} />
      <AbsoluteFill style={{boxShadow: 'inset 0 0 220px rgba(0,0,0,.7)'}} />
      <AbsoluteFill style={{opacity: 0.07, mixBlendMode: 'overlay'}}>
        <svg width="1080" height="1920"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 30} /></filter><rect width="1080" height="1920" filter="url(#n)" /></svg>
      </AbsoluteFill>
    </>
  );
};

// dust particles
const Particles: React.FC<{from: number; to: number; cx: number; cy: number; n?: number}> = ({from, to, cx, cy, n = 40}) => {
  const f = useCurrentFrame();
  if (f < fr(from) || f > fr(to)) return null;
  const k = f - fr(from);
  return (
    <>
      {Array.from({length: n}).map((_, i) => {
        const a = random('a' + i) * Math.PI * 2, v = 4 + random('v' + i) * 10;
        const life = (k * (0.6 + random('l' + i))) % 50;
        const x = cx + Math.cos(a) * v * life, y = cy + Math.sin(a) * v * life - life * 2;
        const o = interpolate(life, [0, 5, 50], [0, 1, 0]);
        const sz = 3 + random('s' + i) * 6;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: sz, height: sz, borderRadius: '50%', background: GOLD2, opacity: o, boxShadow: `0 0 ${sz * 3}px ${GOLD}`}} />;
      })}
    </>
  );
};

// ---------- icons (stroke draw) ----------
const Draw: React.FC<{d: string; p: number; w?: number}> = ({d, p, w = 7}) => (
  <path d={d} fill="none" stroke={GOLD} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
);
const ICONS: Record<string, string[]> = {
  briefcase: ['M15 35 h70 v45 h-70 z', 'M35 35 v-10 h30 v10', 'M15 55 h70'],
  person: ['M50 18 a14 14 0 1 0 0.1 0', 'M22 85 c0 -22 56 -22 56 0'],
  calendar: ['M15 22 h70 v63 h-70 z', 'M15 40 h70', 'M32 12 v18', 'M68 12 v18', 'M40 62 l8 8 l16 -18'],
  building: ['M20 85 v-60 h30 v60', 'M50 85 v-40 h30 v40', 'M28 38 h14 M28 52 h14 M28 66 h14 M58 56 h14 M58 70 h14', 'M12 85 h76'],
  check: ['M20 52 l18 18 l42 -42'],
  chat: ['M15 20 h70 v45 h-40 l-18 16 v-16 h-12 z'],
  heart: ['M50 82 C20 60 12 45 18 32 C24 18 42 18 50 32 C58 18 76 18 82 32 C88 45 80 60 50 82 z'],
  pulse: ['M10 55 h20 l8 -20 l12 40 l10 -30 l6 10 h24'],
  drop: ['M50 15 C35 38 28 50 28 60 a22 22 0 0 0 44 0 C72 50 65 38 50 15 z'],
  flask: ['M40 15 h20', 'M44 15 v25 l-22 38 a6 6 0 0 0 5 9 h46 a6 6 0 0 0 5 -9 l-22 -38 v-25', 'M30 65 h40'],
  envelope: ['M15 28 h70 v46 h-70 z', 'M15 28 l35 26 l35 -26'],
  cross: ['M25 25 l50 50', 'M75 25 l-50 50'],
  family: ['M32 22 a10 10 0 1 0 0.1 0', 'M68 22 a10 10 0 1 0 0.1 0', 'M12 80 c0 -26 40 -26 40 0', 'M48 80 c0 -26 40 -26 40 0'],
  stetho: ['M30 15 v25 a15 15 0 0 0 30 0 v-25', 'M45 55 v10 a15 15 0 0 0 30 0 v-8', 'M75 50 a7 7 0 1 0 0.1 0'],
};
const Icon: React.FC<{name: string; p: number; size?: number}> = ({name, p, size = 110}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{filter: `drop-shadow(0 0 12px rgba(245,184,0,.6))`}}>
    {ICONS[name].map((d, i) => <Draw key={i} d={d} p={interpolate(p, [i * 0.15, i * 0.15 + 0.6], [0, 1], cl)} />)}
  </svg>
);

// ---------- floating photo card ----------
const Card: React.FC<{from: number; to: number; img: string; side: 'L' | 'R'; label: string; icon: string; top?: number}> = ({from, to, img, side, label, icon, top = 520}) => {
  const f = useCurrentFrame();
  const a = fr(from), b = fr(to);
  if (f < a - 2 || f > b + 8) return null;
  const pin = sp(f, from, 13, 150);
  const pout = interpolate(f, [b, b + 8], [0, 1], {...cl, easing: Easing.in(Easing.cubic)});
  const dir = side === 'R' ? 1 : -1;
  const x = side === 'R' ? 735 : 45;
  const tx = (1 - pin) * 500 * dir + pout * 500 * dir;
  const ry = (1 - pin) * -50 * dir + pout * 40 * dir;
  const kb = interpolate(f, [a, b], [1.05, 1.2]);
  const sweep = interpolate(f - a, [8, 26], [-120, 220], cl);
  const ip = interpolate(f - a, [6, 30], [0, 1], cl);
  return (
    <div style={{position: 'absolute', left: x, top, width: 300, perspective: 1200}}>
      <div style={{transform: `translateX(${tx}px) rotateY(${ry}deg) rotate(${dir * -3 * (1 - pin) + dir * 2}deg)`, opacity: 1 - pout}}>
        <div style={{position: 'relative', width: 300, height: 360, borderRadius: 26, overflow: 'hidden', border: `4px solid ${GOLD}`, boxShadow: '0 30px 60px rgba(0,0,0,.7), 0 0 40px rgba(245,184,0,.35)'}}>
          <Img src={staticFile(`img/${img}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${kb})`}} />
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,.85))'}} />
          <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep}%`, width: '40%', background: 'linear-gradient(100deg, rgba(255,255,255,0), rgba(255,240,200,.35), rgba(255,255,255,0))'}} />
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10}}>
            <Icon name={icon} p={ip} size={54} />
            <span style={{fontFamily: F, fontWeight: 800, fontSize: label.length > 10 ? 25 : 32, color: '#fff', letterSpacing: 1, whiteSpace: 'nowrap'}}>{label}</span>
          </div>
        </div>
      </div>
    </div>
  );
};



const OFF = 125; // drone intro frames

const Checklist: React.FC = () => {
  const f = useCurrentFrame();
  const CHECK: [number, string][] = [[11.8, 'REDE'], [12.55, 'CARÊNCIA'], [13.4, 'CABE NO BOLSO']];
  const vis = interpolate(f, [fr(11.6), fr(11.9), fr(16.6), fr(16.9)], [0, 1, 1, 0], cl);
  if (vis <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 50, top: 250, opacity: vis, display: 'flex', flexDirection: 'column', gap: 12}}>
      {CHECK.map(([t, l], i) => {
        const p = sp(f, t, 12, 200);
        const on = f >= fr(t);
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '8px 18px 8px 10px', borderRadius: 40, background: on ? 'rgba(0,0,0,.72)' : 'rgba(0,0,0,.45)', border: `2px solid ${on ? GOLD : 'rgba(255,255,255,.25)'}`, transform: `scale(${on ? 0.85 + 0.15 * p : 0.85})`, transformOrigin: 'left center', opacity: on ? 1 : 0.5, alignSelf: 'flex-start'}}>
            <div style={{width: 38, height: 38, borderRadius: '50%', background: on ? GOLD : 'transparent', border: `2px solid ${GOLD}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <svg width="26" height="26" viewBox="0 0 100 100"><path d="M20 52 l18 18 l42 -42" fill="none" stroke="#000" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={on ? 1 - p : 1} /></svg>
            </div>
            <span style={{fontFamily: F, fontWeight: 700, fontSize: 30, color: '#fff'}}>{l}</span>
          </div>
        );
      })}
    </div>
  );
};

const Bubble: React.FC<{from: number; to: number; text: string; quote?: boolean}> = ({from, to, text, quote}) => {
  const f = useCurrentFrame();
  if (f < fr(from) || f > fr(to) + 6) return null;
  const p = sp(f, from, 11, 200);
  const o = interpolate(f, [fr(to), fr(to) + 6], [1, 0], cl);
  return (
    <div style={{position: 'absolute', left: quote ? 60 : 'auto', right: quote ? 'auto' : 60, top: 1040, maxWidth: 620, opacity: o * p, transform: `scale(${0.6 + 0.4 * p}) rotate(${quote ? -3 : 3}deg)`, transformOrigin: quote ? 'left bottom' : 'right bottom'}}>
      <div style={{background: quote ? '#fff' : GOLD, color: '#111', fontFamily: F, fontWeight: 700, fontSize: 40, lineHeight: 1.2, padding: '22px 30px', borderRadius: 34, boxShadow: '0 20px 50px rgba(0,0,0,.5)'}}>
        {quote ? <span style={{color: '#888', fontSize: 30}}>Cliente: </span> : null}{text}
      </div>
      <div style={{width: 0, height: 0, marginLeft: quote ? 50 : 'auto', marginRight: quote ? 0 : 50, borderLeft: '20px solid transparent', borderRight: '20px solid transparent', borderTop: `26px solid ${quote ? '#fff' : GOLD}`}} />
    </div>
  );
};

const Operadoras: React.FC = () => {
  const f = useCurrentFrame();
  const a = fr(9.9), b = fr(11.7);
  if (f < a || f > b + 8) return null;
  const o = interpolate(f, [b, b + 8], [1, 0], cl);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 960, display: 'flex', justifyContent: 'center', gap: 24, opacity: o}}>
      {['A', 'B', 'C'].map((l, i) => {
        const p = sp(f, 10.0 + i * 0.22, 12, 180);
        const pick = f >= fr(11.0) && i === 1;
        return (
          <div key={i} style={{width: 210, padding: '18px 0', borderRadius: 24, background: pick ? 'rgba(245,184,0,.25)' : 'rgba(0,0,0,.7)', border: `3px solid ${pick ? GOLD : 'rgba(255,255,255,.3)'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${(1 - p) * 120}px) scale(${pick ? 1.1 : 1})`, opacity: p, boxShadow: pick ? '0 0 40px rgba(245,184,0,.6)' : 'none'}}>
            <Icon name="building" p={interpolate(f - fr(10.0 + i * 0.22), [0, 18], [0, 1], cl)} size={86} />
            <div style={{fontFamily: F, fontWeight: 700, fontSize: 28, color: '#fff'}}>Operadora {l}</div>
          </div>
        );
      })}
    </div>
  );
};

const Publico: React.FC = () => {
  const f = useCurrentFrame();
  const a = fr(16.9), b = fr(20.25);
  if (f < a || f > b + 8) return null;
  const o = interpolate(f, [b, b + 8], [1, 0], cl);
  const items: [number, string, string][] = [[16.95, 'person', 'VOCÊ'], [17.75, 'family', 'FAMÍLIA'], [18.55, 'building', 'EMPRESA'], [19.38, 'briefcase', 'MEI']];
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: 950, display: 'flex', justifyContent: 'center', gap: 16, opacity: o}}>
      {items.map(([t, ic, l], i) => {
        const p = sp(f, t, 11, 200);
        return (
          <div key={i} style={{width: 205, padding: '16px 0', borderRadius: 24, background: 'rgba(0,0,0,.72)', border: `3px solid ${GOLD}`, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${(1 - p) * 100}px) scale(${0.7 + 0.3 * p})`, opacity: p}}>
            <Icon name={ic} p={interpolate(f - fr(t), [0, 15], [0, 1], cl)} size={80} />
            <div style={{fontFamily: F, fontWeight: 800, fontSize: 28, color: '#fff'}}>{l}</div>
          </div>
        );
      })}
    </div>
  );
};

const BIGS: {s: number; e: number; txt: string}[] = [
  {s: 0.28, e: 1.5, txt: 'DESDE 2011'},
  {s: 7.44, e: 7.95, txt: 'TUDO BEM.'},
  {s: 15.4, e: 16.3, txt: 'SIMPLES'},
  {s: 19.34, e: 20.0, txt: 'ATÉ MEI'},
];
const inBig = (t: number) => BIGS.some((b) => t >= b.s && t < b.e);
const chunks = (() => {
  const out: {ws: W[]; s: number; e: number; seg: number}[] = [];
  SEGS.forEach((_, si) => {
    if (si >= 12) return;
    const ws = WS.filter((w) => w.seg === si && !inBig(w.s + 0.02));
    for (let i = 0; i < ws.length; i += 3) {
      const c = ws.slice(i, i + 3);
      out.push({ws: c, s: c[0].s, e: c[c.length - 1].e, seg: si});
    }
  });
  return out;
})();

const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  if (inBig(t)) return null;
  const endOf = (c: typeof chunks[0], i: number) => Math.min(c.e + 0.35, i + 1 < chunks.length ? chunks[i + 1].s - 0.04 : 99, (SEGS[c.seg + 1]?.s ?? 99) - 0.06);
  const ci = chunks.findIndex((c, i) => t >= c.s - 0.04 && t < endOf(c, i));
  if (ci < 0) return null;
  const c = chunks[ci];
  const p = sp(f, c.s - 0.04, 12, 260);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 1270, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', transform: `translateY(${(1 - p) * 30}px) scale(${0.85 + 0.15 * p})`, opacity: p}}>
      {c.ws.map((w, i) => {
        const act = t >= w.s - 0.02 && t < w.e + 0.08;
        const key = KEY.test(w.t);
        return (
          <span key={i} style={{fontFamily: F, fontWeight: 800, fontSize: 66, margin: '0 19px', textTransform: 'uppercase', color: key ? GOLD : '#fff', display: 'inline-block', transform: `scale(${act ? 1.12 : 1}) translateY(${act ? -4 : 0}px)`, textShadow: '0 4px 0 rgba(0,0,0,.95), 0 0 26px rgba(0,0,0,.95)', borderBottom: act ? `6px solid ${GOLD}` : '6px solid transparent'}}>
            {w.t}
          </span>
        );
      })}
    </div>
  );
};

const BigWord: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const b = BIGS.find((x) => t >= x.s && t < x.e);
  if (!b) return null;
  const a = fr(b.s);
  const sweep = interpolate(f - a, [3, 16], [-30, 130], cl);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1210, textAlign: 'center'}}>
      <div style={{display: 'inline-flex'}}>
        {b.txt.split('').map((ch, i) => {
          const p = spring({frame: f - a - i * 0.45, fps: FPS, config: {damping: 11, stiffness: 220}});
          return <span key={i} style={{fontFamily: F, fontWeight: 800, fontSize: 124, color: GOLD, display: 'inline-block', transform: `translateY(${(1 - p) * 80}px) scale(${p})`, opacity: p, whiteSpace: 'pre', textShadow: '0 5px 0 #6b4e00, 0 0 40px rgba(0,0,0,.7), 0 0 8px #000'}}>{ch}</span>;
        })}
      </div>
      <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep}%`, width: '18%', background: 'linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,.45), rgba(255,255,255,0))', mixBlendMode: 'overlay'}} />
      <div style={{height: 6, margin: '6px auto 0', width: interpolate(f - a, [5, 15], [0, 520], cl), background: GOLD, borderRadius: 3, boxShadow: '0 0 20px rgba(245,184,0,.8)'}} />
    </div>
  );
};

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const a = fr(20.3);
  if (f < a) return null;
  const p = sp(f, 20.3, 13, 150);
  const bob = Math.sin((f - a) / 3.5) * 6;
  const sweep = interpolate((f - a) % 30, [0, 18], [-40, 140], cl);
  return (
    <>
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,${0.85 * p}) 75%)`}} />
      <div style={{position: 'absolute', left: 70, right: 70, top: 1110, padding: '28px 20px 22px', borderRadius: 36, background: 'rgba(15,12,5,.8)', border: `2px solid rgba(245,184,0,.7)`, textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 120}px)`}}>
        <div style={{position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 14, background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, padding: '14px 40px', borderRadius: 60, overflow: 'hidden', transform: `translateY(${bob}px)`, boxShadow: '0 0 50px rgba(245,184,0,.6)'}}>
          <svg width="50" height="50" viewBox="0 0 100 100"><path d={ICONS.chat[0]} fill="none" stroke="#000" strokeWidth="9" strokeLinejoin="round" /></svg>
          <span style={{fontFamily: F, fontWeight: 800, fontSize: 58, color: '#000'}}>Comenta PLANO</span>
          <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep}%`, width: '25%', background: 'linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,.7), rgba(255,255,255,0))'}} />
        </div>
        <div style={{fontFamily: F, fontWeight: 700, fontSize: 36, color: '#fff', marginTop: 18}}>ou toque no <span style={{color: GOLD}}>Link na bio ↑</span></div>
        <div style={{fontFamily: F, fontWeight: 400, fontSize: 21, color: 'rgba(255,255,255,.78)', marginTop: 12}}>Carências, rede e valores variam por operadora e produto.</div>
      </div>
    </>
  );
};

const Brand: React.FC = () => {
  const f = useCurrentFrame();
  const p = sp(f, 0.05, 15, 150);
  return (
    <div style={{position: 'absolute', right: 50, top: 175, display: 'flex', alignItems: 'center', gap: 12, opacity: p}}>
      <div style={{textAlign: 'right', fontFamily: F, fontWeight: 700, fontSize: 26, color: '#fff', lineHeight: 1.1, textShadow: '0 2px 8px #000'}}>BONI<br /><span style={{fontWeight: 600, fontSize: 18, color: GOLD2, textShadow: '0 1px 6px #000'}}>Planos de Saúde</span></div>
      <Img src={staticFile('emblema.png')} style={{width: 64, height: 64, objectFit: 'contain'}} />
    </div>
  );
};

// aerial rise over the open-air plate (no roof), camera tilting up to the sky
const Aerial: React.FC = () => {
  const f = useCurrentFrame();
  const k = interpolate(f, [0, 78], [0, 1], {...cl, easing: Easing.inOut(Easing.cubic)});
  const fade = interpolate(f, [0, 4], [0, 1], cl);
  return (
    <AbsoluteFill style={{opacity: fade, overflow: 'hidden'}}>
      <Img src={staticFile('img/plate14.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.45 - 0.35 * k}) translateY(${-120 + 260 * k}px) rotate(${-2 + 2 * k}deg)`, transformOrigin: '50% 80%'}} />
    </AbsoluteFill>
  );
};

// cinematic intro over the drone shot
const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const p1 = sp(f, 1.2, 14, 120), p2 = sp(f, 1.8, 14, 120), p3 = sp(f, 2.5, 14, 120);
  const out = interpolate(f, [OFF - 12, OFF], [1, 0], cl);
  const line = interpolate(f, [fr(1.0), fr(2.0)], [0, 520], {...cl, easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill style={{opacity: out}}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 60%, rgba(0,0,0,.6) 100%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center'}}>
        <div style={{display: 'inline-flex', overflow: 'hidden'}}><div style={{transform: `translateY(${(1 - p1) * 110}%)`, fontFamily: F, fontWeight: 800, fontSize: 104, color: '#fff', letterSpacing: 6, textShadow: '0 6px 30px rgba(0,0,0,.7)'}}>THIAGO BONI</div></div>
        <div style={{height: 5, width: line, margin: '10px auto', background: GOLD, boxShadow: '0 0 18px rgba(245,184,0,.9)'}} />
        <div style={{overflow: 'hidden'}}><div style={{transform: `translateY(${(1 - p2) * 110}%)`, fontFamily: F, fontWeight: 600, fontSize: 40, color: GOLD2, textShadow: '0 3px 16px #000'}}>Consultor em planos de saúde</div></div>
        <div style={{overflow: 'hidden'}}><div style={{transform: `translateY(${(1 - p3) * 110}%)`, fontFamily: F, fontWeight: 500, fontSize: 34, color: '#fff', textShadow: '0 3px 16px #000'}}>desde 2011 · Rio de Janeiro</div></div>
      </div>
    </AbsoluteFill>
  );
};

const Sfx: React.FC = () => (
  <>
    <Sequence from={OFF - 3}><Audio src={staticFile('whoosh.wav')} volume={0.55} /></Sequence>
    <Sequence from={OFF + fr(0.3)}><Audio src={staticFile('boom.wav')} volume={0.45} /></Sequence>
    {[4.02, 5.78, 9.9, 16.93].map((t, i) => <Sequence key={i} from={OFF + fr(t) - 2}><Audio src={staticFile('whoosh.wav')} volume={0.4} /></Sequence>)}
    {[11.8, 12.55, 13.4, 16.95, 17.75, 18.55, 19.38, 20.3].map((t, i) => <Sequence key={'p' + i} from={OFF + fr(t)}><Audio src={staticFile('pop.wav')} volume={0.4} /></Sequence>)}
  </>
);

const Talk: React.FC = () => (
  <AbsoluteFill>
    <Camera>
      <OffthreadVideo src={staticFile('avatar14.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </Camera>
    <Atmosphere />
    <Flash />
    <Brand />
    <Checklist />
    <Bubble from={4.0} to={5.15} text="E sabe o que eu mais escuto?" />
    <Bubble from={5.78} to={7.1} text="“Eu não entendo nada de plano.”" quote />
    <Operadoras />
    <Publico />
    <BigWord />
    <Captions />
    <EndCard />
    <Particles from={20.3} to={23} cx={540} cy={1180} n={30} />
  </AbsoluteFill>
);

export const Apres: React.FC = () => {
  const f = useCurrentFrame();
  const flash = interpolate(f, [OFF - 4, OFF, OFF + 8], [0, 0.9, 0], cl);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <style>{fontCss}</style>
      <Sequence durationInFrames={OFF + 4}>
        <AbsoluteFill style={{filter: `blur(${interpolate(f, [OFF - 6, OFF], [0, 10], cl)}px)`}}>
          <Sequence durationInFrames={53}><OffthreadVideo src={staticFile('drone14.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} muted /></Sequence>
          <Sequence from={50}><Aerial /></Sequence>
        </AbsoluteFill>
        <Intro />
      </Sequence>
      <Sequence from={OFF}>
        <Talk />
      </Sequence>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, rgba(255,240,190,${flash}), rgba(245,184,0,${flash * 0.6}) 40%, rgba(0,0,0,0) 80%)`, mixBlendMode: 'screen'}} />
      <Audio src={staticFile('music.mp3')} volume={(x) => interpolate(x, [0, 10, OFF, OFF + 10, 670, 700], [0, 0.32, 0.32, 0.13, 0.13, 0], cl)} />
      <Sfx />
    </AbsoluteFill>
  );
};
