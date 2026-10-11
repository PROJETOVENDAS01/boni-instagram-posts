import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing, random} from 'remotion';
import words from '../public/words16.json';
import {DUR16} from './amilDur';

const FPS = 25;
const DURF = DUR16;
const GOLD = '#F5B800';
const GOLD2 = '#FFD95A';
const F = 'Poppins';
type W = {t: string; s: number; e: number; seg: number};
const WS: W[] = (words as any).words;
const SEGS: {t: string; s: number; e: number}[] = (words as any).segs;
const KEY = /cnpj|vidas|mei|perfil|padrão|filhos|cônjuge|pai|mãe|irmãos|sobrinhos|netos|69|hospitais|rio|barra|vitória|samaritano|pró|jacarepaguá|rede|produto|plano/i;
const AMIL = /amil/i;
const VIO = '#6A3BFF';
const fr = (s: number) => Math.round(s * FPS);
const at = (re: RegExp, n = 0) => { const m = (words as any).words.filter((w: any) => re.test(w.t)); return (m[n] ?? m[m.length - 1]).s as number; };
const endAt = (re: RegExp, n = 0) => { const m = (words as any).words.filter((w: any) => re.test(w.t)); return (m[n] ?? m[m.length - 1]).e as number; };
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const sp = (f: number, at: number, d = 14, st = 170) => spring({frame: f - fr(at), fps: FPS, config: {damping: d, stiffness: st}});

const fontCss = `
@font-face{font-family:Poppins;font-weight:800;src:url(${staticFile('Poppins-Bold.ttf')})}
@font-face{font-family:Poppins;font-weight:700;src:url(${staticFile('Poppins-Bold.ttf')})}
@font-face{font-family:Poppins;font-weight:500;src:url(${staticFile('Poppins-Medium.ttf')})}
@font-face{font-family:Poppins;font-weight:400;src:url(${staticFile('Poppins-Regular.ttf')})}`;

