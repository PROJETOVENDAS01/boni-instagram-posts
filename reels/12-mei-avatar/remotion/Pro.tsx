import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing, random} from 'remotion';
import words from '../public/words.json';

const FPS = 25;
const GOLD = '#F5B800';
const GOLD2 = '#FFD95A';
const F = 'Poppins';
type W = {t: string; s: number; e: number; seg: number};
const WS: W[] = (words as any).words;
const SEGS: {t: string; s: number; e: number}[] = (words as any).segs;
const KEY = /mei|empresarial|pme|vida|180|dias|cnpj|link|bio|operadora|caso|você/i;
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
  [0, 1.0, 0, false], [1.93, 1.24, 0, true], [2.93, 1.08, -1.5, true], [3.92, 1.0, 0, false],
  [7.78, 1.26, 0, true], [8.9, 1.1, 1, false], [12.3, 1.16, 0, true], [13.85, 1.04, 0, false],
  [15.78, 1.22, 0, true], [17.2, 1.06, 0, false],
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
  s += interpolate(f, [0, 485], [0, 0.05]); // constant slow drift
  // shake at 180 dias
  const k = f - fr(12.3);
  const sh = k >= 0 && k < 12 ? (12 - k) * 1.6 : 0;
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
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 52%, rgba(0,0,0,.75) 100%)'}} />
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
            <span style={{fontFamily: F, fontWeight: 800, fontSize: 32, color: '#fff', letterSpacing: 1}}>{label}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- checklist ----------
const CHECK: [number, string][] = [[0.4, 'MEI'], [6.0, '1 VIDA'], [12.3, '180 DIAS']];
const Checklist: React.FC = () => {
  const f = useCurrentFrame();
  const vis = interpolate(f, [fr(0.4), fr(0.8), fr(17.0), fr(17.4)], [0, 1, 1, 0], cl);
  if (vis <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 50, top: 250, opacity: vis, transform: `translateX(${(1 - vis) * -40}px)`, display: 'flex', flexDirection: 'column', gap: 12}}>
      {CHECK.map(([t, l], i) => {
        const p = sp(f, t, 12, 200);
        const on = f >= fr(t);
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '8px 18px 8px 10px', borderRadius: 40, background: on ? 'rgba(0,0,0,.6)' : 'rgba(0,0,0,.3)', border: `2px solid ${on ? GOLD : 'rgba(255,255,255,.2)'}`, backdropFilter: 'blur(8px)', transform: `scale(${on ? 0.85 + 0.15 * p : 0.85})`, transformOrigin: 'left center', opacity: on ? 1 : 0.35}}>
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

// ---------- big 180 ----------
const Big180: React.FC = () => {
  const f = useCurrentFrame();
  const a = fr(12.3), b = fr(13.45);
  if (f < a || f > b + 6) return null;
  const n = Math.round(interpolate(f, [a, a + 30], [0, 180], {...cl, easing: Easing.out(Easing.cubic)}));
  const p = sp(f, 12.3, 10, 140);
  const o = interpolate(f, [b, b + 6], [1, 0], cl);
  const ring = interpolate(f, [a, a + 30], [0, 1], cl);
  return (
    <div style={{position: 'absolute', left: 600, top: 790, width: 420, height: 420, opacity: o, transformOrigin: '50% 50%', transform: `scale(${(0.5 + 0.5 * p) * 0.85}) rotateX(${(1 - p) * 40}deg)`}}>
      <svg width="420" height="420" style={{position: 'absolute', inset: 0}}>
        <circle cx="210" cy="210" r="180" fill="rgba(0,0,0,.6)" stroke="rgba(255,255,255,.15)" strokeWidth="14" />
        <circle cx="210" cy="210" r="180" fill="none" stroke={GOLD} strokeWidth="14" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ring} transform="rotate(-90 210 210)" style={{filter: 'drop-shadow(0 0 14px rgba(245,184,0,.8))'}} />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontFamily: F, fontWeight: 800, fontSize: 150, lineHeight: 1, color: GOLD, textShadow: '0 4px 0 #8a6400, 0 8px 0 #5c4300, 0 0 40px rgba(245,184,0,.6)'}}>{n}</div>
        <div style={{fontFamily: F, fontWeight: 700, fontSize: 40, color: '#fff', letterSpacing: 6}}>DIAS</div>
        <div style={{fontFamily: F, fontWeight: 500, fontSize: 24, color: GOLD2, letterSpacing: 3}}>DE CNPJ ATIVO</div>
      </div>
    </div>
  );
};

