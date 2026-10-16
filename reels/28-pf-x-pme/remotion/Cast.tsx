import React from 'react';
import {AbsoluteFill, Audio, Freeze, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing, random} from 'remotion';
import words from '../public/words28.json';
import {Gold3D, Dust} from './Promo50';

// BONI CAST EP.01 — host question (off-screen voice) + Thiago answering, 2 cameras
const FPS = 25;
const Q = 12.05; // host audio (pergunta_f.mp3 = official host voice): intro 0-3.2s, question 3.5-12s
const A0 = Q + 0.25; // answer starts
const ANS = 27.75;
export const DUR28 = Math.round((A0 + ANS + 2.6) * FPS);
// answer clips: [file, start in answer timeline, lateral camera?]
const CLIPS: [string, number, boolean][] = [['ep1a.mp4', 0, true], ['ep1b.mp4', 7.65, false], ['ep1c.mp4', 16.25, true], ['ep1d.mp4', 21.95, false]];
const CLIP_END = [7.65, 16.25, 21.95, ANS];

const GOLD = '#F5B800', GOLD2 = '#FFD95A', F = 'Poppins';
type W = {t: string; s: number; e: number; g: number};
const WS: W[] = words as any;
const at = (re: RegExp, n = 0) => A0 + WS.filter((w) => re.test(w.t))[n].s;
const fr = (s: number) => Math.round(s * FPS);
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const spr = (f: number, t: number, d = 16, st = 110) => spring({frame: f - fr(t), fps: FPS, config: {damping: d, stiffness: st}});
const T = {
  empresa: at(/^empresa/), mei: at(/^MEI/), pme: at(/^plano$/), geral: at(/^geral/), menos: at(/^menos/), op: at(/^operadora,/), rede: at(/^rede/),
  fam: at(/^família/), mei2: at(/^MEI/, 1), resto: at(/^resto/), comparo: at(/^comparo/), comenta: at(/^Comenta/),
};
const FONTS = `
@font-face{font-family:Poppins;font-weight:800;src:url(${staticFile('Poppins-Bold.ttf')})}
@font-face{font-family:Poppins;font-weight:500;src:url(${staticFile('Poppins-Medium.ttf')})}
@font-face{font-family:Poppins;font-weight:400;src:url(${staticFile('Poppins-Regular.ttf')})}`;
const glass: React.CSSProperties = {background: 'rgba(12,9,4,.66)', border: '2px solid rgba(245,184,0,.75)', backdropFilter: 'blur(14px)', borderRadius: 28, boxShadow: '0 10px 40px rgba(0,0,0,.5), 0 0 26px rgba(245,184,0,.22)'};
const txt = (size: number, color = '#fff', weight = 800): React.CSSProperties => ({fontFamily: F, fontWeight: weight, fontSize: size, color, lineHeight: 1.08, textShadow: '0 3px 14px rgba(0,0,0,.8)'});
// card visible between t0 and t1 with soft in/out
const vis = (f: number, t0: number, t1: number) => Math.min(spr(f, t0), interpolate(f, [fr(t1) - 6, fr(t1)], [1, 0], cl));

