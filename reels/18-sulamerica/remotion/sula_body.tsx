
// ---------- gold grade over the bright office ----------
const GoldGrade: React.FC = () => (
  <>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(60,40,0,.35), rgba(30,20,0,.15) 40%, rgba(0,0,0,.35))', mixBlendMode: 'multiply'}} />
    <AbsoluteFill style={{background: 'radial-gradient(circle at 70% 20%, rgba(255,200,90,.28), rgba(0,0,0,0) 55%)', mixBlendMode: 'soft-light'}} />
  </>
);

// ---------- SulAmérica logo on frosted glass plate ----------
const LogoPlate: React.FC<{from: number; to: number; top: number; w: number}> = ({from, to, top, w}) => {
  const f = useCurrentFrame();
  const a = fr(from), b = fr(to);
  if (f < a || f > b + 10) return null;
  const p = sp(f, from, 13, 150);
  const wipe = interpolate(f - a, [4, 18], [0, 100], {...cl, easing: Easing.out(Easing.cubic)});
  const sweep = interpolate(f - a, [14, 34], [-40, 140], cl);
  const o = interpolate(f, [b, b + 10], [1, 0], cl);
  const h = w * 372 / 1464;
  return (
    <div style={{position: 'absolute', left: (1080 - w - 80) / 2, top, perspective: 1000, opacity: o}}>
      <div style={{transform: `rotateX(${(1 - p) * 60}deg) scale(${0.7 + 0.3 * p})`, padding: '30px 40px', borderRadius: 30, background: 'linear-gradient(160deg, rgba(255,255,255,.92), rgba(255,255,255,.78))', border: `3px solid ${GOLD}`, boxShadow: `0 30px 60px rgba(0,0,0,.55), 0 0 50px rgba(245,184,0,.45), inset 0 1px 0 #fff`, position: 'relative', overflow: 'hidden'}}>
        <div style={{width: w, height: h, clipPath: `inset(0 ${100 - wipe}% 0 0)`}}>
          <Img src={staticFile('sulamerica.png')} style={{width: '100%', height: '100%'}} />
        </div>
        <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep}%`, width: '22%', background: 'linear-gradient(100deg, rgba(255,255,255,0), rgba(255,215,120,.65), rgba(255,255,255,0))', transform: 'skewX(-14deg)'}} />
      </div>
    </div>
  );
};

// ---------- motive 1: family + team join into 3+ ----------
const People: React.FC = () => {
  const f = useCurrentFrame();
  const a = fr(T.um), b = fr(T.dois) - 2;
  if (f < a || f > b + 8) return null;
  const o = interpolate(f, [b, b + 8], [1, 0], cl);
  const items: [number, string, string][] = [[T.familia, 'FAMÍLIA', 'M30 40 a10 10 0 1 0 0.1 0 M70 40 a10 10 0 1 0 0.1 0 M50 55 a7 7 0 1 0 0.1 0 M12 88 c0 -20 36 -20 36 0 M52 88 c0 -20 36 -20 36 0 M38 92 c0 -14 24 -14 24 0'], [T.func, 'FUNCIONÁRIOS', 'M20 35 h60 v45 h-60 z M38 35 v-10 h24 v10 M20 55 h60'], [T.ambos, 'OU OS DOIS', 'M20 52 l18 18 l42 -42']];
  return (
    <div style={{position: 'absolute', right: 40, top: 860, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-end', opacity: o}}>
      {items.map(([t, l, d], i) => {
        const p = sp(f, t, 12, 200);
        const ip = interpolate(f - fr(t), [2, 18], [0, 1], cl);
        return (
          <div key={l} style={{opacity: f >= fr(t) ? p : 0, transform: `translateX(${(1 - p) * 220}px)`, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 24px 10px 12px', borderRadius: 40, background: i === 2 ? `linear-gradient(90deg, ${GOLD}, ${GOLD2})` : 'rgba(20,14,4,.68)', backdropFilter: 'blur(12px)', border: `2px solid ${i === 2 ? GOLD : 'rgba(242,140,40,.8)'}`, boxShadow: '0 10px 30px rgba(0,0,0,.5)'}}>
            <svg width="50" height="50" viewBox="0 0 100 100"><path d={d} fill="none" stroke={i === 2 ? '#000' : GOLD} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ip} /></svg>
            <span style={{fontFamily: F, fontWeight: 800, fontSize: 34, color: i === 2 ? '#000' : '#fff'}}>{l}</span>
          </div>
        );
      })}
    </div>
  );
};

// ---------- motive 2: Rede D'Or 3D glass carousel ----------
const HOSP: [() => number, string, string, string][] = [
  [() => T.rios, 'h-rios-dor', "Rios D'Or", 'FREGUESIA'],
  [() => T.barra, 'h-barra-dor', "Barra D'Or", 'BARRA'],
  [() => T.quinta, 'h-quinta-dor', "Quinta D'Or", 'SÃO CRISTÓVÃO'],
  [() => T.gloria, 'h-gloria-dor', "Glória D'Or", 'GLÓRIA'],
  [() => T.copa, 'h-copa-dor', "Copa D'Or", 'COPACABANA'],
];
const Carousel: React.FC = () => {
  const f = useCurrentFrame();
  const a = fr(T.dois), b = fr(T.tres) - 3;
  if (f < a || f > b + 8) return null;
  const o = interpolate(f, [b, b + 8], [1, 0], cl);
  const lp = sp(f, T.dois + 0.15, 13, 160);
  // active index follows the spoken names with a spring between each
  let act = -1.2;
  HOSP.forEach(([t], i) => { act += (i === 0 ? 1.2 : 1) * sp(f, t() - 0.05, 16, 140); });
  const fan = sp(f, T.outros - 0.1, 14, 120);
  const intro = sp(f, T.rede - 0.3, 14, 120);
  const R = 430;
  return (
    <div style={{opacity: o}}>
      {/* Rede D'Or badge */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 245, display: 'flex', justifyContent: 'center', opacity: lp, transform: `translateY(${(1 - lp) * -40}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '12px 26px', borderRadius: 26, background: 'rgba(20,14,4,.7)', backdropFilter: 'blur(14px)', border: `2px solid ${GOLD}`, boxShadow: '0 0 40px rgba(245,184,0,.35)'}}>
          <Img src={staticFile('rededor-branca.png')} style={{height: 92, width: 92 * 1662 / 1020}} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 540 - 160, top: 1010, width: 320, height: 300, perspective: 1300, transformStyle: 'preserve-3d'}}>
        {HOSP.map(([t, img, name, bairro], i) => {
          const d = i - act;
          const ang = d * 34 * (1 - fan);
          const x = (Math.sin(ang * Math.PI / 180) * R) * (1 - fan) + fan * (i - 2) * 190;
          const z = (Math.cos(ang * Math.PI / 180) * R - R) * (1 - fan) - fan * 260;
          const y = fan * (Math.abs(i - 2) * 26 - 40);
          const sc = 1 - fan * 0.42;
          const front = Math.abs(d) < 0.5 && fan < 0.5;
          const sweep = interpolate((f + i * 7) % 60, [0, 24], [-60, 160], cl);
          const vis = intro * interpolate(Math.abs(d), [2.6, 3.4], [1, 0], cl) + fan;
          return (
            <div key={img} style={{position: 'absolute', inset: 0, transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${ang}deg) scale(${sc})`, opacity: Math.min(1, vis), zIndex: Math.round(100 - Math.abs(d) * 10)}}>
              <div style={{position: 'absolute', inset: 0, borderRadius: 24, overflow: 'hidden', border: `${front ? 3 : 2}px solid ${front ? GOLD : 'rgba(255,255,255,.4)'}`, boxShadow: `0 30px 60px rgba(0,0,0,.6), 0 0 ${front ? 50 : 0}px rgba(245,184,0,.5)`, background: 'rgba(255,255,255,.07)', backdropFilter: 'blur(6px)'}}>
                <Img src={staticFile(`img/${img}.jpg`)} style={{position: 'absolute', inset: 10, width: 300, height: 280, objectFit: 'cover', borderRadius: 16, filter: `brightness(${front || fan > 0.5 ? 1 : 0.6})`}} />
                <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(255,255,255,.3) 0%, rgba(255,255,255,.04) 35%, rgba(245,184,0,.12) 70%, rgba(0,0,0,.6) 100%)'}} />
                <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep}%`, width: '30%', background: 'linear-gradient(100deg, rgba(255,255,255,0), rgba(255,236,170,.4), rgba(255,255,255,0))', transform: 'skewX(-12deg)'}} />
                <div style={{position: 'absolute', left: 14, right: 14, bottom: 12}}>
                  <div style={{display: 'inline-block', padding: '3px 12px', borderRadius: 20, background: ORG, fontFamily: F, fontWeight: 700, fontSize: 16, color: '#fff'}}>📍 {bairro}</div>
                  <div style={{fontFamily: F, fontWeight: 800, fontSize: 32, color: '#fff', marginTop: 4, textShadow: '0 2px 10px #000'}}>{name}</div>
                </div>
              </div>
              {/* floor reflection */}
              <div style={{position: 'absolute', left: 0, right: 0, top: 306, height: 90, borderRadius: 24, background: 'linear-gradient(180deg, rgba(245,184,0,.18), rgba(0,0,0,0))', opacity: front ? 0.9 : 0.3, filter: 'blur(6px)'}} />
            </div>
          );
        })}
      </div>
      {f >= fr(T.outros) - 2 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 1240, display: 'flex', justifyContent: 'center', opacity: fan}}>
          <div style={{transform: `scale(${0.6 + 0.4 * fan})`, padding: '10px 28px', borderRadius: 40, background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, fontFamily: F, fontWeight: 800, fontSize: 34, color: '#000', boxShadow: '0 0 40px rgba(245,184,0,.6)'}}>+ ENTRE OUTROS</div>
        </div>
      )}
    </div>
  );
};

