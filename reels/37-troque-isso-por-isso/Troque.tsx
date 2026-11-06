import React from 'react';
import {AbsoluteFill, Audio, Freeze, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';

const FPS = 30;
const GOLD = '#F5B800';
const GOLD2 = '#FFE08A';
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const fr = (s: number) => Math.round(s * FPS);
const fontCss = `
@font-face{font-family:Poppins;font-weight:800;src:url(${staticFile('Poppins-Bold.ttf')})}
@font-face{font-family:Poppins;font-weight:500;src:url(${staticFile('Poppins-Medium.ttf')})}`;

const PAIRS: {x: string; v: string}[] = [
  {x: 'PAGAR CONSULTA E EXAME PARTICULAR', v: 'CONSULTAS E EXAMES CONFORME O PRODUTO'},
  {x: 'ESPERAR PASSAR MAL', v: 'PLANO FEITO ANTES'},
  {x: 'PLANO QUE ACABA NA DEMISSÃO', v: 'PLANO SÓ SEU'},
  {x: 'GRÁVIDA SEM PLANO', v: 'PLANO ANTES DE ENGRAVIDAR'},
  {x: 'MEI SEM PLANO', v: 'MEI ATIVO HÁ 180 DIAS'},
  {x: 'TORCER PARA NUNCA INTERNAR', v: 'COBERTURA DE INTERNAÇÃO, CONFORME O PRODUTO'},
  {x: 'LIGAR PARA 10 OPERADORAS', v: 'UM WHATSAPP QUE COMPARA PARA O SEU PERFIL'},
];

// tempos (s)
const D_TROQUE = 1.28, D_PORISSO = 0.96, D_X = 1.3, D_V = 2.0;
const P = D_TROQUE + D_X + D_PORISSO + D_V;
const HOOK = 6.2;
const CTA = 4.6;
export const DUR_TROQUE = fr(HOOK) + fr(P) * 7 + fr(CTA);

const fs = (t: string) => (t.length <= 20 ? 100 : t.length <= 32 ? 86 : 70);

const Fade: React.FC<{d: number; i?: number; o?: number; children: React.ReactNode}> = ({d, i = 5, o = 5, children}) => {
  const f = useCurrentFrame();
  const op = interpolate(f, [0, i, d - o, d], [0, 1, 1, 0], cl);
  return <AbsoluteFill style={{opacity: op}}>{children}</AbsoluteFill>;
};

const IconX: React.FC<{c: string; s?: number}> = ({c, s = 64}) => (
  <svg width={s} height={s} viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="none" stroke={c} strokeWidth="5" /><path d="M21 21L43 43M43 21L21 43" stroke={c} strokeWidth="6" strokeLinecap="round" /></svg>
);
const IconV: React.FC<{c: string; s?: number}> = ({c, s = 64}) => (
  <svg width={s} height={s} viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill={c} /><path d="M19 33L28 42L46 23" stroke="#000" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
);

const Chip: React.FC<{kind: 'x' | 'v'; n: number}> = ({kind, n}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '12px 28px 12px 18px', borderRadius: 60, background: kind === 'x' ? 'rgba(40,40,44,.82)' : 'rgba(0,0,0,.72)', border: `3px solid ${kind === 'x' ? '#9aa0a6' : GOLD}`, boxShadow: kind === 'v' ? `0 0 34px ${GOLD}88` : 'none'}}>
    {kind === 'x' ? <IconX c="#c4c8cc" /> : <IconV c={GOLD} />}
    <span style={{fontFamily: 'Poppins', fontWeight: 800, fontSize: 46, letterSpacing: 2, whiteSpace: 'nowrap', color: kind === 'x' ? '#c4c8cc' : GOLD}}>{kind === 'x' ? 'TROQUE ISSO' : 'POR ISSO'}</span>
    <span style={{fontFamily: 'Poppins', fontWeight: 500, fontSize: 34, color: '#ffffffaa', marginLeft: 8}}>{n}/7</span>
  </div>
);

