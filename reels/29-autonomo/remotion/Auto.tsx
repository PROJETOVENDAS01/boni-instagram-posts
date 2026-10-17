import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing, random} from 'remotion';
import words from '../public/words29.json';
import {Gold3D} from './Promo50';

const FPS = 25;
export const DUR29 = 668;
const DURF = DUR29;
const GOLD = '#F5B800';
const GOLD2 = '#FFD95A';
const ACC = '#FFE7A3';
const F = 'Poppins';
type W = {t: string; s: number; e: number; seg: number};
const WS: W[] = (words as any).words;
const KEY = /autônomo|plano|saúde|profissão|classe|carteira|conselho|diploma|mei|cnpj|180|dias|empresarial|nome|família|regras|valores|perfil/i;
const fr = (s: number) => Math.round(s * FPS);
const at = (re: RegExp, n = 0) => { const m = WS.filter((w) => re.test(w.t)); return (m[n] ?? m[m.length - 1]).s; };
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const sp = (f: number, a: number, d = 18, st = 120) => spring({frame: f - fr(a), fps: FPS, config: {damping: d, stiffness: st}});

const fontCss = `
@font-face{font-family:Poppins;font-weight:800;src:url(${staticFile('Poppins-Bold.ttf')})}
@font-face{font-family:Poppins;font-weight:700;src:url(${staticFile('Poppins-Bold.ttf')})}
@font-face{font-family:Poppins;font-weight:500;src:url(${staticFile('Poppins-Medium.ttf')})}
@font-face{font-family:Poppins;font-weight:400;src:url(${staticFile('Poppins-Regular.ttf')})}`;

const T = {
  tres: at(/^3$/), p1: at(/^Primeiro/), cart: at(/^carteira/), dipl: at(/^diploma/), p2: at(/^Segundo/), n180: at(/^180/),
  emp: at(/^empresarial/), p3: at(/^Terceiro/), fam: at(/^família/), cada: at(/^Cada/), regras: at(/^regras/), valores: at(/^valores/),
  mostro: at(/^mostro/), comenta: at(/^Comenta/),
};
// path scenes: photo card + Thiago in a glass circle; null = Thiago full screen
const SC: {s: number; e: number; img: string | null; n?: string; tag?: string; pos?: string}[] = [
  {s: 0, e: T.p1, img: null},
  {s: T.p1, e: T.p2, img: 'img29/autonomo-diploma.png', n: '1', tag: 'PELA SUA PROFISSÃO', pos: '45% 50%'},
  {s: T.p2, e: T.p3, img: 'img29/autonomo-mei-calendario.png', n: '2', tag: 'ABRINDO UM MEI', pos: '40% 60%'},
  {s: T.p3, e: T.cada, img: 'img29/autonomo-familia.png', n: '3', tag: 'PLANO NO SEU NOME', pos: '50% 60%'},
  {s: T.cada, e: 99, img: null},
];
const cur = (t: number) => SC.find((s) => t >= s.s && t < s.e) ?? SC[SC.length - 1];
const FACE = {x: 540, y: 600}; // face centre in the avatar frame
const CIRC = {cx: 540, cy: 430, d: 380};

