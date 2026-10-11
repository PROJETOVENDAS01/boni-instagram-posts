import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing, random} from 'remotion';
import words from '../public/words18.json';
import {DUR18} from './sulaDur';

const FPS = 25;
const DURF = DUR18;
const GOLD = '#F5B800';
const GOLD2 = '#FFD95A';
const F = 'Poppins';
type W = {t: string; s: number; e: number; seg: number};
const WS: W[] = (words as any).words;
const SEGS: {t: string; s: number; e: number}[] = (words as any).segs;
const KEY = /empresa|três|vidas|família|funcionários|rede|d'or|odontológico|seguro|vida|custo|wellhub|gympass|academias|yoga|pilates|terapia|meditação|produto|plano/i;
const AMIL = /sulamérica/i;
const ORG = '#F28C28';
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
  sula0: at(/^SulAmérica$/), um: at(/^Um:$/), dois: at(/^Dois:$/), tres: at(/^Três:$/), quatro: at(/^Quatro:$/),
  familia: at(/^família/), func: at(/^funcionários/), ambos: at(/^dois\.$/), vidas: at(/^vidas/),
  rede: at(/^D'Or\.$/), rios: at(/^Rios/), barra: at(/^Barra/), quinta: at(/^Quinta/), gloria: at(/^Glória/), copa: at(/^Copa/), outros: at(/^outros/),
  odonto: at(/^odontológico/), vida: at(/^vida,/), custo: at(/^custo/),
  wellhub: at(/^Wellhub/), gym: at(/^Gympass/), acad: at(/^Academias/), yoga: at(/^yoga/), pil: at(/^pilates/), ter: at(/^terapia/), med: at(/^meditação/),
  tudo: at(/^Tudo/), comenta: at(/^Comenta/),
};
const CAM: [number, number, number, boolean][] = [
  [0, 1.0, 0, false], [T.sula0, 1.12, 0, true], [T.um, 1.0, 0, true], [T.vidas, 1.08, 0.5, false],
  [T.dois, 1.0, 0, true], [T.rede, 1.05, 0, false], [T.outros, 1.1, -0.5, true],
  [T.tres, 1.0, 0, true], [T.custo, 1.14, 0.6, true],
  [T.quatro, 1.0, 0, true], [T.wellhub, 1.1, 0, true], [T.med, 1.04, 0, false],
  [T.comenta, 1.12, 0, true], [T.comenta + 1.2, 1.05, 0, false],
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
  const k = f - fr(T.custo);
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
          <div style={{height: 5, marginTop: 8, width: 230 * lp, background: `linear-gradient(90deg, ${GOLD}, ${ORG})`, borderRadius: 3, boxShadow: `0 0 14px ${ORG}`}} />
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
const BIGS: {s: number; e: number; txt: string}[] = [{s: T.rios - 0.05, e: T.tres - 0.05, txt: ''}];
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
          <span key={i} style={{fontFamily: F, fontWeight: 800, fontSize: 64, margin: '0 17px', textTransform: 'uppercase', color: am ? '#FFB066' : key ? GOLD : '#fff', display: 'inline-block', transform: `scale(${act ? 1.12 : 1}) translateY(${act ? -4 : 0}px)`, textShadow: am ? `0 4px 0 rgba(0,0,0,.95), 0 0 24px ${ORG}` : '0 4px 0 rgba(0,0,0,.95), 0 0 26px rgba(0,0,0,.95)', borderBottom: act ? `6px solid ${ORG}` : '6px solid transparent'}}>
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
        <div style={{width: `${(f / DURF) * 100}%`, height: '100%', background: `linear-gradient(90deg, ${GOLD}, ${ORG})`, borderRadius: 3, boxShadow: '0 0 12px rgba(245,184,0,.8)'}} />
      </div>
      <div style={{position: 'absolute', right: 50, top: 175, display: 'flex', alignItems: 'center', gap: 12, opacity: p, transform: `translateY(${(1 - p) * -30}px)`}}>
        <div style={{textAlign: 'right', fontFamily: F, fontWeight: 700, fontSize: 26, color: '#fff', lineHeight: 1.1, textShadow: '0 2px 8px #000'}}>BONI<br /><span style={{fontWeight: 600, fontSize: 18, color: GOLD2, textShadow: '0 1px 6px #000, 0 0 2px #000'}}>Planos de Saúde</span></div>
        <Img src={staticFile('emblema.png')} style={{width: 64, height: 64, objectFit: 'contain'}} />
      </div>
    </>
  );
};


