import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing, random} from 'remotion';
import words from '../public/words19.json';
import {DUR19} from './vitDur';

const FPS = 25;
const DURF = DUR19;
const GOLD = '#F5B800';
const GOLD2 = '#FFD95A';
const F = 'Poppins';
type W = {t: string; s: number; e: number; seg: number};
const WS: W[] = (words as any).words;
const SEGS: {t: string; s: number; e: number}[] = (words as any).segs;
const KEY = /internado|plano|diária|dez|mil|cirurgia|cem|completos|barra|emergência|uti|centro|quarto|hotel|bolso|certo|mensalidade|perfil|parcela|ideal|família|empresa/i;
const AMIL = /vitória/i;
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

// ================= Reel 19: Hospital Vitória (split screen, layered 2.5D shots) =================
const PANEL_H = 780;
const AV_Y = 470; // push avatar down so the face sits in the lower half

const T = {
  diaria: at(/^diária/), dez: at(/^dez$/), cirurgia: at(/^cirurgia/), cem: at(/^cem/),
  completo: at(/^É$/), barra: at(/^Barra/), emerg: at(/^emergência/), uti: at(/^UTI/), centro: at(/^centro/), quarto: at(/^quarto/),
  mas: at(/^Mas$/), bolso: at(/^bolso/), com: at(/^Com$/), mensal: at(/^mensalidade/), conta: at(/^Uma$/), parcela: at(/^parcela/),
  ajudo: at(/^ajudo/), familia: at(/^família/), empresa: at(/^empresa/), comenta: at(/^Comenta/),
};
const CAM: [number, number, number, boolean][] = [
  [0, 1.0, 0, false], [T.diaria, 1.06, 0, true], [T.cirurgia, 1.1, 0.4, true], [T.completo, 1.0, 0, false],
  [T.mas, 1.08, 0, true], [T.com, 1.02, 0, true], [T.conta, 1.08, -0.4, false], [T.ajudo, 1.0, 0, true],
  [T.comenta, 1.08, 0, true], [T.comenta + 1.2, 1.03, 0, false],
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
  let blur = 0;
  PUNCH.forEach((t) => { const d = f - fr(t); if (d >= 0 && d < 5) blur = Math.max(blur, (5 - d) * 2); });
  return (
    <AbsoluteFill style={{transform: `scale(${s}) rotate(${r}deg)`, transformOrigin: '50% 60%', filter: blur ? `blur(${blur}px)` : undefined}}>
      {children}
    </AbsoluteFill>
  );
};

const Flash: React.FC = () => {
  const f = useCurrentFrame();
  let o = 0;
  PUNCH.forEach((t) => { const d = f - fr(t); if (d >= -1 && d < 7) o = Math.max(o, interpolate(d, [-1, 0, 7], [0.15, 0.55, 0], cl)); });
  return <AbsoluteFill style={{background: `radial-gradient(circle at 50% 30%, rgba(255,236,170,${o}) 0%, rgba(245,184,0,${o * 0.6}) 35%, rgba(0,0,0,0) 75%)`, mixBlendMode: 'screen'}} />;
};