// camera keyframes: time, scale, rotate(deg), punch(flash+blur)
const T = {
  um: at(/^Um/), dois: at(/^Dois/), tres: at(/^Três/), quatro: at(/^Quatro/),
  vit: at(/^Vitória/), sam: at(/^Samaritano/), pro: at(/^Pró/), jac: at(/^Clínicas/),
  rede: at(/^A$/), comenta: at(/^Comenta/), end: endAt(/você\.$/),
  amil0: at(/^Amil/), rio: at(/^Rio\?/),
  pai: at(/^pai/), mae: at(/^mãe/), irm: at(/^irmãos/), sob: at(/^sobrinhos/), net: at(/^netos/), s69: at(/^sessenta/),
  cnpj: at(/^CNPJ/), duas: at(/^duas/), mei: at(/^MEI/), simples: at(/^simples/), alto: at(/^alto/),
};
const CAM: [number, number, number, boolean][] = [
  [0, 1.0, 0, false], [T.amil0, 1.14, 0, true], [T.rio, 1.06, -0.8, true],
  [T.um, 1.0, 0, true], [T.cnpj, 1.1, 0.6, false],
  [T.dois, 1.02, 0, true], [T.alto, 1.12, -0.6, false],
  [T.tres, 1.0, 0, true], [T.s69, 1.14, 0.6, true],
  [T.quatro, 1.02, 0, true], [T.vit, 1.06, 0, false], [T.jac, 1.12, 0, false],
  [T.rede, 1.04, 0, false], [T.comenta, 1.12, 0, true], [T.comenta + 1.2, 1.05, 0, false],
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
  s += interpolate(f, [0, DURF], [0, 0.05]); // constant slow drift
  // shake on '69'
  const k = f - fr(T.s69);
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
  coin: ['M50 15 a35 35 0 1 0 0.1 0', 'M61 36 c-5 -6 -24 -6 -24 4 c0 12 28 6 28 19 c0 10 -20 10 -26 3', 'M50 26 v48'],
  arrow: ['M50 15 v65', 'M25 55 l25 25 l25 -25'],
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

// ---------- Amil logo reveal (mask wipe + gold sweep + glow) ----------
const LogoReveal: React.FC<{from: number; to: number; top: number; w: number}> = ({from, to, top, w}) => {
  const f = useCurrentFrame();
  const a = fr(from), b = fr(to);
  if (f < a || f > b + 10) return null;
  const wipe = interpolate(f - a, [0, 14], [0, 100], {...cl, easing: Easing.out(Easing.cubic)});
  const s = interpolate(f - a, [0, 24], [1.25, 1], {...cl, easing: Easing.out(Easing.cubic)});
  const sweep = interpolate(f - a, [10, 30], [-30, 130], cl);
  const o = interpolate(f, [b, b + 10], [1, 0], cl);
  const blur = interpolate(f - a, [0, 10], [14, 0], cl);
  const h = w * 576 / 1616;
  return (
    <div style={{position: 'absolute', left: (1080 - w) / 2, top, width: w, height: h, opacity: o, transform: `scale(${s})`, filter: `blur(${blur}px) drop-shadow(0 0 30px rgba(106,59,255,.75)) drop-shadow(0 0 8px rgba(255,255,255,.6))`}}>
      <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 ${100 - wipe}% 0 0)`}}>
        <Img src={staticFile('amil-branca.png')} style={{width: '100%', height: '100%'}} />
        {/* gold light sweep confined to the letters */}
        <div style={{position: 'absolute', inset: 0, WebkitMaskImage: `url(${staticFile('amil-branca.png')})`, WebkitMaskSize: '100% 100%', maskImage: `url(${staticFile('amil-branca.png')})`, maskSize: '100% 100%'}}>
          <div style={{position: 'absolute', inset: 0, background: `linear-gradient(100deg, rgba(106,59,255,.9) 0%, rgba(106,59,255,.9) ${sweep - 18}%, ${GOLD2} ${sweep}%, rgba(106,59,255,.9) ${sweep + 18}%, rgba(106,59,255,.9) 100%)`}} />
        </div>
      </div>
      {/* leading edge spark */}
      {wipe < 100 && <div style={{position: 'absolute', top: -20, bottom: -20, left: `${wipe}%`, width: 6, background: GOLD2, boxShadow: `0 0 30px 12px ${GOLD}`, borderRadius: 3}} />}
    </div>
  );
};

// ---------- giant 3D number ----------
const NUMS: [number, string, string][] = [];
const BigNum: React.FC<{at: number; to: number; n: string; label: string}> = ({at, to, n, label}) => {
  const f = useCurrentFrame();
  const a = fr(at), b = fr(to);
  if (f < a - 1 || f > b + 8) return null;
  const p = sp(f, at, 12, 160);
  const o = interpolate(f, [b, b + 8], [1, 0], cl);
  const ry = (1 - p) * -80;
  const lp = sp(f, at + 0.25, 14, 160);
  return (
    <div style={{position: 'absolute', left: 70, top: 300, opacity: o, perspective: 900}}>
      <div style={{transform: `rotateY(${ry}deg) translateZ(${(1 - p) * -300}px)`, transformOrigin: 'left center', display: 'flex', alignItems: 'center', gap: 18}}>
        <div style={{position: 'relative', fontFamily: F, fontWeight: 800, fontSize: 210, lineHeight: 0.9, color: GOLD, textShadow: `0 2px 0 #c98f00, 0 4px 0 #a87400, 0 6px 0 #7d5600, 0 8px 0 #5c3f00, 0 18px 30px rgba(0,0,0,.7), 0 0 50px rgba(245,184,0,.45)`}}>
          {n}
        </div>
        <div style={{overflow: 'hidden', paddingRight: 10}}>
          <div style={{transform: `translateX(${(1 - lp) * -110}%)`, fontFamily: F, fontWeight: 800, fontSize: 34, color: '#fff', lineHeight: 1.1, textShadow: '0 3px 12px #000', whiteSpace: 'pre'}}>{label}</div>
          <div style={{height: 5, marginTop: 8, width: 230 * lp, background: `linear-gradient(90deg, ${GOLD}, ${VIO})`, borderRadius: 3, boxShadow: `0 0 14px ${VIO}`}} />
        </div>
      </div>
    </div>
  );
};

