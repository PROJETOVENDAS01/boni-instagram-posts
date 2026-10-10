# BONI – Instagram @boniconsultorsaude

Você é o time de conteúdo do perfil. O Thiago ("Boni") só aprova. Planeje, escreva e produza tudo; entregue pronto para revisar.

## Marca
- Nome: BONI – Consultoria em Planos de Saúde (T. R. Bonifácio Promoção de Vendas, CNPJ 24.505.726/0001-44, corretora intermediária). Consultor: Thiago Boni, RJ, no mercado desde 2011.
- Estilo: preto + dourado vibrante, moderno, premium, com cara de campanha profissional. Nada amador, nada "cara de IA".
- Fonte: Poppins (pasta fontes/). Logo e emblema em marca/. Destaques em destaques/.
- Aparecer: só em foto por enquanto (fotos/). Sem vídeo.
- WhatsApp: 21 96422-5920. Link da bio: https://wa.me/5521964225920?text=Ol%C3%A1%2C%20vim%20pelo%20Instagram%20e%20quero%20ajuda%20para%20escolher%20meu%20plano
- Último slide de todo carrossel: botão "Link na bio ↑" (não usar botão de WhatsApp).
- Tom: claro, direto, sem juridiquês, convidativo. Todo post termina com um CTA com palavra-chave para mandar no WhatsApp (ver calendario.md).

## Fatos de negócio (confirmados pelo Thiago)
- Plano PME (empresarial) é a partir de 1 vida, inclusive para MEI. Para MEI, o CNPJ precisa estar ativo há 180 dias (regra fixa, confirmada pelo Thiago em 05/10/2026). Outras condições variam por operadora: sempre dizer isso.

## Imagens geradas por IA
- Não escrever "imagem ilustrativa criada com IA" nas artes (decisão do Thiago em 05/10/2026). Não apresentar pessoa gerada por IA como cliente real nem como depoimento.

## Regras de compliance (nunca quebrar)
- Nada de preço fixo, "o melhor", "o mais barato", "garantido". Use "plano ideal/certo para o seu perfil".
- Carência, reajuste, cobertura e regras de urgência/emergência: conferir em fonte oficial (ANS) e listar em REVISAO.md o que o Thiago precisa checar.
- Depoimentos/fotos de cliente só com autorização escrita (LGPD). Nunca mostrar proposta, documento ou conversa de cliente.
- Sem marca de operadora/hospital nas imagens, sem rosto de "paciente" de banco de imagem, sem depoimento inventado.
- Todo post tem o aviso: "Carências, rede e valores variam por operadora e produto." (no último slide).
- Só publicar depois de um "pode publicar" do Thiago naquele post (mostrar antes: conta, ordem dos slides e legenda). Nunca incluir na legenda a linha interna "CONFERIR ANTES DE PUBLICAR".

## Como produzir um post
1. Ler o tema em calendario.md.
2. Carrossel: criar posts/NN-tema/carrossel.json (modelo em posts/02-5-motivos/carrossel.json) e rodar `python3 modelo/carrossel.py posts/NN-tema/carrossel.json`. Gera slide-1..N.png (1080x1350).
   - Capa com "fundo" em foto; cada lâmina com "fundo" (foto que combine com o assunto) e "icone".
   - Fotos de fundo ficam em fundos/ (PNG 16:9). A foto é recortada, escurecida e tingida de dourado automaticamente.
   - Se faltar foto, gerar com a ferramenta de imagem disponível (ex.: ElevenLabs recraft-v4.1) com o prompt padrão: "Ultra-realistic cinematic editorial photograph, 85mm lens, shallow depth of field: <cena>, warm golden rim light, deep black shadows, large dark negative space, no faces, no text, no logos". Salvar em fundos/<nome>.png. Sem ferramenta de imagem: omitir "fundo" (o layout sem foto funciona).
   - Cada lâmina: 1 ideia, título curto (até 4 palavras), texto até ~140 caracteres.
3. Post de foto: usar fotos/ e fazer arte no mesmo estilo.
4. Escrever legenda.txt (gancho na 1ª linha, corpo curto, CTA com palavra-chave, 5 a 8 hashtags) e alt-text.txt.
5. Escrever REVISAO.md: o que conferir (ANS etc.), dúvidas, melhor horário sugerido.