// one layered (2.5D) hospital shot: blurred plate behind, sharp framed photo, glass + light in front
const SHOTS: {img: string; from: () => number; to: () => number; title: string; sub: string; slices?: boolean}[] = [
  {img: 'h19-fachada-vitoria', from: () => 0, to: () => T.completo, title: 'HOSPITAL VITÓRIA', sub: 'BARRA DA TIJUCA', slices: true},
  {img: 'h19-fachada-americas', from: () => T.completo, to: () => T.emerg, title: 'COMPLEXO NA BARRA', sub: 'ESTRUTURA COMPLETA'},
  {img: 'h19-lounge', from: () => T.emerg, to: () => T.uti, title: 'RECEPÇÃO', sub: 'CONFORTO NA ESPERA'},
  {img: 'h19-uti', from: () => T.uti, to: () => T.quarto, title: 'UTI MODERNA', sub: 'TECNOLOGIA E EQUIPE'},
  {img: 'h19-quarto', from: () => T.quarto, to: () => T.com, title: 'QUARTO', sub: 'QUE PARECE HOTEL'},
  {img: 'h19-fachada-americas', from: () => T.com, to: () => T.comenta, title: '', sub: ''},
  {img: 'h19-fachada-vitoria', from: () => T.comenta, to: () => 99, title: 'HOSPITAL VITÓRIA', sub: 'COM O PLANO CERTO'},
];
const Shot: React.FC<{i: number}> = ({i}) => {
  const f = useCurrentFrame();
  const s = SHOTS[i];
  const a = fr(s.from()), b = fr(s.to());
  if (f < a - 1 || f > b + 12) return null;
  const k = f - a;
  const pin = sp(f, s.from(), 15, 120);
  const out = interpolate(f, [b, b + 12], [0, 1], {...cl, easing: Easing.in(Easing.cubic)});
  const dur = Math.max(30, b - a);
  // camera dolly through the layers
  const dz = interpolate(k, [0, dur], [0, 1], cl);
  const panX = Math.sin(k / 45) * 18;
  const inZ = (1 - pin) * 500, outZ = out * -700;
  const back = s.title === '' ? 0.35 : 1; // background-only shots (behind cards)
  const sweep = interpolate(k, [10, 34], [-40, 150], cl);
  const tp = sp(f, s.from() + 0.25, 14, 150);
  return (
    <AbsoluteFill style={{opacity: (1 - out) * Math.min(1, pin * 1.4)}}>
      {/* layer 0: blurred plate */}
      <div style={{position: 'absolute', left: -60, right: -60, top: -40, height: PANEL_H + 80, overflow: 'hidden'}}>
        <Img src={staticFile(`img/${s.img}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: `blur(${18 - 6 * back}px) brightness(${0.45 * back + 0.2})`, transform: `scale(${1.25 + dz * 0.08}) translateX(${-panX * 0.4}px)`}} />
      </div>
      {/* layer 1: framed sharp photo (or slices) */}
      <div style={{position: 'absolute', left: 70, width: 940, top: 150, height: 560, perspective: 1400, opacity: back === 1 ? 1 : 0}}>
        <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `translateZ(${inZ + outZ + dz * 60}px) rotateY(${-6 + panX * 0.15 + (1 - pin) * -25}deg) rotateX(${2 + (1 - pin) * 10}deg) translateX(${panX * 0.6}px)`, filter: out > 0 ? `blur(${out * 10}px)` : undefined}}>
          {s.slices
            ? Array.from({length: 8}).map((_, j) => {
                const sp2 = sp(f, s.from() + 0.08 + j * 0.06, 14, 130);
                return (
                  <div key={j} style={{position: 'absolute', top: 0, bottom: 0, left: `${j * 12.5}%`, width: '12.6%', overflow: 'hidden', transform: `translateZ(${(1 - sp2) * (j % 2 ? 420 : -420)}px) translateY(${(1 - sp2) * (j % 2 ? -60 : 60)}px)`, opacity: sp2}}>
                    <Img src={staticFile(`img/${s.img}.jpg`)} style={{position: 'absolute', top: 0, height: '100%', width: 940, left: -j * 117.5, objectFit: 'cover', transform: `scale(${1.06 + dz * 0.06})`}} />
                  </div>
                );
              })
            : <div style={{position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 28}}><Img src={staticFile(`img/${s.img}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.06 + dz * 0.08})`}} /></div>}
          {/* layer 2: glass, reflection, gold border, sweep */}
          <div style={{position: 'absolute', inset: 0, borderRadius: 28, border: `3px solid ${GOLD}`, boxShadow: '0 40px 80px rgba(0,0,0,.65), 0 0 50px rgba(245,184,0,.3), inset 0 0 0 1px rgba(255,255,255,.2)', background: 'linear-gradient(155deg, rgba(255,255,255,.22) 0%, rgba(255,255,255,.03) 32%, rgba(0,0,0,0) 60%, rgba(0,0,0,.45) 100%)', overflow: 'hidden', transform: 'translateZ(30px)'}}>
            <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep}%`, width: '22%', background: 'linear-gradient(100deg, rgba(255,255,255,0), rgba(255,236,170,.45), rgba(255,255,255,0))', transform: 'skewX(-14deg)'}} />
          </div>
          {/* layer 3: floating title plate, closest to camera */}
          {s.title && (
            <div style={{position: 'absolute', left: 30, bottom: -38, transform: `translateZ(90px) translateX(${(1 - tp) * -120}px) translateX(${-panX * 0.5}px)`, opacity: tp}}>
              <div style={{padding: '12px 26px', borderRadius: 18, background: 'rgba(15,11,3,.82)', backdropFilter: 'blur(10px)', border: `2px solid ${GOLD}`, boxShadow: '0 20px 40px rgba(0,0,0,.6)'}}>
                <div style={{fontFamily: F, fontWeight: 800, fontSize: 40, color: '#fff', lineHeight: 1.05}}>{s.title}</div>
                <div style={{fontFamily: F, fontWeight: 600, fontSize: 22, color: GOLD2, letterSpacing: 2}}>{s.sub}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// panel frame: gives the split screen a premium edge
const PanelEdge: React.FC = () => {
  const f = useCurrentFrame();
  const sweep = interpolate(f % 90, [0, 60], [-20, 120], cl);
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: PANEL_H - 160, height: 200, background: 'linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,.85))'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: PANEL_H + 38, height: 4, background: `linear-gradient(90deg, rgba(245,184,0,0), ${GOLD} 20%, ${GOLD2} 50%, ${GOLD} 80%, rgba(245,184,0,0))`, boxShadow: '0 0 20px rgba(245,184,0,.8)', overflow: 'hidden'}}>
        <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep}%`, width: '12%', background: '#fff', filter: 'blur(4px)'}} />
      </div>
    </>
  );
};

// price plates with counters
const Count: React.FC<{at: number; to: number; label: string; prefix: string; x: number}> = ({at, to, label, prefix, x}) => {
  const f = useCurrentFrame();
  const a = fr(at), b = fr(to);
  if (f < a - 1 || f > b + 10) return null;
  const p = sp(f, at, 12, 160);
  const n = Math.round(interpolate(f - a, [0, 18], [0, 1], {...cl, easing: Easing.out(Easing.cubic)}) * (prefix === '10' ? 10 : 100));
  const o = interpolate(f, [b, b + 10], [1, 0], cl);
  const shake = f - a < 22 && f - a > 16 ? Math.sin(f * 3) * 5 : 0;
  return (
    <div style={{position: 'absolute', left: x, top: 330, width: 430, perspective: 900, opacity: o}}>
      <div style={{transform: `rotateX(${(1 - p) * -80}deg) translateZ(${(1 - p) * 200}px) translateX(${shake}px)`, padding: '22px 18px', borderRadius: 26, background: 'linear-gradient(160deg, rgba(30,22,4,.92), rgba(10,8,2,.92))', border: `3px solid ${GOLD}`, boxShadow: '0 30px 60px rgba(0,0,0,.7), 0 0 50px rgba(245,184,0,.35)', textAlign: 'center'}}>
        <div style={{fontFamily: F, fontWeight: 700, fontSize: 28, color: '#fff', letterSpacing: 2}}>{label}</div>
        <div style={{fontFamily: F, fontWeight: 800, fontSize: 68, color: GOLD, lineHeight: 1.05, whiteSpace: 'nowrap', textShadow: '0 4px 0 #7d5600, 0 0 30px rgba(245,184,0,.5)'}}>+R$ {n}<span style={{fontSize: 40}}> MIL</span></div>
      </div>
    </div>
  );
};
const PriceTag: React.FC = () => {
  const f = useCurrentFrame();
  const a = fr(T.diaria), b = fr(T.completo);
  if (f < a || f > b + 8) return null;
  const o = interpolate(f, [a, a + 8, b, b + 8], [0, 1, 1, 0], cl);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 590, display: 'flex', justifyContent: 'center', opacity: o}}>
      <div style={{padding: '8px 22px', borderRadius: 30, background: 'rgba(0,0,0,.75)', border: '1px solid rgba(255,255,255,.3)', fontFamily: F, fontWeight: 600, fontSize: 24, color: '#fff'}}>valores médios no particular • podem variar</div>
    </div>
  );
};

// checklist over the tour
const CHK: [() => number, string][] = [[() => T.emerg, 'EMERGÊNCIA'], [() => T.uti, 'UTI MODERNA'], [() => T.centro, 'CENTRO CIRÚRGICO'], [() => T.quarto, 'QUARTO TIPO HOTEL']];
const Tour: React.FC = () => {
  const f = useCurrentFrame();
  const a = fr(T.emerg), b = fr(T.mas);
  if (f < a || f > b + 8) return null;
  const o = interpolate(f, [b, b + 8], [1, 0], cl);
  return (
    <div style={{position: 'absolute', right: 40, top: 905, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end', opacity: o, perspective: 800}}>
      {CHK.map(([t, l]) => {
        const p = sp(f, t(), 12, 210);
        const on = f >= fr(t());
        return (
          <div key={l} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '8px 20px 8px 10px', borderRadius: 40, background: 'rgba(15,11,3,.72)', backdropFilter: 'blur(10px)', border: `2px solid ${GOLD}`, opacity: on ? 1 : 0, transform: `rotateY(${(1 - p) * 70}deg) translateX(${(1 - p) * 120}px)`}}>
            <div style={{width: 36, height: 36, borderRadius: '50%', background: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <svg width="24" height="24" viewBox="0 0 100 100"><path d="M20 52 l18 18 l42 -42" fill="none" stroke="#000" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} /></svg>
            </div>
            <span style={{fontFamily: F, fontWeight: 800, fontSize: 28, color: '#fff'}}>{l}</span>
          </div>
        );
      })}
    </div>
  );
};

// "nem sempre paga do bolso": the R$100 mil bill shatters
const Shatter: React.FC = () => {
  const f = useCurrentFrame();
  const a = fr(T.mas), b = fr(T.com);
  if (f < a || f > b + 6) return null;
  const k = f - a;
  const brk = fr(T.bolso) - a;
  const p = sp(f, T.mas, 12, 170);
  const pieces = 14;
  return (
    <div style={{position: 'absolute', left: 290, top: 300, width: 500, height: 230}}>
      {Array.from({length: pieces}).map((_, i) => {
        const col = i % 7, row = Math.floor(i / 7);
        const t = Math.max(0, k - brk);
        const vx = (random('vx' + i) - 0.5) * 30, vy = -8 - random('vy' + i) * 10;
        const x = col * (500 / 7) + vx * t, y = row * 115 + vy * t + 0.9 * t * t;
        const rot = (random('r' + i) - 0.5) * 30 * t;
        const op = interpolate(t, [0, 18], [1, 0], cl);
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, width: 500 / 7 + 1, height: 116, overflow: 'hidden', transform: `rotate(${rot}deg) scale(${p})`, opacity: op}}>
            <div style={{position: 'absolute', left: -col * (500 / 7), top: -row * 115, width: 500, height: 230, borderRadius: 26, background: 'linear-gradient(160deg, rgba(30,22,4,.95), rgba(10,8,2,.95))', border: `3px solid ${GOLD}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{fontFamily: F, fontWeight: 700, fontSize: 28, color: '#fff'}}>CONTA PARTICULAR</div>
              <div style={{fontFamily: F, fontWeight: 800, fontSize: 84, color: GOLD}}>+R$ 100 MIL</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// conta x mensalidade bars