const Bg: React.FC<{src: string; kind: 'x' | 'v'; h: number; focusY?: number}> = ({src, kind, h, focusY = 50}) => {
  const f = useCurrentFrame();
  const z = 1.04 + f * 0.0006;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: h, overflow: 'hidden', background: '#000'}}>
      <Img src={staticFile(`tr/${src}`)} style={{width: 1080, height: h, objectFit: 'cover', objectPosition: `50% ${focusY}%`, transform: `scale(${z})`, filter: kind === 'x' ? 'grayscale(1) brightness(.72) contrast(1.1)' : 'brightness(1.28) contrast(1.08) saturate(1.2) sepia(.18)'}} />
      <div style={{position: 'absolute', inset: 0, background: kind === 'x' ? 'linear-gradient(180deg,rgba(0,0,0,.55),rgba(0,0,0,.25) 40%,rgba(0,0,0,.7))' : `linear-gradient(180deg,rgba(0,0,0,.5),rgba(0,0,0,.1) 40%,rgba(0,0,0,.65)), radial-gradient(circle at 50% 80%, ${GOLD}33, transparent 60%)`}} />
    </div>
  );
};

const Glass: React.FC<{children: React.ReactNode; kind: 'x' | 'v'}> = ({children, kind}) => (
  <div style={{padding: '30px 40px', borderRadius: 36, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(14px)', border: `2px solid ${kind === 'v' ? GOLD + 'cc' : '#ffffff44'}`, boxShadow: kind === 'v' ? `0 0 40px ${GOLD}44` : '0 0 30px #00000088', maxWidth: 940, textAlign: 'center'}}>
    {children}
  </div>
);

// ---- cenas ----
const Avatar: React.FC<{src: string; label: string; d: number}> = ({src, label, d}) => {
  const f = useCurrentFrame();
  const z = 1 + f * 0.0007;
  const pop = spring({frame: f, fps: FPS, config: {damping: 12, stiffness: 180}});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${z})`}}>
        <OffthreadVideo src={staticFile(`tr/${src}`)} style={{width: 1080, height: 1920, objectFit: 'cover'}} />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1380, display: 'flex', justifyContent: 'center', transform: `scale(${0.7 + 0.3 * pop})`, opacity: pop}}>
        <div style={{fontFamily: 'Poppins', fontWeight: 800, fontSize: 104, letterSpacing: 3, color: GOLD, textShadow: '0 6px 30px #000, 0 0 40px #000'}}>{label}</div>
      </div>
    </AbsoluteFill>
  );
};

const SceneX: React.FC<{n: number; text: string; d: number}> = ({n, text, d}) => {
  const f = useCurrentFrame();
  const pop = spring({frame: f, fps: FPS, config: {damping: 14, stiffness: 140}});
  const strike = interpolate(f, [fr(0.55), fr(0.85)], [0, 100], {...cl, easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill>
      <Bg src={`${n}x.png`} kind="x" h={1920} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 290, display: 'flex', justifyContent: 'center', opacity: pop, transform: `translateY(${(1 - pop) * -40}px)`}}><Chip kind="x" n={n} /></div>
      <div style={{position: 'absolute', left: 70, right: 70, top: 1010, display: 'flex', justifyContent: 'center', opacity: pop, transform: `scale(${0.9 + 0.1 * pop})`}}>
        <Glass kind="x">
          <div style={{position: 'relative', display: 'inline-block'}}>
            <div style={{fontFamily: 'Poppins', fontWeight: 800, fontSize: fs(text), lineHeight: 1.08, color: strike > 0 ? '#9a9ea3' : '#fff', textDecoration: strike > 0 ? 'line-through' : 'none', textDecorationThickness: 10, textDecorationColor: '#e8e8e8'}}>{text}</div>
          </div>
        </Glass>
      </div>
    </AbsoluteFill>
  );
};

const SceneV: React.FC<{n: number; x: string; v: string; d: number}> = ({n, x, v, d}) => {
  const f = useCurrentFrame();
  const a = spring({frame: f, fps: FPS, config: {damping: 16, stiffness: 150}});
  const b = spring({frame: f - 3, fps: FPS, config: {damping: 13, stiffness: 150}});
  const flash = interpolate(f, [0, 3, 10], [0.5, 0.5, 0], cl);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 960, overflow: 'hidden', transform: `translateY(${(1 - a) * -960}px)`}}>
        <Bg src={`${n}x.png`} kind="x" h={960} focusY={55} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 270, display: 'flex', justifyContent: 'center'}}><Chip kind="x" n={n} /></div>
        <div style={{position: 'absolute', left: 60, right: 60, top: 450, display: 'flex', justifyContent: 'center'}}>
          <div style={{position: 'relative', display: 'inline-block', textAlign: 'center'}}>
            <div style={{fontFamily: 'Poppins', fontWeight: 800, fontSize: 54, lineHeight: 1.1, color: '#a5a9ad', textShadow: '0 4px 20px #000', textDecoration: 'line-through', textDecorationThickness: 7, textDecorationColor: '#e8e8e8'}}>{x}</div>
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, top: 960, width: 1080, height: 960, overflow: 'hidden', transform: `translateY(${(1 - b) * 960}px)`}}>
        <Bg src={`${n}v.png`} kind="v" h={960} focusY={55} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 70, display: 'flex', justifyContent: 'center'}}><Chip kind="v" n={n} /></div>
        <div style={{position: 'absolute', left: 60, right: 60, top: 200, display: 'flex', justifyContent: 'center', transform: `scale(${0.92 + 0.08 * b})`}}>
          <Glass kind="v">
            <div style={{fontFamily: 'Poppins', fontWeight: 800, fontSize: fs(v) * 0.82, lineHeight: 1.08, color: GOLD, textShadow: `0 0 30px ${GOLD}66`}}>{v}</div>
          </Glass>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, top: 954, width: 1080, height: 12, background: `linear-gradient(90deg, transparent, ${GOLD2}, ${GOLD}, ${GOLD2}, transparent)`, boxShadow: `0 0 30px ${GOLD}`, opacity: a}} />
      <AbsoluteFill style={{background: '#fff', opacity: flash, mixBlendMode: 'overlay' as const}} />
    </AbsoluteFill>
  );
};

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const words = [
    {t: '7', at: 0.3, size: 360, c: GOLD},
    {t: 'TROCAS', at: 0.65, size: 150, c: '#fff'},
    {t: 'QUE MUDAM', at: 1.15, size: 96, c: '#fff'},
    {t: 'A SUA VIDA', at: 1.65, size: 96, c: '#fff'},
  ];
  const sub = spring({frame: f - fr(2.3), fps: FPS, config: {damping: 14, stiffness: 140}});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Img src={staticFile('tr/7v.png')} style={{width: 1080, height: 1920, objectFit: 'cover', filter: 'blur(26px) brightness(.55) saturate(1.2)', transform: 'scale(1.15)'}} />
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 42%, ${GOLD}40, transparent 60%), linear-gradient(180deg, #000c, #0004 45%, #000d)`}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 120}}>
        {words.map((w, i) => {
          const s = spring({frame: f - fr(w.at), fps: FPS, config: {damping: 12, stiffness: 170}});
          return <div key={i} style={{fontFamily: 'Poppins', fontWeight: 800, fontSize: w.size, lineHeight: 1.0, color: w.c, opacity: s, transform: `scale(${0.6 + 0.4 * s})`, textShadow: w.c === GOLD ? `0 0 60px ${GOLD}aa` : '0 6px 30px #000'}}>{w.t}</div>;
        })}
        <div style={{marginTop: 36, opacity: sub, transform: `translateY(${(1 - sub) * 30}px)`, padding: '16px 44px', borderRadius: 18, background: GOLD, color: '#000', fontFamily: 'Poppins', fontWeight: 800, fontSize: 64, letterSpacing: 1}}>COM UM PLANO DE SAÚDE</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const a = spring({frame: f, fps: FPS, config: {damping: 14, stiffness: 140}});
  const b = spring({frame: f - 10, fps: FPS, config: {damping: 12, stiffness: 160}});
  const glow = 0.5 + 0.5 * Math.sin(f / 6);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Img src={staticFile('tr/7v.png')} style={{width: 1080, height: 1920, objectFit: 'cover', filter: 'blur(22px) brightness(.5) saturate(1.2)', transform: 'scale(1.12)'}} />
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 45%, ${GOLD}40, transparent 62%), linear-gradient(180deg,#000b,#0003 50%,#000d)`}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 60}}>
        <div style={{fontFamily: 'Poppins', fontWeight: 800, fontSize: 84, color: '#fff', textAlign: 'center', lineHeight: 1.05, opacity: a, transform: `scale(${0.85 + 0.15 * a})`}}>QUER FAZER<br />ESSAS TROCAS?</div>
        <div style={{marginTop: 50, opacity: b, transform: `scale(${0.7 + 0.3 * b})`, padding: '28px 70px', borderRadius: 28, background: GOLD, boxShadow: `0 0 ${50 + 40 * glow}px ${GOLD}aa`}}>
          <div style={{fontFamily: 'Poppins', fontWeight: 800, fontSize: 64, color: '#000', letterSpacing: 1}}>COMENTA <span style={{fontSize: 96, verticalAlign: 'middle'}}>TROCA</span></div>
        </div>
        <div style={{marginTop: 44, fontFamily: 'Poppins', fontWeight: 500, fontSize: 36, color: '#ffffffdd', textAlign: 'center', width: 860, opacity: b}}>Eu te chamo no WhatsApp e escolho o plano certo para o seu perfil.</div>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 60, right: 60, top: 1480, textAlign: 'center', fontFamily: 'Poppins', fontWeight: 500, fontSize: 30, lineHeight: 1.35, color: '#ffffffcc', opacity: interpolate(f, [fr(1.2), fr(1.7)], [0, 1], cl)}}>
        Carências, rede e valores variam por operadora e produto.<br />Para MEI: ativo há 180 dias; demais regras variam por operadora.
      </div>
    </AbsoluteFill>
  );
};

