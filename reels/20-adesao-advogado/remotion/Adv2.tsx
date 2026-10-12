import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing, random} from 'remotion';
import words from '../public/words20b.json';
import {DUR20B} from './adv2Dur';

const FPS = 25;
const DURF = DUR20B;
const GOLD = '#F5B800';
const GOLD2 = '#FFD95A';
const F = 'Poppins';
type W = {t: string; s: number; e: number; seg: number};
const WS: W[] = (words as any).words;
const SEGS: {t: string; s: number; e: number}[] = (words as any).segs;
const KEY = /condições|especiais|classe|adesão|direito|categoria|família|produto|simples|alto|padrão|perfil|oab|diploma|carteira|plano|opções|processo|pedido|prova|deferido/i;
const PROF = /advogado/i;
const VIO = '#B0204A';
const VIO2 = '#FF7A9C';
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
  proc: at(/^processo/), pedido: at(/^pedido:/), esp: at(/^especiais/), adesao: at(/^adesão/), direito: at(/^Direito/),
  p1: at(/^Primeira/), cat: at(/^categoria/), p2: at(/^Segunda/), fam: at(/^família/), p3: at(/^Terceira/),
  simples: at(/^simples/), alto: at(/^alto/), comp: at(/^comparo/), opc: at(/^opções/), perfil: at(/^perfil/),
  docs: at(/^Documentos/), carteira: at(/^carteira/), dip: at(/^diploma/), so: at(/^Só/),
  ped2: at(/^Pedido$/), def: at(/^deferido/), comenta: at(/^Comenta/),
};
const CAM: [number, number, number, boolean][] = [
  [0, 1.0, 0, false], [T.proc, 1.06, 0, false], [T.esp, 1.1, -0.5, true],
  [T.p1, 1.0, 0, true], [T.cat, 1.08, 0.5, false],
  [T.p2, 1.02, 0, true], [T.fam, 1.1, -0.5, false],
  [T.p3, 1.0, 0, true], [T.alto, 1.1, 0.5, false],
  [T.comp, 1.04, 0, true], [T.docs, 1.02, 0, true], [T.so, 1.08, 0, false],
  [T.def, 1.16, 0, true], [T.comenta, 1.06, 0, true],
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
  const k = f - fr(T.def);
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
  scale: ['M50 14 v66', 'M32 82 h36', 'M18 28 h64', 'M18 28 l-10 26 h20 z', 'M82 28 l-10 26 h20 z'],
  idcard: ['M10 24 h80 v52 h-80 z', 'M28 42 a9 9 0 1 0 0.1 0', 'M46 42 h32 M46 54 h32 M18 66 h26'],
  diploma: ['M14 28 h72 v38 h-72 z', 'M26 40 h48 M26 52 h30', 'M62 60 l4 22 l6 -8 l6 8 l4 -22'],
  people: ['M35 22 a10 10 0 1 0 0.1 0', 'M65 22 a10 10 0 1 0 0.1 0', 'M15 75 c0 -24 40 -24 40 0', 'M45 75 c0 -24 40 -24 40 0'],
  stairs: ['M12 85 h20 v-18 h20 v-18 h20 v-18 h16'],
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


const Lens: React.FC = () => {
  const f = useCurrentFrame();
  const ts = [T.p1, T.p2, T.p3, T.comp, T.docs, T.def, T.comenta];
  let k = -99;
  ts.forEach((t) => { const d = f - fr(t); if (d >= -3 && d < 7) k = d; });
  if (k < -3) return null;
  const o = interpolate(k, [-3, 0, 7], [0, 0.85, 0], cl);
  return <AbsoluteFill style={{opacity: o, mixBlendMode: 'screen', background: `repeating-conic-gradient(from 0deg at 50% 38%, rgba(255,220,140,.0) 0deg, rgba(255,220,140,.22) 2deg, rgba(255,220,140,0) 5deg)`, WebkitMaskImage: 'radial-gradient(circle at 50% 38%, transparent 18%, black 60%)'}} />;
};

// ---------- hook title ----------
const HookTitle: React.FC = () => {
  const f = useCurrentFrame();
  const b = fr(T.proc) + 6;
  if (f > b + 8) return null;
  const p1 = sp(f, 0.1, 12, 170), p2 = sp(f, 0.35, 12, 170);
  const o = interpolate(f, [b, b + 8], [1, 0], cl);
  const sweep = interpolate(f, [8, 30], [-40, 140], cl);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1030, textAlign: 'center', opacity: o, transform: `scale(${1 - interpolate(f, [b, b + 8], [0, 0.2], cl)})`}}>
      <div style={{position: 'relative', display: 'inline-block', transform: `scale(${0.5 + 0.5 * p1})`, opacity: Math.min(1, p1 * 1.5)}}>
        <div style={{fontFamily: F, fontWeight: 800, fontSize: 128, lineHeight: 1, color: GOLD, WebkitTextStroke: `2px ${VIO}`, textShadow: `0 3px 0 ${VIO}, 0 6px 0 #6e1230, 0 9px 0 #4a0b20, 0 20px 40px rgba(0,0,0,.8), 0 0 40px rgba(245,184,0,.45)`}}>ADVOGADO,</div>
        <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep}%`, width: '18%', background: 'linear-gradient(100deg, rgba(255,255,255,0), rgba(255,236,170,.7), rgba(255,255,255,0))', mixBlendMode: 'screen'}} />
      </div>
      <div style={{fontFamily: F, fontWeight: 800, fontSize: 52, color: '#fff', letterSpacing: 3, opacity: p2, transform: `translateY(${(1 - p2) * 30}px)`, textShadow: '0 4px 18px #000', marginTop: 6}}>VAMOS ABRIR ESSE PROCESSO</div>
    </div>
  );
};

// ---------- 3D case file (pasta de processo) ----------
const CaseFile: React.FC = () => {
  const f = useCurrentFrame();
  const a = fr(T.proc), b = fr(T.p1) - 3;
  if (f < a - 2 || f > b + 8) return null;
  const pin = sp(f, T.proc, 14, 130);
  const open = interpolate(f, [fr(T.pedido) - 8, fr(T.pedido) + 8], [0, 1], {...cl, easing: Easing.inOut(Easing.cubic)});
  const o = interpolate(f, [b, b + 8], [1, 0], cl);
  const sheet = sp(f, T.pedido + 0.15, 13, 150);
  const st = sp(f, T.adesao, 9, 220);
    const sweep = interpolate((f - a) % 50, [0, 26], [-60, 160], cl);
  const W = 430, H = 260;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1000, display: 'flex', justifyContent: 'center', perspective: 1400, opacity: o}}>
      <div style={{position: 'relative', width: W, height: H, transformStyle: 'preserve-3d', transform: `translateY(${(1 - pin) * 500}px) rotateX(${18 - 8 * open}deg) rotateZ(${-3 + 3 * pin}deg) scale(${0.7 + 0.3 * pin})`}}>
        {/* back cover */}
        <div style={{position: 'absolute', inset: 0, borderRadius: 18, background: 'linear-gradient(140deg, #5c0e24, #2a0610)', border: `3px solid ${GOLD}`, boxShadow: '0 40px 80px rgba(0,0,0,.75)'}} />
        {/* paper stack + sheet rising */}
        <div style={{position: 'absolute', left: 18, right: 18, top: 14, bottom: 14, borderRadius: 8, background: '#efe6d2', boxShadow: '0 2px 0 #d8ccb2, 0 4px 0 #cbbd9f'}} />
        <div style={{position: 'absolute', left: 30, right: 30, top: 24, height: H - 30, borderRadius: 8, background: 'linear-gradient(180deg,#fffaf0,#f1e8d6)', transform: `translateY(${-sheet * 110}px) rotate(${sheet * -2}deg)`, boxShadow: '0 20px 40px rgba(0,0,0,.45)', padding: '22px 26px', opacity: open}}>
          <div style={{fontFamily: F, fontWeight: 800, fontSize: 22, color: VIO, letterSpacing: 3}}>PEDIDO</div>
          <div style={{fontFamily: F, fontWeight: 800, fontSize: 30, color: '#1a0a10', lineHeight: 1.12, marginTop: 6}}>Condições especiais pra sua classe</div>
          {f >= fr(T.adesao) && (
            <div style={{position: 'absolute', right: 16, bottom: 14, transform: `scale(${2.2 - 1.2 * st}) rotate(${-10 + (1 - st) * -25}deg)`, opacity: Math.min(1, st * 2), padding: '8px 16px', borderRadius: 10, border: `5px solid ${VIO}`, color: VIO, fontFamily: F, fontWeight: 800, fontSize: 24, lineHeight: 1.05, textAlign: 'center', background: 'rgba(255,255,255,.35)'}}>PLANO POR<br />ADESÃO</div>
          )}
        </div>
        {/* front cover (hinged on the left) */}
        <div style={{position: 'absolute', inset: 0, transformOrigin: 'left center', transform: `rotateY(${-165 * open}deg)`, transformStyle: 'preserve-3d', backfaceVisibility: 'hidden'}}>
          <div style={{position: 'absolute', inset: 0, borderRadius: 18, overflow: 'hidden', background: 'linear-gradient(140deg, #9b1b3f, #4a0b20 60%, #2a0610)', border: `3px solid ${GOLD}`, boxShadow: 'inset 0 1px 0 rgba(255,255,255,.3)'}}>
            <div style={{position: 'absolute', inset: 14, borderRadius: 10, border: `2px solid rgba(245,184,0,.6)`}} />
            <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep}%`, width: '25%', background: 'linear-gradient(100deg, rgba(255,255,255,0), rgba(255,236,170,.35), rgba(255,255,255,0))', transform: 'skewX(-14deg)'}} />
            <div style={{position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center'}}>
              <Icon name="scale" p={interpolate(f - a, [4, 26], [0, 1], cl)} size={80} />
              <div style={{fontFamily: F, fontWeight: 800, fontSize: 46, color: GOLD, letterSpacing: 10, marginTop: 6}}>AUTOS</div>
              <div style={{fontFamily: F, fontWeight: 600, fontSize: 24, color: '#fff', marginTop: 4}}>Plano de saúde do advogado</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- proof sheet (paper with photo, falls and gets clipped) ----------
const Proof: React.FC<{from: number; to: number; img: string; tag: string; label: string; side: 'L' | 'R'; top?: number}> = ({from, to, img, tag, label, side, top = 470}) => {
  const f = useCurrentFrame();
  const a = fr(from), b = fr(to);
  if (f < a - 2 || f > b + 8) return null;
  const p = sp(f, from, 12, 140);
  const out = interpolate(f, [b, b + 8], [0, 1], {...cl, easing: Easing.in(Easing.cubic)});
  const dir = side === 'R' ? 1 : -1;
  const x = side === 'R' ? 725 : 45;
  const rot = dir * (4 - (1 - p) * 18);
  const kb = interpolate(f, [a, b], [1.05, 1.18]);
  const clip = sp(f, from + 0.35, 10, 260);
  const st = sp(f, from + 0.25, 9, 220);
  return (
    <div style={{position: 'absolute', left: x, top, width: 310, perspective: 1200, opacity: 1 - out}}>
      <div style={{transform: `translateY(${(1 - p) * -700 + out * 600}px) rotateX(${(1 - p) * 40}deg) rotate(${rot}deg)`, background: 'linear-gradient(180deg,#fffaf0,#efe4cf)', borderRadius: 10, padding: 14, boxShadow: '0 30px 60px rgba(0,0,0,.7), 0 0 30px rgba(245,184,0,.25)'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
          <span style={{fontFamily: F, fontWeight: 800, fontSize: 22, color: VIO, letterSpacing: 2}}>{tag}</span>
          <span style={{fontFamily: F, fontWeight: 600, fontSize: 14, color: '#8a7055'}}>fls. {tag.replace(/\D/g, '') || '—'}</span>
        </div>
        <div style={{position: 'relative', height: 250, borderRadius: 6, overflow: 'hidden'}}>
          <Img src={staticFile(`img/${img}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${kb})`}} />
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,.6))'}} />
          {f >= a + 6 && <div style={{position: 'absolute', right: 10, bottom: 10, transform: `scale(${2 - st}) rotate(-8deg)`, opacity: Math.min(1, st * 2), padding: '4px 10px', border: `3px solid ${GOLD}`, borderRadius: 6, fontFamily: F, fontWeight: 800, fontSize: 18, color: GOLD, background: 'rgba(0,0,0,.45)'}}>ANEXADA</div>}
        </div>
        <div style={{fontFamily: F, fontWeight: 800, fontSize: label.length > 12 ? 24 : 30, color: '#1a0a10', marginTop: 10, textAlign: 'center'}}>{label}</div>
      </div>
      {/* gold clip */}
      <div style={{position: 'absolute', left: 130, top: -18, width: 50, height: 70, borderRadius: 12, border: `6px solid ${GOLD2}`, boxShadow: '0 4px 10px rgba(0,0,0,.5)', transform: `translateY(${(1 - clip) * -60}px) rotate(${rot}deg)`, opacity: clip}} />
    </div>
  );
};

// ---------- DEFERIDO stamp ----------
const Deferido: React.FC = () => {
  const f = useCurrentFrame();
  const a = fr(T.def), b = fr(T.comenta) - 2;
  if (f < fr(T.ped2) - 2 || f > b + 6) return null;
  const g = sp(f, T.ped2 - 0.05, 12, 160);
  const st = sp(f, T.def, 8, 260);
  const o = interpolate(f, [b, b + 6], [1, 0], cl);
  return (
    <div style={{opacity: o}}>
      <div style={{position: 'absolute', left: 45, top: 470, width: 300, height: 340, borderRadius: 24, overflow: 'hidden', border: `4px solid ${GOLD}`, transform: `translateX(${(1 - g) * -500}px) rotate(-3deg)`, boxShadow: '0 30px 60px rgba(0,0,0,.7)'}}>
        <Img src={staticFile('img/a20-martelo.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.1 + (f >= a ? 0.06 * Math.max(0, 1 - (f - a) / 6) : 0)})`}} />
      </div>
      {f >= a && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 1000, display: 'flex', justifyContent: 'center'}}>
          <div style={{transform: `scale(${3 - 2 * st}) rotate(${-8 + (1 - st) * -20}deg)`, opacity: Math.min(1, st * 2.5), padding: '16px 40px', borderRadius: 18, border: `9px solid ${GOLD}`, background: 'rgba(0,0,0,.5)', boxShadow: '0 0 60px rgba(245,184,0,.7), inset 0 0 30px rgba(245,184,0,.3)', fontFamily: F, fontWeight: 800, fontSize: 104, color: GOLD, letterSpacing: 6, textShadow: '0 0 30px rgba(245,184,0,.6)'}}>DEFERIDO</div>
        </div>
      )}
    </div>
  );
};
// ---------- pills (checklist) ----------
const Pills: React.FC<{from: number; to: number; items: [number, string][]; top?: number; last?: boolean}> = ({from, to, items, top = 860, last = true}) => {
  const f = useCurrentFrame();
  const b = fr(to);
  if (f < fr(from) - 2 || f > b + 8) return null;
  const o = interpolate(f, [b, b + 8], [1, 0], cl);
  return (
    <div style={{position: 'absolute', right: 40, top, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12, opacity: o}}>
      {items.map(([t, l], i) => {
        const p = sp(f, t, 12, 210);
        const on = f >= fr(t);
        const gold = last && i === items.length - 1;
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '8px 22px 8px 10px', borderRadius: 40, background: gold ? `linear-gradient(90deg, ${GOLD}, ${GOLD2})` : 'rgba(20,6,12,.68)', backdropFilter: 'blur(10px)', border: `2px solid ${gold ? GOLD2 : 'rgba(255,122,156,.8)'}`, opacity: on ? 1 : 0, transform: `translateX(${(1 - p) * 220}px) scale(${0.85 + 0.15 * p})`, boxShadow: '0 10px 30px rgba(0,0,0,.5)'}}>
            <div style={{width: 38, height: 38, borderRadius: '50%', background: gold ? '#000' : GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <svg width="26" height="26" viewBox="0 0 100 100"><path d="M20 52 l18 18 l42 -42" fill="none" stroke={gold ? GOLD : '#000'} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} /></svg>
            </div>
            <span style={{fontFamily: F, fontWeight: 800, fontSize: 32, color: gold ? '#000' : '#fff', whiteSpace: 'nowrap'}}>{l}</span>
          </div>
        );
      })}
    </div>
  );
};