const Compare: React.FC = () => {
  const f = useCurrentFrame();
  const a = fr(T.com), b = fr(T.ajudo);
  if (f < a || f > b + 8) return null;
  const o = interpolate(f, [b, b + 8], [1, 0], cl);
  const p = sp(f, T.com + 0.1, 13, 140);
  const shrink = sp(f, T.parcela - 0.2, 12, 120);
  const H = 360;
  const h1 = H * p, h2 = H * p * (0.22 - 0.0 * shrink);
  const morph = sp(f, T.conta, 14, 120);
  return (
    <div style={{position: 'absolute', left: 140, right: 140, top: 210, height: 520, opacity: o, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '30px 30px 70px', borderRadius: 30, background: 'rgba(12,9,2,.72)', backdropFilter: 'blur(12px)', border: `2px solid ${GOLD}`, boxShadow: '0 30px 70px rgba(0,0,0,.6)'}}>
      {[['CONTA\nPARTICULAR', h1 * (1 - 0.55 * morph), 'rgba(255,255,255,.28)', '+R$ 100 MIL'], ['MENSALIDADE\nNO SEU PERFIL', h2 + 40 * morph, GOLD, 'CABE NO BOLSO']].map(([l, h, c, v], i) => (
        <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: 260}}>
          <div style={{fontFamily: F, fontWeight: 800, fontSize: 36, color: i ? GOLD : '#fff', marginBottom: 10}}>{v as string}</div>
          <div style={{width: 150, height: h as number, borderRadius: 16, background: i ? `linear-gradient(180deg, ${GOLD2}, ${GOLD})` : c as string, boxShadow: i ? '0 0 40px rgba(245,184,0,.6)' : 'none'}} />
          <div style={{position: 'absolute', bottom: 14, fontFamily: F, fontWeight: 700, fontSize: 22, color: '#fff', textAlign: 'center', whiteSpace: 'pre', transform: `translateX(${i ? 0 : 0}px)`}} />
          <div style={{fontFamily: F, fontWeight: 800, fontSize: 28, color: '#fff', textAlign: 'center', whiteSpace: 'pre', marginTop: 12}}>{l as string}</div>
        </div>
      ))}
    </div>
  );
};

