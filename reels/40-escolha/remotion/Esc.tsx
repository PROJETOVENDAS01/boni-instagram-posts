import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {FPS, GOLD, GOLD2, cl, fr, fontCss, Glass, Arrow, Giant, IBuilding, IPeople, IShield, IPay, ICheck, IQuest, IDoc, IScale} from './Ret';

const END = 40.91;
export const DUR_ESC = fr(END);
const CTA = 37.8;

// respostas (Scribe): [texto, início no vídeo final, fim]
const off = (o: number, a: [string, number, number][]) => a.map(([t, s, e]) => [t, s + o, e + o] as [string, number, number]);
const W: [string, number, number][] = [
  ...off(13.01, [['Pode.', 0.36, 0.62], ['No', 0.98, 1.06], ['mesmo', 1.1, 1.36], ['contrato', 1.38, 1.78], ['da', 1.8, 1.86], ['empresa,', 1.9, 2.3], ['cada', 2.58, 2.76], ['titular', 2.84, 3.22], ['escolhe', 3.26, 3.54], ['o', 3.56, 3.64], ['produto', 3.66, 4.0], ['que', 4.02, 4.18], ['cabe', 4.22, 4.48], ['pra', 4.5, 4.64], ['ele.', 4.7, 4.82]]),
  ...off(17.07, [['O', 5.5, 5.54], ['sócio', 5.62, 5.84], ['quer', 5.86, 5.94], ['uma', 5.98, 6.08], ['rede', 6.1, 6.28], ['maior?', 6.32, 6.62], ['Escolhe.', 6.86, 7.28], ['O', 7.66, 7.7], ['funcionário', 7.74, 8.2], ['prefere', 8.22, 8.52], ['enfermaria,', 8.54, 9.16], ['que', 9.32, 9.44], ['pesa', 9.46, 9.66], ['menos', 9.72, 9.98], ['no', 10.0, 10.08], ['bolso?', 10.12, 10.4], ['Também.', 10.9, 11.2]]),
  ...off(20.31, [['Muito.', 11.74, 12.02], ['O', 12.48, 12.52], ['RH', 12.58, 12.78], ['não', 12.8, 12.9], ['precisa', 12.92, 13.22], ['agradar', 13.26, 13.6], ['todo', 13.62, 13.82], ['mundo', 13.86, 14.04], ['com', 14.08, 14.18], ['um', 14.18, 14.26], ['plano', 14.28, 14.48], ['só.', 14.58, 14.7], ['Depende', 15.16, 15.46], ['da', 15.48, 15.54], ['operadora', 15.56, 16.04], ['e', 16.24, 16.28], ['do', 16.32, 16.4], ['contrato.', 16.42, 16.86], ['E', 17.1, 17.12], ['eu', 17.14, 17.22], ['te', 17.24, 17.34], ['mostro', 17.38, 17.58], ['as', 17.62, 17.68], ['opções.', 17.72, 18.14], ['Comenta', 18.54, 18.8], ['ESCOLHA', 18.82, 19.26], ['que', 19.42, 19.44], ['eu', 19.46, 19.5], ['te', 19.56, 19.62], ['chamo', 19.64, 19.8], ['no', 19.84, 19.9], ['WhatsApp', 19.94, 20.36]]),
];

// perguntas da apresentadora (linha inteira)
const Q: {t: string; a: number; b: number}[] = [
  {t: 'Oi, gente! Tá começando mais um BONI CAST!', a: 0.1, b: 3.6},
  {t: 'Hoje o papo é com o Thiago', a: 4.05, b: 8.04},
  {t: 'Numa mesma empresa, cada funcionário pode ter um plano diferente?', a: 8.48, b: 13.2},
  {t: 'E o sócio? Pode escolher um plano maior?', a: 18.1, b: 22.4},
  {t: 'E pro RH, isso deixa tudo mais leve?', a: 28.54, b: 31.9},
];

