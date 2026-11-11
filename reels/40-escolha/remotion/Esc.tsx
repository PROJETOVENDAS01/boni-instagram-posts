import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {FPS, GOLD, GOLD2, cl, fr, fontCss, Glass, Arrow, Giant, IBuilding, IPeople, IShield, IPay, ICheck, IQuest, IDoc, IScale} from './Ret';

const END = 42.0;
export const DUR_ESC = fr(END);
const CTA = 39.0;

// respostas (Scribe): [texto, início no vídeo final, fim]
const off = (o: number, a: [string, number, number][]) => a.map(([t, s, e]) => [t, s + o, e + o] as [string, number, number]);
const W: [string, number, number][] = [
  ...off(11.41, [['Pode', 0.36, 0.66], ['sim.', 0.72, 0.92], ['No', 1.54, 1.62], ['mesmo', 1.68, 1.96], ['contrato', 1.98, 2.4], ['da', 2.44, 2.48], ['empresa,', 2.52, 2.94], ['cada', 3.34, 3.54], ['titular', 3.62, 4.02], ['escolhe', 4.08, 4.4], ['o', 4.42, 4.5], ['produto', 4.52, 4.92], ['que', 4.94, 5.08], ['cabe', 5.14, 5.4], ['pra', 5.42, 5.54], ['ele.', 5.62, 5.74]]),
  ...off(15.65, [['O', 6.24, 6.26], ['sócio', 6.36, 6.64], ['quer', 6.66, 6.72], ['uma', 6.76, 6.88], ['rede', 6.92, 7.1], ['maior?', 7.14, 7.48], ['Escolhe.', 7.78, 8.2], ['O', 8.6, 8.66], ['funcionário', 8.7, 9.16], ['prefere', 9.18, 9.46], ['enfermaria', 9.5, 10.24], ['que', 10.26, 10.38], ['pesa', 10.42, 10.7], ['menos', 10.74, 11.0], ['no', 11.04, 11.12], ['bolso?', 11.16, 11.44], ['Também,', 12.04, 12.3], ['muito.', 12.82, 13.14]]),
  ...off(18.64, [['O', 13.98, 14.02], ['RH', 14.1, 14.32], ['não', 14.36, 14.46], ['precisa', 14.48, 14.84], ['agradar', 14.88, 15.24], ['todo', 15.32, 15.54], ['mundo', 15.58, 15.82], ['com', 15.86, 15.94], ['um', 15.98, 16.08], ['plano', 16.1, 16.32], ['só.', 16.44, 16.58], ['Depende', 17.06, 17.4], ['da', 17.42, 17.5], ['operadora', 17.52, 18.0], ['e', 18.02, 18.06], ['do', 18.1, 18.18], ['contrato,', 18.2, 18.7], ['e', 19.04, 19.08], ['eu', 19.1, 19.16], ['te', 19.22, 19.3], ['mostro', 19.36, 19.62], ['as', 19.64, 19.72], ['opções.', 19.76, 20.22], ['Comenta', 20.74, 21.0], ['a', 21.02, 21.08], ['palavra', 21.1, 21.38], ['escolha,', 21.42, 21.9], ['que', 22.06, 22.1], ['eu', 22.12, 22.16], ['te', 22.22, 22.32], ['chamo', 22.34, 22.56], ['no', 22.58, 22.66], ['WhatsApp', 22.68, 23.1]]),
];

// perguntas da apresentadora (linha inteira)
const Q: {t: string; a: number; b: number}[] = [
  {t: 'Oi, gente! Tá começando mais um BONI CAST!', a: 0.1, b: 3.6},
  {t: 'Hoje o papo é com o consultor Boni', a: 4.05, b: 6.54},
  {t: 'Numa mesma empresa, cada funcionário pode ter um plano diferente?', a: 7.05, b: 11.65},
  {t: 'E o sócio? Pode escolher um plano maior?', a: 17.4, b: 21.7},
  {t: 'E pro RH, isso deixa tudo mais leve?', a: 29.14, b: 32.5},
];

const SCENES = [
  {a: 0, b: 11.77, bg: 'pastas-diferentes'},
  {a: 11.77, b: 17.4, bg: 'contrato-lupa'},
  {a: 17.4, b: 21.89, bg: 'decisao-dois-caminhos'},
  {a: 21.89, b: 29.09, bg: 'dinheiro-calculadora-moedas'},
  {a: 29.09, b: CTA, bg: 'generico-equilibrio-pedras'},
  {a: CTA, b: 99, bg: 'celular-aceso'},
];

