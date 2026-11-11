import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Freeze, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing} from 'remotion';

const FPS = 30;
const GOLD = '#F5B800';
const GOLD2 = '#FFE08A';
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const fr = (s: number) => Math.round(s * FPS);
const AV_END = 19.32;
export const DUR_RET = fr(AV_END + 1.5);

// palavras (ElevenLabs scribe): [texto, início, fim]
const W: [string, number, number][] = [
  ['Você', 0.32, 0.52],
  ['contrata,', 0.56, 1.06],
  ['treina', 1.3, 1.6],
  ['e', 2.0, 2.04],
  ['a', 2.06, 2.12],
  ['pessoa', 2.14, 2.4],
  ['vai', 2.44, 2.5],
  ['embora.', 2.52, 2.84],
  ['Hoje', 3.66, 3.82],
  ['o', 3.84, 3.9],
  ['colaborador', 3.94, 4.52],
  ['olha', 4.7, 4.82],
  ['além', 4.86, 5.08],
  ['do', 5.12, 5.16],
  ['salário.', 5.24, 5.58],
  ['Ele', 5.92, 6.04],
  ['quer', 6.06, 6.2],
  ['saber', 6.24, 6.5],
  ['se', 6.58, 6.62],
  ['a', 6.62, 6.66],
  ['empresa', 6.68, 7.04],
  ['cuida', 7.06, 7.24],
  ['dele', 7.36, 7.6],
  ['e', 7.88, 7.92],
  ['da', 7.96, 8.06],
  ['família.', 8.1, 8.42],
  ['Plano', 8.78, 8.98],
  ['de', 9.0, 9.08],
  ['saúde', 9.12, 9.38],
  ['costuma', 9.42, 9.74],
  ['pesar', 9.76, 10.08],
  ['muito', 10.16, 10.38],
  ['nessa', 10.4, 10.6],
  ['conversa.', 10.62, 11.0],
  ['Não', 11.52, 11.6],
  ['garante', 11.64, 11.9],
  ['que', 11.94, 12.0],
  ['ninguém', 12.02, 12.3],
  ['saia,', 12.34, 12.6],
  ['mas', 12.92, 13.02],
  ['é', 13.0, 13.02],
  ['um', 13.04, 13.1],
  ['motivo', 13.12, 13.4],
  ['a', 13.46, 13.48],
  ['mais', 13.56, 13.78],
  ['pra', 13.8, 13.86],
  ['ficar.', 13.94, 14.18],
  ['E', 14.7, 14.74],
  ['dá', 14.8, 14.92],
  ['pra', 14.94, 14.98],
  ['oferecer', 15.02, 15.44],
  ['com', 15.5, 15.56],
  ['o', 15.58, 15.62],
  ['funcionário', 15.66, 16.06],
  ['contribuindo.', 16.08, 16.6],
  ['Comenta', 17.38, 17.64],
  ['"RH"', 17.7, 18.0],
  ['que', 17.86, 17.9],
  ['eu', 17.9, 17.94],
  ['te', 17.98, 18.06],
  ['mostro', 18.48, 18.76],
  ['como', 18.8, 18.98],
];

const SCENES = [
  {a: 0, b: 3.3, bg: 'demissao-caixa-mesa', fx: 0.5},
  {a: 3.3, b: 5.9, bg: 'dinheiro-calculadora-moedas', fx: 0.5},
  {a: 5.9, b: 8.6, bg: 'pessoas-familia-silhueta-janela', fx: 0.5},
  {a: 8.6, b: 11.3, bg: 'estetoscopio-coracao', fx: 0.5},
  {a: 11.3, b: 14.5, bg: 'generico-balanca', fx: 0.5},
  {a: 14.5, b: 17.1, bg: 'generico-assinatura-papeis', fx: 0.5},
  {a: 17.1, b: 99, bg: 'celular-aceso', fx: 0.5},
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

const IClock = () => <svg width="76" height="76" viewBox="0 0 64 64"><circle {...sv} cx="32" cy="32" r="26" /><path {...sv} d="M32 18v15l10 6" /></svg>;
const IDoor = () => <svg width="76" height="76" viewBox="0 0 64 64"><path {...sv} d="M14 56V8h26v48M8 56h48M46 30h10M52 24l6 6-6 6M32 32h2" /></svg>;
const IHeart = () => <svg width="76" height="76" viewBox="0 0 64 64"><path {...sv} d="M32 54C10 38 8 24 16 16c6-5 13-2 16 4 3-6 10-9 16-4 8 8 6 22-16 38z" /></svg>;
const IScale = () => <svg width="76" height="76" viewBox="0 0 64 64"><path {...sv} d="M32 8v46M18 54h28M12 20h40M12 20l-6 16h16zM52 20l-6 16h12z" /></svg>;

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
        return <Img key={i} src={staticFile(`ret/${sc.bg}.jpg`)} style={{position: 'absolute', inset: 0, width: 1080, height: 960, objectFit: 'cover', objectPosition: `${sc.fx * 100}% 50%`, transform: `scale(${z})`, opacity: o, filter: 'brightness(.62) contrast(1.1) saturate(1.15) sepia(.22)'}} />;
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
  if (!g || t > AV_END - 1.9) return null;
  const txt = g.t.replace(/["]/g, '').toUpperCase();
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: 850, display: 'flex', justifyContent: 'center'}}>
      <div style={{padding: '6px 26px', fontFamily: 'Poppins', fontWeight: 800, fontSize: 50, color: '#fff', textShadow: '0 4px 20px #000, 0 0 30px #000', whiteSpace: 'nowrap', background: 'rgba(0,0,0,.35)', borderRadius: 20}}>{txt}</div>
    </div>
  );
};