const Avatar: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS; const sc = cur(t);
  const k = f - fr(sc.s);
  const inClip = !!sc.img;
  const prev = SC[SC.indexOf(sc) - 1];
  const ease = interpolate(k, [0, 12], [0, 1], {...cl, easing: Easing.inOut(Easing.cubic)});
  const p = inClip ? (prev && prev.img ? 1 : ease) : (prev && prev.img ? 1 - ease : 0);
  const S = 0.62;
  const R = interpolate(p, [0, 1], [1200, CIRC.d / 2]);
  const scale = interpolate(p, [0, 1], [1 + interpolate(f, [0, DURF], [0, 0.05]), S]);
  const tx = interpolate(p, [0, 1], [0, CIRC.cx - FACE.x * S - (540 - 540 * S)]);
  const ty = interpolate(p, [0, 1], [0, CIRC.cy - FACE.y * S - (960 - 960 * S)]);
  return (
    <AbsoluteFill style={{clipPath: `circle(${R}px at ${CIRC.cx}px ${interpolate(p, [0, 1], [960, CIRC.cy])}px)`}}>
      <AbsoluteFill style={{transform: `translate(${tx}px,${ty}px) scale(${scale})`}}>
        <OffthreadVideo src={staticFile('avatar29.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
const Ring: React.FC = () => {
  const f = useCurrentFrame(); const sc = cur(f / FPS);
  if (!sc.img) return null;
  const prev = SC[SC.indexOf(sc) - 1];
  const p = prev && prev.img ? 1 : interpolate(f - fr(sc.s), [6, 16], [0, 1], cl);
  const r = CIRC.d / 2 + 12;
  return (
    <div style={{position: 'absolute', left: CIRC.cx - r, top: CIRC.cy - r, width: r * 2, height: r * 2, borderRadius: '50%', opacity: p,
      background: `conic-gradient(from ${f * 3}deg, ${GOLD}, #7a4f12, ${GOLD2}, #fff6cf, ${GOLD})`, WebkitMask: `radial-gradient(circle, transparent ${r - 10}px, black ${r - 9}px)`, boxShadow: '0 0 40px rgba(245,184,0,.55)'}} />
  );
};
// blurred backdrop + sharp photo card for each path
const Scenes: React.FC = () => (
  <>
    {SC.filter((s) => s.img).map((s, i) => (
      <Sequence key={i} from={fr(s.s)} durationInFrames={Math.max(1, fr(s.e) - fr(s.s))}>
        <PathScene sc={s} len={fr(s.e) - fr(s.s)} />
      </Sequence>
    ))}
  </>
);
const PathScene: React.FC<{sc: typeof SC[0]; len: number}> = ({sc, len}) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, len], [1.05, 1.16]);
  const p = spring({frame: f - 4, fps: FPS, config: {damping: 18, stiffness: 110}});
  const np = spring({frame: f - 8, fps: FPS, config: {damping: 16, stiffness: 90}});
  const sweep = interpolate(f, [8, 40], [-20, 130], cl);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{overflow: 'hidden'}}>
        <Img src={staticFile(sc.img!)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: sc.pos, transform: `scale(${z * 1.1})`, filter: 'blur(26px) sepia(.3) brightness(.45)'}} />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 60, top: 720, width: 960, height: 540, borderRadius: 34, overflow: 'hidden', border: `3px solid ${GOLD}`, boxShadow: '0 30px 80px rgba(0,0,0,.7), 0 0 40px rgba(245,184,0,.35)',
        opacity: p, transform: `perspective(1400px) rotateX(${(1 - p) * 18}deg) translateY(${(1 - p) * 120}px) scale(${0.9 + 0.1 * p})`}}>
        <Img src={staticFile(sc.img!)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})`, filter: 'sepia(.15) saturate(1.05) contrast(1.05)'}} />
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,.7))'}} />
      </div>
      <div style={{position: 'absolute', left: 120, top: 400, transform: `scale(${np}) rotate(${(1 - np) * -20}deg)`, transformOrigin: '30% 70%', perspective: 900}}>
        <Gold3D text={sc.n!} size={230} rotY={-18 + Math.sin(f / 18) * 6} rotX={6} sweep={sweep} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1200, textAlign: 'center'}}>
        <div style={{display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 40}px)`, padding: '10px 34px 12px', borderRadius: 40, background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, boxShadow: '0 0 40px rgba(245,184,0,.55)', fontFamily: F, fontWeight: 800, fontSize: 46, color: '#000'}}>{sc.tag}</div>
      </div>
    </AbsoluteFill>
  );
};
// detail chips inside the photo card
const Chip: React.FC<{from: number; to: number; text: string; top: number; big?: boolean}> = ({from, to, text, top, big}) => {
  const f = useCurrentFrame();
  if (f < fr(from) || f > fr(to) + 6) return null;
  const p = sp(f, from, 16, 130);
  const o = interpolate(f, [fr(to), fr(to) + 6], [1, 0], cl);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top, textAlign: 'center', opacity: o * p}}>
      <div style={{display: 'inline-block', transform: `translateY(${(1 - p) * 30}px) scale(${0.85 + 0.15 * p})`, padding: big ? '14px 34px' : '10px 28px', borderRadius: 30, background: 'rgba(10,8,4,.62)', backdropFilter: 'blur(12px)', border: `2px solid ${GOLD}`, fontFamily: F, fontWeight: 800, fontSize: big ? 54 : 40, color: '#fff', boxShadow: '0 14px 40px rgba(0,0,0,.6)'}}>{text}</div>
    </div>
  );
};
const N180: React.FC = () => {
  const f = useCurrentFrame();
  const a = T.n180, b = T.emp - 0.1;
  if (f < fr(a) - 2 || f > fr(b) + 6) return null;
  const p = sp(f, a, 14, 120);
  const o = interpolate(f, [fr(b), fr(b) + 6], [1, 0], cl);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 830, display: 'flex', justifyContent: 'center', opacity: o}}>
      <div style={{textAlign: 'center', padding: '18px 40px 24px', borderRadius: 34, background: 'rgba(10,8,4,.6)', backdropFilter: 'blur(12px)', border: `2px solid ${GOLD}`, transform: `scale(${0.7 + 0.3 * p})`, opacity: p}}>
        <div style={{fontFamily: F, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: ACC}}>CNPJ ATIVO HÁ</div>
        <div style={{display: 'flex', justifyContent: 'center', perspective: 900}}><Gold3D text="180" size={170} rotY={Math.sin(f / 16) * 10} sweep={interpolate(f - fr(a), [0, 30], [-20, 130], cl)} /></div>
        <div style={{fontFamily: F, fontWeight: 800, fontSize: 48, color: '#fff', marginTop: -6}}>DIAS</div>
      </div>
    </div>
  );
};
// hook
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const b = fr(T.p1) - 2;
  if (f > b + 6) return null;
  const p1 = sp(f, 0.25, 14, 140), p2 = sp(f, 0.85, 14, 150), p3 = sp(f, T.tres, 13, 120);
  const o = interpolate(f, [b, b + 6], [1, 0], cl);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 960, textAlign: 'center', opacity: o}}>
      <div style={{fontFamily: F, fontWeight: 800, fontSize: 108, lineHeight: 1, color: '#fff', transform: `scale(${0.7 + 0.3 * p1})`, opacity: p1, textShadow: `0 6px 0 #7a4f12, 0 18px 40px rgba(0,0,0,.85)`}}>AUTÔNOMO</div>
      <div style={{display: 'inline-block', marginTop: 14, padding: '6px 30px', borderRadius: 20, background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, fontFamily: F, fontWeight: 800, fontSize: 62, color: '#000', transform: `rotate(-2deg) scale(${p2})`, boxShadow: '0 0 50px rgba(245,184,0,.6)'}}>TAMBÉM PODE TER PLANO</div>
      {f >= fr(T.tres) - 1 && (
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, marginTop: 26, transform: `scale(${0.6 + 0.4 * p3})`, opacity: p3}}>
          <div style={{perspective: 900}}><Gold3D text="3" size={190} rotY={-14 + Math.sin(f / 16) * 6} sweep={interpolate(f - fr(T.tres), [0, 30], [-20, 130], cl)} /></div>
          <div style={{fontFamily: F, fontWeight: 800, fontSize: 84, color: '#fff', textShadow: '0 6px 20px #000'}}>CAMINHOS</div>
        </div>
      )}
    </div>
  );
};
// closing: rules vary + I show you
const Varia: React.FC = () => {
  const f = useCurrentFrame();
  const a = fr(T.cada), b = fr(T.comenta) - 2;
  if (f < a || f > b + 6) return null;
  const o = interpolate(f, [b, b + 6], [1, 0], cl);
  const items: [number, string][] = [[T.regras, 'REGRAS'], [T.valores, 'VALORES']];
  const mp = sp(f, T.mostro, 15, 130);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center', opacity: o}}>
      <div style={{fontFamily: F, fontWeight: 700, fontSize: 30, letterSpacing: 5, color: ACC, marginBottom: 14, textShadow: '0 2px 8px #000', opacity: sp(f, T.cada)}}>MUDAM EM CADA CAMINHO</div>
      <div style={{display: 'flex', justifyContent: 'center', gap: 18}}>
        {items.map(([t, l], i) => { const p = sp(f, t, 16, 140); return (
          <div key={i} style={{opacity: f >= fr(t) ? p : 0, transform: `translateY(${(1 - p) * 40}px)`, padding: '10px 28px', borderRadius: 40, background: 'rgba(10,8,4,.55)', backdropFilter: 'blur(10px)', border: `2px solid ${GOLD}`, fontFamily: F, fontWeight: 800, fontSize: 40, color: '#fff'}}>{l}</div>); })}
      </div>
      {f >= fr(T.mostro) && <div style={{display: 'inline-block', marginTop: 24, padding: '12px 32px', borderRadius: 40, background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, fontFamily: F, fontWeight: 800, fontSize: 44, color: '#000', transform: `scale(${0.7 + 0.3 * mp})`, opacity: mp, boxShadow: '0 0 40px rgba(245,184,0,.6)'}}>EU TE MOSTRO O CERTO<br />PRO SEU PERFIL</div>}
    </div>
  );
};