export const Troque: React.FC = () => {
  const seq: React.ReactNode[] = [];
  let t = HOOK;
  PAIRS.forEach((p, i) => {
    const n = i + 1;
    const pre = i % 2 === 0 ? 'esc' : 'est';
    const parts: [number, React.ReactNode][] = [
      [D_TROQUE, <Avatar src={`${pre}-troque.mp4`} label="TROQUE ISSO" d={D_TROQUE} />],
      [D_X, <SceneX n={n} text={p.x} d={D_X} />],
      [D_PORISSO, <Avatar src={`${pre}-porisso.mp4`} label="POR ISSO!" d={D_PORISSO} />],
      [D_V, <SceneV n={n} x={p.x} v={p.v} d={D_V} />],
    ];
    parts.forEach(([d, node], k) => {
      seq.push(<Sequence key={`${n}-${k}`} from={fr(t)} durationInFrames={fr(d) + 1}>{node}</Sequence>);
      t += d;
    });
  });
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <style>{fontCss}</style>
      <Audio src={staticFile('tr/trilha-47.mp3')} volume={0.12} />
      <Sequence from={0} durationInFrames={fr(HOOK) + 6}><Hook /></Sequence>
      <Sequence from={fr(0.3)}><Audio src={staticFile('tr/vo-hook.mp3')} /></Sequence>
      {seq}
      <Sequence from={fr(HOOK) + fr(P) * 7} durationInFrames={fr(CTA)}><Cta /></Sequence>
    </AbsoluteFill>
  );
};