// ---------- tiers ladder ----------
const Tiers: React.FC<{from: number; to: number}> = ({from, to}) => {
  const f = useCurrentFrame();
  const a = fr(from), b = fr(to);
  if (f < a - 2 || f > b + 8) return null;
  const pin = sp(f, from, 13, 150);
  const o = interpolate(f, [b, b + 8], [1, 0], cl);
  const fill = interpolate(f, [fr(T.simples) - 3, fr(T.alto) + 8], [0, 1], cl);
  return (
    <div style={{position: 'absolute', left: 705, top: 820, width: 330, padding: '20px 18px', borderRadius: 26, background: 'rgba(20,6,12,.72)', border: `3px solid ${GOLD}`, backdropFilter: 'blur(10px)', opacity: o, transform: `translateX(${(1 - pin) * 400}px)`, boxShadow: '0 20px 50px rgba(0,0,0,.6)'}}>
      <div style={{fontFamily: F, fontWeight: 800, fontSize: 28, color: GOLD, textAlign: 'center', marginBottom: 12}}>ACOMODAÇÃO</div>
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 10, height: 190}}>
        {[0, 1, 2, 3].map((i) => {
          const pp = interpolate(fill * 4 - i, [0, 1], [0, 1], cl);
          return (
            <div key={i} style={{flex: 1, display: 'flex', alignItems: 'flex-end', height: '100%'}}>
              <div style={{width: '100%', height: `${(30 + i * 22) * (0.15 + 0.85 * pp)}%`, borderRadius: 10, background: i === 3 ? `linear-gradient(180deg, ${GOLD2}, ${GOLD})` : `linear-gradient(180deg, ${VIO2}, ${VIO})`, opacity: pp > 0 ? 1 : 0.3, boxShadow: i === 3 && pp > 0.5 ? '0 0 24px rgba(245,184,0,.8)' : 'none'}} />
            </div>
          );
        })}
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 10, fontFamily: F, fontWeight: 700, fontSize: 17, color: '#fff'}}><span>ENFERMARIA</span><span style={{color: GOLD}}>APARTAMENTO</span></div>
    </div>
  );
};

