import React from 'react';
import {Composition} from 'remotion';
import {Loading, DUR_LOADING} from './Loading';
import {BateTela, BTProps, durBT} from './BateTela';

const BT: Record<string, BTProps> = {
  'BT-MEI': {look: 'cafe', falaDur: 1.0, toqueIni: 0.2, toqueDur: 2.1, knockAt: 0.65, vo: 'vo-mei.mp3', freezeAt: 0.05, voDur: 8.39, tDest: 5.16, tB: 6.36, tSub: 7.6, fala: 'Você que é MEI!', hookA: 'CNPJ com 180 dias já pode ter plano de saúde', hookDestaque: 'empresarial', hookB: 'a partir de 1 vida', sub: 'Só você já conta como 1 vida.', palavra: 'MEI'},
  'BT-GESTANTE': {look: 'corredor', falaDur: 1.75, toqueIni: 0.6, toqueDur: 2.3, knockAt: 1.4, vo: 'vo-gestante.mp3', voDur: 5.51, tDest: 1.24, tB: 1.62, tSub: 2.82, fala: 'Pensando em engravidar?', hookA: 'Faça o plano de saúde', hookDestaque: 'antes', hookB: 'de engravidar', sub: 'A carência para o parto pode chegar a 300 dias.', palavra: 'GESTANTE'},
  'BT-DEMISSAO': {look: 'reuniao', falaDur: 1.7, toqueIni: 0.2, toqueDur: 2.1, knockAt: 0.65, vo: 'vo-demissao.mp3', voDur: 5.41, tDest: 2.77, tB: 3.4, tSub: 4.22, fala: 'Seu plano é da empresa?', hookA: 'Se você for demitido, o plano de saúde pode', hookDestaque: 'acabar junto', hookB: '', sub: 'Ter um plano só seu evita ficar sem cobertura.', palavra: 'PLANO'},
  'BT-ADESAO': {look: 'escritorio', falaDur: 1.8, toqueIni: 0.2, toqueDur: 2.1, knockAt: 0.65, vo: 'vo-adesao.mp3', voDur: 6.14, tDest: 3.03, tB: 3.6, tSub: 3.88, fala: 'Você que tem diploma!', hookA: 'Sua profissão pode dar acesso a plano de saúde por', hookDestaque: 'adesão', hookB: '', sub: 'Com condições especiais para a sua classe.', palavra: 'ADESÃO'},
};

export const Root: React.FC = () => (
  <>
    <Composition id="LOADING" component={Loading} durationInFrames={DUR_LOADING} fps={30} width={1080} height={1920} />
    {Object.entries(BT).map(([id, p]) => (
      <Composition key={id} id={id} component={BateTela} defaultProps={p} durationInFrames={durBT(p)} fps={30} width={1080} height={1920} />
    ))}
  </>
);