const Cameras: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const idx = CLIPS.findIndex((_, i) => t >= A0 + CLIPS[i][1] && t < A0 + CLIP_END[i]);
  const lateral = t < A0 || (idx >= 0 && CLIPS[idx][2]);
  const start = t < A0 ? 0 : A0 + CLIPS[Math.max(idx, 0)][1];
  // lateral camera is tighter (hides host mic), slow push-in inside each shot
  const s = (lateral ? 1.14 : 1.0) + interpolate(t - start, [0, 9], [0, 0.05], cl);
  return (
    <AbsoluteFill style={{transform: `scale(${s})`, transformOrigin: lateral ? '420px 640px' : '540px 700px'}}>
      <Sequence durationInFrames={fr(A0)}>
        <Img src={staticFile('ep1a_f0.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </Sequence>
      {CLIPS.map(([file, s0], i) => (
        <Sequence key={file} from={fr(A0 + s0)} durationInFrames={fr(CLIP_END[i] - s0) + (i === 3 ? 0 : 1)}>
          <OffthreadVideo src={staticFile(file)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </Sequence>
      ))}
      <Sequence from={fr(A0 + ANS)}>
        <Freeze frame={144}><OffthreadVideo muted src={staticFile('ep1d.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Freeze>
      </Sequence>
    </AbsoluteFill>
  );
};

const Badge: React.FC = () => {
  const f = useCurrentFrame();
  const p = spr(f, 0.1);
  return (
    <div style={{position: 'absolute', left: 50, top: 285, display: 'flex', alignItems: 'center', gap: 14, opacity: p, transform: `translateX(${(1 - p) * -60}px)`}}>
      <div style={{...glass, borderRadius: 50, padding: '10px 22px 10px 16px', display: 'flex', alignItems: 'center', gap: 12}}>
        <svg width="38" height="38" viewBox="0 0 100 100"><rect x="36" y="10" width="28" height="48" rx="14" fill="none" stroke={GOLD} strokeWidth="8" /><path d="M24 46 a26 26 0 0 0 52 0 M50 72 v16 M34 90 h32" fill="none" stroke={GOLD} strokeWidth="8" strokeLinecap="round" /></svg>
        <span style={{...txt(32, '#fff')}}>BONI <span style={{color: GOLD}}>CAST</span></span>
        <span style={{...txt(22, GOLD2, 500), marginLeft: 6}}>EP. 01</span>
      </div>
    </div>
  );
};


// BONI CAST opening cover (logo) while the host says "Oi, gente! Tá começando mais um BONI CAST!"
const INTRO_END = 3.35;
export const CastLogo: React.FC<{f: number; scale?: number}> = ({f, scale = 1}) => {
  const pe = spr(f, 0.05, 11, 110), pw = spr(f, 0.45, 13, 120), ps = spr(f, 0.9, 14, 120);
  const sweep = ((f * 2.6) % 140) - 20;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${scale})`}}>
      <div style={{position: 'relative', width: 420, height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        {[0, 1, 2].map((k) => {
          const w = ((f / FPS + k * 0.55) % 1.65) / 1.65;
          return <div key={k} style={{position: 'absolute', width: 300 + 380 * w, height: 300 + 380 * w, borderRadius: '50%', border: `3px solid rgba(245,184,0,${0.55 * (1 - w) * pe})`}} />;
        })}
        <div style={{position: 'absolute', width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,190,60,.35), transparent 60%)', filter: 'blur(12px)', opacity: pe}} />
        <Img src={staticFile('emblema.png')} style={{width: 330, height: 330, opacity: pe, transform: `scale(${0.6 + 0.4 * pe}) rotateY(${(1 - pe) * 160}deg)`, mixBlendMode: 'screen', WebkitMaskImage: 'radial-gradient(closest-side, #000 90%, transparent 100%)'}} />
      </div>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 26, marginTop: -10, opacity: pw, transform: `translateY(${(1 - pw) * 40}px)`}}>
        <span style={{...txt(150, '#ffffff'), letterSpacing: 6, textShadow: '0 0 30px rgba(255,255,255,.35), 0 4px 18px rgba(0,0,0,.8)'}}>BONI</span>
        <div style={{perspective: 1200}}><Gold3D text="CAST" size={150} rotY={(1 - pw) * -90 + Math.sin(f / 14) * 5} rotX={-4} sweep={sweep} depth={18} /></div>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 14, opacity: ps}}>
        <div style={{display: 'flex', gap: 5, alignItems: 'center', height: 40}}>
          {Array.from({length: 9}, (_, i) => <div key={i} style={{width: 6, borderRadius: 3, background: GOLD, height: 8 + 26 * Math.abs(Math.sin(f / 3.2 + i * 0.8))}} />)}
        </div>
        <span style={{...txt(34, GOLD2, 500), letterSpacing: 6}}>PLANO DE SAÚDE SEM COMPLICAÇÃO</span>
      </div>
    </div>
  );
};

const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  if (t > INTRO_END + 0.4) return null;
  const out = interpolate(t, [INTRO_END - 0.05, INTRO_END + 0.35], [1, 0], cl);
  const zoom = interpolate(t, [0, INTRO_END], [1.0, 1.06]) + (1 - out) * 0.35;
  return (
    <AbsoluteFill style={{opacity: out}}>
      <AbsoluteFill style={{backdropFilter: 'blur(26px)', background: 'radial-gradient(ellipse at 50% 45%, rgba(20,14,4,.72), rgba(0,0,0,.94) 75%)'}} />
      <Dust frame={f} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${zoom})`}}>
        <CastLogo f={f} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// host question: off-screen voice, question on screen with a live waveform
const Question: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  if (t > A0 + 0.3) return null;
  const p = spr(f, 3.45, 14, 120);
  const out = interpolate(t, [A0 - 0.2, A0 + 0.2], [1, 0], cl);
  const lines: [number, React.ReactNode][] = [[6.1, <>"Tenho <span style={{color: GOLD}}>CNPJ</span>, mas pago</>], [8.3, <>plano <span style={{color: GOLD}}>pessoa física</span>.</>], [10.95, <>Tô <span style={{color: GOLD}}>pagando a mais</span>?"</>]];
  return (
    <>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,.75) 75%)', opacity: out}} />
      <div style={{position: 'absolute', left: 60, right: 60, top: 1000, ...glass, padding: '26px 34px 30px', opacity: p * out, transform: `translateY(${(1 - p) * 80}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14}}>
          <span style={{...txt(26, '#000'), textShadow: 'none', background: GOLD, borderRadius: 30, padding: '6px 18px'}}>PERGUNTA</span>
          <div style={{display: 'flex', gap: 5, alignItems: 'center', height: 40}}>
            {Array.from({length: 22}, (_, i) => <div key={i} style={{width: 6, borderRadius: 3, background: GOLD2, height: 8 + 28 * Math.abs(Math.sin(f / 3 + i * 0.9)) * (0.5 + random('w' + i + Math.floor(f / 2)) * 0.5)}} />)}
          </div>
        </div>
        {lines.map(([t0, el], i) => {
          const q = spr(f, t0, 14, 140);
          return <div key={i} style={{...txt(58), opacity: q, transform: `translateY(${(1 - q) * 20}px)`}}>{el}</div>;
        })}
      </div>
    </>
  );
};

const Chips: React.FC = () => {
  const f = useCurrentFrame();
  const v = vis(f, T.empresa - 0.05, T.pme - 0.1);
  if (v <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1010, display: 'flex', justifyContent: 'center', gap: 24, opacity: v}}>
      {([[T.empresa, 'EMPRESA'], [T.mei, 'MEI']] as [number, string][]).map(([t0, s], i) => {
        const p = spr(f, t0 - 0.05, 14, 130);
        return <div key={s} style={{...glass, padding: '18px 38px', ...txt(56), opacity: p, transform: `translateY(${(1 - p) * 60}px)`}}>{i ? '' : '✓ '}<span style={{color: i ? GOLD : '#fff'}}>{s}</span>{i ? ' também' : ''}</div>;
      })}
    </div>
  );
};

const BigWord: React.FC = () => {
  const f = useCurrentFrame();
  const v = vis(f, T.pme - 0.05, T.geral - 0.1);
  if (v <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1020, textAlign: 'center', opacity: v, transform: `scale(${0.8 + 0.2 * v})`}}>
      <div style={{...txt(64, '#fff')}}>PLANO</div>
      <div style={{...txt(104, GOLD), letterSpacing: 2}}>EMPRESARIAL</div>
    </div>
  );
};

const Compare: React.FC = () => {
  const f = useCurrentFrame();
  const v = vis(f, T.geral - 0.05, T.fam + 1.2);
  if (v <= 0.01) return null;
  const pm = spr(f, T.menos - 0.1, 12, 120);
  const card = (title: string, gold: boolean) => (
    <div style={{...glass, width: 430, padding: '22px 18px 20px', textAlign: 'center', border: gold ? `3px solid ${GOLD}` : '2px solid rgba(255,255,255,.35)'}}>
      <div style={{...txt(40, gold ? GOLD : '#fff')}}>{title}</div>
      {[[T.op, 'mesma operadora'], [T.rede, 'mesma rede']].map(([t0, s]) => {
        const p = spr(f, (t0 as number) - 0.05, 14, 140);
        return <div key={s as string} style={{...txt(32, '#fff', 500), marginTop: 10, opacity: p}}><span style={{color: GOLD}}>✓</span> {s}</div>;
      })}
      {gold && (
        <div style={{marginTop: 14, padding: '10px 12px', borderRadius: 20, background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, ...txt(30, '#000'), textShadow: 'none', opacity: pm, transform: `scale(${0.7 + 0.3 * pm})`}}>EM GERAL, VOCÊ PAGA MENOS ↓</div>
      )}
      {gold && (
        <div style={{...txt(30, '#fff', 500), marginTop: 12, opacity: spr(f, T.fam - 0.05)}}><span style={{color: GOLD}}>+</span> família junto</div>
      )}
    </div>
  );
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 960, display: 'flex', justifyContent: 'center', gap: 26, opacity: v, transform: `translateY(${(1 - v) * 60}px)`}}>
      {card('PESSOA FÍSICA', false)}
      {card('PELO CNPJ', true)}
    </div>
  );
};

const Mei180: React.FC = () => {
  const f = useCurrentFrame();
  const v = vis(f, T.mei2 - 0.05, T.resto - 0.1);
  if (v <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: v}}>
      <div style={{...txt(46, '#fff')}}>MEI: CNPJ ATIVO HÁ</div>
      <div style={{perspective: 1400, margin: '6px 0'}}><Gold3D text="180" size={190} rotY={interpolate(f, [fr(T.mei2), fr(T.mei2 + 0.8)], [-150, 0], {...cl, easing: Easing.out(Easing.cubic)}) + Math.sin(f / 10) * 6} rotX={-6} sweep={((f * 2.4) % 140) - 20} /></div>
      <div style={{...txt(56, GOLD)}}>DIAS</div>
    </div>
  );
};

const Varia: React.FC = () => {
  const f = useCurrentFrame();
  const v = vis(f, T.resto - 0.05, T.comparo - 0.1);
  if (v <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: 80, right: 80, top: 1060, ...glass, padding: '24px 30px', textAlign: 'center', opacity: v, transform: `translateY(${(1 - v) * 50}px)`}}>
      <div style={{...txt(44)}}>O resto <span style={{color: GOLD}}>muda de operadora</span> pra operadora</div>
    </div>
  );
};

const Check: React.FC = () => {
  const f = useCurrentFrame();
  const v = vis(f, T.comparo - 0.1, T.comenta - 0.1);
  if (v <= 0.01) return null;
  const items = ['Pessoa física', 'Pelo CNPJ', 'Rede', 'Família'];
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: v}}>
      <div style={{...txt(44, GOLD)}}>EU COMPARO PRA VOCÊ</div>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14, maxWidth: 900}}>
        {items.map((s, i) => {
          const p = spr(f, T.comparo + i * 0.18, 14, 160);
          return <div key={s} style={{...glass, padding: '12px 26px', ...txt(38), opacity: p, transform: `scale(${0.6 + 0.4 * p})`}}><span style={{color: GOLD}}>✓</span> {s}</div>;
        })}
      </div>
    </div>
  );
};

const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS - A0;
  if (t < 0 || f / FPS >= T.comenta - 0.1) return null;
  const chunks: W[][] = [];
  for (let g = 0; g <= 10; g++) { const ws = WS.filter((w) => w.g === g); for (let i = 0; i < ws.length; i += 3) chunks.push(ws.slice(i, i + 3)); }
  const ci = chunks.findIndex((c, i) => t >= c[0].s - 0.04 && t < Math.min(c[c.length - 1].e + 0.3, chunks[i + 1] ? chunks[i + 1][0].s - 0.04 : 99));
  if (ci < 0) return null;
  const c = chunks[ci];
  const p = spr(f, A0 + c[0].s - 0.04, 12, 260);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 1455, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', opacity: p}}>
      {c.map((w, i) => {
        const act = t >= w.s - 0.02 && t < w.e + 0.08;
        const key = /cnpj|mei|empresa|menos|família|180|dias|rede|operadora|comparo/i.test(w.t);
        return <span key={i} style={{...txt(56, key ? GOLD : '#fff'), margin: '0 13px', textTransform: 'uppercase', display: 'inline-block', transform: `scale(${act ? 1.1 : 1})`, textShadow: '0 4px 0 rgba(0,0,0,.95), 0 0 24px rgba(0,0,0,.95)'}}>{w.t.replace(/[.,!?]$/, '')}</span>;
      })}
    </div>
  );
};

const End: React.FC = () => {
  const f = useCurrentFrame();
  if (f < fr(T.comenta - 0.1)) return null;
  const p = spr(f, T.comenta - 0.1, 14, 120);
  const bob = Math.sin(f / 3.5) * 5;
  return (
    <>
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(0,0,0,0) 42%, rgba(0,0,0,${0.85 * p}) 72%)`}} />
      <div style={{position: 'absolute', left: 60, right: 60, top: 1000, ...glass, background: 'rgba(14,10,6,.82)', padding: '26px 20px 24px', textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 120}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 14}}>
          <Img src={staticFile('emblema.png')} style={{width: 70, height: 70, objectFit: 'contain'}} />
          <div style={{...txt(34), textAlign: 'left'}}>BONI <span style={{color: GOLD}}>CAST</span><br /><span style={{...txt(20, GOLD2, 500)}}>Planos de Saúde · RJ</span></div>
        </div>
        <div style={{display: 'inline-block', background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, padding: '14px 40px', borderRadius: 60, transform: `translateY(${bob}px)`, boxShadow: '0 0 50px rgba(245,184,0,.6)', ...txt(56, '#000'), textShadow: 'none'}}>Comenta CNPJ</div>
        <div style={{...txt(32), marginTop: 16}}>que eu te mostro <span style={{color: GOLD}}>se vale trocar</span></div>
        <div style={{...txt(21, 'rgba(255,255,255,.8)', 400), marginTop: 14}}>Carências, rede e valores variam por operadora e produto.</div>
      </div>
    </>
  );
};

