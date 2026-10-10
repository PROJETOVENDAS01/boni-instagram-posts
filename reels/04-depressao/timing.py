"""Tempos derivados de words.json (transcricao da narracao do Reel 04)."""
import json, os
_h = os.path.dirname(os.path.abspath(__file__))
WORDS = json.load(open(f'{_h}/words.json'))
def _w(t, n=0): return [x for x in WORDS if x['t'] == t][n]
# cenas: 1 poltrona | 2 calendario (Isso) | 3 relogio (E doenca) | 4 estetoscopio (Procure) | 5 celular (Se precisar) | 6 pasta c/ coracao (Cuidar)
BOUNDS = [0.0, _w('Isso')['s'] - 0.17, _w('É')['s'] - 0.17, _w('Procure')['s'] - 0.17,
          _w('Se')['s'] - 0.17, _w('Cuidar')['s'] - 0.17]
END_START = _w('Comenta')['s'] - 0.2
DUR = round(WORDS[-1]['e'] + 1.7, 2)
KINETIC = [('NÃO É FRESCURA', 100, 560, _w('frescura,')['s'] - 0.6, _w('fraqueza.')['e'] + 0.1),
           ('TEM TRATAMENTO', 100, 560, _w('tem')['s'] - 0.05, _w('tratamento.')['e'] + 0.1),
           ('CVV 188', 170, 560, _w('liga')['s'] - 0.05, _w('V.')['e'] + 0.1)]
