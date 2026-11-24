import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {FPS, GOLD, GOLD2, cl, fr, fontCss, Glass, Arrow, Giant, IBuilding, IPeople, IShield, IPay, ICheck, IQuest, IDoc, IScale} from './Ret';

const END = 36.3;
export const DUR_FAM = fr(END);
const CTA = 29.2;

// respostas (Scribe): [texto, início no vídeo final, fim]
const off = (o: number, a: [string, number, number][]) => a.map(([t, s, e]) => [t, s + o, e + o] as [string, number, number]);
const W: [string, number, number][] = [
  ...off(11.0, [['Em', 0.299, 0.384], ['geral,', 0.427, 0.683], ['pode', 0.981, 1.109], ['sim.', 1.195, 1.365], ['Muitas', 1.792, 2.09], ['operadoras', 2.133, 2.645], ['aceitam', 2.688, 3.157], ['incluir', 3.2, 3.456], ['cônjuge', 3.541, 4.053], ['e', 4.096, 4.224], ['filhos', 4.267, 4.608], ['como', 4.651, 4.821], ['dependentes.', 4.864, 5.419]]),
  ...off(16.86, [['Mas', 0.299, 0.469], ['quem', 0.555, 0.725], ['entra', 0.768, 1.152], ['e', 1.195, 1.28], ['como', 1.323, 1.664], ['entra', 1.792, 2.133], ['muda', 2.176, 2.389], ['de', 2.432, 2.475], ['operadora', 2.517, 2.987], ['pra', 3.029, 3.115], ['operadora,', 3.157, 3.627], ['então', 3.883, 4.181], ['eu', 4.224, 4.309], ['confiro', 4.352, 4.736], ['isso', 4.779, 4.907], ['antes', 5.035, 5.291], ['de', 5.333, 5.376], ['montar', 5.419, 5.589], ['a', 5.632, 5.675], ['proposta.', 5.717, 6.059]]),
  ...off(23.35, [['E', 0.299, 0.384], ['tem', 0.427, 0.555], ['um', 0.597, 0.64], ['detalhe', 0.683, 0.981], ['importante:', 1.024, 1.408], ['os', 1.877, 2.048], ['dependentes', 2.133, 2.688], ['também', 2.773, 3.115], ['contam', 3.157, 3.584], ['na', 3.627, 3.712], ['hora', 3.755, 3.883], ['de', 3.925, 3.968], ['somar', 4.011, 4.352], ['as', 4.395, 4.48], ['vidas', 4.565, 4.821], ['do', 4.864, 4.949], ['contrato.', 4.949, 5.376]]),
];

// perguntas da apresentadora (linha inteira)
const Q: {t: string; a: number; b: number}[] = [
  {t: 'Oi, gente! Tá começando mais um BONI CAST!', a: 0.1, b: 3.5},
  {t: 'Boni, uma dúvida que todo RH tem:', a: 3.8, b: 6.6},
  {t: 'o funcionário pode incluir a família no plano da empresa?', a: 6.7, b: 10.7},
];

const SCENES = [
  {a: 0, b: 11.0, bg: 'ep4-familia'},
  {a: 11.0, b: 16.86, bg: 'casal-documento-maos'},
  {a: 16.86, b: 23.35, bg: 'pastas-diferentes'},
  {a: 23.35, b: CTA, bg: 'ep4-grupo'},
  {a: CTA, b: 99, bg: 'celular-aceso'},
];