export const Cast: React.FC = () => {
  const f = useCurrentFrame();
  const cuts = CLIPS.map((c) => A0 + c[1]);
  const flash = Math.max(0, ...cuts.map((t) => interpolate(f - fr(t), [0, 2, 6], [0, 0.18, 0], cl)));
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <style>{FONTS}</style>
      <Cameras />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 38%, rgba(0,0,0,0) 45%, rgba(0,0,0,.55) 100%)'}} />
      <Badge />
      <Question />
      <Intro />
      <Chips />
      <BigWord />
      <Compare />
      <Mei180 />
      <Varia />
      <Check />
      <Captions />
      <End />
      <AbsoluteFill style={{background: '#fff4d6', opacity: flash, mixBlendMode: 'screen'}} />
      <Audio src={staticFile('pergunta_f.mp3')} />
      <Audio src={staticFile('music.mp3')} volume={(x) => interpolate(x, [0, 10, DUR28 - 25, DUR28], [0, 0.1, 0.1, 0], cl)} />
      {cuts.map((t, i) => <Sequence key={i} from={Math.max(0, fr(t) - 2)}><Audio src={staticFile('whoosh.wav')} volume={0.25} /></Sequence>)}
      {[T.empresa, T.mei, T.menos, T.op, T.rede, T.fam, T.mei2, T.comparo].map((t, i) => <Sequence key={'p' + i} from={fr(t)}><Audio src={staticFile('pop.wav')} volume={0.35} /></Sequence>)}
    </AbsoluteFill>
  );
};
