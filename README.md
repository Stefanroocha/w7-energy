# W7 Energy — Site institucional

Site da **W7 Energy | Energia Solar**, de Linhares - ES.
*Conectando economia e sustentabilidade.*

## Estrutura

```
index.html        Página única (landing page)
css/style.css     Estilos (cores no topo, em :root)
js/main.js        Menu, animações, simulador e formulário → WhatsApp
assets/logo.svg   Logo W7
```

HTML, CSS e JavaScript puros, sem build e sem dependências.

## Rodar localmente

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

## Personalizar

- **Cores:** variáveis `--navy-*`, `--blue-*` e `--yellow` em `css/style.css`.
- **WhatsApp:** constante `WHATSAPP` em `js/main.js` e links `wa.me` no `index.html`.
- **Simulador:** constantes no topo de `js/main.js` (tarifa, geração por kWp, potência do módulo).
- **Fotos dos projetos:** adicione a imagem em `assets/` e aplique no card:
  `<div class="project__img has-photo" style="background-image:url(assets/projeto-1.jpg)">`

## Formulário de orçamento → CRM

O formulário (`#leadForm`) já valida os campos, mostra carregamento e tela de sucesso.
Enquanto o CRM não estiver conectado, o envio é **simulado** (nada sai do navegador; o lead aparece no console).

Para conectar, em `js/main.js`:

```js
const CRM_ENDPOINT = "https://seu-crm.com/api/leads";   // URL do webhook/API
const CRM_HEADERS  = { "Content-Type": "application/json" /*, "Authorization": "Bearer ..." */ };
```

Payload enviado (POST, JSON):

```json
{
  "nome": "Maria da Silva",
  "telefone": "+5527997214733",
  "email": null,
  "cidade": "Linhares",
  "conta_media": 1250,
  "tipo_projeto": "Residencial",
  "consentimento_lgpd": true,
  "origem": "site",
  "utm_source": "instagram",
  "utm_medium": null,
  "utm_campaign": null,
  "pagina": "https://.../?utm_source=instagram",
  "enviado_em": "2026-09-23T15:00:00.000Z"
}
```

Se o CRM exigir outro formato (form-data, nomes de campo diferentes), ajuste a função `sendLead`.
Qualquer resposta que não seja 2xx mostra a mensagem de erro com o link do WhatsApp.

> Não coloque chaves secretas do CRM no front-end — o código é público. Use um webhook
> sem segredo (ex.: formulário/webhook do próprio CRM) ou um intermediário (Zapier, Make, n8n, função serverless).

## Publicação

Publicado com GitHub Pages a partir da branch `main`.
