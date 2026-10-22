import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, random} from 'remotion';
import words from '../public/words31.json';
import {Gold3D} from './Promo50';

// Reel 31 "Quanto custa ir ao dentista sem plano?" — tela dividida: b-roll em cima, Thiago embaixo.
const FPS = 25;
const VOZ = 28.84;
const OUT = 28.75; // tela da marca depois da fala
export const DUR31 = Math.round((OUT + 3.4) * FPS);
const GOLD = '#F5B800', GOLD2 = '#FFD95A', RED = '#FF5A4E', F = 'Poppins';
const SPLIT = 940; // linha que divide os quadros
type W = {t: string; s: number; e: number; seg: number};
const WS: W[] = (words as any).words;
const fr = (s: number) => Math.round(s * FPS);
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const sp = (f: number, a: number, d = 16, st = 130) => spring({frame: f - fr(a), fps: FPS, config: {damping: d, stiffness: st}});
const fontCss = `
@font-face{font-family:Poppins;font-weight:800;src:url(${staticFile('Poppins-Bold.ttf')})}
@font-face{font-family:Poppins;font-weight:700;src:url(${staticFile('Poppins-Bold.ttf')})}
@font-face{font-family:Poppins;font-weight:500;src:url(${staticFile('Poppins-Medium.ttf')})}
@font-face{font-family:Poppins;font-weight:400;src:url(${staticFile('Poppins-Regular.ttf')})}`;

// b-roll de cima: [início, fim, arquivo, início dentro do clipe]
const BROLL: [number, number, string, number][] = [
  [0, 2.85, 'p31/d1-cadeira.mp4', 0],
  [2.85, 5.2, 'p31/d2-limpeza.mp4', 0],
  [5.2, 7.85, 'p31/d3-restauracao.mp4', 0],
  [7.85, 9.5, 'p31/d4-raiox.mp4', 0],
  [9.5, 11.9, 'p31/d5-dinheiro.mp4', 0],
  [11.9, 17.6, 'p31/d6-clinica.mp4', 0],
  [17.6, 21.25, 'p31/d7-implante.mp4', 0],
  [21.25, 24.15, 'p31/d8-relogio.mp4', 0],
  [24.15, 99, 'p31/d1-cadeira.mp4', 0.6],
];
// Thiago embaixo: 4 trechos alternando os visuais (áudio vem do voz.wav)
const AV: [number, number, string, number][] = [
  [0, 9.46, 'p31/av1.mp4', 0],
  [9.46, 17.55, 'p31/av2.mp4', 0],
  [17.55, 24.15, 'p31/av3.mp4', 0],
  [24.15, 99, 'p31/av4.mp4', 0],
];
const FACE: Record<string, [number, number]> = {'p31/av1.mp4': [640, 1.0], 'p31/av3.mp4': [640, 1.0], 'p31/av2.mp4': [585, 1.22], 'p31/av4.mp4': [585, 1.22]}; // [rosto y, zoom]