// ================= VERSÃO 2: avatar à direita, cards subindo à esquerda =================
const G1 = 1.0, G2 = 1.6;
const P2 = D_TROQUE + G1 + D_PORISSO + G2;
export const DUR_TROQUE2 = fr(HOOK) + fr(P2) * 7 + fr(CTA);

const AvClip: React.FC<{src: string; dur: number; frozen?: boolean}> = ({src, dur, frozen}) => {
  const f = useCurrentFrame();
  const br = 1 + 0.004 * Math.sin(f / 14);
  const v = (st: React.CSSProperties) => (
    frozen
      ? <Img src={staticFile(`tr/${src.replace('.mp4', '-last.png')}`)} style={st} />
      : <OffthreadVideo src={staticFile(`tr/${src}`)} style={st} />
  );
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{overflow: 'hidden'}}>
        {v({width: 1080, height: 1920, objectFit: 'cover', transform: 'scale(1.5)', filter: 'blur(28px) brightness(.45) saturate(1.1)'})}
      </AbsoluteFill>
      <AbsoluteFill style={{transformOrigin: '50% 100%', transform: `translateX(250px) scale(${0.66 * br})`}}>
        {v({width: 1080, height: 1920, objectFit: 'cover'})}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const CardW = 630, CardX = 30;
