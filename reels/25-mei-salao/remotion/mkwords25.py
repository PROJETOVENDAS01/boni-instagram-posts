import json,re
segs=[("Tem salão de beleza e é MEI?",0.35,1.59),("Presta atenção.",2.30,2.91),("Manicure,",3.39,4.02),("cabeleireira,",4.18,4.90),
("cabeleireiro:",5.07,5.69),("com o seu MEI dá pra ter plano de saúde empresarial,",6.18,8.95),("a partir de uma vida só.",9.29,10.45),
("E o empresarial pode sair mais em conta",11.00,13.01),("que o individual.",13.21,13.85),("A regra:",14.37,14.76),
("o CNPJ ativo há 180 dias.",15.07,17.33),("O resto varia por operadora,",17.95,19.29),("e eu comparo pra você.",19.59,20.53),
("Comenta salão,",20.99,21.60),("que eu te mostro as opções.",21.83,22.77)]
ALT={'180':'centoeoitenta','CNPJ':'cenepejota'}
w=lambda t:len(re.sub(r'\W','',ALT.get(t,t)))+2
out=[]
for si,(txt,a,b) in enumerate(segs):
    ws=txt.split();ww=[w(x) for x in ws];T=sum(ww);t=a
    for x,k in zip(ws,ww):
        e=t+(b-a)*k/T; out.append({"t":x,"s":round(t,2),"e":round(e-0.03,2),"seg":si}); t=e
json.dump({"words":out,"segs":[{"t":s[0],"s":s[1],"e":s[2]} for s in segs]},open("/tmp/claude-0/rm/public/words25.json","w"),ensure_ascii=False)
