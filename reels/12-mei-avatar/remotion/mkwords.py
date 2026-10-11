import json,re
segs=[("MEI",0.31,0.64),("pode ter plano de saúde",0.82,1.92),("empresarial.",1.95,2.457),("Sabia?",2.95,3.28),
("O plano PME",3.94,4.89),("pode começar a partir de uma vida.",5.01,6.53),("Ou seja,",7.04,7.48),("só você.",7.80,8.36),
("Sem funcionário.",8.94,9.69),("O CNPJ precisa estar ativo há 180 dias.",10.17,13.38),("O resto muda",13.88,14.32),("de operadora,",14.57,15.38),
("e eu olho o seu caso.",15.81,16.63),("Comenta MEI,",17.27,17.83),("ou chama no link da bio.",18.15,19.11)]
ALT={'CNPJ':'ceenepejota','180':'centoeoitenta','PME':'peemee','MEI,':'meii','MEI':'meii'}
w=lambda t:len(re.sub(r'\W','',ALT.get(t,t)))+2
out=[];
for si,(txt,a,b) in enumerate(segs):
    ws=txt.split();ww=[w(x) for x in ws];T=sum(ww);t=a
    for x,k in zip(ws,ww):
        e=t+(b-a)*k/T; out.append({"t":x,"s":round(t,2),"e":round(e-0.03,2),"seg":si}); t=e
json.dump({"words":out,"segs":[{"t":s[0],"s":s[1],"e":s[2]} for s in segs]},open("public/words.json","w"),ensure_ascii=False)
print(len(out))