// "eu te ajudo": name plate + who
const Help: React.FC = () => {
  const f = useCurrentFrame();
  const a = fr(T.ajudo), b = fr(T.comenta);
  if (f < a || f > b + 8) return null;
  const o = interpolate(f, [b, b + 8], [1, 0], cl);
  const p = sp(f, T.ajudo, 13, 150);
  const items: [number, string][] = [[T.ajudo + 0.5, 'VOCÊ'], [T.familia, 'SUA FAMÍLIA'], [T.empresa, 'SUA EMPRESA']];
  return (
    <div style={{opacity: o}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center', perspective: 1000}}>
        <div style={{transform: `rotateX(${(1 - p) * 70}deg)`, opacity: p, padding: '22px 40px', borderRadius: 28, background: 'rgba(12,9,2,.82)', backdropFilter: 'blur(12px)', border: `3px solid ${GOLD}`, textAlign: 'center', boxShadow: '0 30px 60px rgba(0,0,0,.6), 0 0 50px rgba(245,184,0,.3)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center'}}>
            <Img src={staticFile('emblema.png')} style={{width: 70, height: 70, objectFit: 'contain'}} />
            <div style={{textAlign: 'left'}}>
              <div style={{fontFamily: F, fontWeight: 800, fontSize: 46, color: '#fff'}}>Thiago Boni</div>
              <div style={{fontFamily: F, fontWeight: 600, fontSize: 24, color: GOLD2}}>Consultor em planos de saúde desde 2011</div>
            </div>
          </div>
          <div style={{display: 'flex', gap: 14, justifyContent: 'center', marginTop: 18}}>
            {items.map(([t, l]) => {
              const q = sp(f, t, 12, 200);
              return <div key={l} style={{opacity: f >= fr(t) ? q : 0, transform: `translateY(${(1 - q) * 30}px)`, padding: '8px 18px', borderRadius: 30, background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, fontFamily: F, fontWeight: 800, fontSize: 24, color: '#000'}}>{l}</div>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

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
    <div style={{position: 'absolute', left: 60, right: 60, top: 1345, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', transform: `translateY(${(1 - p) * 30}px) scale(${0.85 + 0.15 * p})`, opacity: p}}>
      {c.ws.map((w, i) => {
        const act = t >= w.s - 0.02 && t < w.e + 0.08;
        const am = AMIL.test(w.t);
        const key = KEY.test(w.t);
        return (
          <span key={i} style={{fontFamily: F, fontWeight: 800, fontSize: 64, margin: '0 17px', textTransform: 'uppercase', color: am ? GOLD2 : key ? GOLD : '#fff', display: 'inline-block', transform: `scale(${act ? 1.12 : 1}) translateY(${act ? -4 : 0}px)`, textShadow: am ? `0 4px 0 rgba(0,0,0,.95), 0 0 24px rgba(245,184,0,.8)` : '0 4px 0 rgba(0,0,0,.95), 0 0 26px rgba(0,0,0,.95)', borderBottom: act ? `6px solid ${GOLD}` : '6px solid transparent'}}>
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
        <div style={{width: `${(f / DURF) * 100}%`, height: '100%', background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, borderRadius: 3, boxShadow: '0 0 12px rgba(245,184,0,.8)'}} />
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
  return (
    <>
      <div style={{position: 'absolute', left: 70, right: 70, top: 250, padding: '26px 20px 22px', borderRadius: 36, background: 'rgba(15,12,5,.82)', border: `2px solid rgba(245,184,0,.7)`, backdropFilter: 'blur(14px)', textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 120}px)`}}>
        <div style={{position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 14, background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, padding: '14px 36px', borderRadius: 60, overflow: 'hidden', transform: `translateY(${bob}px)`, boxShadow: '0 0 50px rgba(245,184,0,.6)'}}>
          <svg width="50" height="50" viewBox="0 0 100 100"><path d={ICONS.chat[0]} fill="none" stroke="#000" strokeWidth="9" strokeLinejoin="round" /></svg>
          <span style={{fontFamily: F, fontWeight: 800, fontSize: 54, color: '#000'}}>Comenta VITÓRIA</span>
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
  const wh = [0.05, T.completo, T.emerg, T.uti, T.quarto, T.com, T.ajudo, T.comenta];
  const pops = [T.dez, T.cem, T.centro, T.familia, T.empresa];
  return (
    <>
      {wh.map((t, i) => <Sequence key={'w' + i} from={Math.max(0, fr(t) - 2)}><Audio src={staticFile('whoosh.wav')} volume={0.38} /></Sequence>)}
      {[T.diaria, T.cirurgia, T.bolso].map((t, i) => <Sequence key={'b' + i} from={fr(t)}><Audio src={staticFile('boom.wav')} volume={0.5} /></Sequence>)}
      {pops.map((t, i) => <Sequence key={'p' + i} from={fr(t)}><Audio src={staticFile('pop.wav')} volume={0.42} /></Sequence>)}
    </>
  );
};

export const Vitoria: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <style>{fontCss}</style>
    <Camera>
      <AbsoluteFill style={{transform: `translateY(${AV_Y}px)`}}>
        <OffthreadVideo src={staticFile('avatar19.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
    </Camera>
    <AbsoluteFill style={{height: PANEL_H + 40, overflow: 'hidden', background: '#000'}}>
      {SHOTS.map((_, i) => <Shot key={i} i={i} />)}
      <Count at={T.dez - 0.15} to={T.completo - 0.1} label="DIÁRIA" prefix="10" x={60} />
      <Count at={T.cem - 0.15} to={T.emerg - 0.1} label="CIRURGIA" prefix="100" x={590} />
      <PriceTag />
      <Shatter />
      <Compare />
      <Help />
    </AbsoluteFill>
    <PanelEdge />
    <Atmosphere />
    <Flash />
    <Brand />
    <Tour />
    <Captions />
    <EndCard />
    <Particles from={T.comenta} to={DURF / FPS} cx={540} cy={480} n={30} />
    <Audio src={staticFile('music.mp3')} volume={(x) => interpolate(x, [0, 10, DURF - 20, DURF], [0, 0.12, 0.12, 0], cl)} />
    <Sfx />
  </AbsoluteFill>
);
