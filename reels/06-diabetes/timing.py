import json, os
_h = os.path.dirname(os.path.abspath(__file__))
WORDS = json.load(open(f'{_h}/words.json'))
def _w(t, n=0): return [x for x in WORDS if x['t'] == t][n]
BOUNDS = [0.0, _w('Sede',0)['s'] - 0.17, _w('Só',0)['s'] - 0.17, _w('Descobrir',0)['s'] - 0.17, _w('Com',0)['s'] - 0.17, _w('Check-up',0)['s'] - 0.17]
END_START = _w('Comenta')['s'] - 0.2
DUR = round(WORDS[-1]['e'] + 1.7, 2)
KINETIC = [('SÓ O EXAME CONFIRMA', 90, 560, _w('exame',0)['s'] - 0.05, _w('confirma.',0)['e'] + 0.1),
           ('DESCOBRIR CEDO', 100, 560, _w('Descobrir',0)['s'] - 0.05, _w('tudo.',0)['e'] + 0.1)]
