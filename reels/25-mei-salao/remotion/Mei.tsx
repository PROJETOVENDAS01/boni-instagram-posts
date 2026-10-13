import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing, random} from 'remotion';
import words from '../public/words25.json';
import {DUR25} from './meiDur';

const FPS = 25;
const DURF = DUR25;
const GOLD = '#F5B800';
const GOLD2 = '#FFD95A';
const F = 'Poppins';
type W = {t: string; s: number; e: number; seg: number};
const WS: W[] = (words as any).words;
const SEGS: {t: string; s: number; e: number}[] = (words as any).segs;
const KEY = /salão|beleza|mei|manicure|cabeleireir|plano|empresarial|vida|conta|cnpj|180|dias|operadora|comparo|opções|saúde/i;
const PROF = /salão/i;
const VIO = '#C2577A';
const VIO2 = '#F6B8CB';
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
  presta: at(/^Presta/), mani: at(/^Manicure/), cabA: at(/^cabeleireira/), cabO: at(/^cabeleireiro/), seu: at(/^seu$/),
  emp: at(/^empresarial/), uma: at(/^uma$/), vida: at(/^vida/), e2: at(/^E$/), emp2: at(/^empresarial/, 1), conta: at(/^conta$/),
  indiv: at(/^individual/), regra: at(/^regra/), cnpj: at(/^CNPJ/), n180: at(/^180/), dias: at(/^dias/), resto: at(/^resto/),
  oper: at(/^operadora/), comp: at(/^comparo/), comenta: at(/^Comenta/),
};
// scenes: clip = full-screen salon video with Thiago in a glass circle; null = Thiago full screen
const SC: {s: number; e: number; clip: string | null}[] = [
  {s: 0, e: T.presta, clip: null},
  {s: T.presta, e: T.mani, clip: 'c6-ambiente'},
  {s: T.mani, e: T.cabA, clip: 'c1-unha'},
  {s: T.cabA, e: T.cabO, clip: 'c2-tesoura'},
  {s: T.cabO, e: T.uma, clip: 'c3-escova'},
  {s: T.uma, e: T.e2, clip: null},
  {s: T.e2, e: T.regra, clip: 'c4-lavatorio'},
  {s: T.regra, e: T.resto, clip: null},
  {s: T.resto, e: T.comenta, clip: 'c5-esmaltes'},
  {s: T.comenta, e: 99, clip: null},
];
const cur = (t: number) => SC.find((s) => t >= s.s && t < s.e) ?? SC[SC.length - 1];
const FACE = {x: 540, y: 650}; // face centre in the avatar frame