// ---------- captions ----------
const BIGS: {s: number; e: number}[] = [{s: 0, e: T.proc + 0.5}];
const inBig = (t: number) => BIGS.some((b) => t >= b.s && t < b.e);
const LAST_SEG = SEGS.length - 2;
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
        const pr = PROF.test(w.t), key = KEY.test(w.t);
        return (
          <span key={i} style={{fontFamily: F, fontWeight: 800, fontSize: 64, margin: '0 17px', textTransform: 'uppercase', color: pr ? VIO2 : key ? GOLD : '#fff', display: 'inline-block', transform: `scale(${act ? 1.12 : 1}) translateY(${act ? -4 : 0}px)`, textShadow: pr ? `0 4px 0 rgba(0,0,0,.95), 0 0 24px ${VIO}` : '0 4px 0 rgba(0,0,0,.95), 0 0 26px rgba(0,0,0,.95)', borderBottom: act ? `6px solid ${VIO2}` : '6px solid transparent'}}>
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
        <div style={{width: `${(f / DURF) * 100}%`, height: '100%', background: `linear-gradient(90deg, ${GOLD}, ${VIO2})`, borderRadius: 3, boxShadow: '0 0 12px rgba(245,184,0,.8)'}} />
      </div>
      <div style={{position: 'absolute', right: 50, top: 175, display: 'flex', alignItems: 'center', gap: 12, opacity: p, transform: `translateY(${(1 - p) * -30}px)`}}>
        <div style={{textAlign: 'right', fontFamily: F, fontWeight: 700, fontSize: 26, color: '#fff', lineHeight: 1.1, textShadow: '0 2px 8px #000'}}>BONI<br /><span style={{fontWeight: 600, fontSize: 18, color: GOLD2, textShadow: '0 1px 6px #000, 0 0 2px #000'}}>Planos de Saúde</span></div>
        <Img src={staticFile('emblema.png')} style={{width: 64, height: 64, objectFit: 'contain'}} />
      </div>
      <div style={{position: 'absolute', left: 50, top: 180, opacity: p, padding: '6px 16px', borderRadius: 30, border: `2px solid ${VIO2}`, background: 'rgba(20,6,12,.6)', fontFamily: F, fontWeight: 700, fontSize: 20, color: '#fff', letterSpacing: 2}}>ADESÃO · DIREITO</div>
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
  return (
    <>
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,${0.85 * p}) 75%)`}} />
      <div style={{position: 'absolute', left: 70, right: 70, top: 1050, padding: '26px 20px 22px', borderRadius: 36, background: 'rgba(20,6,12,.8)', border: `2px solid rgba(245,184,0,.7)`, backdropFilter: 'blur(14px)', textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 120}px)`, boxShadow: `0 0 50px rgba(176,32,74,.4)`}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, marginBottom: 18}}>
          <Icon name="scale" p={interpolate(f - a, [4, 24], [0, 1], cl)} size={70} />
          <div style={{fontFamily: F, fontWeight: 800, fontSize: 34, color: '#fff', textAlign: 'left', lineHeight: 1.1}}>Plano por adesão<br /><span style={{color: VIO2}}>pro profissional do Direito</span></div>
          <div style={{width: 2, height: 60, background: 'rgba(255,255,255,.4)'}} />
          <Img src={staticFile('emblema.png')} style={{width: 76, height: 76, objectFit: 'contain'}} />
        </div>
        <div style={{position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 14, background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, padding: '14px 36px', borderRadius: 60, overflow: 'hidden', transform: `translateY(${bob}px)`, boxShadow: '0 0 50px rgba(245,184,0,.6)'}}>
          <svg width="50" height="50" viewBox="0 0 100 100"><path d={ICONS.chat[0]} fill="none" stroke="#000" strokeWidth="9" strokeLinejoin="round" /></svg>
          <span style={{fontFamily: F, fontWeight: 800, fontSize: 50, color: '#000'}}>Comenta ADVOGADO</span>
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
  const wh = [0.05, T.proc, T.pedido, T.p1, T.p2, T.p3, T.comp, T.docs, T.ped2, T.comenta];
  const pops = [T.adesao, T.p1 + 0.25, T.p2 + 0.25, T.p3 + 0.25, T.opc, T.perfil, T.carteira, T.dip, T.so];
  return (
    <>
      {wh.map((t, i) => <Sequence key={'w' + i} from={Math.max(0, fr(t) - 2)}><Audio src={staticFile('whoosh.wav')} volume={0.4} /></Sequence>)}
      {[T.esp, T.alto, T.def].map((t, i) => <Sequence key={'b' + i} from={fr(t)}><Audio src={staticFile('boom.wav')} volume={i === 2 ? 0.8 : 0.5} /></Sequence>)}
      {pops.map((t, i) => <Sequence key={'p' + i} from={fr(t)}><Audio src={staticFile('pop.wav')} volume={0.45} /></Sequence>)}
    </>
  );
};

