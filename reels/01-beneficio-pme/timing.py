"""Tempos derivados de words.json (saida do splice.py)."""
import json, os
_h = os.path.dirname(os.path.abspath(__file__))
WORDS = json.load(open(f'{_h}/words.json'))
def _w(t): return next(x for x in WORDS if x['t'] == t)
BOUNDS = [0.0, _w('Salário')['s'] - 0.17, _w('Benefício')['s'] - 0.17, _w('Plano')['s'] - 0.17,
          _w('Para')['s'] - 0.17, _w('As')['s'] - 0.17]
END_START = _w('Comenta')['s'] - 0.2
DUR = round(WORDS[-1]['e'] + 1.7, 2)
KINETIC = [('1 VIDA', 210, 560, _w('1')['s'] - 0.05, _w('vida.')['e'] + 0.1),
           ('MEI: 180 DIAS', 112, 560, _w('MEI,')['s'] - 0.05, _w('dias.')['e'] + 0.15)]