// lens transition: radial zoom streaks on each motive change
const Lens: React.FC = () => {
  const f = useCurrentFrame();
  const ts = [T.um, T.dois, T.tres, T.quatro, T.comenta];
  let k = -99;
  ts.forEach((t) => { const d = f - fr(t); if (d >= -3 && d < 7) k = d; });
  if (k < -3) return null;
  const o = interpolate(k, [-3, 0, 7], [0, 0.85, 0], cl);
  return (
    <AbsoluteFill style={{opacity: o, mixBlendMode: 'screen', background: `repeating-conic-gradient(from 0deg at 50% 38%, rgba(255,220,140,.0) 0deg, rgba(255,220,140,.22) 2deg, rgba(255,220,140,0) 5deg)`, WebkitMaskImage: 'radial-gradient(circle at 50% 38%, transparent 18%, black 60%)'}} />
  );
};

// ---------- motive 1: CNPJ chips ----------
const Chips: React.FC<{from: number; to: number; items: [number, string][]}> = ({from, to, items}) => {
  const f = useCurrentFrame();
  const b = fr(to);
  if (f < fr(from) || f > b + 8) return null;
  const o = interpolate(f, [b, b + 8], [1, 0], cl);
  return (
    <div style={{position: 'absolute', right: 40, top: 860, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14, opacity: o}}>
      {items.map(([t, l], i) => {
        const p = sp(f, t, 12, 200);
        return (
          <div key={i} style={{opacity: p, transform: `translateX(${(1 - p) * 200}px) scale(${0.8 + 0.2 * p})`, padding: '12px 26px', borderRadius: 40, background: 'rgba(14,10,30,.62)', backdropFilter: 'blur(12px)', border: `2px solid ${i === items.length - 1 ? GOLD : 'rgba(150,120,255,.75)'}`, boxShadow: `0 10px 30px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.25)`, fontFamily: F, fontWeight: 800, fontSize: 36, color: '#fff'}}>{l}</div>
        );
      })}
    </div>
  );
};

// ---------- motive 2: tiers ladder ----------
const Tiers: React.FC<{from: number; to: number}> = ({from, to}) => {
  const f = useCurrentFrame();
  const a = fr(from), b = fr(to);
  if (f < a - 2 || f > b + 8) return null;
  const pin = sp(f, from, 13, 150);
  const o = interpolate(f, [b, b + 8], [1, 0], cl);
  const fill = interpolate(f, [fr(T.simples) - 3, fr(T.alto) + 8], [0, 1], cl);
  const labels = ['BÁSICO', 'INTERMEDIÁRIO', 'SUPERIOR', 'ALTO PADRÃO'];
  return (
    <div style={{position: 'absolute', left: 705, top: 820, width: 330, padding: '20px 18px', borderRadius: 26, background: 'rgba(14,10,30,.7)', border: `3px solid ${GOLD}`, backdropFilter: 'blur(10px)', opacity: o, transform: `translateX(${(1 - pin) * 400}px)`, boxShadow: '0 20px 50px rgba(0,0,0,.6)'}}>
      <div style={{fontFamily: F, fontWeight: 800, fontSize: 28, color: GOLD, textAlign: 'center', marginBottom: 12}}>TODO PERFIL</div>
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 10, height: 190}}>
        {labels.map((l, i) => {
          const on = fill * 4 > i;
          const pp = interpolate(fill * 4 - i, [0, 1], [0, 1], cl);
          return (
            <div key={l} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%'}}>
              <div style={{width: '100%', height: `${(30 + i * 22) * (0.15 + 0.85 * pp)}%`, borderRadius: 10, background: i === 3 ? `linear-gradient(180deg, ${GOLD2}, ${GOLD})` : `linear-gradient(180deg, ${VIO}, #3a1aa8)`, opacity: on ? 1 : 0.3, boxShadow: i === 3 && on ? '0 0 24px rgba(245,184,0,.8)' : 'none'}} />
            </div>
          );
        })}
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 10, fontFamily: F, fontWeight: 700, fontSize: 17, color: '#fff'}}><span>SIMPLES</span><span style={{color: GOLD}}>ALTO PADRÃO</span></div>
    </div>
  );
};