// ---------- cenas (elementos da metade de cima) ----------
const Elements: React.FC = () => {
  const Y = 300;
  return (
    <>
      {/* A: contrata, treina, vai embora */}
      <Glass at={0.32} out={3.3} x={190} y={Y} icon={<IPeople />} label="CONTRATA" tilt={-3} />
      <Arrow at={1.0} out={3.3} x={362} y={Y + 110} />
      <Glass at={1.3} out={3.3} x={540} y={Y + 70} icon={<IDoc />} label="TREINA" />
      <Arrow at={2.0} out={3.3} x={718} y={Y + 180} />
      <Glass at={2.14} out={3.3} x={895} y={Y + 140} icon={<IDoor />} label="VAI EMBORA" tilt={3} accent="#ff6b5a" />
      {/* B1: além do salário */}
      <Glass at={3.94} out={5.9} x={540} y={Y + 60} variant="wide" w={720} icon={<IDown />} label="ALÉM DO SALÁRIO" sub="o que o colaborador procura" />
      {/* B2: cuida dele e da família */}
      <Glass at={6.68} out={8.6} x={300} y={Y + 20} variant="seal" icon={<IPeople />} label="DELE" accent={GOLD2} />
      <Glass at={7.9} out={8.6} x={780} y={Y + 20} variant="seal" icon={<IHeart />} label="FAMÍLIA" accent={GOLD2} />
      <Giant at={7.1} out={8.6} text="A EMPRESA CUIDA" size={70} y={650} c="#fff" />
      {/* C: plano de saúde pesa */}
      <Glass at={9.12} out={11.3} x={540} y={Y + 20} variant="wide" w={700} icon={<IShield />} label="PLANO DE SAÚDE" sub="pesa na decisão" />
      <Giant at={9.76} out={11.3} text="PESA MUITO" size={110} y={600} />
      {/* D: motivo a mais */}
      <Glass at={11.64} out={14.5} x={540} y={Y} variant="wide" w={700} icon={<IScale />} label="NÃO GARANTE" sub="que ninguém saia" tilt={-1} />
      <Glass at={13.12} out={14.5} x={540} y={Y + 200} variant="wide" w={700} icon={<ICheck />} label="UM MOTIVO A MAIS" sub="pra ficar" accent={GOLD2} />
      {/* E: funcionário contribuindo */}
      <Glass at={15.02} out={17.1} x={300} y={Y + 20} icon={<IBuilding />} label="EMPRESA" sub="oferece" tilt={-3} />
      <Arrow at={15.9} out={17.1} x={540} y={Y + 130} w={80} />
      <Glass at={15.66} out={17.1} x={790} y={Y + 20} icon={<IPay />} label="FUNCIONÁRIO" sub="contribui" tilt={3} />
    </>
  );
};

const End: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const a = spring({frame: f - fr(17.3), fps: FPS, config: {damping: 13, stiffness: 150}});
  const b = spring({frame: f - fr(17.7), fps: FPS, config: {damping: 11, stiffness: 160}});
  const glow = 0.5 + 0.5 * Math.sin(f / 6);
  if (t < 17.1) return null;
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: 'Poppins', fontWeight: 800, fontSize: 84, color: '#fff', opacity: a, transform: `scale(${0.85 + 0.15 * a})`, textShadow: '0 6px 30px #000'}}>COMENTA</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 410, display: 'flex', justifyContent: 'center', opacity: b, transform: `scale(${0.7 + 0.3 * b})`}}>
        <div style={{padding: '16px 56px', borderRadius: 28, background: GOLD, boxShadow: `0 0 ${50 + 40 * glow}px ${GOLD}aa`, fontFamily: 'Poppins', fontWeight: 800, fontSize: 120, color: '#000'}}>RH</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', fontFamily: 'Poppins', fontWeight: 500, fontSize: 36, color: '#fff', opacity: b, textShadow: '0 4px 18px #000'}}>Eu te chamo no WhatsApp</div>
      <div style={{position: 'absolute', left: 50, right: 50, top: 790, textAlign: 'center', fontFamily: 'Poppins', fontWeight: 500, fontSize: 26, lineHeight: 1.3, color: '#ffffffdd', textShadow: '0 3px 14px #000', opacity: interpolate(t, [18.0, 18.4], [0, 1], cl)}}>
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
        <Sequence from={0} durationInFrames={fr(AV_END) - 2}><OffthreadVideo src={staticFile('ret/avatar.mp4')} style={{width: 1080, height: 1920, objectFit: 'cover'}} /></Sequence>
        <Sequence from={fr(AV_END) - 2}><Freeze frame={fr(AV_END) - 3}><OffthreadVideo muted src={staticFile('ret/avatar.mp4')} style={{width: 1080, height: 1920, objectFit: 'cover'}} /></Freeze></Sequence>
      </div>
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 30%, ${GOLD}1f, transparent 60%)`}} />
    </div>
  );
};

export const Ret: React.FC = () => {
  const f = useCurrentFrame();
  const flash = SCENES.slice(1).reduce((m, sc) => Math.max(m, interpolate(f / FPS - sc.a, [0, 0.08, 0.3], [0, 0.35, 0], cl)), 0);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <style>{fontCss}</style>
      <Audio src={staticFile('ret/musica_b.mp3')} volume={0.09} />
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