// ---------- gold grade over the bright office ----------
const GoldGrade: React.FC = () => (
  <>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(60,40,0,.35), rgba(30,20,0,.15) 40%, rgba(0,0,0,.35))', mixBlendMode: 'multiply'}} />
    <AbsoluteFill style={{background: 'radial-gradient(circle at 70% 20%, rgba(255,200,90,.28), rgba(0,0,0,0) 55%)', mixBlendMode: 'soft-light'}} />
  </>
);

// ---------- SulAmérica logo on frosted glass plate ----------
const LogoPlate: React.FC<{from: number; to: number; top: number; w: number}> = ({from, to, top, w}) => {
  const f = useCurrentFrame();
  const a = fr(from), b = fr(to);
  if (f < a || f > b + 10) return null;
  const p = sp(f, from, 13, 150);
  const wipe = interpolate(f - a, [4, 18], [0, 100], {...cl, easing: Easing.out(Easing.cubic)});
  const sweep = interpolate(f - a, [14, 34], [-40, 140], cl);
  const o = interpolate(f, [b, b + 10], [1, 0], cl);
  const h = w * 372 / 1464;
  return (
    <div style={{position: 'absolute', left: (1080 - w - 80) / 2, top, perspective: 1000, opacity: o}}>
      <div style={{transform: `rotateX(${(1 - p) * 60}deg) scale(${0.7 + 0.3 * p})`, padding: '30px 40px', borderRadius: 30, background: 'linear-gradient(160deg, rgba(255,255,255,.92), rgba(255,255,255,.78))', border: `3px solid ${GOLD}`, boxShadow: `0 30px 60px rgba(0,0,0,.55), 0 0 50px rgba(245,184,0,.45), inset 0 1px 0 #fff`, position: 'relative', overflow: 'hidden'}}>
        <div style={{width: w, height: h, clipPath: `inset(0 ${100 - wipe}% 0 0)`}}>
          <Img src={staticFile('sulamerica.png')} style={{width: '100%', height: '100%'}} />
        </div>
        <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep}%`, width: '22%', background: 'linear-gradient(100deg, rgba(255,255,255,0), rgba(255,215,120,.65), rgba(255,255,255,0))', transform: 'skewX(-14deg)'}} />
      </div>
    </div>
  );
};

// ---------- motive 1: family + team join into 3+ ----------
const People: React.FC = () => {
  const f = useCurrentFrame();
  const a = fr(T.um), b = fr(T.dois) - 2;
  if (f < a || f > b + 8) return null;
  const o = interpolate(f, [b, b + 8], [1, 0], cl);
  const items: [number, string, string][] = [[T.familia, 'FAMÍLIA', 'M30 40 a10 10 0 1 0 0.1 0 M70 40 a10 10 0 1 0 0.1 0 M50 55 a7 7 0 1 0 0.1 0 M12 88 c0 -20 36 -20 36 0 M52 88 c0 -20 36 -20 36 0 M38 92 c0 -14 24 -14 24 0'], [T.func, 'FUNCIONÁRIOS', 'M20 35 h60 v45 h-60 z M38 35 v-10 h24 v10 M20 55 h60'], [T.ambos, 'OU OS DOIS', 'M20 52 l18 18 l42 -42']];
  return (
    <div style={{position: 'absolute', right: 40, top: 860, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-end', opacity: o}}>
      {items.map(([t, l, d], i) => {
        const p = sp(f, t, 12, 200);
        const ip = interpolate(f - fr(t), [2, 18], [0, 1], cl);
        return (
          <div key={l} style={{opacity: f >= fr(t) ? p : 0, transform: `translateX(${(1 - p) * 220}px)`, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 24px 10px 12px', borderRadius: 40, background: i === 2 ? `linear-gradient(90deg, ${GOLD}, ${GOLD2})` : 'rgba(20,14,4,.68)', backdropFilter: 'blur(12px)', border: `2px solid ${i === 2 ? GOLD : 'rgba(242,140,40,.8)'}`, boxShadow: '0 10px 30px rgba(0,0,0,.5)'}}>
            <svg width="50" height="50" viewBox="0 0 100 100"><path d={d} fill="none" stroke={i === 2 ? '#000' : GOLD} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ip} /></svg>
            <span style={{fontFamily: F, fontWeight: 800, fontSize: 34, color: i === 2 ? '#000' : '#fff'}}>{l}</span>
          </div>
        );
      })}
    </div>
  );
};

// ---------- motive 2: Rede D'Or 3D glass carousel ----------
const HOSP: [() => number, string, string, string][] = [
  [() => T.rios, 'h-rios-dor', "Rios D'Or", 'FREGUESIA'],
  [() => T.barra, 'h-barra-dor', "Barra D'Or", 'BARRA'],
  [() => T.quinta, 'h-quinta-dor', "Quinta D'Or", 'SÃO CRISTÓVÃO'],
  [() => T.gloria, 'h-gloria-dor', "Glória D'Or", 'GLÓRIA'],
  [() => T.copa, 'h-copa-dor', "Copa D'Or", 'COPACABANA'],
];
const Carousel: React.FC = () => {
  const f = useCurrentFrame();
  const a = fr(T.dois), b = fr(T.tres) - 3;
  if (f < a || f > b + 8) return null;
  const o = interpolate(f, [b, b + 8], [1, 0], cl);
  const lp = sp(f, T.dois + 0.15, 13, 160);
  // active index follows the spoken names with a spring between each
  let act = -1.2;
  HOSP.forEach(([t], i) => { act += (i === 0 ? 1.2 : 1) * sp(f, t() - 0.05, 16, 140); });
  const fan = sp(f, T.outros - 0.1, 14, 120);
  const intro = sp(f, T.rede - 0.3, 14, 120);
  const R = 430;
  return (
    <div style={{opacity: o}}>
      {/* Rede D'Or badge */}
      <div style={{position: 'absolute', right: 40, top: 255, display: 'flex', justifyContent: 'flex-end', opacity: lp, transform: `translateX(${(1 - lp) * 200}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '12px 26px', borderRadius: 26, background: 'rgba(20,14,4,.7)', backdropFilter: 'blur(14px)', border: `2px solid ${GOLD}`, boxShadow: '0 0 40px rgba(245,184,0,.35)'}}>
          <Img src={staticFile('rededor-branca.png')} style={{height: 70, width: 70 * 1662 / 1020}} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 540 - 160, top: 1010, width: 320, height: 300, perspective: 1300, transformStyle: 'preserve-3d'}}>
        {HOSP.map(([t, img, name, bairro], i) => {
          const d = i - act;
          const ang = d * 34 * (1 - fan);
          const x = (Math.sin(ang * Math.PI / 180) * R) * (1 - fan) + fan * (i - 2) * 190;
          const z = (Math.cos(ang * Math.PI / 180) * R - R) * (1 - fan) - fan * 260;
          const y = fan * (Math.abs(i - 2) * 26 - 40);
          const sc = 1 - fan * 0.42;
          const front = Math.abs(d) < 0.5 && fan < 0.5;
          const sweep = interpolate((f + i * 7) % 60, [0, 24], [-60, 160], cl);
          const vis = intro * interpolate(Math.abs(d), [2.6, 3.4], [1, 0], cl) + fan;
          return (
            <div key={img} style={{position: 'absolute', inset: 0, transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${ang}deg) scale(${sc})`, opacity: Math.min(1, vis), zIndex: Math.round(100 - Math.abs(d) * 10)}}>
              <div style={{position: 'absolute', inset: 0, borderRadius: 24, overflow: 'hidden', border: `${front ? 3 : 2}px solid ${front ? GOLD : 'rgba(255,255,255,.4)'}`, boxShadow: `0 30px 60px rgba(0,0,0,.6), 0 0 ${front ? 50 : 0}px rgba(245,184,0,.5)`, background: 'rgba(255,255,255,.07)', backdropFilter: 'blur(6px)'}}>
                <Img src={staticFile(`img/${img}.jpg`)} style={{position: 'absolute', inset: 10, width: 300, height: 280, objectFit: 'cover', borderRadius: 16, filter: `brightness(${front || fan > 0.5 ? 1 : 0.6})`}} />
                <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(255,255,255,.3) 0%, rgba(255,255,255,.04) 35%, rgba(245,184,0,.12) 70%, rgba(0,0,0,.6) 100%)'}} />
                <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep}%`, width: '30%', background: 'linear-gradient(100deg, rgba(255,255,255,0), rgba(255,236,170,.4), rgba(255,255,255,0))', transform: 'skewX(-12deg)'}} />
                <div style={{position: 'absolute', left: 14, right: 14, bottom: 12}}>
                  <div style={{display: 'inline-block', padding: '3px 12px', borderRadius: 20, background: ORG, fontFamily: F, fontWeight: 700, fontSize: 16, color: '#fff'}}>📍 {bairro}</div>
                  <div style={{fontFamily: F, fontWeight: 800, fontSize: 32, color: '#fff', marginTop: 4, textShadow: '0 2px 10px #000'}}>{name}</div>
                </div>
              </div>
              {/* floor reflection */}
              <div style={{position: 'absolute', left: 0, right: 0, top: 306, height: 90, borderRadius: 24, background: 'linear-gradient(180deg, rgba(245,184,0,.18), rgba(0,0,0,0))', opacity: front ? 0.9 : 0.3, filter: 'blur(6px)'}} />
            </div>
          );
        })}
      </div>
      {f >= fr(T.outros) - 2 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 1240, display: 'flex', justifyContent: 'center', opacity: fan}}>
          <div style={{transform: `scale(${0.6 + 0.4 * fan})`, padding: '10px 28px', borderRadius: 40, background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, fontFamily: F, fontWeight: 800, fontSize: 34, color: '#000', boxShadow: '0 0 40px rgba(245,184,0,.6)'}}>+ ENTRE OUTROS</div>
        </div>
      )}
    </div>
  );
};

