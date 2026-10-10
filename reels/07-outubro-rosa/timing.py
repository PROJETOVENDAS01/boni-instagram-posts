import json, os
_h = os.path.dirname(os.path.abspath(__file__))
WORDS = json.load(open(f'{_h}/words.json'))
def _w(t, n=0): return [x for x in WORDS if x['t'] == t][n]
BOUNDS = [0.0, _w('Descobrir',0)['s'] - 0.17, _w('Quando',0)['s'] - 0.17, _w('Converse',0)['s'] - 0.17, _w('Ter',0)['s'] - 0.17, _w('plano,',0)['s'] - 0.17]
END_START = _w('Comenta')['s'] - 0.2
DUR = round(WORDS[-1]['e'] + 1.7, 2)
KINETIC = [('OUTUBRO ROSA', 120, 560, _w('Outubro',0)['s'] - 0.05, _w('Rosa.',0)['e'] + 0.1),
           ('MAMOGRAFIA', 110, 560, _w('mamografia',0)['s'] - 0.05, _w('mamografia',0)['e'] + 0.1)]