// ---------- motive 3: odonto + vida seals ----------
const Seals: React.FC = () => {
  const f = useCurrentFrame();
  const a = fr(T.tres), b = fr(T.quatro) - 2;
  if (f < a || f > b + 8) return null;
  const o = interpolate(f, [b, b + 8], [1, 0], cl);
  const items: [number, string, string][] = [
    [T.odonto, 'ODONTO', 'M30 20 c-14 0 -18 14 -14 30 c4 14 6 36 14 36 c8 0 6 -20 20 -20 c14 0 12 20 20 20 c8 0 10 -22 14 -36 c4 -16 0 -30 -14 -30 c-8 0 -12 6 -20 6 c-8 0 -12 -6 -20 -6 z'],
    [T.vida, 'SEGURO DE VIDA', 'M50 12 l32 12 v24 c0 22 -14 34 -32 42 c-18 -8 -32 -20 -32 -42 v-24 z M36 50 l10 10 l20 -20'],
  ];
  const st = sp(f, T.custo, 9, 200);
  return (
    <div style={{opacity: o}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 940, display: 'flex', justifyContent: 'center', gap: 36, perspective: 1000}}>
        {items.map(([t, l, d]) => {
          const p = sp(f, t - 0.05, 12, 170);
          const ip = interpolate(f - fr(t), [2, 20], [0, 1], cl);
          return (
            <div key={l} style={{width: 270, height: 250, borderRadius: 30, transform: `rotateY(${(1 - p) * 90}deg)`, opacity: f >= fr(t) - 2 ? 1 : 0, background: 'linear-gradient(160deg, rgba(255,255,255,.22), rgba(255,255,255,.05) 45%, rgba(0,0,0,.45))', backdropFilter: 'blur(14px)', border: `2px solid ${GOLD}`, boxShadow: '0 30px 60px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14}}>
              <svg width="110" height="110" viewBox="0 0 100 100" style={{filter: 'drop-shadow(0 0 12px rgba(245,184,0,.7))'}}><path d={d} fill="none" stroke={GOLD} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ip} /></svg>
              <div style={{fontFamily: F, fontWeight: 800, fontSize: l.length > 8 ? 26 : 34, color: '#fff'}}>{l}</div>
            </div>
          );
        })}
      </div>
      {f >= fr(T.custo) && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 1150, display: 'flex', justifyContent: 'center'}}>
          <div style={{transform: `scale(${2.2 - 1.2 * st}) rotate(-6deg)`, opacity: st, padding: '12px 30px', border: `5px solid ${GOLD}`, borderRadius: 16, background: 'rgba(0,0,0,.6)', fontFamily: F, fontWeight: 800, fontSize: 44, color: GOLD, letterSpacing: 2, boxShadow: '0 0 40px rgba(245,184,0,.5)'}}>SEM CUSTO A MAIS</div>
        </div>
      )}
    </div>
  );
};

