import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Freeze, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing} from 'remotion';

const FPS = 30;
const GOLD = '#F5B800';
const GOLD2 = '#FFE08A';
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const fr = (s: number) => Math.round(s * FPS);
const AV_END = 17.9;
export const DUR_RH = fr(AV_END + 1.5);

// palavras (ElevenLabs scribe): [texto, início, fim]
const W: [string, number, number][] = [['Seu',0.3,0.43],['RH',0.47,0.77],['perde',0.81,1.02],['a',1.1,1.15],['manhã',1.2,1.37],['ligando',1.41,1.66],['pra',1.71,1.79],['operadora?',1.84,2.26],['Funcionário',2.69,3.24],['novo',3.29,3.46],['pra',3.54,3.67],['incluir,',3.71,4.05],['outro',4.35,4.61],['saiu',4.69,4.91],['pra',4.95,5.03],['excluir.',5.08,5.42],['Dúvida',5.85,6.1],['de',6.14,6.19],['carteirinha,',6.23,6.87],['de',7.21,7.25],['boleto,',7.34,7.77],['de',8.11,8.19],['rede.',8.32,8.62],['Com',9.04,9.21],['a',9.26,9.3],['gente,',9.34,9.51],['você',9.81,10.03],['manda',10.07,10.24],['uma',10.28,10.37],['mensagem,',10.41,10.88],['e',11.05,11.09],['eu',11.13,11.26],['cuido',11.3,11.56],['disso',11.6,11.86],['junto',11.99,12.16],['à',12.2,12.24],['operadora.',12.29,12.76],['Menos',13.31,13.57],['ligação,',13.61,14.08],['menos',14.29,14.55],['papel.',14.59,14.89],['Comenta',15.4,15.66],['RH,',15.79,16.04],['que',16.21,16.25],['eu',16.3,16.38],['te',16.43,16.47],['explico',16.51,16.77],['como',16.81,16.94],['funciona.',16.98,17.36]];

const SCENES = [
  {a: 0, b: 2.65, bg: 'rh-telefone', fx: 0.5},
  {a: 2.65, b: 5.8, bg: 'rh-fichas', fx: 0.5},
  {a: 5.8, b: 9.0, bg: 'rh-carteirinha', fx: 0.5},
  {a: 9.0, b: 13.2, bg: 'celular-aceso', fx: 0.5},
  {a: 13.2, b: 15.3, bg: 'rh-mesa-limpa', fx: 0.5},
  {a: 15.3, b: 99, bg: 'ep4-celular', fx: 0.5},
];

const fontCss = `
@font-face{font-family:Poppins;font-weight:800;src:url(${staticFile('Poppins-Bold.ttf')})}
@font-face{font-family:Poppins;font-weight:500;src:url(${staticFile('Poppins-Medium.ttf')})}`;

// ---------- ícones ----------
const sv = {fill: 'none', stroke: GOLD, strokeWidth: 3.5, strokeLinecap: 'round', strokeLinejoin: 'round'} as const;
const IBuilding = () => <svg width="76" height="76" viewBox="0 0 64 64"><path {...sv} d="M12 56V14l24-6v48M36 24h16v32M4 56h56M20 22h8M20 32h8M20 42h8M42 34h4M42 44h4" /></svg>;
const IPeople = () => <svg width="76" height="76" viewBox="0 0 64 64"><circle {...sv} cx="22" cy="22" r="8" /><circle {...sv} cx="44" cy="24" r="7" /><path {...sv} d="M6 54c0-10 7-16 16-16s16 6 16 16M38 40c9-2 20 2 20 14" /></svg>;
const IShield = () => <svg width="76" height="76" viewBox="0 0 64 64"><path {...sv} d="M32 6l20 8v16c0 14-9 24-20 28C21 54 12 44 12 30V14z" /><path {...sv} d="M32 22v20M22 32h20" /></svg>;
const IPay = () => <svg width="76" height="76" viewBox="0 0 64 64"><rect {...sv} x="12" y="6" width="40" height="52" rx="5" /><path {...sv} d="M20 18h24M20 28h24M20 38h12" /><path {...sv} d="M38 44l6 6 10-12" /></svg>;
const ICheck = () => <svg width="76" height="76" viewBox="0 0 64 64"><circle {...sv} cx="32" cy="32" r="26" /><path {...sv} strokeWidth={6} d="M19 33l9 9 18-20" /></svg>;
const IQuest = () => <svg width="76" height="76" viewBox="0 0 64 64"><circle {...sv} cx="32" cy="32" r="26" /><path {...sv} strokeWidth={5} d="M24 25c0-5 4-8 8-8s8 3 8 7c0 6-8 6-8 12M32 46v2" /></svg>;
const IDown = () => <svg width="76" height="76" viewBox="0 0 64 64"><path {...sv} strokeWidth={5} d="M10 18l18 18 10-10 16 16M54 42v-14H40" /></svg>;
const IDoc = () => <svg width="76" height="76" viewBox="0 0 64 64"><path {...sv} d="M16 6h22l12 12v40H16z M38 6v12h12M24 30h20M24 40h20M24 50h12" /></svg>;
const IPhone = () => <svg width="76" height="76" viewBox="0 0 64 64"><rect {...sv} x="18" y="6" width="28" height="52" rx="6" /><path {...sv} d="M28 50h8" /></svg>;