export const Adv2: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <style>{fontCss}</style>
    <Camera>
      <OffthreadVideo src={staticFile('avatar20v2.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </Camera>
    <Atmosphere />
    <Flash />
    <Lens />
    <Brand />
    <HookTitle />
    <CaseFile />
    <Particles from={T.adesao} to={T.adesao + 1.2} cx={700} cy={1050} n={30} />
    <Proof from={T.p1} to={T.p2 - 0.1} img="a20-escritorio" tag="PROVA 1" label="SUA CATEGORIA" side="R" />
    <Proof from={T.p2} to={T.p3 - 0.1} img="a20-familia" tag="PROVA 2" label="FAMÍLIA" side="R" />
    <Proof from={T.p3} to={T.alto - 0.1} img="a20-enfermaria" tag="PROVA 3" label="ENFERMARIA" side="L" top={560} />
    <Proof from={T.alto} to={T.comp - 0.1} img="a20-suite" tag="PROVA 3" label="APARTAMENTO" side="L" top={560} />
    <Tiers from={T.simples - 0.2} to={T.comp - 0.1} />
    <Pills from={T.comp} to={T.docs - 0.1} items={[[T.comp + 0.15, 'QUEM VAI USAR'], [T.opc, 'ONDE SE TRATA'], [T.opc + 0.5, 'QUANTO CABE NO BOLSO'], [T.perfil, 'SEU PERFIL']]} />
    <Proof from={T.docs} to={T.ped2 - 0.1} img="a20-docs" tag="ANEXOS" label="DOCUMENTOS" side="L" />
    <Pills from={T.carteira} to={T.ped2 - 0.1} items={[[T.carteira, 'CARTEIRA DA OAB'], [T.dip, 'OU DIPLOMA'], [T.so, 'SÓ ISSO']]} top={900} />
    <Deferido />
    <Particles from={T.def} to={T.def + 1.4} cx={540} cy={1070} n={50} />
    <Captions />
    <EndCard />
    <Particles from={T.comenta} to={DURF / FPS} cx={540} cy={1150} n={30} />
    <Audio src={staticFile('music.mp3')} volume={(x) => interpolate(x, [0, 10, DURF - 20, DURF], [0, 0.12, 0.12, 0], cl)} />
    <Sfx />
  </AbsoluteFill>
);