// ---------- motive 4: Wellhub (antigo Gympass) ----------
const Wellhub: React.FC = () => {
  const f = useCurrentFrame();
  const a = fr(T.quatro), b = fr(T.tudo) - 2;
  if (f < a || f > b + 8) return null;
  const o = interpolate(f, [b, b + 8], [1, 0], cl);
  const p = sp(f, T.wellhub - 0.1, 12, 140);
  const g = sp(f, T.gym, 14, 160);
  const list: [number, string][] = [[T.acad, 'ACADEMIAS'], [T.yoga, 'YOGA'], [T.pil, 'PILATES'], [T.ter, 'TERAPIA ONLINE'], [T.med, 'MEDITAÇÃO']];
  const sweep = interpolate((f - a) % 50, [0, 22], [-50, 160], cl);
  return (
    <div style={{opacity: o}}>
      {f >= fr(T.wellhub) - 3 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 245, display: 'flex', justifyContent: 'center', perspective: 1100}}>
          <div style={{position: 'relative', width: 620, height: 348, borderRadius: 26, overflow: 'hidden', transform: `rotateX(${(1 - p) * -75}deg) scale(${0.75 + 0.25 * p})`, opacity: p, border: `3px solid ${GOLD}`, boxShadow: '0 30px 70px rgba(0,0,0,.6), 0 0 50px rgba(245,184,0,.4)'}}>
            <Img src={staticFile('img/gympass-wellhub.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(255,255,255,.25), rgba(255,255,255,0) 40%)'}} />
            <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep}%`, width: '25%', background: 'linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,.5), rgba(255,255,255,0))', transform: 'skewX(-12deg)'}} />
            {f >= fr(T.gym) && <div style={{position: 'absolute', left: 20, bottom: 18, padding: '6px 18px', borderRadius: 30, background: 'rgba(0,0,0,.75)', fontFamily: F, fontWeight: 800, fontSize: 26, color: GOLD, opacity: g, transform: `translateY(${(1 - g) * 30}px)`}}>O ANTIGO GYMPASS</div>}
          </div>
        </div>
      )}
      <div style={{position: 'absolute', right: 40, top: 900, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end'}}>
        {list.map(([t, l]) => {
          const q = sp(f, t, 12, 220);
          const on = f >= fr(t);
          return (
            <div key={l} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '8px 20px 8px 10px', borderRadius: 40, background: 'rgba(20,14,4,.7)', backdropFilter: 'blur(10px)', border: `2px solid ${GOLD}`, opacity: on ? 1 : 0, transform: `translateX(${(1 - q) * 160}px)`}}>
              <div style={{width: 36, height: 36, borderRadius: '50%', background: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <svg width="24" height="24" viewBox="0 0 100 100"><path d="M20 52 l18 18 l42 -42" fill="none" stroke="#000" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - q} /></svg>
              </div>
              <span style={{fontFamily: F, fontWeight: 800, fontSize: 30, color: '#fff'}}>{l}</span>
            </div>
          );
        })}
      </div>
    </div>
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
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,${0.85 * p}) 72%)`}} />
      <div style={{position: 'absolute', left: 60, right: 60, top: 1010, padding: '24px 20px 22px', borderRadius: 36, background: 'rgba(20,14,4,.8)', border: `2px solid rgba(245,184,0,.7)`, backdropFilter: 'blur(14px)', textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 120}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 18}}>
          <div style={{padding: '12px 18px', borderRadius: 16, background: 'rgba(255,255,255,.93)'}}><Img src={staticFile('sulamerica.png')} style={{width: 280, height: 280 * 372 / 1464}} /></div>
          <Img src={staticFile('emblema.png')} style={{width: 76, height: 76, objectFit: 'contain'}} />
        </div>
        <div style={{position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 14, background: `linear-gradient(90deg, ${GOLD}, ${GOLD2})`, padding: '14px 32px', borderRadius: 60, overflow: 'hidden', transform: `translateY(${bob}px)`, boxShadow: '0 0 50px rgba(245,184,0,.6)'}}>
          <svg width="46" height="46" viewBox="0 0 100 100"><path d={ICONS.chat[0]} fill="none" stroke="#000" strokeWidth="9" strokeLinejoin="round" /></svg>
          <span style={{fontFamily: F, fontWeight: 800, fontSize: 46, color: '#000'}}>Comenta SULAMÉRICA</span>
          <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep}%`, width: '25%', background: 'linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,.7), rgba(255,255,255,0))'}} />
        </div>
        <div style={{fontFamily: F, fontWeight: 700, fontSize: 36, color: '#fff', marginTop: 18}}>ou toque no <span style={{color: GOLD}}>Link na bio ↑</span></div>
        <div style={{fontFamily: F, fontWeight: 500, fontSize: 28, color: GOLD2, marginTop: 10}}>O plano certo para a sua empresa</div>
        <div style={{fontFamily: F, fontWeight: 400, fontSize: 21, color: 'rgba(255,255,255,.78)', marginTop: 12}}>Carências, rede e valores variam por operadora e produto.</div>
      </div>
    </>
  );
};

const Sfx: React.FC = () => {
  const wh = [0.05, T.sula0, T.um, T.dois, T.rios, T.barra, T.quinta, T.gloria, T.copa, T.tres, T.quatro, T.wellhub, T.comenta];
  const pops = [T.familia, T.func, T.ambos, T.odonto, T.vida, T.acad, T.yoga, T.pil, T.ter, T.med];
  return (
    <>
      {wh.map((t, i) => <Sequence key={'w' + i} from={Math.max(0, fr(t) - 2)}><Audio src={staticFile('whoosh.wav')} volume={0.38} /></Sequence>)}
      {[T.sula0, T.outros, T.custo].map((t, i) => <Sequence key={'b' + i} from={fr(t)}><Audio src={staticFile('boom.wav')} volume={0.5} /></Sequence>)}
      {pops.map((t, i) => <Sequence key={'p' + i} from={fr(t)}><Audio src={staticFile('pop.wav')} volume={0.42} /></Sequence>)}
    </>
  );
};

export const Sula: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <style>{fontCss}</style>
    <Camera>
      <OffthreadVideo src={staticFile('avatar18.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(.32) saturate(1.15) brightness(.8) contrast(1.1)'}} />
    </Camera>
    <GoldGrade />
    <Atmosphere />
    <Flash />
    <Lens />
    <Brand />
    <LogoPlate from={T.sula0 - 0.2} to={T.um - 0.1} top={950} w={560} />
    <Particles from={T.sula0} to={T.um} cx={540} cy={1030} n={36} />
    <BigNum at={T.um} to={T.dois - 0.05} n="1" label={'A PARTIR DE\n3 VIDAS'} />
    <People />
    <BigNum at={T.dois} to={T.rede - 0.1} n="2" label={'REDE D\'OR'} />
    <Carousel />
    <BigNum at={T.tres} to={T.quatro - 0.05} n="3" label={'ODONTO +\nSEGURO DE VIDA'} />
    <Seals />
    <BigNum at={T.quatro} to={T.wellhub - 0.2} n="4" label={'O GRANDE\nDIFERENCIAL'} />
    <Wellhub />
    <Captions />
    <EndCard />
    <Particles from={T.comenta} to={DURF / FPS} cx={540} cy={1100} n={30} />
    <Audio src={staticFile('music.mp3')} volume={(x) => interpolate(x, [0, 10, DURF - 20, DURF], [0, 0.12, 0.12, 0], cl)} />
    <Sfx />
  </AbsoluteFill>
);