const Atmosphere: React.FC = () => {
  const f = useCurrentFrame();
  const lx = 50 + Math.sin(f / 40) * 40, ly = 20 + Math.cos(f / 55) * 15;
  return (
    <>
      <AbsoluteFill style={{background: `radial-gradient(circle at ${lx}% ${ly}%, rgba(245,184,0,.16), rgba(0,0,0,0) 45%)`, mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.5) 0%, rgba(0,0,0,0) 16%, rgba(0,0,0,0) 45%, rgba(0,0,0,.5) 62%, rgba(0,0,0,.85) 100%)'}} />
      <AbsoluteFill style={{boxShadow: 'inset 0 0 220px rgba(0,0,0,.7)'}} />
    </>
  );
};
// flash on every scene change
const Flash: React.FC = () => {
  const f = useCurrentFrame();
  let o = 0;
  SC.slice(1).forEach((s) => { const d = f - fr(s.s); if (d >= 0 && d < 8) o = Math.max(o, interpolate(d, [0, 2, 8], [0, 0.45, 0])); });
  return o > 0 ? <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #fff6cf, rgba(245,184,0,.6) 40%, rgba(0,0,0,0) 75%)', opacity: o, mixBlendMode: 'screen'}} /> : null;
};

const Particles: React.FC<{from: number; to: number; cx: number; cy: number; n?: number}> = ({from, to, cx, cy, n = 30}) => {
  const f = useCurrentFrame();
  if (f < fr(from) || f > fr(to)) return null;
  const k = f - fr(from);
  return (
    <>
      {Array.from({length: n}).map((_, i) => {
        const a = random('a' + i) * Math.PI * 2, v = 3 + random('v' + i) * 7;
        const life = (k * (0.5 + random('l' + i))) % 60;
        const x = cx + Math.cos(a) * v * life, y = cy + Math.sin(a) * v * life - life * 2;
        const o = interpolate(life, [0, 6, 60], [0, 1, 0]);
        const sz = 3 + random('s' + i) * 6;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: sz, height: sz, borderRadius: '50%', background: GOLD2, opacity: o, boxShadow: `0 0 ${sz * 3}px ${GOLD}`}} />;
      })}
    </>
  );
};