// ---------- motive 3: odonto + vida seals ----------
const Seals: React.FC = () => {
  const f = useCurrentFrame();
  const a = fr(T.tres), b = fr(T.quatro) - 2;
  if (f < a || f > b + 8) return null;
  const o = interpolate(f, [b, b + 8], [1, 0], cl);
  const items: [number, string, string][] = [
    [T.odonto, 'ODONTO', 'M30 20 c-14 0 -18 14 -14 30 c4 14 6 36 14 36 c8 0 6 -20 20 -20 c14 0 12 20 20 20 c8 0 10 -22 14 -36 c4 -16 0 -30 -14 -30 c-8 0 -12 6 -20 6 c-8 0 -12 -6 -20 -6 z'],
    [T.vida, 'SEGURO DE VIDA', 'M50 12 l32 12 v24 c0 22 -14 34 -32 42 c-18 -8 -32 -20 -32 -42 v-24 z M36 50 l10 10 l20 -20'],
  ];
  const st = sp(f, T.custo, 9, 200);
  return (
    <div style={{opacity: o}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 940, display: 'flex', justifyContent: 'center', gap: 36, perspective: 1000}}>
        {items.map(([t, l, d]) => {
          const p = sp(f, t - 0.05, 12, 170);
          const ip = interpolate(f - fr(t), [2, 20], [0, 1], cl);
          return (
            <div key={l} style={{width: 270, height: 250, borderRadius: 30, transform: `rotateY(${(1 - p) * 90}deg)`, opacity: f >= fr(t) - 2 ? 1 : 0, background: 'linear-gradient(160deg, rgba(255,255,255,.22), rgba(255,255,255,.05) 45%, rgba(0,0,0,.45))', backdropFilter: 'blur(14px)', border: `2px solid ${GOLD}`, boxShadow: '0 30px 60px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14}}>
              <svg width="110" height="110" viewBox="0 0 100 100" style={{filter: 'drop-shadow(0 0 12px rgba(245,184,0,.7))'}}><path d={d} fill="none" stroke={GOLD} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ip} /></svg>
              <div style={{fontFamily: F, fontWeight: 800, fontSize: l.length > 8 ? 26 : 34, color: '#fff'}}>{l}</div>
            </div>
          );
        })}
      </div>
      {f >= fr(T.custo) && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 1150, display: 'flex', justifyContent: 'center'}}>
          <div style={{transform: `scale(${2.2 - 1.2 * st}) rotate(-6deg)`, opacity: st, padding: '12px 30px', border: `5px solid ${GOLD}`, borderRadius: 16, background: 'rgba(0,0,0,.6)', fontFamily: F, fontWeight: 800, fontSize: 44, color: GOLD, letterSpacing: 2, boxShadow: '0 0 40px rgba(245,184,0,.5)', textAlign: 'center'}}>SEM CUSTO A MAIS<div style={{fontSize: 22, color: '#fff', letterSpacing: 1, marginTop: 4}}>TITULARES E DEPENDENTES</div></div>
        </div>
      )}
    </div>
  );
};