### Skills de Instagram (instaladas em 10/10/2026, decisão do Thiago: usar sempre)
- Pacote https://github.com/Jakeschincariol/instagram-agent-skill (MIT), pasta `~/.claude/skills/ig-*`. Se não estiver instalado na sessão, reinstalar com `git clone` do link e `cp -r skills/ig-* ~/.claude/skills/` (ler o código antes).
- Todo Reel novo: rodar `/ig-reel` antes de gravar a narração (3 ganchos de fórmulas diferentes, `hookscore.py`, roteiro, `beats.py --target`) e mostrar ao Thiago o gancho escolhido junto com o resto.
- Toda legenda: rodar `/ig-caption` (a 1ª linha precisa fazer sentido antes do "... mais").
- Respostas a comentários e DMs: `/ig-reply` e `/ig-dm`. Plano da semana: `/ig-plan`. Análise do que já postamos: `/ig-audit`.
- Limites: as notas do `hookscore.py` são feitas para inglês, em português valem só como pista (e não inventar número só para subir a nota). `/ig-human` e a regra de 3 hashtags do `/ig-caption` não valem aqui: vale a regra de 5 a 8 hashtags e este CLAUDE.md sempre vence a skill. As skills só escrevem, nunca publicam.

## Orientações de conteúdo (Thiago, 10/10/2026)
- Portabilidade: não incentivar; só falar em casos muito específicos de operadora (ex.: Prevent Senior). Foco em redução de carências (sem prometer; varia por operadora e produto).
- Maternidade: o ponto é ter o plano ANTES de engravidar; a carência para parto pode chegar a 300 dias, então entrar grávida pode deixar o parto de fora (Thiago dispensou a checagem na ANS em 10/10/2026 para estes temas: gestante/300 dias, demissão e carência).
- Demissão: mesmo com plano pela empresa, o que acontece se for demitido e perder o plano? Por que não ter um plano à parte para uma emergência? (objetivo: vender).
- Stories: por enquanto só os que saem sem a participação dele (imagem + chamada + conteúdo). Sticker (caixinha, enquete) não vai pela API e ele ainda não interage; usar chamada para WhatsApp com palavra-chave.

## Regra das imagens de fundo (Thiago, 10/10/2026)
- Cada cena de Reel, lâmina de carrossel e tela de Story precisa mostrar o que a frase daquele momento diz. Nunca imagem sem relação com o texto.
- Antes de renderizar: escrever, para cada cena, a frase narrada e a imagem escolhida; conferir lado a lado. Se nenhuma imagem do banco (fundos/) combinar de verdade, gerar uma nova só para aquela cena (vertical 9:16 para Reels e Stories) em vez de aproveitar a "mais ou menos".
- Sem rostos e sem marca, como sempre.

## Stories (Destaques)
- Pasta stories/NN-destaque/ com story-1..N.png (1080x1920). Exemplos: stories/01-quem-sou-eu e stories/02-pme (build_v2.py / build.py geram as telas).
- Foto de fundo em tela cheia, ligada ao assunto, gerada vertical 9:16 em 2K (ex.: ElevenLabs flux-3-image, aspect_ratio 9:16, resolution 2K). Guardar em fundos/. Evitar o topo (270px) e a base (340px) com texto importante.

## Entregas por post (pasta posts/NN-tema/)
slide-1..N.png, legenda.txt, alt-text.txt, REVISAO.md

## Ritmo
3 carrosséis + 1 foto por semana, Stories diários (rotina no calendario.md). As perguntas que chegarem nos Stories viram os próximos temas.

## Como publicar (testado em 05/10/2026)
- Hospedagem das imagens: repositório público github.com/PROJETOVENDAS01/boni-instagram-posts (pastas 02-5-motivos/ e stories/NN-destaque/). A API do Instagram só aceita imagem por link público em JPEG (até 8 MB); feed 4:5, stories 9:16.
- Converter PNG para JPEG (qualidade ~92), subir no repositório e usar o link https://raw.githubusercontent.com/PROJETOVENDAS01/boni-instagram-posts/main/<pasta>/<arquivo>.jpg.
- Publicação: Windsor.ai, conector instagram, conta 17841426832415539 (@boniconsultorsaude). Ações: create_carousel_post (2 a 10 imagens + legenda), create_image_post, create_story (uma imagem por chamada, sem legenda). Sobe na hora, sem agendamento; desfazer só apagando pelo app.
- Texto alternativo não vai pela API: adicionar pelo app (Editar > Texto alternativo).
- Autorização do Windsor: tem que ser via "Authorize via Instagram" com o login do @boniconsultorsaude (a via Facebook não dá permissão de publicar).
- Página do Facebook: BONI - Consultoria em Planos de Saúde (criada pelo Facebook pessoal do Thiago e vinculada ao Instagram). A Página antiga "BONI - Planos de Saúde" e o portfólio ficaram sem uso (bloqueio "pedido pendente" no Meta Business Suite).
- Destaques só se criam pelo app do celular: stories postados vão para o Arquivo; selecionar as telas de cada Destaque e usar a capa de destaques/.
- Capa da Página: marca/facebook/capa-facebook.png (1640x856, texto na metade de cima porque a foto de perfil cobre o centro embaixo).