const HIDE: {s: number; e: number}[] = [{s: 0, e: T.p1 - 0.05}, {s: T.comenta - 0.1, e: 99}];
const hidden = (t: number) => HIDE.some((b) => t >= b.s && t < b.e);
const SEGN = Math.max(...WS.map((w) => w.seg)) + 1;
const chunks = (() => {
  const out: {ws: W[]; s: number; e: number; seg: number}[] = [];
  for (let si = 0; si < SEGN; si++) {
    const ws = WS.filter((w) => w.seg === si && !hidden(w.s + 0.02));
    for (let i = 0; i < ws.length; i += 3) { const c = ws.slice(i, i + 3); out.push({ws: c, s: c[0].s, e: c[c.length - 1].e, seg: si}); }
  }
  return out;
})();
const Captions: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  if (hidden(t)) return null;
  const ci = chunks.findIndex((c, i) => t >= c.s - 0.04 && t < Math.min(c.e + 0.35, i + 1 < chunks.length ? chunks[i + 1].s - 0.04 : 99));
  if (ci < 0) return null;
  const c = chunks[ci];
  const p = sp(f, c.s - 0.04, 14, 220);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 1320, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', transform: `translateY(${(1 - p) * 24}px) scale(${0.88 + 0.12 * p})`, opacity: p}}>
      {c.ws.map((w, i) => {
        const act = t >= w.s - 0.02 && t < w.e + 0.08;
        return (
          <span key={i} style={{fontFamily: F, fontWeight: 800, fontSize: 62, margin: '0 15px', textTransform: 'uppercase', color: KEY.test(w.t) ? GOLD : '#fff', display: 'inline-block', transform: `scale(${act ? 1.1 : 1})`, textShadow: '0 4px 0 rgba(0,0,0,.95), 0 0 26px rgba(0,0,0,.95)', borderBottom: act ? `6px solid ${GOLD2}` : '6px solid transparent'}}>{w.t.replace(/[.,:]$/, '')}</span>
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
        <div style={{width: `${(f / DURF) * 100}%`, height: '100%', background: `linear-gradient(90deg, #b07a18, ${GOLD2})`, borderRadius: 3, boxShadow: '0 0 12px rgba(245,184,0,.8)'}} />
      </div>
      <div style={{position: 'absolute', right: 50, top: 175, display: 'flex', alignItems: 'center', gap: 12, opacity: p}}>
        <div style={{textAlign: 'right', fontFamily: F, fontWeight: 700, fontSize: 26, color: '#fff', lineHeight: 1.1, textShadow: '0 2px 8px #000'}}>BONI<br /><span style={{fontWeight: 600, fontSize: 18, color: GOLD2, textShadow: '0 1px 6px #000'}}>Planos de Saúde</span></div>
        <Img src={staticFile('emblema.png')} style={{width: 64, height: 64, objectFit: 'contain'}} />
      </div>
      <div style={{position: 'absolute', left: 50, top: 180, opacity: p, padding: '6px 16px', borderRadius: 30, border: `2px solid ${GOLD}`, background: 'rgba(10,8,4,.6)', fontFamily: F, fontWeight: 700, fontSize: 20, color: '#fff', letterSpacing: 2}}>AUTÔNOMO · SEM CNPJ</div>
    </>
  );
};

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const at0 = T.comenta - 0.1; const a = fr(at0);
  if (f < a) return null;
  const p = sp(f, at0, 16, 120);
  const bob = Math.sin((f - a) / 4) * 5;
  const sweep = interpolate((f - a) % 34, [0, 20], [-40, 140], cl);
  return (
    <>
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,${0.85 * p}) 75%)`}} />
      <div style={{position: 'absolute', left: 70, right: 70, top: 1040, padding: '26px 20px 22px', borderRadius: 36, background: 'rgba(10,8,4,.82)', border: `2px solid rgba(245,184,0,.75)`, backdropFilter: 'blur(14px)', textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 120}px)`, boxShadow: '0 0 50px rgba(245,184,0,.3)'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, marginBottom: 18}}>
          <div style={{fontFamily: F, fontWeight: 800, fontSize: 34, color: '#fff', textAlign: 'left', lineHeight: 1.1}}>Autônomo sem CNPJ<br /><span style={{color: GOLD2}}>tem caminho, sim</span></div>
          <div style={{width: 2, height: 60, background: 'rgba(255,255,255,.4)'}} />
          <Img src={staticFile('emblema.png')} style={{width: 76, height: 76, objectFit: 'contain'}} />
        </div>
        <div style={{position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 14, background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, padding: '14px 36px', borderRadius: 60, overflow: 'hidden', transform: `translateY(${bob}px)`, boxShadow: '0 0 50px rgba(245,184,0,.6)'}}>
          <span style={{fontFamily: F, fontWeight: 800, fontSize: 50, color: '#000'}}>Comenta AUTÔNOMO</span>
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
    {SC.slice(1).map((s, i) => <Sequence key={'w' + i} from={Math.max(0, fr(s.s) - 2)}><Audio src={staticFile('whoosh.wav')} volume={0.35} /></Sequence>)}
    {[T.tres, T.n180].map((t, i) => <Sequence key={'b' + i} from={fr(t)}><Audio src={staticFile('boom.wav')} volume={0.5} /></Sequence>)}
    {[T.cart, T.dipl, T.emp, T.fam, T.mostro].map((t, i) => <Sequence key={'p' + i} from={fr(t)}><Audio src={staticFile('pop.wav')} volume={0.4} /></Sequence>)}
  </>
);

export const Auto: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <style>{fontCss}</style>
    <Scenes />
    <Avatar />
    <Ring />
    <Atmosphere />
    <Flash />
    <Brand />
    <Hook />
    <Chip from={T.cart} to={T.p2 - 0.1} text="CARTEIRA DO CONSELHO" top={900} />
    <Chip from={T.dipl} to={T.p2 - 0.1} text="OU DIPLOMA" top={990} />
    <N180 />
    <Chip from={T.emp} to={T.p3 - 0.1} text="PLANO EMPRESARIAL" top={940} big />
    <Chip from={T.fam} to={T.cada - 0.1} text="VOCÊ + FAMÍLIA" top={940} big />
    <Varia />
    <Captions />
    <EndCard />
    <Particles from={T.comenta} to={DURF / FPS} cx={540} cy={1150} />
    <Audio src={staticFile('music.mp3')} volume={(x) => interpolate(x, [0, 10, DURF - 20, DURF], [0, 0.1, 0.1, 0], cl)} />
    <Sfx />
  </AbsoluteFill>
);