// ---------- motive 4: Wellhub (antigo Gympass) ----------
const Wellhub: React.FC = () => {
  const f = useCurrentFrame();
  const a = fr(T.quatro), b = fr(T.tudo) - 2;
  if (f < a || f > b + 8) return null;
  const o = interpolate(f, [b, b + 8], [1, 0], cl);
  const p = sp(f, T.wellhub - 0.1, 12, 140);
  const g = sp(f, T.gym, 14, 160);
  const list: [number, string][] = [[T.acad, 'ACADEMIAS'], [T.yoga, 'YOGA'], [T.pil, 'PILATES'], [T.ter, 'TERAPIA ONLINE'], [T.med, 'MEDITAÇÃO']];
  const sweep = interpolate((f - a) % 50, [0, 22], [-50, 160], cl);
  return (
    <div style={{opacity: o}}>
      {f >= fr(T.wellhub) - 3 && (
        <div style={{position: 'absolute', left: 40, top: 950, perspective: 1100}}>
          <div style={{position: 'relative', width: 500, height: 280, borderRadius: 26, overflow: 'hidden', transform: `rotateX(${(1 - p) * -75}deg) scale(${0.75 + 0.25 * p})`, opacity: p, border: `3px solid ${GOLD}`, boxShadow: '0 30px 70px rgba(0,0,0,.6), 0 0 50px rgba(245,184,0,.4)'}}>
            <Img src={staticFile('img/gympass-wellhub.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(255,255,255,.25), rgba(255,255,255,0) 40%)'}} />
            <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep}%`, width: '25%', background: 'linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,.5), rgba(255,255,255,0))', transform: 'skewX(-12deg)'}} />
            {f >= fr(T.gym) && <div style={{position: 'absolute', left: 20, bottom: 18, padding: '6px 18px', borderRadius: 30, background: 'rgba(0,0,0,.75)', fontFamily: F, fontWeight: 800, fontSize: 26, color: GOLD, opacity: g, transform: `translateY(${(1 - g) * 30}px)`}}>O ANTIGO GYMPASS</div>}
            <div style={{position: 'absolute', right: 18, top: 16, padding: '6px 16px', borderRadius: 30, background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, fontFamily: F, fontWeight: 800, fontSize: 24, color: '#000', opacity: p}}>ACESSO INCLUSO</div>
          </div>
        </div>
      )}
      <div style={{position: 'absolute', right: 40, top: 900, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end'}}>
        {list.map(([t, l]) => {
          const q = sp(f, t, 12, 220);
          const on = f >= fr(t);
          return (
            <div key={l} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '8px 20px 8px 10px', borderRadius: 40, background: 'rgba(20,14,4,.7)', backdropFilter: 'blur(10px)', border: `2px solid ${GOLD}`, opacity: on ? 1 : 0, transform: `translateX(${(1 - q) * 160}px)`}}>
              <div style={{width: 36, height: 36, borderRadius: '50%', background: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <svg width="24" height="24" viewBox="0 0 100 100"><path d="M20 52 l18 18 l42 -42" fill="none" stroke="#000" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - q} /></svg>
              </div>
              <span style={{fontFamily: F, fontWeight: 800, fontSize: 30, color: '#fff'}}>{l}</span>
            </div>
          );
        })}
      </div>
    </div>
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
  return (
    <>
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,${0.85 * p}) 72%)`}} />
      <div style={{position: 'absolute', left: 60, right: 60, top: 1010, padding: '24px 20px 22px', borderRadius: 36, background: 'rgba(20,14,4,.8)', border: `2px solid rgba(245,184,0,.7)`, backdropFilter: 'blur(14px)', textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 120}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 18}}>
          <div style={{padding: '12px 18px', borderRadius: 16, background: 'rgba(255,255,255,.93)'}}><Img src={staticFile('sulamerica.png')} style={{width: 280, height: 280 * 372 / 1464}} /></div>
          <Img src={staticFile('emblema.png')} style={{width: 76, height: 76, objectFit: 'contain'}} />
        </div>
        <div style={{position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 14, background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, padding: '14px 32px', borderRadius: 60, overflow: 'hidden', transform: `translateY(${bob}px)`, boxShadow: '0 0 50px rgba(245,184,0,.6)'}}>
          <svg width="46" height="46" viewBox="0 0 100 100"><path d={ICONS.chat[0]} fill="none" stroke="#000" strokeWidth="9" strokeLinejoin="round" /></svg>
          <span style={{fontFamily: F, fontWeight: 800, fontSize: 46, color: '#000'}}>Comenta SULAMÉRICA</span>
          <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep}%`, width: '25%', background: 'linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,.7), rgba(255,255,255,0))'}} />
        </div>
        <div style={{fontFamily: F, fontWeight: 700, fontSize: 36, color: '#fff', marginTop: 18}}>ou toque no <span style={{color: GOLD}}>Link na bio ↑</span></div>
        <div style={{fontFamily: F, fontWeight: 500, fontSize: 28, color: GOLD2, marginTop: 10}}>O plano certo para a sua empresa</div>
        <div style={{fontFamily: F, fontWeight: 400, fontSize: 21, color: 'rgba(255,255,255,.78)', marginTop: 12}}>Carências, rede e valores variam por operadora e produto.</div>
      </div>
    </>
  );
};

const Sfx: React.FC = () => {
  const wh = [0.05, T.sula0, T.um, T.dois, T.rios, T.barra, T.quinta, T.gloria, T.copa, T.tres, T.quatro, T.wellhub, T.comenta];
  const pops = [T.familia, T.func, T.ambos, T.odonto, T.vida, T.acad, T.yoga, T.pil, T.ter, T.med];
  return (
    <>
      {wh.map((t, i) => <Sequence key={'w' + i} from={Math.max(0, fr(t) - 2)}><Audio src={staticFile('whoosh.wav')} volume={0.38} /></Sequence>)}
      {[T.sula0, T.outros, T.custo].map((t, i) => <Sequence key={'b' + i} from={fr(t)}><Audio src={staticFile('boom.wav')} volume={0.5} /></Sequence>)}
      {pops.map((t, i) => <Sequence key={'p' + i} from={fr(t)}><Audio src={staticFile('pop.wav')} volume={0.42} /></Sequence>)}
    </>
  );
};

export const Sula: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <style>{fontCss}</style>
    <Camera>
      <OffthreadVideo src={staticFile('avatar18.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(.32) saturate(1.15) brightness(.8) contrast(1.1)'}} />
    </Camera>
    <GoldGrade />
    <Atmosphere />
    <Flash />
    <Lens />
    <Brand />
    <LogoPlate from={T.sula0 - 0.2} to={T.um - 0.1} top={950} w={560} />
    <Particles from={T.sula0} to={T.um} cx={540} cy={1030} n={36} />
    <BigNum at={T.um} to={T.dois - 0.05} n="1" label={'A PARTIR DE\n3 VIDAS'} />
    <People />
    <BigNum at={T.dois} to={T.rede - 0.1} n="2" label={'REDE D\'OR'} />
    <Carousel />
    <BigNum at={T.tres} to={T.quatro - 0.05} n="3" label={'ODONTO +\nSEGURO DE VIDA'} />
    <Seals />
    <BigNum at={T.quatro} to={T.wellhub - 0.2} n="4" label={'O GRANDE\nDIFERENCIAL'} />
    <Wellhub />
    <Captions />
    <EndCard />
    <Particles from={T.comenta} to={DURF / FPS} cx={540} cy={1100} n={30} />
    <Audio src={staticFile('music.mp3')} volume={(x) => interpolate(x, [0, 10, DURF - 20, DURF], [0, 0.12, 0.12, 0], cl)} />
    <Sfx />
  </AbsoluteFill>
);