// ---------- vidro ----------
type Variant = 'tile' | 'seal' | 'wide';
const Glass: React.FC<{at: number; out?: number; x: number; y: number; icon: React.ReactNode; label: string; sub?: string; variant?: Variant; w?: number; accent?: string; tilt?: number}> = ({at, out = 99, x, y, icon, label, sub, variant = 'tile', w, accent = GOLD, tilt = 0}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const s = spring({frame: f - fr(at), fps: FPS, config: {damping: 13, stiffness: 150}});
  const o = interpolate(t, [out - 0.25, out], [1, 0], cl);
  if (t < at - 0.05 || o <= 0) return null;
  const float = Math.sin((f - fr(at)) / 22) * 7;
  const sweep = interpolate((f - fr(at)) % 90, [10, 50], [-40, 140], cl);
  const width = w ?? (variant === 'wide' ? 760 : variant === 'seal' ? 280 : 310);
  const common: React.CSSProperties = {position: 'absolute', left: x - width / 2, top: y + float + (1 - s) * 50, width, opacity: s * o, transform: `scale(${0.8 + 0.2 * s}) rotate(${tilt}deg)`};
  const plate: React.CSSProperties = {position: 'relative', borderRadius: variant === 'seal' ? 999 : 34, overflow: 'hidden', background: 'linear-gradient(150deg, rgba(255,255,255,.34), rgba(255,255,255,.10) 50%, rgba(255,255,255,.04))', backdropFilter: 'blur(18px) saturate(1.5)', border: '1.5px solid rgba(255,255,255,.55)', boxShadow: `inset 0 1px 0 rgba(255,255,255,.7), inset 0 -22px 44px rgba(0,0,0,.35), 0 24px 50px rgba(0,0,0,.55), 0 0 40px ${accent}44`};
  const shine = <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep}%`, width: '22%', background: 'linear-gradient(100deg, transparent, rgba(255,255,255,.35), transparent)', transform: 'skewX(-18deg)'}} />;
  if (variant === 'wide') {
    return (
      <div style={common}><div style={{...plate, display: 'flex', alignItems: 'center', gap: 26, padding: '22px 34px'}}>
        {shine}{icon}
        <div><div style={{fontFamily: 'Poppins', fontWeight: 800, fontSize: 46, lineHeight: 1.05, color: '#fff'}}>{label}</div>{sub && <div style={{fontFamily: 'Poppins', fontWeight: 500, fontSize: 28, color: GOLD2, marginTop: 4}}>{sub}</div>}</div>
      </div></div>
    );
  }
  if (variant === 'seal') {
    return (
      <div style={common}><div style={{...plate, height: width, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `3px solid ${accent}`}}>
        {shine}{icon}<div style={{fontFamily: 'Poppins', fontWeight: 800, fontSize: 28, color: '#fff', marginTop: 6, textAlign: 'center', lineHeight: 1.05}}>{label}</div>
      </div></div>
    );
  }
  return (
    <div style={common}><div style={{...plate, padding: '26px 14px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
      {shine}{icon}
      <div style={{fontFamily: 'Poppins', fontWeight: 800, fontSize: 36, lineHeight: 1.05, color: '#fff', textAlign: 'center'}}>{label}</div>
      {sub && <div style={{fontFamily: 'Poppins', fontWeight: 500, fontSize: 26, color: GOLD2, textAlign: 'center'}}>{sub}</div>}
    </div></div>
  );
};

const Arrow: React.FC<{at: number; out?: number; x: number; y: number; w?: number}> = ({at, out = 99, x, y, w = 70}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const p = interpolate(t, [at, at + 0.3], [0, 1], {...cl, easing: Easing.out(Easing.cubic)});
  const o = interpolate(t, [out - 0.25, out], [1, 0], cl);
  return (
    <svg style={{position: 'absolute', left: x - w / 2, top: y - 20, opacity: p * o}} width={w} height={40} viewBox="0 0 70 40">
      <path d={`M4 20H${4 + 56 * p}`} stroke={GOLD} strokeWidth={6} strokeLinecap="round" />
      <path d="M50 8l14 12-14 12" stroke={GOLD} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={p} />
    </svg>
  );
};

const Giant: React.FC<{at: number; out: number; text: string; size: number; y: number; c?: string}> = ({at, out, text, size, y, c = GOLD}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const s = spring({frame: f - fr(at), fps: FPS, config: {damping: 12, stiffness: 170}});
  const o = interpolate(t, [out - 0.2, out], [1, 0], cl);
  if (t < at - 0.05 || o <= 0) return null;
  return <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', fontFamily: 'Poppins', fontWeight: 800, fontSize: size, lineHeight: 1, color: c, opacity: s * o, transform: `scale(${0.6 + 0.4 * s})`, textShadow: c === GOLD ? `0 0 60px ${GOLD}aa, 0 6px 30px #000` : '0 6px 30px #000'}}>{text}</div>;
};

