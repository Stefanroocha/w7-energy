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

## Publicação

Publicado com GitHub Pages a partir da branch `main`.