// ---------- motive 3: dependents checklist + 69 seal ----------
const Dependentes: React.FC = () => {
  const f = useCurrentFrame();
  const a = fr(T.tres), b = fr(T.quatro) - 2;
  if (f < a || f > b + 8) return null;
  const o = interpolate(f, [b, b + 8], [1, 0], cl);
  const list: [number, string][] = [[T.pai, 'PAI'], [T.mae, 'MÃE'], [T.irm, 'IRMÃOS'], [T.sob, 'SOBRINHOS'], [T.net, 'NETOS']];
  const sp69 = sp(f, T.s69, 9, 180);
  return (
    <div style={{opacity: o}}>
      <div style={{position: 'absolute', right: 40, top: 820, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end'}}>
        {list.map(([t, l], i) => {
          const p = sp(f, t, 12, 220);
          const on = f >= fr(t);
          return (
            <div key={l} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '8px 20px 8px 10px', borderRadius: 40, background: 'rgba(14,10,30,.66)', backdropFilter: 'blur(10px)', border: `2px solid ${on ? GOLD : 'rgba(255,255,255,.2)'}`, opacity: on ? 1 : 0, transform: `translateY(${(1 - p) * -60}px) scale(${0.85 + 0.15 * p})`}}>
              <div style={{width: 38, height: 38, borderRadius: '50%', background: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <svg width="26" height="26" viewBox="0 0 100 100"><path d="M20 52 l18 18 l42 -42" fill="none" stroke="#000" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} /></svg>
              </div>
              <span style={{fontFamily: F, fontWeight: 800, fontSize: 32, color: '#fff'}}>{l}</span>
            </div>
          );
        })}
      </div>
      {f >= fr(T.s69) && (
        <div style={{position: 'absolute', left: 60, top: 860, width: 230, height: 230, borderRadius: '50%', transform: `scale(${sp69}) rotate(${(1 - sp69) * -90 - 8}deg)`, background: `radial-gradient(circle at 35% 30%, ${GOLD2}, ${GOLD} 55%, #9a6b00)`, boxShadow: '0 0 60px rgba(245,184,0,.7), inset 0 -8px 20px rgba(0,0,0,.35)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '5px dashed rgba(0,0,0,.35)'}}>
          <div style={{fontFamily: F, fontWeight: 700, fontSize: 26, color: '#000'}}>ATÉ</div>
          <div style={{fontFamily: F, fontWeight: 800, fontSize: 86, color: '#000', lineHeight: 0.9}}>69</div>
          <div style={{fontFamily: F, fontWeight: 700, fontSize: 26, color: '#000'}}>ANOS</div>
        </div>
      )}
    </div>
  );
};

// ---------- motive 4: translucent 3D glass hospital frames ----------
const HOSP: {t: () => number; img: string; name: string; bairro: string}[] = [
  {t: () => T.vit, img: 'h-hospital-vitoria', name: 'Hospital Vitória', bairro: 'BARRA'},
  {t: () => T.sam, img: 'h-samaritano-barra', name: 'Samaritano', bairro: 'BARRA'},
  {t: () => T.pro, img: 'h-pro-cardiaco', name: 'Pró-Cardíaco', bairro: 'BOTAFOGO'},
  {t: () => T.jac, img: 'h-clinicas-jacarepagua', name: 'Clínicas de Jacarepaguá', bairro: 'JACAREPAGUÁ'},
];
const Glass: React.FC<{i: number; active: boolean; slot: number; pin: number; f: number; a: number}> = ({i, active, slot, pin, f, a}) => {
  const h = HOSP[i];
  const sweep = interpolate(f - a, [6, 24], [-60, 160], cl);
  const kb = interpolate(f - a, [0, 120], [1.08, 1.22], cl);
  // fan: newest in front at slot 0, older pushed back/up
  const x = slot * 26, y = slot * -46, z = slot * -140, ry = -22 + (1 - pin) * -70, rot = -4 + slot * 3;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 360, height: 300, transform: `translate3d(${x + (1 - pin) * 520}px, ${y}px, ${z}px) rotateY(${ry}deg) rotateZ(${rot}deg)`, opacity: pin * (1 - slot * 0.22), transformStyle: 'preserve-3d'}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 24, overflow: 'hidden', border: `2px solid ${active ? GOLD : 'rgba(255,255,255,.35)'}`, boxShadow: `0 30px 60px rgba(0,0,0,.6), 0 0 ${active ? 40 : 0}px rgba(245,184,0,.45), inset 0 0 0 1px rgba(255,255,255,.15)`, background: 'rgba(255,255,255,.06)', backdropFilter: 'blur(6px)'}}>
        <Img src={staticFile(`img/${h.img}.jpg`)} style={{position: 'absolute', inset: 10, width: 340, height: 280, objectFit: 'cover', borderRadius: 16, transform: `scale(${kb})`, filter: 'saturate(1.05) contrast(1.05)'}} />
        {/* glass layer: frosted top + violet reflection + gold sweep */}
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(255,255,255,.28) 0%, rgba(255,255,255,.04) 35%, rgba(106,59,255,.18) 70%, rgba(0,0,0,.55) 100%)'}} />
        <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep}%`, width: '30%', background: 'linear-gradient(100deg, rgba(255,255,255,0), rgba(255,236,170,.45), rgba(255,255,255,0))', transform: 'skewX(-12deg)'}} />
        <div style={{position: 'absolute', left: 16, right: 16, bottom: 14}}>
          <div style={{display: 'inline-block', padding: '3px 12px', borderRadius: 20, background: VIO, fontFamily: F, fontWeight: 700, fontSize: 17, color: '#fff', letterSpacing: 1}}>📍 {h.bairro}</div>
          <div style={{fontFamily: F, fontWeight: 800, fontSize: h.name.length > 16 ? 25 : 31, color: '#fff', marginTop: 6, textShadow: '0 2px 10px #000'}}>{h.name}</div>
        </div>
      </div>
    </div>
  );
};
const Hospitais: React.FC = () => {
  const f = useCurrentFrame();
  const a = fr(T.quatro), b = fr(T.comenta) - 4;
  if (f < a || f > b + 8) return null;
  const o = interpolate(f, [b, b + 8], [1, 0], cl);
  const shown = HOSP.map((h, i) => ({i, t: h.t()})).filter((h) => f >= fr(h.t) - 2);
  const tag = sp(f, T.quatro + 0.1, 13, 170);
  return (
    <div style={{opacity: o}}>
      <div style={{position: 'absolute', right: 40, top: 270, opacity: tag, transform: `translateY(${(1 - tag) * -30}px)`, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 22px', borderRadius: 40, background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, boxShadow: '0 0 30px rgba(245,184,0,.5)'}}>
        <svg width="34" height="34" viewBox="0 0 100 100"><path d="M20 85 v-60 h60 v60 M12 85 h76 M50 35 v24 M38 47 h24" stroke="#000" strokeWidth="9" fill="none" strokeLinecap="round" /></svg>
        <span style={{fontFamily: F, fontWeight: 800, fontSize: 30, color: '#000'}}>REFERÊNCIA NO RIO</span>
      </div>
      <div style={{position: 'absolute', left: 690, top: 980, perspective: 1100, transformStyle: 'preserve-3d'}}>
        {shown.map((h, k) => {
          const slot = shown.length - 1 - k;
          const pin = sp(f, h.t - 0.05, 13, 150);
          return <Glass key={h.i} i={h.i} slot={slot} active={slot === 0} pin={pin} f={f} a={fr(h.t)} />;
        })}
      </div>
    </div>
  );
};

// ---------- captions (gold keys, violet AMIL, violet underline) ----------
const BIGS: {s: number; e: number; txt: string}[] = [];
const inBig = (t: number) => BIGS.some((b) => t >= b.s && t < b.e);
const LAST_SEG = SEGS.length - 2; // end card covers the CTA
const chunks = (() => {
  const out: {ws: W[]; s: number; e: number; seg: number}[] = [];
  SEGS.forEach((_, si) => {
    if (si >= LAST_SEG) return;
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
    <div style={{position: 'absolute', left: 60, right: 60, top: 1290, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', transform: `translateY(${(1 - p) * 30}px) scale(${0.85 + 0.15 * p})`, opacity: p}}>
      {c.ws.map((w, i) => {
        const act = t >= w.s - 0.02 && t < w.e + 0.08;
        const am = AMIL.test(w.t);
        const key = KEY.test(w.t);
        return (
          <span key={i} style={{fontFamily: F, fontWeight: 800, fontSize: 64, margin: '0 17px', textTransform: 'uppercase', color: am ? '#B79BFF' : key ? GOLD : '#fff', display: 'inline-block', transform: `scale(${act ? 1.12 : 1}) translateY(${act ? -4 : 0}px)`, textShadow: am ? `0 4px 0 rgba(0,0,0,.95), 0 0 24px ${VIO}` : '0 4px 0 rgba(0,0,0,.95), 0 0 26px rgba(0,0,0,.95)', borderBottom: act ? `6px solid ${VIO}` : '6px solid transparent'}}>
            {w.t}
          </span>
        );
      })}
    </div>
  );
};

const Brand: React.FC = () => {
  const f = useCurrentFrame();
  const p = sp(f, 0.05, 15, 150);
  return (
    <>
      <div style={{position: 'absolute', left: 50, right: 50, top: 150, height: 5, background: 'rgba(255,255,255,.25)', borderRadius: 3}}>
        <div style={{width: `${(f / DURF) * 100}%`, height: '100%', background: `linear-gradient(90deg, ${GOLD}, ${VIO})`, borderRadius: 3, boxShadow: '0 0 12px rgba(245,184,0,.8)'}} />
      </div>
      <div style={{position: 'absolute', right: 50, top: 175, display: 'flex', alignItems: 'center', gap: 12, opacity: p, transform: `translateY(${(1 - p) * -30}px)`}}>
        <div style={{textAlign: 'right', fontFamily: F, fontWeight: 700, fontSize: 26, color: '#fff', lineHeight: 1.1, textShadow: '0 2px 8px #000'}}>BONI<br /><span style={{fontWeight: 600, fontSize: 18, color: GOLD2, textShadow: '0 1px 6px #000, 0 0 2px #000'}}>Planos de Saúde</span></div>
        <Img src={staticFile('emblema.png')} style={{width: 64, height: 64, objectFit: 'contain'}} />
      </div>
    </>
  );
};

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const at0 = T.comenta - 0.1;
  const a = fr(at0);
  if (f < a) return null;
  const p = sp(f, at0, 13, 150);
  const bob = Math.sin((f - a) / 3.5) * 6;
  const sweep = interpolate((f - a) % 30, [0, 18], [-40, 140], cl);
  const lw = 300;
  return (
    <>
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,${0.85 * p}) 75%)`}} />
      <div style={{position: 'absolute', left: 70, right: 70, top: 1050, padding: '26px 20px 22px', borderRadius: 36, background: 'rgba(14,10,30,.78)', border: `2px solid rgba(245,184,0,.7)`, backdropFilter: 'blur(14px)', textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 120}px)`, boxShadow: `0 0 50px rgba(106,59,255,.35)`}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, marginBottom: 18}}>
          <Img src={staticFile('amil-branca.png')} style={{width: lw, height: lw * 576 / 1616, filter: `drop-shadow(0 0 14px ${VIO})`}} />
          <div style={{width: 2, height: 60, background: 'rgba(255,255,255,.4)'}} />
          <Img src={staticFile('emblema.png')} style={{width: 76, height: 76, objectFit: 'contain'}} />
        </div>
        <div style={{position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 14, background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, padding: '14px 36px', borderRadius: 60, overflow: 'hidden', transform: `translateY(${bob}px)`, boxShadow: '0 0 50px rgba(245,184,0,.6)'}}>
          <svg width="50" height="50" viewBox="0 0 100 100"><path d={ICONS.chat[0]} fill="none" stroke="#000" strokeWidth="9" strokeLinejoin="round" /></svg>
          <span style={{fontFamily: F, fontWeight: 800, fontSize: 54, color: '#000'}}>Comenta AMIL</span>
          <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep}%`, width: '25%', background: 'linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,.7), rgba(255,255,255,0))'}} />
        </div>
        <div style={{fontFamily: F, fontWeight: 700, fontSize: 36, color: '#fff', marginTop: 18}}>ou toque no <span style={{color: GOLD}}>Link na bio ↑</span></div>
        <div style={{fontFamily: F, fontWeight: 500, fontSize: 28, color: GOLD2, marginTop: 10}}>O plano certo para o seu perfil</div>
        <div style={{fontFamily: F, fontWeight: 400, fontSize: 21, color: 'rgba(255,255,255,.78)', marginTop: 12}}>Carências, rede e valores variam por operadora e produto.</div>
      </div>
    </>
  );
};