// ---------- fundo da metade de cima ----------
const TopBg: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 960, overflow: 'hidden', background: '#000'}}>
      {SCENES.map((sc, i) => {
        const o = interpolate(t, [sc.a - 0.2, sc.a + 0.15, sc.b - 0.15, sc.b + 0.2], [i === 0 ? 1 : 0, 1, 1, i === SCENES.length - 1 ? 1 : 0], cl);
        if (o <= 0) return null;
        const z = 1.06 + (t - sc.a) * 0.012;
        return <Img key={i} src={staticFile(`rh/${sc.bg}.jpg`)} style={{position: 'absolute', inset: 0, width: 1080, height: 960, objectFit: 'cover', objectPosition: `${sc.fx * 100}% 50%`, transform: `scale(${z})`, opacity: o, filter: 'brightness(.62) contrast(1.1) saturate(1.15) sepia(.22)'}} />;
      })}
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg,rgba(0,0,0,.55),rgba(0,0,0,.1) 40%,rgba(0,0,0,.6)), radial-gradient(circle at 50% 70%, ${GOLD}2a, transparent 60%)`}} />
    </div>
  );
};

// ---------- legenda 2-3 palavras ----------
const groups = (() => {
  const g: {t: string; a: number; b: number}[] = [];
  let cur: typeof W = [];
  const flush = () => { if (cur.length) { g.push({t: cur.map((x) => x[0]).join(' '), a: cur[0][1], b: cur[cur.length - 1][2]}); cur = []; } };
  for (const w of W) {
    cur.push(w);
    if (cur.length >= 3 || /[.,?:]$/.test(w[0])) flush();
  }
  flush();
  return g;
})();

const Legend: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const g = groups.find((x, i) => t >= x.a - 0.05 && t < (groups[i + 1]?.a ?? x.b + 0.3) - 0.01);
  if (!g || t > 15.3) return null;
  const txt = g.t.replace(/["]/g, '').toUpperCase();
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: 850, display: 'flex', justifyContent: 'center'}}>
      <div style={{padding: '6px 26px', fontFamily: 'Poppins', fontWeight: 800, fontSize: 50, color: '#fff', textShadow: '0 4px 20px #000, 0 0 30px #000', whiteSpace: 'nowrap', background: 'rgba(0,0,0,.35)', borderRadius: 20}}>{txt}</div>
    </div>
  );
};

// ---------- cenas (elementos da metade de cima) ----------
const Elements: React.FC = () => {
  return (
    <>
      <Giant at={0.3} out={2.65} text="SEU RH" size={150} y={300} c="#fff" />
      <Giant at={1.15} out={2.65} text="PERDE A MANHÃ" size={92} y={470} />
      <Glass at={1.84} out={2.65} x={540} y={650} variant="wide" w={640} icon={<IPhone />} label="LIGAÇÃO" sub="pra operadora" />
      <Glass at={3.3} out={5.8} x={540} y={290} variant="wide" w={620} icon={<IPeople />} label="INCLUIR" sub="funcionário novo" />
      <Glass at={4.4} out={5.8} x={540} y={570} variant="wide" w={620} icon={<IDown />} label="EXCLUIR" sub="quem saiu" accent={GOLD2} />
      <Glass at={6.2} out={9.0} x={175} y={330} w={320} icon={<IShield />} label="CARTEIRINHA" tilt={-3} />
      <Glass at={7.3} out={9.0} x={540} y={330} w={300} icon={<IPay />} label="BOLETO" />
      <Glass at={8.3} out={9.0} x={905} y={330} w={300} icon={<IBuilding />} label="REDE" tilt={3} />
      <Glass at={10.07} out={13.2} x={540} y={300} variant="wide" w={700} icon={<IPhone />} label="UMA MENSAGEM" />
      <Giant at={11.1} out={13.2} text="EU CUIDO" size={150} y={560} />
      <Giant at={13.31} out={15.3} text="MENOS LIGAÇÃO" size={84} y={330} c="#fff" />
      <Giant at={14.29} out={15.3} text="MENOS PAPEL" size={100} y={480} />
    </>
  );
};

const End: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const a = spring({frame: f - fr(15.4), fps: FPS, config: {damping: 13, stiffness: 150}});
  const b = spring({frame: f - fr(15.8), fps: FPS, config: {damping: 11, stiffness: 160}});
  const glow = 0.5 + 0.5 * Math.sin(f / 6);
  if (t < 15.3) return null;
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: 'Poppins', fontWeight: 800, fontSize: 84, color: '#fff', opacity: a, transform: `scale(${0.85 + 0.15 * a})`, textShadow: '0 6px 30px #000'}}>COMENTA</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 410, display: 'flex', justifyContent: 'center', opacity: b, transform: `scale(${0.7 + 0.3 * b})`}}>
        <div style={{padding: '16px 56px', borderRadius: 28, background: GOLD, boxShadow: `0 0 ${50 + 40 * glow}px ${GOLD}aa`, fontFamily: 'Poppins', fontWeight: 800, fontSize: 170, color: '#000'}}>RH</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', fontFamily: 'Poppins', fontWeight: 500, fontSize: 36, color: '#fff', opacity: b, textShadow: '0 4px 18px #000'}}>Eu te explico como funciona</div>
      <div style={{position: 'absolute', left: 50, right: 50, top: 790, textAlign: 'center', fontFamily: 'Poppins', fontWeight: 500, fontSize: 26, lineHeight: 1.3, color: '#ffffffdd', textShadow: '0 3px 14px #000', opacity: interpolate(t, [16.5, 16.9], [0, 1], cl)}}>
        Carências, rede e valores variam por operadora e produto.
      </div>
    </>
  );
};

// ---------- avatar embaixo ----------
const Avatar: React.FC = () => {
  const f = useCurrentFrame();
  const z = 1.0 + f * 0.00012;
  return (
    <div style={{position: 'absolute', left: 0, top: 960, width: 1080, height: 960, overflow: 'hidden', background: '#000'}}>
      <div style={{position: 'absolute', left: 0, top: -300, width: 1080, height: 1920, transform: `scale(${z})`, transformOrigin: '50% 30%', filter: 'saturate(1.1) contrast(1.05) sepia(.14) brightness(1.02)'}}>
        <Sequence from={0} durationInFrames={fr(AV_END) - 2}><OffthreadVideo src={staticFile('rh/avatar.mp4')} style={{width: 1080, height: 1920, objectFit: 'cover'}} /></Sequence>
        <Sequence from={fr(AV_END) - 2}><Freeze frame={fr(AV_END) - 3}><OffthreadVideo muted src={staticFile('rh/avatar.mp4')} style={{width: 1080, height: 1920, objectFit: 'cover'}} /></Freeze></Sequence>
      </div>
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 30%, ${GOLD}1f, transparent 60%)`}} />
    </div>
  );
};

export const Rh: React.FC = () => {
  const f = useCurrentFrame();
  const flash = SCENES.slice(1).reduce((m, sc) => Math.max(m, interpolate(f / FPS - sc.a, [0, 0.08, 0.3], [0, 0.35, 0], cl)), 0);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <style>{fontCss}</style>
      <Audio src={staticFile('rh/musica_b.mp3')} volume={0.09} />
      <TopBg />
      <Elements />
      <End />
      <Legend />
      <Avatar />
      <div style={{position: 'absolute', left: 0, top: 954, width: 1080, height: 12, background: `linear-gradient(90deg, transparent, ${GOLD2}, ${GOLD}, ${GOLD2}, transparent)`, boxShadow: `0 0 30px ${GOLD}`}} />
      <AbsoluteFill style={{background: '#fff', opacity: flash, mixBlendMode: 'overlay' as const}} />
    </AbsoluteFill>
  );
};