const Broll: React.FC = () => (
  <>
    {BROLL.map(([s, e, src, off], i) => (
      <Sequence key={i} from={fr(s)} durationInFrames={fr(Math.min(e, OUT + 4)) - fr(s)}>
        <BClip src={src} off={off} len={fr(Math.min(e, OUT)) - fr(s)} />
      </Sequence>
    ))}
  </>
);
const BClip: React.FC<{src: string; off: number; len: number}> = ({src, off, len}) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, Math.max(1, len)], [1.04, 1.12], cl);
  const fade = interpolate(f, [0, 4], [0, 1], cl);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: SPLIT, overflow: 'hidden', opacity: fade}}>
      <OffthreadVideo src={staticFile(src)} muted startFrom={fr(off)} playbackRate={Math.min(1, (4.9 - off) / Math.max(0.1, len / FPS))} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})`, filter: 'saturate(1.05) contrast(1.05) brightness(.92)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 70%, rgba(0,0,0,.55) 100%)'}} />
    </div>
  );
};
const Avatar: React.FC = () => (
  <>
    {AV.map(([s, e, src], i) => (
      <Sequence key={i} from={fr(s)} durationInFrames={fr(Math.min(e, OUT + 4)) - fr(s)}>
        <AvClip src={src} still={fr(VOZ - s - 0.1)} />
      </Sequence>
    ))}
  </>
);
const AvClip: React.FC<{src: string; still: number}> = ({src}) => {
  const f = useCurrentFrame();
  const [fy, zs] = FACE[src] ?? [610, 1];
  const ty = SPLIT + 400 - fy; // rosto fica uns 330px abaixo da divisão
  const z = zs * (1 + f * 0.0004);
  return (
    <div style={{position: 'absolute', left: 0, top: SPLIT, width: 1080, height: 1920 - SPLIT, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: ty - SPLIT, width: 1080, height: 1920, transform: `scale(${z})`, transformOrigin: `540px ${fy}px`}}>
        <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 14%, rgba(0,0,0,0) 62%, rgba(0,0,0,.7) 100%)'}} />
    </div>
  );
};
// faixa dourada que separa os quadros
const Divider: React.FC = () => {
  const f = useCurrentFrame();
  const x = (f * 9) % 1400 - 200;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: SPLIT - 3, height: 6, background: `linear-gradient(90deg, #7a4f12, ${GOLD}, #fff6cf ${x / 14}%, ${GOLD}, #7a4f12)`, boxShadow: '0 0 24px rgba(245,184,0,.8)'}} />
  );
};
const Brand: React.FC = () => {
  const f = useCurrentFrame();
  const p = sp(f, 0.05, 15, 150);
  return (
    <>
      <div style={{position: 'absolute', left: 50, right: 50, top: 150, height: 5, background: 'rgba(255,255,255,.25)', borderRadius: 3}}>
        <div style={{width: `${Math.min(1, f / fr(OUT)) * 100}%`, height: '100%', background: `linear-gradient(90deg, #b07a18, ${GOLD2})`, borderRadius: 3}} />
      </div>
      <div style={{position: 'absolute', right: 50, top: 175, display: 'flex', alignItems: 'center', gap: 12, opacity: p}}>
        <div style={{textAlign: 'right', fontFamily: F, fontWeight: 700, fontSize: 26, color: '#fff', lineHeight: 1.1, textShadow: '0 2px 8px #000'}}>BONI<br /><span style={{fontWeight: 600, fontSize: 18, color: GOLD2}}>Planos de Saúde</span></div>
        <Img src={staticFile('emblema.png')} style={{width: 64, height: 64, objectFit: 'contain'}} />
      </div>
      <div style={{position: 'absolute', left: 50, top: 180, opacity: p, padding: '6px 16px', borderRadius: 30, border: `2px solid ${GOLD}`, background: 'rgba(10,8,4,.6)', fontFamily: F, fontWeight: 700, fontSize: 20, color: '#fff', letterSpacing: 2}}>QUANTO CUSTA SEM PLANO?</div>
    </>
  );
};
// gancho: pergunta + valor gigante
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  if (f > fr(2.9) + 6) return null;
  const o = interpolate(f, [fr(2.9), fr(2.9) + 6], [1, 0], cl);
  const p1 = sp(f, 0.2, 14, 150), p2 = sp(f, 1.85, 12, 130);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', opacity: o}}>
      <div style={{fontFamily: F, fontWeight: 800, fontSize: 92, lineHeight: 1.02, color: '#fff', transform: `scale(${0.7 + 0.3 * p1})`, opacity: p1, textShadow: '0 6px 0 #7a4f12, 0 18px 40px rgba(0,0,0,.85)'}}>VAI AO DENTISTA<br />SEM PLANO?</div>
      {f >= fr(1.85) && <div style={{display: 'inline-block', marginTop: 18, padding: '8px 30px', borderRadius: 20, background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, fontFamily: F, fontWeight: 800, fontSize: 56, color: '#000', transform: `rotate(-2deg) scale(${p2})`}}>OLHA ESSA CONTA</div>}
    </div>
  );
};
// a nota que soma
const LINES: [number, string, string, string][] = [
  [2.94, '🪥', '2 limpezas', 'R$ 700'],
  [5.29, '🦷', '2 restaurações', 'R$ 240'],
  [7.89, '🩻', '1 canal', 'R$ 990'],
];
const Bill: React.FC = () => {
  const f = useCurrentFrame();
  const a = fr(2.9), b = fr(11.85);
  if (f < a || f > b + 8) return null;
  const o = interpolate(f, [b, b + 8], [1, 0], cl);
  const p = sp(f, 2.9, 16, 120);
  const tot = sp(f, 9.55, 14, 120);
  const count = Math.round(interpolate(f, [fr(9.55), fr(10.5)], [0, 1930], cl));
  return (
    <div style={{position: 'absolute', left: 90, right: 90, top: 300, opacity: o * p, transform: `translateY(${(1 - p) * 60}px) rotate(-1deg)`, padding: '26px 34px 22px', borderRadius: 18, background: 'rgba(250,246,236,.96)', boxShadow: '0 30px 70px rgba(0,0,0,.6), 0 0 0 3px rgba(245,184,0,.8)', fontFamily: F}}>
      <div style={{fontWeight: 800, fontSize: 30, letterSpacing: 4, color: '#7a4f12', textAlign: 'center', borderBottom: '3px dashed #c9b27a', paddingBottom: 10, marginBottom: 12}}>1 ANO DE DENTISTA · PARTICULAR</div>
      {LINES.map(([t, ic, l, v], i) => {
        if (f < fr(t)) return null;
        const q = sp(f, t, 13, 170);
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', fontSize: 38, fontWeight: 700, color: '#1a1408', margin: '8px 0', transform: `translateX(${(1 - q) * -40}px)`, opacity: q}}>
            <span style={{marginRight: 14}}>{ic}</span><span>{l}</span>
            <span style={{flex: 1, borderBottom: '3px dotted #b9a36a', margin: '0 14px', transform: 'translateY(8px)'}} />
            <span style={{fontWeight: 800, color: '#000'}}>{v}</span>
          </div>
        );
      })}
      {f >= fr(9.55) && (
        <div style={{marginTop: 14, paddingTop: 12, borderTop: '4px solid #1a1408', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transform: `scale(${0.85 + 0.15 * tot})`}}>
          <span style={{fontSize: 44, fontWeight: 800, color: '#1a1408'}}>TOTAL</span>
          <span style={{fontSize: 54, fontWeight: 800, color: '#c0392b'}}>+ de R$ {count.toLocaleString('pt-BR')}</span>
        </div>
      )}
    </div>
  );
};
const Tag: React.FC<{from: number; to: number; children: React.ReactNode; top?: number; color?: string}> = ({from, to, children, top = 360, color = GOLD}) => {
  const f = useCurrentFrame();
  if (f < fr(from) || f > fr(to) + 6) return null;
  const p = sp(f, from, 13, 150);
  const o = interpolate(f, [fr(to), fr(to) + 6], [1, 0], cl);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top, textAlign: 'center', opacity: o}}>
      <div style={{display: 'inline-block', transform: `scale(${0.6 + 0.4 * p})`, opacity: p, padding: '18px 40px 20px', borderRadius: 28, background: 'rgba(8,6,3,.72)', backdropFilter: 'blur(10px)', border: `3px solid ${color}`, boxShadow: `0 0 50px ${color}66`, fontFamily: F, fontWeight: 800, color: '#fff', textAlign: 'center'}}>{children}</div>
    </div>
  );
};
const Lista: React.FC<{itens: [number, string][]; mark: string; cor: string}> = ({itens, mark, cor}) => {
  const f = useCurrentFrame();
  return (
    <div style={{textAlign: 'left', marginTop: 8}}>
      {itens.map(([t, l], i) => { if (f < fr(t)) return null; const q = sp(f, t, 13, 170); return (
        <div key={i} style={{fontSize: 46, margin: '4px 0', transform: `translateX(${(1 - q) * -30}px)`, opacity: q}}><span style={{color: cor, marginRight: 14}}>{mark}</span>{l}</div>); })}
    </div>
  );
};
const Cover: React.FC = () => (
  <Tag from={11.98} to={17.55} color="#4BD37B" top={300}><div style={{fontSize: 34, letterSpacing: 4, color: '#9ff0bc'}}>O PLANO ODONTO COBRE</div><Lista itens={[[13.13, 'Limpeza'], [13.86, 'Restauração'], [14.88, 'Canal'], [15.78, 'Extração'], [16.63, 'Raio-x']]} mark="✓" cor="#4BD37B" /></Tag>
);
const Captions: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  if (t > 25.95) return null;
  const chunks: W[][] = [];
  const segs = Array.from(new Set(WS.map((w) => w.seg)));
  segs.forEach((sg) => { const ws = WS.filter((w) => w.seg === sg); for (let i = 0; i < ws.length; i += 3) chunks.push(ws.slice(i, i + 3)); });
  const ci = chunks.findIndex((c, i) => t >= c[0].s - 0.04 && t < Math.min(c[c.length - 1].e + 0.3, i + 1 < chunks.length ? chunks[i + 1][0].s - 0.04 : 99));
  if (ci < 0) return null;
  const c = chunks[ci];
  const p = sp(f, c[0].s - 0.04, 14, 220);
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: SPLIT + 26, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', opacity: p, transform: `scale(${0.88 + 0.12 * p})`}}>
      {c.map((w, i) => {
        const act = t >= w.s - 0.02 && t < w.e + 0.08;
        const key = /\d|mil|R\$|dentista|plano|odonto|limpeza|restaura|canal|extração|raio|implante|aparelho|clareamento|urgência|carência|DENTE/i.test(w.t);
        return <span key={i} style={{fontFamily: F, fontWeight: 800, fontSize: 56, margin: '0 13px', textTransform: 'uppercase', color: key ? GOLD : '#fff', transform: `scale(${act ? 1.1 : 1})`, display: 'inline-block', textShadow: '0 4px 0 rgba(0,0,0,.95), 0 0 24px rgba(0,0,0,.95)'}}>{w.t.replace(/[.,:?]$/, '')}</span>;
      })}
    </div>
  );
};
const Footer: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [fr(2.9), fr(3.3), fr(25.8), fr(26.2)], [0, 1, 1, 0], cl);
  return <div style={{position: 'absolute', left: 40, right: 40, top: SPLIT - 52, textAlign: 'center', opacity: o, fontFamily: F, fontWeight: 500, fontSize: 19, color: 'rgba(255,255,255,.88)', textShadow: '0 1px 6px #000'}}>Valores médios de referência no particular, pesquisados em 2025–2026. Podem variar conforme hospital, região e cada caso.</div>;
};
const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const a = 25.95;
  if (f < fr(a) || f > fr(OUT) + 4) return null;
  const p = sp(f, a, 16, 120);
  const sweep = interpolate((f - fr(a)) % 34, [0, 20], [-40, 140], cl);
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top: 300, padding: '28px 22px 24px', borderRadius: 36, background: 'rgba(10,8,4,.86)', border: '2px solid rgba(245,184,0,.75)', textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 80}px)`, fontFamily: F}}>
      <div style={{fontWeight: 800, fontSize: 40, color: '#fff', lineHeight: 1.15}}>Quer saber quanto<br /><span style={{color: GOLD2}}>fica o seu plano odonto?</span></div>
      <div style={{position: 'relative', display: 'inline-block', marginTop: 20, background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, padding: '14px 40px', borderRadius: 60, overflow: 'hidden', boxShadow: '0 0 50px rgba(245,184,0,.6)'}}>
        <span style={{fontWeight: 800, fontSize: 54, color: '#000'}}>Comenta DENTE</span>
        <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep}%`, width: '25%', background: 'linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,.7), rgba(255,255,255,0))'}} />
      </div>
      <div style={{fontWeight: 700, fontSize: 36, color: '#fff', marginTop: 16}}>ou clique no <span style={{color: GOLD}}>link da bio ↑</span></div>
      <div style={{fontWeight: 400, fontSize: 20, color: 'rgba(255,255,255,.78)', marginTop: 14}}>Carências, rede e valores variam por operadora e produto.</div>
    </div>
  );
};
const Outro: React.FC = () => {
  const f = useCurrentFrame();
  if (f < fr(OUT)) return null;
  const k = f - fr(OUT);
  const bg = interpolate(k, [0, 7], [0, 1], cl);
  const p1 = sp(f, OUT + 0.2, 14, 110), p3 = sp(f, OUT + 0.5, 16, 120);
  return (
    <AbsoluteFill style={{background: `rgba(0,0,0,${bg})`, alignItems: 'center', justifyContent: 'center'}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 42%, rgba(245,184,0,${0.22 * bg}), rgba(0,0,0,0) 55%)`}} />
      <div style={{textAlign: 'center', marginTop: -120, fontFamily: F}}>
        <Img src={staticFile('emblema.png')} style={{width: 250, height: 250, objectFit: 'contain', opacity: p1, mixBlendMode: 'screen', WebkitMaskImage: 'radial-gradient(circle, black 55%, transparent 72%)', transform: `scale(${0.6 + 0.4 * p1})`}} />
        <div style={{display: 'flex', justifyContent: 'center', marginTop: 16, opacity: p1, perspective: 900}}><Gold3D text="BONI" size={140} rotY={Math.sin(k / 20) * 8} sweep={interpolate(k, [10, 50], [-20, 130], cl)} /></div>
        <div style={{fontWeight: 600, fontSize: 36, letterSpacing: 4, color: '#fff', marginTop: 6, opacity: p3}}>CONSULTORIA EM PLANOS DE SAÚDE</div>
        <div style={{display: 'inline-block', marginTop: 44, padding: '14px 40px', borderRadius: 60, background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, fontWeight: 800, fontSize: 48, color: '#000', opacity: p3}}>Comenta DENTE</div>
        <div style={{fontWeight: 700, fontSize: 38, color: '#fff', marginTop: 20, opacity: p3}}>ou clique no <span style={{color: GOLD}}>link da bio ↑</span></div>
        <div style={{fontWeight: 400, fontSize: 21, color: 'rgba(255,255,255,.75)', marginTop: 36, opacity: p3, padding: '0 60px'}}>Valores médios de referência no particular, pesquisados em 2025–2026. Podem variar conforme hospital, região e cada caso. Carências, rede e valores variam por operadora e produto.</div>
      </div>
    </AbsoluteFill>
  );
};
const Flash: React.FC = () => {
  const f = useCurrentFrame();
  let o = 0;
  BROLL.slice(1).forEach(([s]) => { const d = f - fr(s); if (d >= 0 && d < 6) o = Math.max(o, interpolate(d, [0, 1, 6], [0, 0.35, 0])); });
  return o > 0 ? <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: SPLIT, background: '#fff6cf', opacity: o, mixBlendMode: 'screen'}} /> : null;
};
const Sfx: React.FC = () => (
  <>
    {BROLL.slice(1).map(([s], i) => <Sequence key={'w' + i} from={Math.max(0, fr(s) - 2)}><Audio src={staticFile('whoosh.wav')} volume={0.25} /></Sequence>)}
    {[9.55, 17.74, 21.5].map((t, i) => <Sequence key={'b' + i} from={fr(t)}><Audio src={staticFile('boom.wav')} volume={0.5} /></Sequence>)}
    {LINES.map(([t], i) => <Sequence key={'p' + i} from={fr(t)}><Audio src={staticFile('pop.wav')} volume={0.5} /></Sequence>)}
    {[OUT + 0.2].map((t, i) => <Sequence key={'o' + i} from={fr(t)}><Audio src={staticFile('boom.wav')} volume={0.4} /></Sequence>)}
  </>
);
export const Dente: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <style>{fontCss}</style>
    <Broll />
    <Avatar />
    <Flash />
    <Divider />
    <Brand />
    <Hook />
    <Bill />
    <Cover />
    <Tag from={17.74} to={21.2} color={RED}><div style={{fontSize: 32, letterSpacing: 4, color: '#ffb3ad'}}>COSTUMAM FICAR DE FORA</div><Lista itens={[[17.74, 'Implante'], [18.47, 'Aparelho'], [19.19, 'Clareamento']]} mark="✗" cor={RED} /></Tag>
    <Tag from={21.33} to={24.1}><div style={{fontSize: 34, letterSpacing: 4, color: GOLD2}}>URGÊNCIA: CARÊNCIA DE SÓ</div><div style={{display: 'flex', justifyContent: 'center', perspective: 900}}><Gold3D text="24 HORAS" size={110} rotY={0} sweep={60} /></div></Tag>
    <Tag from={24.25} to={25.9}><div style={{fontSize: 56}}>QUER SABER QUANTO<br />FICA O SEU?</div></Tag>
    <EndCard />
    <Footer />
    <Captions />
    <Outro />
    <Audio src={staticFile('p31/voz.wav')} />
    <Audio src={staticFile('music.mp3')} volume={(x) => interpolate(x, [0, 10, DUR31 - 20, DUR31], [0, 0.1, 0.1, 0], cl)} />
    <Sfx />
  </AbsoluteFill>
);
