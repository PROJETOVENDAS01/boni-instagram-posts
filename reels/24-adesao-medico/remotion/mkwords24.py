import json,re
segs=[("Doutor,",0.32,0.74),("dessa vez a receita é pra você.",0.91,2.36),("Plano de saúde com condições especiais pra sua classe:",2.95,5.99),
("é o plano por adesão,",6.39,7.47),("feito pro profissional formado em Medicina.",7.83,9.82),("Na receita:",10.31,10.94),
("condições pensadas pra sua categoria.",11.30,13.19),("Espaço pra família,",13.57,14.53),("conforme o produto.",14.71,15.37),
("E opções do simples ao alto padrão.",16.00,17.93),("Eu comparo as opções com você,",18.18,19.64),("pro seu perfil.",19.82,20.46),
("O que precisa?",20.92,21.61),("A carteira do conselho,",22.13,23.12),("ou o diploma.",23.52,24.12),("Só isso.",24.44,24.88),
("Receita assinada.",25.28,26.02),("Comenta médico,",26.42,27.09),("que eu te mostro as opções.",27.34,28.36)]
w=lambda t:len(re.sub(r'\W','',t))+2
out=[]
for si,(txt,a,b) in enumerate(segs):
    ws=txt.split();ww=[w(x) for x in ws];T=sum(ww);t=a
    for x,k in zip(ws,ww):
        e=t+(b-a)*k/T; out.append({"t":x,"s":round(t,2),"e":round(e-0.03,2),"seg":si}); t=e
json.dump({"words":out,"segs":[{"t":s[0],"s":s[1],"e":s[2]} for s in segs]},open("/tmp/claude-0/rm/public/words24.json","w"),ensure_ascii=False)