const TopBg: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 960, overflow: 'hidden', background: '#000'}}>
      {SCENES.map((sc, i) => {
        const o = interpolate(t, [sc.a - 0.2, sc.a + 0.15, sc.b - 0.15, sc.b + 0.2], [i === 0 ? 1 : 0, 1, 1, i === SCENES.length - 1 ? 1 : 0], cl);
        if (o <= 0) return null;
        return <Img key={i} src={staticFile(`fam/${sc.bg}.jpg`)} style={{position: 'absolute', inset: 0, width: 1080, height: 960, objectFit: 'cover', transform: `scale(${1.06 + (t - sc.a) * 0.012})`, opacity: o, filter: 'brightness(.62) contrast(1.1) saturate(1.15) sepia(.22)'}} />;
      })}
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg,rgba(0,0,0,.55),rgba(0,0,0,.1) 40%,rgba(0,0,0,.6)), radial-gradient(circle at 50% 70%, ${GOLD}2a, transparent 60%)`}} />
    </div>
  );
};

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
  const q = Q.find((x) => t >= x.a && t < x.b + 0.15);
  const g = groups.find((x, i) => t >= x.a - 0.05 && t < (groups[i + 1]?.a ?? x.b + 0.3) - 0.01);
  if (q) {
    return (
      <div style={{position: 'absolute', left: 50, right: 50, top: 790, display: 'flex', justifyContent: 'center'}}>
        <div style={{padding: '10px 28px', fontFamily: 'Poppins', fontWeight: 800, fontSize: 42, lineHeight: 1.15, textAlign: 'center', color: GOLD2, textShadow: '0 4px 20px #000', background: 'rgba(0,0,0,.45)', borderRadius: 22, border: `2px solid ${GOLD}66`}}>{q.t}</div>
      </div>
    );
  }
  if (!g) return null;
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: 850, display: 'flex', justifyContent: 'center'}}>
      <div style={{padding: '6px 26px', fontFamily: 'Poppins', fontWeight: 800, fontSize: 50, color: '#fff', textShadow: '0 4px 20px #000, 0 0 30px #000', whiteSpace: 'nowrap', background: 'rgba(0,0,0,.35)', borderRadius: 20}}>{g.t.toUpperCase()}</div>
    </div>
  );
};

const Elements: React.FC = () => {
  const Y = 300;
  return (
    <>
      <Giant at={0.2} out={3.5} text="BONI CAST" size={120} y={330} />
      <Glass at={4.2} out={10.9} x={540} y={Y + 40} variant="wide" w={760} icon={<IQuest />} label="E A FAMÍLIA?" sub="dependentes no plano da empresa" />
      <Glass at={11.3} out={12.75} x={540} y={Y + 40} variant="wide" w={620} icon={<ICheck />} label="EM GERAL" sub="pode sim" />
      <Glass at={12.8} out={16.8} x={540} y={Y + 30} variant="wide" w={760} icon={<IPeople />} label="CÔNJUGE + FILHOS" sub="como dependentes" />
      <Glass at={17.3} out={19.0} x={540} y={Y + 40} variant="wide" w={640} icon={<IPeople />} label="QUEM ENTRA" sub="e como entra" />
      <Glass at={19.05} out={21.0} x={540} y={Y + 40} variant="wide" w={760} icon={<IBuilding />} label="MUDA POR OPERADORA" />
      <Glass at={21.1} out={23.3} x={540} y={Y + 40} variant="wide" w={700} icon={<IShield />} label="EU CONFIRO" sub="antes de montar a proposta" accent={GOLD2} />
      <Glass at={23.7} out={25.4} x={540} y={Y + 40} variant="wide" w={640} icon={<IQuest />} label="UM DETALHE" sub="importante" />
      <Giant at={25.45} out={29.1} text="DEPENDENTES" size={96} y={330} c="#fff" />
      <Giant at={26.45} out={29.1} text="CONTAM" size={140} y={470} />
      <Glass at={27.7} out={29.1} x={540} y={640} variant="wide" w={700} icon={<IDoc />} label="NAS VIDAS" sub="do contrato" accent={GOLD2} />
    </>
  );
};

const End: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const a = spring({frame: f - fr(29.45), fps: FPS, config: {damping: 13, stiffness: 150}});
  const b = spring({frame: f - fr(29.9), fps: FPS, config: {damping: 11, stiffness: 160}});
  const c = spring({frame: f - fr(31.0), fps: FPS, config: {damping: 13, stiffness: 150}});
  const glow = 0.5 + 0.5 * Math.sin(f / 6);
  if (t < CTA) return null;
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: 'Poppins', fontWeight: 800, fontSize: 84, color: '#fff', opacity: a, transform: `scale(${0.85 + 0.15 * a})`, textShadow: '0 6px 30px #000'}}>COMENTA</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 410, display: 'flex', justifyContent: 'center', opacity: b, transform: `scale(${0.7 + 0.3 * b})`}}>
        <div style={{padding: '16px 48px', borderRadius: 28, background: GOLD, boxShadow: `0 0 ${50 + 40 * glow}px ${GOLD}aa`, fontFamily: 'Poppins', fontWeight: 800, fontSize: 100, color: '#000'}}>FAMILIA</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', fontFamily: 'Poppins', fontWeight: 500, fontSize: 36, color: '#fff', opacity: c, textShadow: '0 4px 18px #000'}}>Eu te explico como funciona</div>
      <div style={{position: 'absolute', left: 50, right: 50, top: 720, textAlign: 'center', fontFamily: 'Poppins', fontWeight: 500, fontSize: 26, lineHeight: 1.3, color: '#ffffffdd', textShadow: '0 3px 14px #000', opacity: interpolate(t, [31.6, 32.0], [0, 1], cl)}}>
        Carências, rede e valores variam por operadora e produto.
      </div>
    </>
  );
};

const Cam: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 0, top: 960, width: 1080, height: 960, overflow: 'hidden', background: '#000'}}>
      <div style={{position: 'absolute', left: 0, top: -300, width: 1080, height: 1920, transform: `scale(${1 + f * 0.00008})`, transformOrigin: '50% 30%', filter: 'saturate(1.1) contrast(1.05) sepia(.14) brightness(1.02)'}}>
        <OffthreadVideo muted src={staticFile('fam/bottom.mp4')} style={{width: 1080, height: 1920, objectFit: 'cover'}} />
      </div>
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 30%, ${GOLD}1f, transparent 60%)`}} />
    </div>
  );
};

export const Fam: React.FC = () => {
  const f = useCurrentFrame();
  const flash = SCENES.slice(1).reduce((m, sc) => Math.max(m, interpolate(f / FPS - sc.a, [0, 0.08, 0.3], [0, 0.35, 0], cl)), 0);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <style>{fontCss}</style>
      <Audio src={staticFile('fam/voz.mp3')} />
      <Audio src={staticFile('fam/musica_b.mp3')} volume={0.08} />
      <TopBg />
      <Elements />
      <End />
      <Legend />
      <Cam />
      <div style={{position: 'absolute', left: 0, top: 954, width: 1080, height: 12, background: `linear-gradient(90deg, transparent, ${GOLD2}, ${GOLD}, ${GOLD2}, transparent)`, boxShadow: `0 0 30px ${GOLD}`}} />
      <AbsoluteFill style={{background: '#fff', opacity: flash, mixBlendMode: 'overlay' as const}} />
    </AbsoluteFill>
  );
};
