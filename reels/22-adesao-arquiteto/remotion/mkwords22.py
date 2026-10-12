import json,re
segs=[("Arquiteto,",0.31,0.78),("vamos desenhar o seu projeto.",1.26,2.48),("O briefing:",2.79,3.25),
("plano de saúde com condições especiais pra sua classe.",3.72,6.48),("É o plano por adesão,",6.89,7.93),
("feito pro profissional formado em Arquitetura.",8.33,10.24),("Na planta,",10.77,11.28),("três ambientes:",11.45,12.21),
("condições pensadas pra sua categoria.",12.62,14.52),("Espaço pra família,",14.88,15.80),("conforme o produto.",15.99,16.84),
("E acabamento do simples",17.17,18.35),("ao alto padrão.",18.52,19.17),("Eu comparo as opções com você,",19.61,20.97),
("pro seu perfil.",21.17,21.77),("O que precisa?",22.30,22.96),("A carteira do conselho,",23.65,24.71),("ou o diploma.",25.12,25.73),
("Só isso.",26.21,26.71),("Projeto aprovado.",27.16,27.96),("Comenta arquiteto,",28.37,29.22),("que eu te mostro as opções.",29.57,30.67)]
w=lambda t:len(re.sub(r'\W','',t))+2
out=[]
for si,(txt,a,b) in enumerate(segs):
    ws=txt.split();ww=[w(x) for x in ws];T=sum(ww);t=a
    for x,k in zip(ws,ww):
        e=t+(b-a)*k/T; out.append({"t":x,"s":round(t,2),"e":round(e-0.03,2),"seg":si}); t=e
json.dump({"words":out,"segs":[{"t":s[0],"s":s[1],"e":s[2]} for s in segs]},open("/tmp/claude-0/rm/public/words22.json","w"),ensure_ascii=False)
