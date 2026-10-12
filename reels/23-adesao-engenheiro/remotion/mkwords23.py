import json,re
segs=[("Engenheiro,",0.33,0.77),("faz essa conta comigo.",1.00,1.82),("Plano de saúde com condições especiais pra sua classe:",2.28,4.91),
("é o plano por adesão,",5.41,6.33),("feito pro profissional formado em Engenharia.",6.72,8.59),("Primeiro termo:",9.15,9.77),
("condições pensadas pra sua categoria.",10.19,12.02),("Mais:",12.66,13.05),("espaço pra família,",13.29,14.16),("conforme o produto.",14.34,15.12),
("Mais:",15.66,16.05),("do plano simples ao alto padrão.",16.36,17.91),("Eu comparo as opções com você, pro seu perfil.",18.31,20.55),
("O que precisa?",21.15,21.80),("A carteira do conselho,",22.30,23.27),("ou o diploma.",23.66,24.22),("Só isso.",24.78,25.19),
("Conta fechada.",25.55,26.17),("Comenta engenheiro,",26.51,27.22),("que eu te mostro as opções.",27.48,28.58)]
w=lambda t:len(re.sub(r'\W','',t))+2
out=[]
for si,(txt,a,b) in enumerate(segs):
    ws=txt.split();ww=[w(x) for x in ws];T=sum(ww);t=a
    for x,k in zip(ws,ww):
        e=t+(b-a)*k/T; out.append({"t":x,"s":round(t,2),"e":round(e-0.03,2),"seg":si}); t=e
json.dump({"words":out,"segs":[{"t":s[0],"s":s[1],"e":s[2]} for s in segs]},open("/tmp/claude-0/rm/public/words23.json","w"),ensure_ascii=False)
