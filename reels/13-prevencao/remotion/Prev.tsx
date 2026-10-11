import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing, random} from 'remotion';
import words from '../public/words13.json';

const FPS = 25;
const GOLD = '#F5B800';
const GOLD2 = '#FFD95A';
const F = 'Poppins';
type W = {t: string; s: number; e: number; seg: number};
const WS: W[] = (words as any).words;
const SEGS: {t: string; s: number; e: number}[] = (words as any).segs;
const KEY = /doença|prevenir|rotina|check|exames|pressão|glicose|colesterol|começo|médico|ano|cuidar|antes|link|bio|perfil|plano/i;
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
  [0, 1.0, 0, false], [1.3, 1.22, 0, true], [2.33, 1.06, -1, true], [4.1, 1.0, 0, false],
  [6.9, 1.12, 0, true], [7.52, 1.2, 0.8, true], [8.3, 1.28, -0.8, true], [9.25, 1.05, 0, false],
  [10.9, 1.0, 0, false], [13.32, 1.24, 0, true], [15.8, 1.04, 0, false], [16.35, 1.12, 0, true], [19.0, 1.05, 0, false],
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
  s += interpolate(f, [0, 525], [0, 0.05]); // constant slow drift
  // shake at 180 dias
  const k = f - fr(8.3);
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