const SCENES = [
  {a: 0, b: 13.4, bg: 'pastas-diferentes'},
  {a: 13.4, b: 18.1, bg: 'contrato-lupa'},
  {a: 18.1, b: 22.6, bg: 'decisao-dois-caminhos'},
  {a: 22.6, b: 28.5, bg: 'dinheiro-calculadora-moedas'},
  {a: 28.5, b: CTA, bg: 'generico-equilibrio-pedras'},
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
  if (t > 38.5) return null;
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
      <Glass at={4.3} out={8.0} x={540} y={Y + 40} variant="wide" w={720} icon={<IBuilding />} label="NA MESMA EMPRESA" sub="vários funcionários" />
      <Glass at={8.7} out={13.3} x={190} y={Y + 20} icon={<IShield />} label="PLANO A" tilt={-3} />
      <Glass at={9.4} out={13.3} x={540} y={Y + 80} icon={<IShield />} label="PLANO B" />
      <Glass at={10.1} out={13.3} x={895} y={Y + 140} icon={<IShield />} label="PLANO C" tilt={3} />
      {/* A1 */}
      <Glass at={14.0} out={15.5} x={540} y={Y + 40} variant="wide" w={720} icon={<IDoc />} label="UM CONTRATO" sub="no CNPJ da empresa" />
      <Glass at={15.7} out={18.1} x={300} y={Y + 20} icon={<IPeople />} label="CADA TITULAR" tilt={-3} />
      <Arrow at={16.9} out={18.1} x={540} y={Y + 130} w={80} />
      <Glass at={17.0} out={18.1} x={790} y={Y + 20} icon={<IShield />} label="O SEU PRODUTO" tilt={3} accent={GOLD2} />
      {/* Q2 */}
      <Glass at={18.3} out={22.5} x={540} y={Y + 60} variant="wide" w={620} icon={<IQuest />} label="E O SÓCIO?" sub="plano maior?" />
      {/* A2 */}
      <Glass at={22.9} out={24.7} x={540} y={Y + 20} variant="wide" w={700} icon={<IPeople />} label="SÓCIO" sub="quer rede maior" />
      <Giant at={23.9} out={24.7} text="ESCOLHE" size={110} y={600} />
      <Glass at={25.0} out={28.4} x={540} y={Y + 10} variant="wide" w={720} icon={<IPay />} label="FUNCIONÁRIO" sub="enfermaria" accent={GOLD2} />
      <Giant at={26.8} out={28.4} text="PESA MENOS" size={100} y={600} />
      {/* Q3 */}
      <Glass at={28.7} out={32.0} x={540} y={Y + 60} variant="wide" w={620} icon={<IQuest />} label="E O RH?" sub="fica mais leve?" />
      {/* A3 */}
      <Giant at={32.1} out={33.0} text="MUITO" size={150} y={380} />
      <Glass at={33.1} out={35.3} x={540} y={Y + 30} variant="wide" w={740} icon={<IScale />} label="UM PLANO SÓ" sub="não precisa agradar todo mundo" tilt={-1} />
      <Glass at={35.5} out={37.6} x={540} y={Y + 30} variant="wide" w={740} icon={<ICheck />} label="DEPENDE" sub="da operadora e do contrato" accent={GOLD2} />
    </>
  );
};

const End: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const a = spring({frame: f - fr(38.4), fps: FPS, config: {damping: 13, stiffness: 150}});
  const b = spring({frame: f - fr(38.85), fps: FPS, config: {damping: 11, stiffness: 160}});
  const glow = 0.5 + 0.5 * Math.sin(f / 6);
  if (t < CTA) return null;
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: 'Poppins', fontWeight: 800, fontSize: 84, color: '#fff', opacity: a, transform: `scale(${0.85 + 0.15 * a})`, textShadow: '0 6px 30px #000'}}>COMENTA</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 410, display: 'flex', justifyContent: 'center', opacity: b, transform: `scale(${0.7 + 0.3 * b})`}}>
        <div style={{padding: '16px 48px', borderRadius: 28, background: GOLD, boxShadow: `0 0 ${50 + 40 * glow}px ${GOLD}aa`, fontFamily: 'Poppins', fontWeight: 800, fontSize: 100, color: '#000'}}>ESCOLHA</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', fontFamily: 'Poppins', fontWeight: 500, fontSize: 36, color: '#fff', opacity: b, textShadow: '0 4px 18px #000'}}>Eu te chamo no WhatsApp</div>
      <div style={{position: 'absolute', left: 50, right: 50, top: 790, textAlign: 'center', fontFamily: 'Poppins', fontWeight: 500, fontSize: 26, lineHeight: 1.3, color: '#ffffffdd', textShadow: '0 3px 14px #000', opacity: interpolate(t, [39.0, 39.4], [0, 1], cl)}}>
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
