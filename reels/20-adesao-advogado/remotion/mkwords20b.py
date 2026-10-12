import json,re
segs=[("Advogado,",0.31,0.87),("vamos abrir esse processo.",1.15,2.22),("O pedido:",2.64,3.10),
("plano de saúde com condições especiais pra sua classe.",3.51,6.22),("É o plano por adesão,",6.64,7.68),
("feito pro profissional do Direito.",7.99,9.28),("Primeira prova:",9.80,10.41),("condições pensadas pra sua categoria.",10.86,12.88),
("Segunda prova:",13.36,14.04),("dá pra incluir a família, conforme o produto.",14.43,16.32),("Terceira prova:",16.96,17.70),
("tem do plano simples ao alto padrão.",18.00,19.85),("E eu comparo as opções com você,",20.39,21.71),("pro seu perfil.",22.04,22.62),
("Documentos?",23.12,23.69),("A carteira da OAB,",23.96,24.78),("ou o diploma.",25.08,25.65),("Só isso.",25.97,26.43),
("Pedido deferido.",26.84,27.58),("Comenta advogado,",28.01,28.85),("que eu te mostro as opções.",28.85,29.88)]
ALT={'OAB,':'oabê'}
w=lambda t:len(re.sub(r'\W','',ALT.get(t,t)))+2
out=[]
for si,(txt,a,b) in enumerate(segs):
    ws=txt.split();ww=[w(x) for x in ws];T=sum(ww);t=a
    for x,k in zip(ws,ww):
        e=t+(b-a)*k/T; out.append({"t":x,"s":round(t,2),"e":round(e-0.03,2),"seg":si}); t=e
json.dump({"words":out,"segs":[{"t":s[0],"s":s[1],"e":s[2]} for s in segs]},open("/tmp/claude-0/rm/public/words20b.json","w"),ensure_ascii=False)