// ---------- checklist ----------
const CHECK: [number, string][] = [[4.15, 'CONSULTA'], [5.3, 'CHECK-UP'], [6.02, 'EXAMES'], [11.2, 'ACOMPANHAMENTO']];
const Checklist: React.FC = () => {
  const f = useCurrentFrame();
  const vis = interpolate(f, [fr(4.0), fr(4.3), fr(16.1), fr(16.4)], [0, 1, 1, 0], cl);
  if (vis <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 50, top: 250, opacity: vis, transform: `translateX(${(1 - vis) * -40}px)`, display: 'flex', flexDirection: 'column', gap: 12}}>
      {CHECK.map(([t, l], i) => {
        const p = sp(f, t, 12, 200);
        const on = f >= fr(t);
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '8px 18px 8px 10px', borderRadius: 40, background: on ? 'rgba(0,0,0,.7)' : 'rgba(0,0,0,.45)', border: `2px solid ${on ? GOLD : 'rgba(255,255,255,.25)'}`, backdropFilter: 'blur(8px)', transform: `scale(${on ? 0.85 + 0.15 * p : 0.85})`, transformOrigin: 'left center', opacity: on ? 1 : 0.5, alignSelf: 'flex-start'}}>
            <div style={{width: 38, height: 38, borderRadius: '50%', background: on ? GOLD : 'transparent', border: `2px solid ${GOLD}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <svg width="26" height="26" viewBox="0 0 100 100"><path d="M20 52 l18 18 l42 -42" fill="none" stroke="#000" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={on ? 1 - p : 1} /></svg>
            </div>
            <span style={{fontFamily: F, fontWeight: 700, fontSize: 28, color: '#fff'}}>{l}</span>
          </div>
        );
      })}
    </div>
  );
};

// X over the "only when sick" card
const XMark: React.FC<{at: number; to: number}> = ({at, to}) => {
  const f = useCurrentFrame();
  if (f < fr(at) || f > fr(to) + 8) return null;
  const p = interpolate(f - fr(at), [0, 8], [0, 1], cl);
  const o = interpolate(f, [fr(to), fr(to) + 8], [1, 0], cl);
  return (
    <svg width="300" height="360" viewBox="0 0 100 120" style={{position: 'absolute', left: 45, top: 830, opacity: o, filter: 'drop-shadow(0 0 14px rgba(245,184,0,.9))'}}>
      <path d="M20 25 L80 95" stroke={GOLD} strokeWidth="9" strokeLinecap="round" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - interpolate(p, [0, 0.5], [0, 1], cl)} />
      <path d="M80 25 L20 95" stroke={GOLD} strokeWidth="9" strokeLinecap="round" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - interpolate(p, [0.5, 1], [0, 1], cl)} />
    </svg>
  );
};

// scan line "descobrir no começo"
const Scan: React.FC<{from: number; to: number}> = ({from, to}) => {
  const f = useCurrentFrame();
  if (f < fr(from) || f > fr(to)) return null;
  const y = interpolate(f, [fr(from), fr(to)], [200, 1250]);
  const o = interpolate(f, [fr(from), fr(from) + 4, fr(to) - 4, fr(to)], [0, 1, 1, 0], cl);
  const p = sp(f, from + 0.1, 12, 180);
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: y, height: 4, background: GOLD, opacity: o, boxShadow: '0 0 30px 10px rgba(245,184,0,.55)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: y - 140, height: 140, background: 'linear-gradient(180deg, rgba(245,184,0,0), rgba(245,184,0,.18))', opacity: o}} />
      <div style={{position: 'absolute', right: 50, top: 260, opacity: o * p, transform: `scale(${0.8 + 0.2 * p})`, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 22px', borderRadius: 40, background: 'rgba(0,0,0,.7)', border: `2px solid ${GOLD}`}}>
        <svg width="40" height="40" viewBox="0 0 100 100"><circle cx="42" cy="42" r="24" stroke={GOLD} strokeWidth="9" fill="none" /><path d="M60 60 l22 22" stroke={GOLD} strokeWidth="10" strokeLinecap="round" /></svg>
        <span style={{fontFamily: F, fontWeight: 800, fontSize: 30, color: '#fff'}}>DESCOBRIR CEDO</span>
      </div>
    </>
  );
};

// year by year chart
const YearChart: React.FC<{from: number; to: number}> = ({from, to}) => {
  const f = useCurrentFrame();
  const a = fr(from), b = fr(to);
  if (f < a - 2 || f > b + 8) return null;
  const pin = sp(f, from, 13, 150);
  const o = interpolate(f, [b, b + 8], [1, 0], cl);
  const yrs = ['ANO 1', 'ANO 2', 'ANO 3'];
  const line = interpolate(f, [a + 10, a + 40], [0, 1], cl);
  return (
    <div style={{position: 'absolute', left: 705, top: 820, width: 330, padding: '20px 18px', borderRadius: 26, background: 'rgba(10,8,2,.78)', border: `3px solid ${GOLD}`, backdropFilter: 'blur(10px)', opacity: o, transform: `translateX(${(1 - pin) * 400}px)`, boxShadow: '0 20px 50px rgba(0,0,0,.6)'}}>
      <div style={{fontFamily: F, fontWeight: 800, fontSize: 30, color: GOLD, textAlign: 'center', marginBottom: 10}}>ANO A ANO</div>
      <svg width="294" height="190" viewBox="0 0 294 190">
        {yrs.map((y, i) => {
          const bp = sp(f, from + 0.25 + i * 0.35, 12, 160);
          const h = [70, 100, 130][i] * bp;
          return (
            <g key={i}>
              <rect x={20 + i * 95} y={160 - h} width={64} height={h} rx={10} fill={i === 2 ? GOLD : 'rgba(245,184,0,.45)'} />
              <text x={52 + i * 95} y={184} textAnchor="middle" fill="#fff" fontFamily={F} fontWeight={700} fontSize={18}>{y}</text>
              {bp > 0.9 && <path d={`M${40 + i * 95} ${140 - h} l8 8 l16 -16`} stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" />}
            </g>
          );
        })}
        <path d="M52 85 L147 55 L242 25" stroke="#fff" strokeWidth={4} fill="none" strokeDasharray="8 8" pathLength={1} style={{strokeDasharray: 1, strokeDashoffset: 1 - line}} />
      </svg>
    </div>
  );
};

// ---------- captions ----------
const BIGS: {s: number; e: number; txt: string}[] = [
  {s: 1.28, e: 2.3, txt: 'SÓ PRA DOENÇA?'},
  {s: 6.86, e: 7.5, txt: 'PRESSÃO'},
  {s: 7.48, e: 8.27, txt: 'GLICOSE'},
  {s: 8.25, e: 9.2, txt: 'COLESTEROL'},
  {s: 13.28, e: 14.22, txt: 'CUIDAR ANTES'},
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
  const txt = b.txt;
  const sweep = interpolate(f - a, [3, 16], [-30, 130], cl);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1210, textAlign: 'center'}}>
      <div style={{display: 'inline-flex'}}>
        {txt.split('').map((ch, i) => {
          const p = spring({frame: f - a - i * 0.45, fps: FPS, config: {damping: 11, stiffness: 220}});
          return <span key={i} style={{fontFamily: F, fontWeight: 800, fontSize: txt.length > 10 ? 100 : 128, color: GOLD, display: 'inline-block', transform: `translateY(${(1 - p) * 80}px) scale(${p})`, opacity: p, whiteSpace: 'pre', textShadow: '0 5px 0 #6b4e00, 0 0 40px rgba(0,0,0,.7), 0 0 8px #000'}}>{ch}</span>;
        })}
      </div>
      <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep}%`, width: '18%', background: 'linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,.45), rgba(255,255,255,0))', mixBlendMode: 'overlay'}} />
      <div style={{height: 6, margin: '6px auto 0', width: interpolate(f - a, [5, 15], [0, 520], cl), background: GOLD, borderRadius: 3, boxShadow: '0 0 20px rgba(245,184,0,.8)'}} />
    </div>
  );
};