const TopBg: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 960, overflow: 'hidden', background: '#000'}}>
      {SCENES.map((sc, i) => {
        const o = interpolate(t, [sc.a - 0.2, sc.a + 0.15, sc.b - 0.15, sc.b + 0.2], [i === 0 ? 1 : 0, 1, 1, i === SCENES.length - 1 ? 1 : 0], cl);
        if (o <= 0) return null;
        return <Img key={i} src={staticFile(`esc/${sc.bg}.jpg`)} style={{position: 'absolute', inset: 0, width: 1080, height: 960, objectFit: 'cover', transform: `scale(${1.06 + (t - sc.a) * 0.012})`, opacity: o, filter: 'brightness(.62) contrast(1.1) saturate(1.15) sepia(.22)'}} />;
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
  if (t > 38.95) return null;
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
      {/* Q1 */}
      <Giant at={0.2} out={3.5} text="BONI CAST" size={120} y={330} />
      <Glass at={4.3} out={6.5} x={540} y={Y + 40} variant="wide" w={720} icon={<IBuilding />} label="NA MESMA EMPRESA" sub="vários funcionários" />
      <Glass at={7.3} out={11.7} x={190} y={Y + 20} icon={<IShield />} label="PLANO A" tilt={-3} />
      <Glass at={8.0} out={11.7} x={540} y={Y + 80} icon={<IShield />} label="PLANO B" />
      <Glass at={8.7} out={11.7} x={895} y={Y + 140} icon={<IShield />} label="PLANO C" tilt={3} />
      {/* A1 */}
      <Glass at={12.95} out={14.7} x={540} y={Y + 40} variant="wide" w={720} icon={<IDoc />} label="UM CONTRATO" sub="no CNPJ da empresa" />
      <Glass at={15.0} out={17.3} x={300} y={Y + 20} icon={<IPeople />} label="CADA TITULAR" tilt={-3} />
      <Arrow at={16.0} out={17.3} x={540} y={Y + 130} w={80} />
      <Glass at={16.1} out={17.3} x={790} y={Y + 20} icon={<IShield />} label="O SEU PRODUTO" tilt={3} accent={GOLD2} />
      {/* Q2 */}
      <Glass at={17.6} out={21.8} x={540} y={Y + 60} variant="wide" w={620} icon={<IQuest />} label="E O SÓCIO?" sub="plano maior?" />
      {/* A2 */}
      <Glass at={22.0} out={23.95} x={540} y={Y + 20} variant="wide" w={700} icon={<IPeople />} label="SÓCIO" sub="quer rede maior" />
      <Giant at={23.4} out={23.95} text="ESCOLHE" size={110} y={600} />
      <Glass at={24.4} out={29.0} x={540} y={Y + 10} variant="wide" w={720} icon={<IPay />} label="FUNCIONÁRIO" sub="enfermaria" accent={GOLD2} />
      <Giant at={26.1} out={29.0} text="PESA MENOS" size={100} y={600} />
      {/* Q3 */}
      <Glass at={29.3} out={32.5} x={540} y={Y + 60} variant="wide" w={620} icon={<IQuest />} label="E O RH?" sub="fica mais leve?" />
      {/* A3 */}
      <Glass at={32.9} out={35.5} x={540} y={Y + 30} variant="wide" w={740} icon={<IScale />} label="UM PLANO SÓ" sub="não precisa agradar todo mundo" tilt={-1} />
      <Glass at={35.7} out={38.9} x={540} y={Y + 30} variant="wide" w={740} icon={<ICheck />} label="DEPENDE" sub="da operadora e do contrato" accent={GOLD2} />
    </>
  );
};

const End: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const a = spring({frame: f - fr(39.6), fps: FPS, config: {damping: 13, stiffness: 150}});
  const b = spring({frame: f - fr(40.0), fps: FPS, config: {damping: 11, stiffness: 160}});
  const glow = 0.5 + 0.5 * Math.sin(f / 6);
  if (t < CTA) return null;
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: 'Poppins', fontWeight: 800, fontSize: 84, color: '#fff', opacity: a, transform: `scale(${0.85 + 0.15 * a})`, textShadow: '0 6px 30px #000'}}>COMENTA</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 410, display: 'flex', justifyContent: 'center', opacity: b, transform: `scale(${0.7 + 0.3 * b})`}}>
        <div style={{padding: '16px 48px', borderRadius: 28, background: GOLD, boxShadow: `0 0 ${50 + 40 * glow}px ${GOLD}aa`, fontFamily: 'Poppins', fontWeight: 800, fontSize: 100, color: '#000'}}>ESCOLHA</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', fontFamily: 'Poppins', fontWeight: 500, fontSize: 36, color: '#fff', opacity: b, textShadow: '0 4px 18px #000'}}>Eu te chamo no WhatsApp</div>
      <div style={{position: 'absolute', left: 50, right: 50, top: 790, textAlign: 'center', fontFamily: 'Poppins', fontWeight: 500, fontSize: 26, lineHeight: 1.3, color: '#ffffffdd', textShadow: '0 3px 14px #000', opacity: interpolate(t, [40.3, 40.7], [0, 1], cl)}}>
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
        <OffthreadVideo muted src={staticFile('esc/bottom.mp4')} style={{width: 1080, height: 1920, objectFit: 'cover'}} />
      </div>
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 30%, ${GOLD}1f, transparent 60%)`}} />
    </div>
  );
};

export const Esc: React.FC = () => {
  const f = useCurrentFrame();
  const flash = SCENES.slice(1).reduce((m, sc) => Math.max(m, interpolate(f / FPS - sc.a, [0, 0.08, 0.3], [0, 0.35, 0], cl)), 0);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <style>{fontCss}</style>
      <Audio src={staticFile('esc/voz.mp3')} />
      <Audio src={staticFile('esc/musica_b.mp3')} volume={0.08} />
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
