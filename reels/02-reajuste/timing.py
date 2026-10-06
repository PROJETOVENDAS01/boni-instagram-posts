"""Tempos derivados de words.json (transcricao da narracao B)."""
import json, os
_h = os.path.dirname(os.path.abspath(__file__))
WORDS = json.load(open(f'{_h}/words.json'))
def _w(t): return next(x for x in WORDS if x['t'] == t)
BOUNDS = [0.0, _w('Reajuste')['s'] - 0.17, _w('Mas')['s'] - 0.17, _w('Dependendo')['s'] - 0.17,
          _w('E,')['s'] - 0.17, _w('Antes')['s'] - 0.17]
END_START = _w('Comenta')['s'] - 0.2
DUR = round(WORDS[-1]['e'] + 1.7, 2)
KINETIC = [('SUBIU DE NOVO?', 100, 560, _w('SUBIU')['s'] - 0.05, _w('novo?')['e'] + 0.1),
           ('CARÊNCIAS', 130, 560, _w('carências')['s'] - 0.05, _w('cumpriu.')['e'] + 0.1)]
