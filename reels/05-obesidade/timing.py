import json, os
_h = os.path.dirname(os.path.abspath(__file__))
WORDS = json.load(open(f'{_h}/words.json'))
def _w(t, n=0): return [x for x in WORDS if x['t'] == t][n]
BOUNDS = [0.0, _w('Deixar',0)['s'] - 0.17, _w('pode',0)['s'] - 0.17, _w('O',0)['s'] - 0.17, _w('Sem',0)['s'] - 0.17, _w('Ter',0)['s'] - 0.17]
END_START = _w('Comenta')['s'] - 0.2
DUR = round(WORDS[-1]['e'] + 1.7, 2)
KINETIC = [('DOENÇA CRÔNICA', 100, 560, _w('doença',0)['s'] - 0.05, _w('crônica,',0)['e'] + 0.1),
           ('SEM DIETA DA MODA', 100, 560, _w('Sem',0)['s'] - 0.05, _w('moda.',0)['e'] + 0.1)]
