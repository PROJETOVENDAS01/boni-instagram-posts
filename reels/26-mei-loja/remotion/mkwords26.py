import json,re
segs=[("Tem loja no bairro",0.35,1.16),("e é MEI?",1.33,1.77),("Presta atenção.",2.54,3.14),("Loja de informática,",3.86,4.89),
("mercearia,",5.06,5.75),("papelaria,",5.80,6.51),("qualquer lojinha:",6.87,7.60),("com o seu MEI dá pra ter plano de saúde empresarial,",7.97,10.30),
("a partir de uma vida só.",10.65,11.75),("E o empresarial pode sair mais em conta que o individual.",12.29,14.90),("A regra:",15.41,15.79),
("o CNPJ ativo há 180 dias.",16.16,18.57),("O resto varia por operadora,",19.04,20.37),("e eu comparo pra você.",20.69,21.60),
("Comenta loja,",21.95,22.54),("que eu te mostro as opções.",22.78,23.74)]
ALT={'180':'centoeoitenta','CNPJ':'cenepejota'}
w=lambda t:len(re.sub(r'\W','',ALT.get(t,t)))+2
out=[]
for si,(txt,a,b) in enumerate(segs):
    ws=txt.split();ww=[w(x) for x in ws];T=sum(ww);t=a
    for x,k in zip(ws,ww):
        e=t+(b-a)*k/T; out.append({"t":x,"s":round(t,2),"e":round(e-0.03,2),"seg":si}); t=e
json.dump({"words":out,"segs":[{"t":s[0],"s":s[1],"e":s[2]} for s in segs]},open("/tmp/claude-0/rm/public/words26.json","w"),ensure_ascii=False)