const Avatar: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS; const sc = cur(t);
  const k = f - fr(sc.s);
  const inClip = !!sc.clip;
  // circle size animates: full screen (r = big) <-> glass circle
  const prev = SC[SC.indexOf(sc) - 1];
  const ease = interpolate(k, [0, 10], [0, 1], {...cl, easing: Easing.out(Easing.cubic)});
  const p = inClip ? (prev && prev.clip ? 1 : ease) : (prev && prev.clip ? 1 - ease : 0);
  const D = 400; const cx = 540, cy = 470;
  const R = interpolate(p, [0, 1], [1200, D / 2]);
  const scale = interpolate(p, [0, 1], [1 + interpolate(f, [0, DURF], [0, 0.06]), 0.5]);
  const tx = interpolate(p, [0, 1], [0, cx - FACE.x * 0.5 - (540 - 540 * 0.5)]);
  const ty = interpolate(p, [0, 1], [0, cy - FACE.y * 0.5 - (960 - 960 * 0.5)]);
  return (
    <AbsoluteFill style={{clipPath: `circle(${R}px at ${cx}px ${interpolate(p, [0, 1], [960, cy])}px)`}}>
      <AbsoluteFill style={{transform: `translate(${tx}px,${ty}px) scale(${scale})`}}>
        <OffthreadVideo src={staticFile('avatar25.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
const Ring: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS; const sc = cur(t);
  if (!sc.clip) return null;
  const prev = SC[SC.indexOf(sc) - 1];
  const p = prev && prev.clip ? 1 : interpolate(f - fr(sc.s), [4, 14], [0, 1], cl);
  return (
    <div style={{position: 'absolute', left: 540 - 212, top: 470 - 212, width: 424, height: 424, borderRadius: '50%', opacity: p,
      background: `conic-gradient(from ${f * 4}deg, ${GOLD}, ${VIO2}, ${GOLD2}, ${GOLD})`, WebkitMask: 'radial-gradient(circle, transparent 200px, black 201px)', boxShadow: '0 0 40px rgba(245,184,0,.55)'}} />
  );
};
const Clips: React.FC = () => (
  <>
    {SC.filter((s) => s.clip).map((s, i) => (
      <Sequence key={i} from={fr(s.s)} durationInFrames={Math.max(1, fr(s.e) - fr(s.s))}>
        <ClipLayer name={s.clip as string} len={fr(s.e) - fr(s.s)} />
      </Sequence>
    ))}
  </>
);
const ClipLayer: React.FC<{name: string; len: number}> = ({name, len}) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, len], [1.08, 1.2]);
  return (
    <AbsoluteFill>
      <OffthreadVideo src={staticFile(`clips/${name}.mp4`)} muted playbackRate={0.85} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})`, filter: 'sepia(.25) saturate(1.1) brightness(.78) contrast(1.08)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,.75))'}} />
    </AbsoluteFill>
  );
};
// colour sweep at every scene change
const Sweep: React.FC = () => {
  const f = useCurrentFrame();
  let o = -1;
  SC.slice(1).forEach((s) => { const d = f - fr(s.s); if (d >= -4 && d < 6) o = d; });
  if (o < -4) return null;
  const x = interpolate(o, [-4, 6], [-60, 160]);
  return <AbsoluteFill style={{background: `linear-gradient(105deg, rgba(0,0,0,0) ${x - 30}%, rgba(246,184,203,.55) ${x - 8}%, rgba(255,236,170,.75) ${x}%, rgba(0,0,0,0) ${x + 22}%)`, mixBlendMode: 'screen'}} />;
};
// big label on clip scenes
const Label: React.FC<{from: number; to: number; tag: string; text: string; top?: number}> = ({from, to, tag, text, top = 1030}) => {
  const f = useCurrentFrame();
  if (f < fr(from) || f > fr(to) + 6) return null;
  const p = sp(f, from, 12, 200);
  const o = interpolate(f, [fr(to), fr(to) + 6], [1, 0], cl);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top, textAlign: 'center', opacity: o}}>
      <div style={{display: 'inline-block', transform: `translateY(${(1 - p) * 60}px) scale(${0.8 + 0.2 * p})`, opacity: p, padding: '14px 34px 16px', borderRadius: 28, background: 'rgba(20,8,14,.45)', backdropFilter: 'blur(14px)', border: `2px solid ${VIO2}`, boxShadow: '0 20px 50px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.4)'}}>
        <div style={{fontFamily: F, fontWeight: 700, fontSize: 24, letterSpacing: 6, color: VIO2}}>{tag}</div>
        <div style={{fontFamily: F, fontWeight: 800, fontSize: 70, lineHeight: 1.05, color: GOLD, textShadow: '0 4px 0 rgba(0,0,0,.6)'}}>{text}</div>
      </div>
    </div>
  );
};
// hook
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const b = fr(T.mani) - 2;
  if (f > b + 6) return null;
  const p1 = sp(f, 0.1, 12, 170), p2 = sp(f, 0.7, 11, 200);
  const o = interpolate(f, [b, b + 6], [1, 0], cl);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1000, textAlign: 'center', opacity: o}}>
      <div style={{fontFamily: F, fontWeight: 800, fontSize: 104, lineHeight: 1, color: '#fff', transform: `scale(${0.6 + 0.4 * p1})`, opacity: p1, textShadow: `0 6px 0 ${VIO}, 0 18px 40px rgba(0,0,0,.8)`}}>TEM SALÃO</div>
      <div style={{display: 'inline-block', marginTop: 12, padding: '6px 30px', borderRadius: 20, background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, fontFamily: F, fontWeight: 800, fontSize: 86, color: '#000', transform: `rotate(-3deg) scale(${p2})`, boxShadow: '0 0 50px rgba(245,184,0,.6)'}}>E É MEI?</div>
    </div>
  );
};
// service bubbles (circles menu)
const Bubbles: React.FC = () => {
  const f = useCurrentFrame();
  const a = fr(T.mani), b = fr(T.seu);
  if (f < a || f > b + 8) return null;
  const o = interpolate(f, [b, b + 8], [1, 0], cl);
  const items: [number, string, string][] = [[T.mani, 'MANICURE', 'c1-unha'], [T.cabA, 'CABELEIREIRA', 'c2-tesoura'], [T.cabO, 'CABELEIREIRO', 'c3-escova']];
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 760, display: 'flex', justifyContent: 'center', gap: 26, opacity: o}}>
      {items.map(([t, l], i) => {
        const p = sp(f, t, 11, 190); const on = f >= fr(t);
        const act = cur(f / FPS).s === t;
        return (
          <div key={i} style={{opacity: on ? 1 : 0, transform: `scale(${(0.6 + 0.4 * p) * (act ? 1.08 : 0.92)})`, textAlign: 'center'}}>
            <div style={{width: 150, height: 150, borderRadius: '50%', border: `4px solid ${act ? GOLD : VIO2}`, background: 'rgba(20,8,14,.45)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: act ? '0 0 40px rgba(245,184,0,.7)' : '0 10px 30px rgba(0,0,0,.5)'}}>
              <svg width="80" height="80" viewBox="0 0 100 100">{(i === 0 ? ICONS.check : ICONS.scissors).map((d, j) => <path key={j} d={d} fill="none" stroke={GOLD} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />)}</svg>
            </div>
            <div style={{fontFamily: F, fontWeight: 800, fontSize: 24, color: act ? GOLD : '#fff', marginTop: 10, textShadow: '0 2px 8px #000'}}>{l}</div>
          </div>
        );
      })}
    </div>
  );
};
// giant number beside Thiago (full-screen scenes)
const Giant: React.FC<{from: number; to: number; top: string; big: string; sub: string; at2: number}> = ({from, to, top, big, sub, at2}) => {
  const f = useCurrentFrame();
  if (f < fr(from) || f > fr(to) + 6) return null;
  const p = sp(f, at2, 9, 220), q = sp(f, from, 12, 170);
  const o = interpolate(f, [fr(to), fr(to) + 6], [1, 0], cl);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 930, textAlign: 'center', opacity: o}}>
      <div style={{fontFamily: F, fontWeight: 700, fontSize: 34, letterSpacing: 8, color: VIO2, opacity: q, textShadow: '0 2px 10px #000'}}>{top}</div>
      <div style={{fontFamily: F, fontWeight: 800, fontSize: 210, lineHeight: 0.95, color: GOLD, transform: `scale(${f >= fr(at2) ? 2.4 - 1.4 * p : 0})`, textShadow: `0 8px 0 ${VIO}, 0 0 60px rgba(245,184,0,.6)`}}>{big}</div>
      <div style={{display: 'inline-block', marginTop: 8, padding: '6px 26px', borderRadius: 30, background: 'rgba(20,8,14,.55)', border: `2px solid ${GOLD}`, fontFamily: F, fontWeight: 800, fontSize: 38, color: '#fff', opacity: q}}>{sub}</div>
    </div>
  );
};
const Chips: React.FC = () => {
  const f = useCurrentFrame();
  const a = fr(T.resto), b = fr(T.comenta) - 2;
  if (f < a || f > b + 6) return null;
  const o = interpolate(f, [b, b + 6], [1, 0], cl);
  const items: [number, string][] = [[T.resto + 0.2, 'REDE'], [T.resto + 0.5, 'CARÊNCIAS'], [T.oper, 'VALORES']];
  const cp = sp(f, T.comp, 11, 200);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', opacity: o}}>
      <div style={{fontFamily: F, fontWeight: 700, fontSize: 28, letterSpacing: 5, color: VIO2, marginBottom: 14, textShadow: '0 2px 8px #000'}}>VARIA POR OPERADORA</div>
      <div style={{display: 'flex', justifyContent: 'center', gap: 16}}>
        {items.map(([t, l], i) => { const p = sp(f, t, 12, 210); return (
          <div key={i} style={{opacity: f >= fr(t) ? 1 : 0, transform: `translateY(${(1 - p) * 40}px)`, padding: '10px 24px', borderRadius: 40, background: 'rgba(20,8,14,.5)', backdropFilter: 'blur(10px)', border: `2px solid ${VIO2}`, fontFamily: F, fontWeight: 800, fontSize: 32, color: '#fff'}}>{l}</div>); })}
      </div>
      {f >= fr(T.comp) && <div style={{display: 'inline-block', marginTop: 22, padding: '10px 30px', borderRadius: 40, background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, fontFamily: F, fontWeight: 800, fontSize: 44, color: '#000', transform: `scale(${0.6 + 0.4 * cp})`, boxShadow: '0 0 40px rgba(245,184,0,.6)'}}>EU COMPARO PRA VOCÊ</div>}
    </div>
  );
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
  scissors: ['M30 30 a10 10 0 1 0 0.1 0', 'M30 70 a10 10 0 1 0 0.1 0', 'M38 36 l46 30', 'M38 64 l46 -30'],
  helmet: ['M14 66 h72', 'M22 66 c0 -34 56 -34 56 0', 'M42 34 v-6 h16 v6', 'M50 34 v32'],
  compass: ['M50 14 l-24 72', 'M50 14 l24 72', 'M50 14 a7 7 0 1 0 0.1 0', 'M32 60 h36'],
  tooth: ['M30 18 c-14 0 -18 14 -14 30 c3 12 6 22 8 34 c2 8 9 8 11 0 l5 -18 c1 -4 7 -4 8 0 l5 18 c2 8 9 8 11 0 c2 -12 5 -22 8 -34 c4 -16 0 -30 -14 -30 c-8 0 -10 4 -14 4 c-4 0 -6 -4 -14 -4 z'],
  stetho: ['M30 15 v25 a15 15 0 0 0 30 0 v-25', 'M45 55 v10 a15 15 0 0 0 30 0 v-8', 'M75 50 a7 7 0 1 0 0.1 0'],
};
const Icon: React.FC<{name: string; p: number; size?: number}> = ({name, p, size = 110}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{filter: `drop-shadow(0 0 12px rgba(245,184,0,.6))`}}>
    {ICONS[name].map((d, i) => <Draw key={i} d={d} p={interpolate(p, [i * 0.15, i * 0.15 + 0.6], [0, 1], cl)} />)}
  </svg>
);

const BIGS: {s: number; e: number}[] = [{s: 0, e: T.mani - 0.05}];
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
      <div style={{position: 'absolute', left: 50, top: 180, opacity: p, padding: '6px 16px', borderRadius: 30, border: `2px solid ${VIO2}`, background: 'rgba(20,6,12,.6)', fontFamily: F, fontWeight: 700, fontSize: 20, color: '#fff', letterSpacing: 2}}>MEI · SALÃO DE BELEZA</div>
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
      <div style={{position: 'absolute', left: 70, right: 70, top: 1050, padding: '26px 20px 22px', borderRadius: 36, background: 'rgba(6,10,22,.8)', border: `2px solid rgba(245,184,0,.7)`, backdropFilter: 'blur(14px)', textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 120}px)`, boxShadow: `0 0 50px rgba(194,87,122,.45)`}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, marginBottom: 18}}>
          <Icon name="scissors" p={interpolate(f - a, [4, 24], [0, 1], cl)} size={70} />
          <div style={{fontFamily: F, fontWeight: 800, fontSize: 34, color: '#fff', textAlign: 'left', lineHeight: 1.1}}>Plano empresarial<br /><span style={{color: VIO2}}>pelo seu MEI</span></div>
          <div style={{width: 2, height: 60, background: 'rgba(255,255,255,.4)'}} />
          <Img src={staticFile('emblema.png')} style={{width: 76, height: 76, objectFit: 'contain'}} />
        </div>
        <div style={{position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 14, background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, padding: '14px 36px', borderRadius: 60, overflow: 'hidden', transform: `translateY(${bob}px)`, boxShadow: '0 0 50px rgba(245,184,0,.6)'}}>
          <svg width="50" height="50" viewBox="0 0 100 100"><path d={ICONS.chat[0]} fill="none" stroke="#000" strokeWidth="9" strokeLinejoin="round" /></svg>
          <span style={{fontFamily: F, fontWeight: 800, fontSize: 50, color: '#000'}}>Comenta SALÃO</span>
          <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep}%`, width: '25%', background: 'linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,.7), rgba(255,255,255,0))'}} />
        </div>
        <div style={{fontFamily: F, fontWeight: 700, fontSize: 36, color: '#fff', marginTop: 18}}>ou toque no <span style={{color: GOLD}}>Link na bio ↑</span></div>
        <div style={{fontFamily: F, fontWeight: 500, fontSize: 28, color: GOLD2, marginTop: 10}}>O plano certo para o seu perfil</div>
        <div style={{fontFamily: F, fontWeight: 400, fontSize: 21, color: 'rgba(255,255,255,.78)', marginTop: 12}}>Carências, rede e valores variam por operadora e produto.</div>
      </div>
    </>
  );
};



const Sfx: React.FC = () => (
  <>
    {SC.slice(1).map((s, i) => <Sequence key={'w' + i} from={Math.max(0, fr(s.s) - 2)}><Audio src={staticFile('whoosh.wav')} volume={0.4} /></Sequence>)}
    {[T.vida, T.n180].map((t, i) => <Sequence key={'b' + i} from={fr(t)}><Audio src={staticFile('boom.wav')} volume={0.6} /></Sequence>)}
    {[T.mani, T.cabA, T.cabO, T.emp2, T.comp].map((t, i) => <Sequence key={'p' + i} from={fr(t)}><Audio src={staticFile('pop.wav')} volume={0.45} /></Sequence>)}
  </>
);

export const Mei: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <style>{fontCss}</style>
    <Clips />
    <Avatar />
    <Ring />
    <Atmosphere />
    <Sweep />
    <Brand />
    <Hook />
    <Bubbles />
    <Label from={T.seu} to={T.uma - 0.05} tag="PELO SEU MEI" text="PLANO EMPRESARIAL" />
    <Giant from={T.uma} to={T.e2 - 0.05} top="A PARTIR DE" big="1" sub="VIDA SÓ" at2={T.uma + 0.1} />
    <Label from={T.e2} to={T.regra - 0.05} tag="EMPRESARIAL x INDIVIDUAL" text="PODE SAIR MAIS EM CONTA" />
    <Giant from={T.regra} to={T.resto - 0.05} top="CNPJ ATIVO HÁ" big="180" sub="DIAS" at2={T.n180} />
    <Chips />
    <Captions />
    <EndCard />
    <Particles from={T.comenta} to={DURF / FPS} cx={540} cy={1150} n={30} />
    <Audio src={staticFile('music.mp3')} volume={(x) => interpolate(x, [0, 10, DURF - 20, DURF], [0, 0.12, 0.12, 0], cl)} />
    <Sfx />
  </AbsoluteFill>
);
