# Portfólio — Daniel Augusto

Landing page / portfólio de Daniel Augusto — desenvolvedor de sistemas e automação.
Site estático (HTML + CSS + JS puro, sem build), pensado para ser servido direto pelo Nginx numa VPS.

## Estrutura

```
.
├── index.html            # página única (todas as seções)
├── assets/
│   ├── css/styles.css    # design system + layout
│   ├── js/main.js        # nav, galeria, lightbox, reveal, contadores
│   └── img/              # favicon + prints reais do GPS Vista
├── deploy/
│   ├── portfolio.nginx.conf   # server block de exemplo
│   └── DEPLOY.md              # passo a passo do deploy na VPS
└── README.md
```

## Rodar localmente

Não precisa de build. Qualquer servidor estático serve:

```bash
python -m http.server 5577
# abre http://127.0.0.1:5577
```

## Deploy

Site 100% estático — o deploy é um `git pull` na VPS + um `root` do Nginx apontando para esta pasta.
Veja [`deploy/DEPLOY.md`](deploy/DEPLOY.md).

## Conteúdo

Portfólio com trabalhos reais entregues para **Grupo GPS**, **ISA CTEEP**, **Edibra**,
**Equatorial/Proguarda** e **JI Ferreira Imóveis**, além de projetos de game dev (Unity/Roblox).
Nenhum dado sensível (CPF, credenciais, dados pessoais de terceiros) é exibido.

## Contato

- E-mail: daniel.aual08@gmail.com
- WhatsApp: (62) 99515-0112
- LinkedIn: https://www.linkedin.com/in/vitrolealves/
- GitHub: https://github.com/Vitrolesalves