// ---------- operadoras ----------
const Operadoras: React.FC = () => {
  const f = useCurrentFrame();
  const a = fr(13.9), b = fr(16.7);
  if (f < a || f > b + 8) return null;
  const o = interpolate(f, [b, b + 8], [1, 0], cl);
  const items = ['A', 'B', 'C'];
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1000, display: 'flex', justifyContent: 'center', gap: 26, opacity: o}}>
      {items.map((l, i) => {
        const p = sp(f, 13.95 + i * 0.25, 12, 180);
        const pick = f >= fr(15.85) && i === 1;
        const pp = sp(f, 15.85, 10, 200);
        return (
          <div key={i} style={{width: 210, padding: '18px 0', borderRadius: 24, background: pick ? 'rgba(245,184,0,.18)' : 'rgba(0,0,0,.6)', border: `3px solid ${pick ? GOLD : 'rgba(255,255,255,.25)'}`, backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${(1 - p) * 120}px) scale(${pick ? 1 + 0.12 * pp : 1})`, opacity: p, boxShadow: pick ? '0 0 40px rgba(245,184,0,.6)' : 'none'}}>
            <Icon name="building" p={interpolate(f - fr(13.95 + i * 0.25), [0, 20], [0, 1], cl)} size={90} />
            <div style={{fontFamily: F, fontWeight: 700, fontSize: 28, color: '#fff'}}>Operadora {l}</div>
            <div style={{fontFamily: F, fontWeight: 500, fontSize: 20, color: GOLD2}}>{['regras próprias', 'o seu caso', 'outra condição'][i]}</div>
          </div>
        );
      })}
    </div>
  );
};

// ---------- captions (2-3 word chunks, low) ----------
const BIG: Record<number, string> = {2: 'EMPRESARIAL', 3: 'SABIA?', 7: 'SÓ VOCÊ.'};
const chunks = (() => {
  const out: {ws: W[]; s: number; e: number; seg: number}[] = [];
  SEGS.forEach((_, si) => {
    if (BIG[si] || si >= 13) return;
    const ws = WS.filter((w) => w.seg === si);
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
          <span key={i} style={{fontFamily: F, fontWeight: 800, fontSize: 66, margin: '0 19px', textTransform: 'uppercase', color: key ? GOLD : '#fff', display: 'inline-block', transform: `scale(${act ? 1.12 : 1}) translateY(${act ? -4 : 0}px)`, textShadow: '0 4px 0 rgba(0,0,0,.9), 0 0 24px rgba(0,0,0,.9)', padding: act && !key ? '0 10px' : 0, background: act && !key ? 'rgba(245,184,0,.0)' : 'none', borderBottom: act ? `6px solid ${GOLD}` : '6px solid transparent'}}>
            {w.t}
          </span>
        );
      })}
    </div>
  );
};

const BigWord: React.FC = () => {
  const f = useCurrentFrame();
  const segI = Object.keys(BIG).map(Number).find((i) => f >= fr(SEGS[i].s - 0.12) && f < fr((SEGS[i + 1]?.s ?? 99) - 0.05));
  if (segI === undefined) return null;
  const txt = BIG[segI];
  const a = fr(SEGS[segI].s - 0.12);
  const sweep = interpolate(f - a, [4, 20], [-30, 130], cl);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1200, textAlign: 'center'}}>
      <div style={{display: 'inline-flex'}}>
        {txt.split('').map((ch, i) => {
          const p = spring({frame: f - a - i * 0.45, fps: FPS, config: {damping: 11, stiffness: 220}});
          return <span key={i} style={{fontFamily: F, fontWeight: 800, fontSize: txt.length > 8 ? 112 : 140, color: GOLD, display: 'inline-block', transform: `translateY(${(1 - p) * 80}px) scale(${p})`, opacity: p, whiteSpace: 'pre', textShadow: '0 5px 0 #6b4e00, 0 0 40px rgba(245,184,0,.55), 0 0 6px #000'}}>{ch}</span>;
        })}
      </div>
      <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep}%`, width: '18%', background: 'linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,.45), rgba(255,255,255,0))', mixBlendMode: 'overlay'}} />
      <div style={{height: 6, margin: '6px auto 0', width: interpolate(f - a, [6, 18], [0, 520], cl), background: GOLD, borderRadius: 3, boxShadow: '0 0 20px rgba(245,184,0,.8)'}} />
    </div>
  );
};

// ---------- brand + progress ----------
const Brand: React.FC = () => {
  const f = useCurrentFrame();
  const p = sp(f, 0.05, 15, 150);
  return (
    <>
      <div style={{position: 'absolute', left: 50, right: 50, top: 150, height: 5, background: 'rgba(255,255,255,.2)', borderRadius: 3}}>
        <div style={{width: `${(f / 485) * 100}%`, height: '100%', background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, borderRadius: 3, boxShadow: '0 0 12px rgba(245,184,0,.8)'}} />
      </div>
      <div style={{position: 'absolute', right: 50, top: 175, display: 'flex', alignItems: 'center', gap: 12, opacity: p, transform: `translateY(${(1 - p) * -30}px)`}}>
        <div style={{textAlign: 'right', fontFamily: F, fontWeight: 700, fontSize: 26, color: '#fff', lineHeight: 1.1}}>BONI<br /><span style={{fontWeight: 500, fontSize: 18, color: GOLD}}>Planos de Saúde</span></div>
        <Img src={staticFile('emblema.png')} style={{width: 64, height: 64, objectFit: 'contain'}} />
      </div>
    </>
  );
};

// lower-third name tag
const NameTag: React.FC = () => {
  const f = useCurrentFrame();
  const a = fr(0.5), b = fr(1.75);
  if (f < a || f > b + 8) return null;
  const p = sp(f, 0.5, 14, 160);
  const o = interpolate(f, [b, b + 8], [1, 0], cl);
  const w = interpolate(f - a, [0, 12], [0, 1], {...cl, easing: Easing.out(Easing.cubic)});
  return (
    <div style={{position: 'absolute', left: 50, top: 1100, opacity: o}}>
      <div style={{height: 4, width: 360 * w, background: GOLD, boxShadow: '0 0 12px rgba(245,184,0,.8)'}} />
      <div style={{overflow: 'hidden'}}>
        <div style={{transform: `translateY(${(1 - p) * 100}%)`, fontFamily: F, fontWeight: 700, fontSize: 36, color: '#fff', marginTop: 8}}>Thiago Boni</div>
      </div>
      <div style={{overflow: 'hidden'}}>
        <div style={{transform: `translateY(${(1 - sp(f, 0.7, 14, 160)) * 100}%)`, fontFamily: F, fontWeight: 500, fontSize: 22, color: GOLD}}>Consultor em planos de saúde desde 2011</div>
      </div>
    </div>
  );
};

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const a = fr(17.15);
  if (f < a) return null;
  const p = sp(f, 17.15, 13, 150);
  const bob = Math.sin((f - a) / 3.5) * 6;
  const sweep = interpolate((f - a) % 30, [0, 18], [-40, 140], cl);
  return (
    <>
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,${0.85 * p}) 78%)`}} />
      <div style={{position: 'absolute', left: 70, right: 70, top: 1130, padding: '30px 20px 22px', borderRadius: 36, background: 'rgba(15,12,5,.7)', border: `2px solid rgba(245,184,0,.6)`, backdropFilter: 'blur(14px)', textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 120}px)`}}>
        <div style={{position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 14, background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, padding: '14px 40px', borderRadius: 60, overflow: 'hidden', transform: `translateY(${bob}px)`, boxShadow: '0 0 50px rgba(245,184,0,.6)'}}>
          <svg width="52" height="52" viewBox="0 0 100 100"><path d={ICONS.chat[0]} fill="none" stroke="#000" strokeWidth="9" strokeLinejoin="round" /></svg>
          <span style={{fontFamily: F, fontWeight: 800, fontSize: 60, color: '#000'}}>Comenta MEI</span>
          <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep}%`, width: '25%', background: 'linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,.7), rgba(255,255,255,0))'}} />
        </div>
        <div style={{fontFamily: F, fontWeight: 700, fontSize: 36, color: '#fff', marginTop: 18}}>ou toque no <span style={{color: GOLD}}>Link na bio ↑</span></div>
        <div style={{fontFamily: F, fontWeight: 400, fontSize: 21, color: 'rgba(255,255,255,.75)', marginTop: 14}}>Carências, rede e valores variam por operadora e produto.</div>
      </div>
    </>
  );
};

const Sfx: React.FC = () => (
  <>
    {[0.35, 1.9, 2.9, 5.6, 7.75, 10.15, 13.88, 15.76].map((t, i) => (
      <Sequence key={'w' + i} from={Math.max(0, fr(t) - 2)}><Audio src={staticFile('whoosh.wav')} volume={0.45} /></Sequence>
    ))}
    <Sequence from={fr(12.3)}><Audio src={staticFile('boom.wav')} volume={0.6} /></Sequence>
    {CHECK.map(([t], i) => <Sequence key={'c' + i} from={fr(t)}><Audio src={staticFile('pop.wav')} volume={0.45} /></Sequence>)}
    <Sequence from={fr(17.2)}><Audio src={staticFile('pop.wav')} volume={0.6} /></Sequence>
  </>
);

export const Pro: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <style>{fontCss}</style>
    <Camera>
      <OffthreadVideo src={staticFile('avatar.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </Camera>
    <Atmosphere />
    <Flash />
    <Brand />
    <Checklist />
    <NameTag />
    <Card from={0.3} to={1.9} img="11s1-mesa-mei" side="R" label="MEI" icon="briefcase" top={830} />
    <Card from={5.6} to={6.95} img="11s3-cartao-um" side="R" label="1 VIDA" icon="person" top={830} />
    <Card from={8.9} to={9.85} img="11s4-sozinho" side="L" label="SEM EQUIPE" icon="person" top={830} />
    <Card from={10.15} to={13.4} img="agenda-data-circulada" side="L" label="180 DIAS" icon="calendar" top={830} />
    <Big180 />
    <Particles from={12.3} to={13.4} cx={850} cy={1000} />
    <Operadoras />
    <BigWord />
    <Captions />
    <EndCard />
    <Particles from={17.2} to={19.4} cx={540} cy={1200} n={30} />
    <Audio src={staticFile('music.mp3')} volume={(x) => interpolate(x, [0, 10, 460, 485], [0, 0.13, 0.13, 0], cl)} />
    <Sfx />
  </AbsoluteFill>
);
