import json,re
segs=[("Tem loja no bairro",0.35,1.16),("e é MEI?",1.33,1.77),("Presta atenção.",2.54,3.14),("Loja de informática,",3.67,4.80),
("mercearia,",4.93,5.73),("papelaria,",5.90,6.61),("todo comércio do bairro:",7.04,7.97),("com o seu MEI dá pra ter plano de saúde empresarial,",8.31,10.62),
("a partir de uma vida só.",10.97,12.07),("E o empresarial pode sair mais em conta que o individual.",12.61,15.22),("A regra:",15.73,16.11),
("o CNPJ ativo há 180 dias.",16.48,18.89),("O resto varia por operadora,",19.36,20.69),("e eu comparo pra você.",21.01,21.92),
("Comenta loja,",22.27,22.86),("que eu te mostro as opções.",23.10,24.06)]
ALT={'180':'centoeoitenta','CNPJ':'cenepejota'}
w=lambda t:len(re.sub(r'\W','',ALT.get(t,t)))+2
out=[]
for si,(txt,a,b) in enumerate(segs):
    ws=txt.split();ww=[w(x) for x in ws];T=sum(ww);t=a
    for x,k in zip(ws,ww):
        e=t+(b-a)*k/T; out.append({"t":x,"s":round(t,2),"e":round(e-0.03,2),"seg":si}); t=e
json.dump({"words":out,"segs":[{"t":s[0],"s":s[1],"e":s[2]} for s in segs]},open("/tmp/claude-0/rm/public/words26.json","w"),ensure_ascii=False)