const Sfx: React.FC = () => {
  const wh = [0.05, T.amil0, T.um, T.dois, T.tres, T.quatro, T.vit, T.sam, T.pro, T.jac, T.comenta];
  const pops = [T.cnpj, T.duas, T.mei, T.pai, T.mae, T.irm, T.sob, T.net];
  return (
    <>
      {wh.map((t, i) => <Sequence key={'w' + i} from={Math.max(0, fr(t) - 2)}><Audio src={staticFile('whoosh.wav')} volume={0.4} /></Sequence>)}
      {[T.amil0, T.s69, T.quatro].map((t, i) => <Sequence key={'b' + i} from={fr(t)}><Audio src={staticFile('boom.wav')} volume={0.5} /></Sequence>)}
      {pops.map((t, i) => <Sequence key={'p' + i} from={fr(t)}><Audio src={staticFile('pop.wav')} volume={0.45} /></Sequence>)}
    </>
  );
};

export const Amil: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <style>{fontCss}</style>
    <Camera>
      <OffthreadVideo src={staticFile('avatar16.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </Camera>
    <Atmosphere />
    <Flash />
    <Lens />
    <Brand />
    <LogoReveal from={T.amil0 - 0.15} to={T.um - 0.1} top={930} w={520} />
    <Particles from={T.amil0} to={T.um} cx={540} cy={1020} n={36} />
    <BigNum at={T.um} to={T.dois - 0.05} n="1" label={'PELO CNPJ'} />
    <Chips from={T.cnpj} to={T.dois - 0.05} items={[[T.cnpj, 'CNPJ'], [T.duas, 'A PARTIR DE 2 VIDAS'], [T.mei, 'INCLUSIVE MEI']]} />
    <BigNum at={T.dois} to={T.tres - 0.05} n="2" label={'TODO\nPERFIL'} />
    <Tiers from={T.dois + 0.1} to={T.tres - 0.05} />
    <BigNum at={T.tres} to={T.quatro - 0.05} n="3" label={'DEPENDENTES'} />
    <Dependentes />
    <BigNum at={T.quatro} to={T.vit - 0.05} n="4" label={'HOSPITAIS'} />
    <Hospitais />
    <Captions />
    <EndCard />
    <Particles from={T.comenta} to={DURF / FPS} cx={540} cy={1150} n={30} />
    <Audio src={staticFile('music.mp3')} volume={(x) => interpolate(x, [0, 10, DURF - 20, DURF], [0, 0.12, 0.12, 0], cl)} />
    <Sfx />
  </AbsoluteFill>
);
