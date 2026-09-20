# Deploy na VPS

Site estático → o deploy é clonar o repositório, apontar o Nginx e, para atualizar, `git pull`.

> ⚠️ **Atenção:** nesta VPS também roda o **bot do Discord**. Todos os passos abaixo mexem
> apenas em Nginx e na pasta do site de cheats. **Nada aqui toca no serviço/pasta do bot.**
> Antes de remover qualquer coisa, confira o que está rodando (`systemctl list-units`,
> `docker ps`, `crontab -l`) para não derrubar o bot por engano.

## 1. Clonar o repositório

```bash
sudo mkdir -p /var/www
sudo git clone git@github.com:Vitrolesalves/<REPO>.git /var/www/portfolio
# (ou https:// com token, se preferir)
```

## 2. Trocar o site de cheats pelo portfólio (reaproveitando o domínio)

1. Descobrir qual server block responde pelo domínio hoje:
   ```bash
   grep -rl "SEU_DOMINIO" /etc/nginx/sites-enabled/ /etc/nginx/sites-available/
   ```
2. Fazer backup e desativar o site antigo (NÃO apagar ainda):
   ```bash
   sudo cp /etc/nginx/sites-available/<site-cheats> ~/backup-nginx-cheats.conf
   sudo rm /etc/nginx/sites-enabled/<site-cheats>
   ```
3. Instalar o server block do portfólio (troque SEU_DOMINIO no arquivo antes):
   ```bash
   sudo cp /var/www/portfolio/deploy/portfolio.nginx.conf /etc/nginx/sites-available/portfolio
   sudo ln -sf /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/portfolio
   sudo nginx -t && sudo systemctl reload nginx
   ```
4. Conferir no navegador que o portfólio está no ar pelo domínio.
5. Só então remover os arquivos do site antigo (o backup do config já está salvo):
   ```bash
   # confirmar o caminho no root do config antigo antes!
   sudo rm -rf /var/www/<pasta-do-site-de-cheats>
   ```

## 3. HTTPS

```bash
sudo certbot --nginx -d SEU_DOMINIO -d www.SEU_DOMINIO
```

## 4. Atualizar o site depois

```bash
cd /var/www/portfolio && sudo git pull
```

Pronto — sem build, sem restart de app. O Nginx já serve a versão nova.