const SideCard: React.FC<{kind: 'x' | 'v'; n: number; text: string; top: number; p: number; out: number}> = ({kind, n, text, top, p, out}) => {
  const isV = kind === 'v';
  const size = text.length <= 20 ? 66 : text.length <= 32 ? 56 : 48;
  return (
    <div style={{position: 'absolute', left: CardX, top, width: CardW, opacity: p * (1 - out), transform: `translateY(${(1 - p) * 620 - out * 420}px) scale(${0.94 + 0.06 * p})`, borderRadius: 34, overflow: 'hidden', background: 'rgba(8,8,8,.82)', border: `3px solid ${isV ? GOLD : '#8d9399'}`, boxShadow: isV ? `0 0 46px ${GOLD}66` : '0 10px 40px #000a'}}>
      <div style={{position: 'relative', height: 290, overflow: 'hidden'}}>
        <Img src={staticFile(`tr/${n}${kind}.png`)} style={{width: CardW, height: 290, objectFit: 'cover', objectPosition: '50% 58%', filter: isV ? 'brightness(1.25) contrast(1.08) saturate(1.2) sepia(.15)' : 'grayscale(1) brightness(.75) contrast(1.1)'}} />
        <div style={{position: 'absolute', left: 16, top: 14, transform: 'scale(.66)', transformOrigin: '0 0'}}><Chip kind={kind} n={n} /></div>
      </div>
      <div style={{display: 'flex', alignItems: 'flex-start', gap: 18, padding: '22px 24px 26px', minHeight: 190, boxSizing: 'border-box', alignItems: 'center'}}>
        <div style={{flexShrink: 0}}>{isV ? <IconV c={GOLD} s={64} /> : <IconX c="#c4c8cc" s={64} />}</div>
        <div style={{fontFamily: 'Poppins', fontWeight: 800, fontSize: size, lineHeight: 1.08, color: isV ? GOLD : '#c9cdd2', textDecoration: isV ? 'none' : 'line-through', textDecorationThickness: 3, textDecorationColor: '#ffffffaa', textShadow: isV ? `0 0 24px ${GOLD}55` : 'none'}}>{text}</div>
      </div>
    </div>
  );
};

const Pair2: React.FC<{n: number; x: string; v: string; pre: string}> = ({n, x, v, pre}) => {
  const f = useCurrentFrame();
  const sp = (at: number) => spring({frame: f - fr(at), fps: FPS, config: {damping: 15, stiffness: 120}});
  const xp = sp(0.12), vp = sp(D_TROQUE + G1 + 0.1);
  const out = interpolate(f, [fr(P2) - 12, fr(P2)], [0, 1], {...cl, easing: Easing.in(Easing.cubic)});
  const t2 = fr(D_TROQUE + G1);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Sequence from={0} durationInFrames={fr(D_TROQUE)}><AvClip src={`${pre}-troque.mp4`} dur={D_TROQUE} /></Sequence>
      <Sequence from={fr(D_TROQUE)} durationInFrames={fr(G1)}><AvClip src={`${pre}-troque.mp4`} dur={D_TROQUE} frozen /></Sequence>
      <Sequence from={t2} durationInFrames={fr(D_PORISSO)}><AvClip src={`${pre}-porisso.mp4`} dur={D_PORISSO} /></Sequence>
      <Sequence from={t2 + fr(D_PORISSO)}><AvClip src={`${pre}-porisso.mp4`} dur={D_PORISSO} frozen /></Sequence>
      <AbsoluteFill style={{background: 'linear-gradient(90deg, #000e 0%, #000b 42%, #0000 66%)'}} />
      <SideCard kind="x" n={n} text={x} top={250} p={xp} out={out} />
      <SideCard kind="v" n={n} text={v} top={810} p={vp} out={out} />
      <div style={{position: 'absolute', left: CardX, top: 1400, width: CardW, display: 'flex', justifyContent: 'center', gap: 14}}>
        {PAIRS.map((_, i) => <div key={i} style={{width: i + 1 === n ? 46 : 18, height: 14, borderRadius: 8, background: i + 1 <= n ? GOLD : '#ffffff40', boxShadow: i + 1 === n ? `0 0 16px ${GOLD}` : 'none'}} />)}
      </div>
    </AbsoluteFill>
  );
};

export const Troque2: React.FC = () => {
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <style>{fontCss}</style>
      <Audio src={staticFile('tr/trilha-47.mp3')} volume={0.12} />
      <Sequence from={0} durationInFrames={fr(HOOK) + 6}><Hook /></Sequence>
      <Sequence from={fr(0.3)}><Audio src={staticFile('tr/vo-hook.mp3')} /></Sequence>
      {PAIRS.map((p, i) => (
        <Sequence key={i} from={fr(HOOK) + fr(P2) * i} durationInFrames={fr(P2) + 1}>
          <Pair2 n={i + 1} x={p.x} v={p.v} pre={i % 2 === 0 ? 'esc' : 'est'} />
        </Sequence>
      ))}
      <Sequence from={fr(HOOK) + fr(P2) * 7} durationInFrames={fr(CTA)}><Cta /></Sequence>
    </AbsoluteFill>
  );
};