const Brand: React.FC = () => {
  const f = useCurrentFrame();
  const p = sp(f, 0.05, 15, 150);
  return (
    <>
      <div style={{position: 'absolute', left: 50, right: 50, top: 150, height: 5, background: 'rgba(255,255,255,.25)', borderRadius: 3}}>
        <div style={{width: `${(f / 525) * 100}%`, height: '100%', background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, borderRadius: 3, boxShadow: '0 0 12px rgba(245,184,0,.8)'}} />
      </div>
      <div style={{position: 'absolute', right: 50, top: 175, display: 'flex', alignItems: 'center', gap: 12, opacity: p, transform: `translateY(${(1 - p) * -30}px)`}}>
        <div style={{textAlign: 'right', fontFamily: F, fontWeight: 700, fontSize: 26, color: '#fff', lineHeight: 1.1, textShadow: '0 2px 8px #000'}}>BONI<br /><span style={{fontWeight: 600, fontSize: 18, color: GOLD2, textShadow: '0 1px 6px #000, 0 0 2px #000'}}>Planos de Saúde</span></div>
        <Img src={staticFile('emblema.png')} style={{width: 64, height: 64, objectFit: 'contain'}} />
      </div>
    </>
  );
};

const NameTag: React.FC = () => {
  const f = useCurrentFrame();
  const a = fr(2.4), b = fr(3.95);
  if (f < a || f > b + 8) return null;
  const p = sp(f, 2.4, 14, 160);
  const o = interpolate(f, [b, b + 8], [1, 0], cl);
  const w = interpolate(f - a, [0, 12], [0, 1], {...cl, easing: Easing.out(Easing.cubic)});
  return (
    <div style={{position: 'absolute', left: 50, top: 1100, opacity: o}}>
      <div style={{height: 4, width: 360 * w, background: GOLD, boxShadow: '0 0 12px rgba(245,184,0,.8)'}} />
      <div style={{overflow: 'hidden'}}><div style={{transform: `translateY(${(1 - p) * 100}%)`, fontFamily: F, fontWeight: 700, fontSize: 36, color: '#fff', marginTop: 8, textShadow: '0 2px 10px #000'}}>Thiago Boni</div></div>
      <div style={{overflow: 'hidden'}}><div style={{transform: `translateY(${(1 - sp(f, 2.6, 14, 160)) * 100}%)`, fontFamily: F, fontWeight: 500, fontSize: 22, color: GOLD, textShadow: '0 2px 10px #000'}}>Consultor em planos de saúde desde 2011</div></div>
    </div>
  );
};

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const a = fr(16.25);
  if (f < a) return null;
  const p = sp(f, 16.25, 13, 150);
  const bob = Math.sin((f - a) / 3.5) * 6;
  const sweep = interpolate((f - a) % 30, [0, 18], [-40, 140], cl);
  return (
    <>
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,${0.85 * p}) 75%)`}} />
      <div style={{position: 'absolute', left: 70, right: 70, top: 1110, padding: '28px 20px 22px', borderRadius: 36, background: 'rgba(15,12,5,.78)', border: `2px solid rgba(245,184,0,.7)`, backdropFilter: 'blur(14px)', textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 120}px)`}}>
        <div style={{position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 14, background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, padding: '14px 36px', borderRadius: 60, overflow: 'hidden', transform: `translateY(${bob}px)`, boxShadow: '0 0 50px rgba(245,184,0,.6)'}}>
          <svg width="50" height="50" viewBox="0 0 100 100"><path d={ICONS.chat[0]} fill="none" stroke="#000" strokeWidth="9" strokeLinejoin="round" /></svg>
          <span style={{fontFamily: F, fontWeight: 800, fontSize: 54, color: '#000'}}>Comenta PREVENIR</span>
          <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep}%`, width: '25%', background: 'linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,.7), rgba(255,255,255,0))'}} />
        </div>
        <div style={{fontFamily: F, fontWeight: 700, fontSize: 36, color: '#fff', marginTop: 18}}>ou toque no <span style={{color: GOLD}}>Link na bio ↑</span></div>
        <div style={{fontFamily: F, fontWeight: 500, fontSize: 28, color: GOLD2, marginTop: 10, opacity: interpolate(f, [fr(19.0), fr(19.3)], [0, 1], cl)}}>O plano certo para o seu perfil</div>
        <div style={{fontFamily: F, fontWeight: 400, fontSize: 21, color: 'rgba(255,255,255,.78)', marginTop: 12}}>Carências, rede e valores variam por operadora e produto.</div>
      </div>
    </>
  );
};

const WH = [0.35, 2.33, 4.1, 5.27, 5.98, 6.9, 7.52, 8.3, 9.27, 10.88, 13.3, 16.3];
const Sfx: React.FC = () => (
  <>
    {WH.map((t, i) => <Sequence key={'w' + i} from={Math.max(0, fr(t) - 2)}><Audio src={staticFile('whoosh.wav')} volume={0.4} /></Sequence>)}
    {[1.3, 13.32].map((t, i) => <Sequence key={'b' + i} from={fr(t)}><Audio src={staticFile('boom.wav')} volume={0.5} /></Sequence>)}
    {CHECK.map(([t], i) => <Sequence key={'c' + i} from={fr(t)}><Audio src={staticFile('pop.wav')} volume={0.45} /></Sequence>)}
    <Sequence from={fr(16.3)}><Audio src={staticFile('pop.wav')} volume={0.6} /></Sequence>
  </>
);

export const Prev: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <style>{fontCss}</style>
    <Camera>
      <OffthreadVideo src={staticFile('avatar13.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </Camera>
    <Atmosphere />
    <Flash />
    <Brand />
    <Checklist />
    <NameTag />
    <Card from={0.4} to={2.25} img="emergencia-corredor-hospital" side="L" label="SÓ DOENÇA?" icon="cross" top={830} />
    <XMark at={1.4} to={2.25} />
    <Card from={2.38} to={3.95} img="saude-caminhada" side="R" label="PREVENÇÃO" icon="heart" top={830} />
    <Card from={4.12} to={5.15} img="saude-consultorio" side="L" label="CONSULTA" icon="stetho" top={830} />
    <Card from={5.28} to={5.95} img="saude-laboratorio" side="R" label="CHECK-UP" icon="flask" top={830} />
    <Card from={6.0} to={6.85} img="prev-envelopes-exames" side="L" label="EXAMES" icon="envelope" top={830} />
    <Card from={6.92} to={7.48} img="saude-pressao" side="R" label="PRESSÃO" icon="pulse" top={830} />
    <Card from={7.54} to={8.26} img="saude-glicemia" side="L" label="GLICOSE" icon="drop" top={830} />
    <Card from={8.32} to={10.3} img="saude-alimentacao" side="R" label="COLESTEROL" icon="heart" top={830} />
    <Scan from={9.28} to={10.4} />
    <Card from={10.9} to={12.9} img="planner-checks-estetoscopio" side="L" label="ACOMPANHAR" icon="calendar" top={830} />
    <YearChart from={10.95} to={12.9} />
    <Card from={13.36} to={15.8} img="estetoscopio-coracao" side="R" label="CUIDAR ANTES" icon="heart" top={830} />
    <Particles from={13.34} to={15.8} cx={880} cy={1000} />
    <BigWord />
    <Captions />
    <EndCard />
    <Particles from={16.3} to={21} cx={540} cy={1180} n={30} />
    <Audio src={staticFile('music.mp3')} volume={(x) => interpolate(x, [0, 10, 500, 525], [0, 0.13, 0.13, 0], cl)} />
    <Sfx />
  </AbsoluteFill>
);
