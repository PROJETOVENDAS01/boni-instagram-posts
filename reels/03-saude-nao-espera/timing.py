"""Tempos derivados de words.json (transcricao da narracao C)."""
import json, os
_h = os.path.dirname(os.path.abspath(__file__))
WORDS = json.load(open(f'{_h}/words.json'))
def _w(t): return next(x for x in WORDS if x['t'] == t)
# cenas: 1 calendario | 2 sala lotada (Emergencia) | 3 corredor (Cirurgia) | 4 relogio (Saude NAO espera) | 5 estetoscopio (Mas existe) | 6 pasta (Eu analiso)
BOUNDS = [0.0, _w('Emergência')['s'] - 0.17, _w('Cirurgia')['s'] - 0.17, _w('Saúde')['s'] - 0.17,
          _w('Mas')['s'] - 0.17, _w('Eu')['s'] - 0.17]
END_START = _w('Comenta')['s'] - 0.2
DUR = round(WORDS[-1]['e'] + 1.7, 2)
KINETIC = [('SAÚDE NÃO ESPERA!', 100, 560, _w('Saúde')['s'] - 0.05, _w('espera!')['e'] + 0.1),
           ('EM PAUSA', 150, 560, _w('Em')['s'] - 0.05, _w('PAUSA.')['e'] + 0.1)]
