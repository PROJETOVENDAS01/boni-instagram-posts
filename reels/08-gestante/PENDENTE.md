# Pendente — Reel 08 (gestante): trocar a cena 4 por ultrassom

Pedido do Thiago (10/10/2026): na cena de "Quem entra grávida pode ficar sem o parto" usar uma imagem de grávida fazendo ultrassom (sem rosto).

Estado: o Reel atual usa `fundos/porta-fechada-corredor-vazio.png` (corredor com porta fechada, sem pessoa). Pode ser postado assim.

O que fazer:
1. Gerar imagem vertical 9:16, 2K, ElevenLabs flux-3-image (nao usar Higgsfield), prompt:
   "Ultra-realistic cinematic editorial photograph, 85mm lens, shallow depth of field: close-up of a pregnant belly during an ultrasound exam, a doctor's gloved hand gliding the transducer probe over the abdomen with gel, an ultrasound monitor glowing softly in the dark background with an abstract blurred grayscale scan, tight crop on the belly and hands only, warm golden rim light, deep black shadows, large dark negative space, no faces, no text, no logos"
2. Salvar em `fundos/gestante-ultrassom.png`, conferir que nao tem rosto nem texto legivel.
3. Em `reels/08-gestante/config.json`, trocar o fundo da cena 4 (indice 3, hoje `porta-fechada-corredor-vazio`) por `gestante-ultrassom`.
4. Rodar `python3 reels/make_reel.py reels/08-gestante` (cerca de 10 min), conferir o quadro, commitar (caminhos especificos), subir e enviar o mp4 ao Thiago.

Motivo do atraso: em 10/10/2026 as chamadas de criacao do ElevenLabs falharam na sessao ("missing required resultType"); leituras funcionavam. Nada foi gerado nem cobrado.
