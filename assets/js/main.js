/* ===========================================================
   Daniel Augusto — Portfólio interativo (Airbnb-style)
   =========================================================== */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var el = function (html) { var t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  var finePointer = window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* ---------- kinetic text: quebra o headline em palavras p/ animar em stagger ---------- */
  function splitText(node) {
    var walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null);
    var texts = []; var n;
    while ((n = walker.nextNode())) texts.push(n);
    var wordIndex = 0;
    texts.forEach(function (textNode) {
      var words = textNode.textContent.split(/(\s+)/).filter(function (w) { return w.length; });
      var frag = document.createDocumentFragment();
      words.forEach(function (w) {
        if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
        var outer = document.createElement('span'); outer.className = 'split-word';
        var inner = document.createElement('span'); inner.className = 'split-inner';
        inner.style.transitionDelay = (wordIndex * 55) + 'ms';
        inner.textContent = w;
        outer.appendChild(inner); frag.appendChild(outer);
        wordIndex++;
      });
      textNode.parentNode.replaceChild(frag, textNode);
    });
  }
  $$('[data-split]').forEach(function (h) {
    try { splitText(h); } catch (e) { }
    var reveal = function () { h.classList.add('in'); };
    // caminho normal: rAF duplo garante que o navegador "commitou" o estado inicial antes de animar
    requestAnimationFrame(function () { requestAnimationFrame(reveal); });
    // rede de segurança: se rAF ficar pausado (aba em 2º plano no load), revela mesmo assim
    setTimeout(reveal, 400);
  });

  /* ---------- cursor customizado (dot + ring com inércia) ---------- */
  if (finePointer) {
    document.body.classList.add('has-cursor');
    var cursor = $('#cursor');
    if (cursor) {
      var dot = $('.cursor__dot', cursor), ring = $('.cursor__ring', cursor);
      var mx = 0, my = 0, rx = 0, ry = 0;
      // sempre readiciona 'on' a cada movimento — autocorretivo: mesmo que algo
      // remova a classe por engano (ex.: um bug futuro), o próximo mousemove já resolve,
      // em vez de ficar sumido até um F5 (era isso que causava "só volta com Ctrl+Shift+R")
      window.addEventListener('mousemove', function (e) {
        mx = e.clientX; my = e.clientY;
        cursor.classList.add('on');
        dot.style.setProperty('--cx', mx + 'px'); dot.style.setProperty('--cy', my + 'px');
      }, { passive: true });
      (function loop() {
        rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
        ring.style.setProperty('--rx', rx + 'px'); ring.style.setProperty('--ry', ry + 'px');
        requestAnimationFrame(loop);
      })();
      document.addEventListener('mouseover', function (e) {
        var big = e.target.closest && e.target.closest('a,button,.card,[role="button"],input,select,textarea');
        cursor.classList.toggle('big', !!big);
      });
      // esconde só quando o mouse sai de VERDADE da janela. mouseleave (sem capture,
      // direto no document) só dispara quando o ponteiro sai do documento E de todos
      // os seus descendentes — inclusive iframes — nunca ao simplesmente passar por
      // cima de um. (a versão anterior usava mouseout+relatedTarget, que reporta
      // relatedTarget=null ao entrar em QUALQUER iframe da página — e este site tem
      // vários: preview dos cards, as vitrines do GPS Flow/Conecta, o modal de demo —
      // por isso sumia toda hora.)
      document.addEventListener('mouseleave', function () { cursor.classList.remove('on'); });
    }
  }

  /* ---------- botões magnéticos (atraídos pelo cursor perto) ---------- */
  if (finePointer) {
    $$('.btn--primary, .btn--ghost, .btn--dark').forEach(function (b) {
      b.classList.add('magnetic');
      var raf = null, tx = 0, ty = 0, cx = 0, cy = 0;
      function tick() {
        cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
        b.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px)';
        if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) raf = requestAnimationFrame(tick); else raf = null;
      }
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        tx = (e.clientX - r.left - r.width / 2) * 0.35; ty = (e.clientY - r.top - r.height / 2) * 0.45;
        if (!raf) raf = requestAnimationFrame(tick);
      });
      b.addEventListener('mouseleave', function () { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(tick); });
    });
  }

  /* ---------- ícones ---------- */
  var IC = {
    grid:'<path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>',
    window:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/>',
    robot:'<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4M9 14h.01M15 14h.01M2 13h2M20 13h2"/>',
    server:'<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>',
    game:'<rect x="2" y="7" width="20" height="10" rx="4"/><path d="M7 12h3M8.5 10.5v3M15.5 11h.01M18 13h.01"/>',
    check:'<path d="M20 6L9 17l-5-5"/>',
    star:'<path d="M12 2l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.8 6.1 20l1.2-6.5L2.5 8.9 9 8z" fill="currentColor" stroke="none"/>',
    db:'<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    doc:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    bolt:'<path d="M13 2L4 14h6l-1 8 9-12h-6z"/>',
    qr:'<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h3v3h-3zM19 14h1v1h-1zM17 19h3v1h-3zM19 17h1v1h-1z" fill="currentColor" stroke="none"/>',
    lock:'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    wifi:'<path d="M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0M12 19h.01"/>',
    cart:'<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.5 13h11l2-9H6"/>',
    cog:'<circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M4 12H1M23 12h-3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
    cloud:'<path d="M6 18a4 4 0 0 1 .5-8 6 6 0 0 1 11.5 2 3.5 3.5 0 0 1-1 7z"/>',
    key:'<circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v4M15 12v3"/>',
    money:'<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>',
    puzzle:'<path d="M9 3a2 2 0 0 1 4 0v1h3a1 1 0 0 1 1 1v3h1a2 2 0 0 1 0 4h-1v3a1 1 0 0 1-1 1h-3v-1a2 2 0 0 0-4 0v1H6a1 1 0 0 1-1-1v-3H4a2 2 0 0 1 0-4h1V5a1 1 0 0 1 1-1h3z"/>'
  };
  var svg = function (name, w) { return '<svg width="' + (w || 22) + '" height="' + (w || 22) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (IC[name] || '') + '</svg>'; };

  var SHOTS = ['assets/img/gpsvista-home.png','assets/img/gpsvista-torre.png','assets/img/gpsvista-cmo.png','assets/img/gpsvista-implantacoes.png','assets/img/gpsvista-fluxo.png'];

  /* ---------- categorias ---------- */
  var CATS = [
    { id:'all',  label:'Todos',            icon:'grid' },
    { id:'web',  label:'Sistemas Web',      icon:'window' },
    { id:'auto', label:'Automação & RPA',   icon:'robot' },
    { id:'infra',label:'Infraestrutura',    icon:'server' },
    { id:'game', label:'Game Dev',          icon:'game' }
  ];

  /* ---------- projetos ---------- */
  var P = [
    {
      id:'gpsvista', cat:'web', title:'GPS Vista — Gestão à Vista', company:'Grupo GPS',
      tag:'★ Projeto principal', tagRed:true, year:'2025–2026', metric:'Em produção · nacional',
      cover:{ type:'shots', shots:SHOTS },
      sub:['Sistemas Web','Grupo GPS','Produção nacional'],
      tagline:'O sistema operacional de uma das maiores empresas de facilities do Brasil — usado hoje pelas regionais do país inteiro.',
      problem:'A operação vivia em papel, planilhas e grupos de WhatsApp: livro de ocorrências manual, rondas sem evidência, indicadores montados à mão no fim do mês. Cada regional fazia do seu jeito e o corporativo não enxergava nada em tempo real.',
      solution:'Um único sistema web com permissão por página e por papel, digitalizando fluxo a fluxo. Começou em uma regional; deu resultado e o corporativo adotou como padrão nacional. Essa virada guiou a decisão de arquitetura mais importante: roteamento multi-banco — cada regional com seu próprio PostgreSQL, escolhido em runtime pelo Django.',
      result:'Mais de 40 módulos em produção: Torre de Controle (livro de ocorrências com auditoria por hash encadeado), Livro Ata com QR Code + WhatsApp, avaliação psicossocial NR-01 (para a ISA CTEEP), gestão da qualidade, CMO de efetivo e o módulo de manutenção da Edibra. Roda como app no celular do supervisor em campo (PWA).',
      feats:[
        {i:'db',t:'Multi-banco por regional',d:'router customizado, aliases em runtime, réplica read-only p/ relatórios'},
        {i:'shield',t:'Auditoria imutável',d:'registros do livro encadeados por hash'},
        {i:'doc',t:'Geração de documentos',d:'Word (NR-01), PDF, planilhas e QR gerados automaticamente'},
        {i:'lock',t:'Migração de senhas legadas',d:'base MD5 antiga → Argon2 no 1º login'}
      ],
      stack:['Python 3.12','Django 5.2','PostgreSQL','Redis','Docker','Nginx','Pandas','Ollama'],
      liveDemo:{ url:'assets/demos/gpsflow/home.html', name:'GPS Flow', note:'O frontend real do sistema (versão atual, já rebatizada para FLOW), rodando com dados de exemplo. Navegue pelo menu lateral e pelas abas — é a interface de verdade.' },
      tour:[
        {i:'window',t:'Home',d:'Painel inicial: atalhos para os módulos e monitoramento dos sistemas integrados.',p:'assets/demos/gpsflow/home.html'},
        {i:'wifi',t:'Torre de Controle',d:'Livro de ocorrências digital com trilha de auditoria (hash encadeado), planos de ação, aprovações e compras.',p:'assets/demos/gpsflow/torre-controle.html'},
        {i:'shield',t:'Auditor de Ronda',d:'Auditoria das rondas — inclusive análise por IA — com evidências, reprovações e ranking por colaborador/local.',p:'assets/demos/gpsflow/auditoria.html'},
        {i:'check',t:'Gestão da Qualidade',d:'Treinamentos, visitas técnicas, não conformidades e planos de ação, com CRUD completo e evidências.',p:'assets/demos/gpsflow/qualidade.html'},
        {i:'money',t:'Financeiro',d:'Acompanhamento de orçamento x compras, alertas de estouro e ingestão de planilhas — com assistente de análise.',p:'assets/demos/gpsflow/financeiro.html'},
        {i:'server',t:'Implantações',d:'Acompanhamento e fluxo (kanban) da implantação de contratos, por serviço e regional.',p:'assets/demos/gpsflow/implantacoes.html'},
        {i:'cog',t:'Planner',d:'Kanban de projetos com etapas padronizadas, SLA, checklist, prioridade e responsáveis.',p:'assets/demos/gpsflow/planner.html'},
        {i:'doc',t:'Psicossocial NR-01',d:'Avaliação psicossocial baseada no COPSOQ II: importa respostas, calcula scores e gera o relatório.',p:'assets/demos/gpsflow/psicossocial.html'},
        {i:'db',t:'Gestão de Salas',d:'Cadastro de unidades e salas, reservas com calendário e QR Code por sala.',p:'assets/demos/gpsflow/gestao-salas.html'},
        {i:'cart',t:'Chamado',d:'Abertura e acompanhamento de chamados/tickets com prioridade, status e SLA.',p:'assets/demos/gpsflow/chamados.html'},
        {i:'qr',t:'Geradores (QR/Etiquetas)',d:'Geração de QR Codes e etiquetas em PDF para os pontos de operação.',p:'assets/demos/gpsflow/qr-generator.html'},
        {i:'lock',t:'Controle de Acessos',d:'Usuários e permissões por página e por papel (admin, gerente, coordenador, supervisor).',p:'assets/demos/gpsflow/controle-acessos.html'}
      ],
      links:[{label:'Ver versão pública no GitHub',url:'https://github.com/Vitrolesalves/gestao-a-vista'}]
    },
    {
      id:'conecta', cat:'web', title:'Conecta Jurídico', company:'Jurídico corporativo',
      tag:'Governança + IA', year:'2026', metric:'Plataforma interna',
      cover:{ type:'shots', shots:['assets/img/conecta-feed.png','assets/img/conecta-relatorios.png','assets/img/conecta-regulatorio.png'] },
      sub:['Sistemas Web','Jurídico corporativo','IA'],
      tagline:'Governança de contratos com uma IA que lê e resume as tratativas.',
      problem:'A área jurídica se afogava em e-mails desestruturados, prazos perdidos e documentos espalhados — sem rastreabilidade para auditoria e compliance.',
      solution:'Uma plataforma de governança contratual com chamados inteligentes: campos, anexos e aprovadores mudam conforme a norma e a criticidade. Timeline colaborativa por demanda, gestão de SLA e uma IA — a Lexia — que lê contratos em PDF/DOCX e resume as tratativas.',
      result:'Um único ambiente para solicitações, aprovações, evidências e histórico — do início ao encerramento de cada demanda, pronto para auditoria.',
      feats:[
        {i:'puzzle',t:'Chamados que se adaptam',d:'formulário muda conforme norma e criticidade'},
        {i:'bolt',t:'Timeline colaborativa',d:'histórico, anexos e aprovações por demanda'},
        {i:'doc',t:'IA Lexia',d:'lê PDF/DOCX e resume contratos e tratativas'},
        {i:'chart',t:'Gestão de SLA',d:'prazos e responsáveis rastreáveis'}
      ],
      stack:['Django','PostgreSQL','Ollama (LLM)','python-docx','pypdf'],
      liveDemo:{ url:'assets/demos/conecta/dashboard.html', name:'Conecta Jurídico', note:'O frontend real da plataforma, com dados de exemplo. Navegue pelo feed e abra "Novo Chamado" para ver o formulário que se adapta à norma.' },
      tour:[
        {i:'window',t:'Feed Jurídico',d:'Mural das demandas com busca, filtro por norma e resumo da fila (processos, SLA, concluídos).',p:'assets/demos/conecta/dashboard.html'},
        {i:'puzzle',t:'Novo Chamado',d:'Formulário inteligente: campos, anexos e aprovadores mudam conforme a norma e a criticidade.',p:'assets/demos/conecta/novo-chamado.html'},
        {i:'bolt',t:'Meus Chamados',d:'Lista e acompanhamento das demandas com status, prioridade e timeline por chamado.',p:'assets/demos/conecta/chamados.html'},
        {i:'chart',t:'Relatórios de Risco',d:'Visão de risco e conformidade das tratativas para auditoria e compliance.',p:'assets/demos/conecta/relatorios.html'},
        {i:'doc',t:'Base de Conhecimento',d:'Documentos, modelos e materiais de referência centralizados.',p:'assets/demos/conecta/conhecimento.html'},
        {i:'shield',t:'Regulatório',d:'Informações e acompanhamento regulatório da área jurídica.',p:'assets/demos/conecta/regulatorio.html'}
      ],
      links:[]
    },
    {
      id:'qr', cat:'auto', title:'Gerador de Etiquetas QR', company:'Grupo GPS',
      tag:'App desktop', year:'2025', metric:'Ferramenta interna',
      cover:{ type:'designed', kind:'qr', icon:'qr', inner:
        '<div class="cvi"><div class="cvi__bar"><i></i><i></i><i></i><span>Gerador de Etiquetas</span></div>'+
        '<div class="cvi__body" style="text-align:center">'+ qrSVG('CR-1042','cvi__qr') +
        '<div>LOCAL → SALA TÉCNICA<br>16 etiquetas / A4 · 300 DPI</div></div></div>' },
      sub:['Automação','Grupo GPS','Desktop'],
      tagline:'Centenas de etiquetas de QR por operação — geradas em lote, em PDF pronto pra impressão.',
      problem:'Cada posto de operação precisa de uma etiqueta com QR Code para o supervisor registrar o turno no local — e eram centenas, montadas manualmente.',
      solution:'Um app desktop que consulta a árvore de locais no PostgreSQL (CTE recursiva), monta um PDF com 16 etiquetas por página A4 a 300 DPI, com preview em tempo real e logo do cliente posicionável por drag & drop. Distribuído como .exe.',
      result:'O que era um trabalho manual e demorado virou "digita o código do contrato e gera o PDF". Testa aqui embaixo. 👇',
      demo:'qr',
      feats:[
        {i:'db',t:'Consulta recursiva',d:'CTE WITH RECURSIVE percorre a árvore de locais'},
        {i:'doc',t:'PDF 300 DPI',d:'16 etiquetas por A4, prontas para impressão'},
        {i:'cog',t:'Preview + drag & drop',d:'logo do cliente posicionável em tempo real'}
      ],
      stack:['Python','Tkinter','Pillow','psycopg2','PyInstaller'],
      links:[{label:'Ver no GitHub',url:'https://github.com/Vitrolesalves/gerador-etiquetas-qr'}]
    },
    {
      id:'tunel', cat:'infra', title:'Gerenciador de Túnel SSH', company:'Grupo GPS',
      tag:'Infra', year:'2025', metric:'Ferramenta interna',
      cover:{ type:'designed', kind:'terminal', icon:'server', inner:
        '<div class="cvi cvi--term"><div class="cvi__bar"><i></i><i></i><i></i><span>TunelServidor.exe</span></div>'+
        '<div class="cvi__body"><span class="tgreen">●</span> TÚNEL ATIVO base → VPS:5433<br>'+
        '<span class="tgray">conexões</span> 3 · <span class="tgray">total</span> 128<br>'+
        '<span class="tgray">watchdog</span> 45s · timeout 15s<br>'+
        '<span class="tgreen">✓</span> latência de VPN eliminada</div></div>' },
      sub:['Infraestrutura','Grupo GPS','Python'],
      tagline:'O túnel que tirou a latência da VPN do caminho do banco — e volta sozinho quando cai.',
      problem:'O sistema web rodava na VPS, mas o banco ficava na rede interna atrás de VPN. A latência deixava o site arrastado a ponto de atrapalhar a operação.',
      solution:'Um túnel SSH reverso ligando o banco on-premise à VPS, com reconexão automática, watchdog que detecta queda silenciosa (não só o keepalive), backoff exponencial e um painel de status para a equipe.',
      result:'A latência da VPN saiu do caminho das queries. Distribuído como .exe: qualquer pessoa da equipe roda com dois cliques, e o painel avisa (visual + bipe) se algo cair.',
      feats:[
        {i:'wifi',t:'Detecção de queda silenciosa',d:'watchdog ativo, não só o keepalive'},
        {i:'cog',t:'Reconexão com backoff',d:'3s, 6s, 12s… até religar sozinho'},
        {i:'chart',t:'Painel de status',d:'verde/vermelho + histórico, pensado p/ a equipe'}
      ],
      stack:['Python','paramiko','rich','PyInstaller'],
      links:[{label:'Ver no GitHub',url:'https://github.com/Vitrolesalves/ssh-tunnel-manager'}]
    },
    {
      id:'equatorial', cat:'auto', title:'Robô de Faturas — Equatorial', company:'Proguarda',
      tag:'RPA', year:'2026', metric:'Automação mensal',
      cover:{ type:'designed', kind:'terminal', icon:'robot', inner:
        '<div class="cvi cvi--term"><div class="cvi__bar"><i></i><i></i><i></i><span>robô · equatorial-faturas</span></div>'+
        '<div class="cvi__body"><span class="tgray">UC 632.971…</span> <span class="tgreen">✓ baixado</span><br>'+
        '<span class="tgray">UC 905.771…</span> <span class="tblue">↓ PDF</span><br>'+
        '<span class="tred">🛡 WAF Imperva</span><br><span class="tgreen">→ extensão no Chrome real: OK</span></div></div>' },
      sub:['Automação','Proguarda','Playwright'],
      tagline:'Baixa as faturas de energia de dezenas de unidades — e venceu o anti-bot do jeito certo.',
      problem:'Baixar todo mês as faturas de energia de dezenas de unidades consumidoras, uma a uma, e digitar valor, vencimento e consumo à mão.',
      solution:'Um robô que baixa o PDF completo de cada UC e extrai os dados para uma planilha. O portal fica atrás de um WAF Imperva que barra automação headless — mapeei isso e virei a estratégia para uma extensão de navegador (Manifest V3) que roda dentro do Chrome real do operador, depois do login.',
      result:'Engenharia honesta: entendi o bloqueio e desenhei em cima dele, em vez de brigar com o anti-bot. O operador loga uma vez e a extensão varre a lista de UCs em fila.',
      feats:[
        {i:'robot',t:'Download em lote',d:'PDF completo de cada UC, padronizado'},
        {i:'chart',t:'Extração de dados',d:'valor, vencimento, kWh → planilha'},
        {i:'shield',t:'Contorno de WAF',d:'extensão MV3 na sessão real, sem CDP'}
      ],
      stack:['Python','Playwright','Chrome Extension MV3','PDF parsing'],
      links:[]
    },
    {
      id:'imoveis', cat:'auto', title:'Automação de Documentos', company:'JI Ferreira Imóveis',
      tag:'Automação', year:'2025', metric:'Imobiliária · SP',
      cover:{ type:'designed', kind:'doc', icon:'doc', inner:
        '<div class="paperm"><div class="h">JI Ferreira Imóveis</div><div class="t">Contrato de Locação</div>'+
        '<div class="l"></div><div class="l w70"></div><div class="l w50"></div></div>' },
      sub:['Automação','JI Ferreira Imóveis','Documentos'],
      tagline:'Contratos e propostas da imobiliária gerados sozinhos, padronizados e prontos pra assinar.',
      problem:'Uma imobiliária gera dezenas de contratos, propostas e recibos por semana — sempre os mesmos modelos, preenchidos manualmente, sujeitos a erro e retrabalho.',
      solution:'Uma automação que recebe os dados do imóvel e das partes e monta o documento final padronizado, pronto para assinatura — cortando o trabalho manual e padronizando a saída.',
      result:'Menos retrabalho, menos erro de digitação e um padrão só para todos os documentos. Dados sensíveis (CPF e afins) tratados com cuidado.',
      feats:[
        {i:'doc',t:'Modelos padronizados',d:'contratos, propostas e recibos a partir dos dados'},
        {i:'bolt',t:'Preenchimento automático',d:'do dado bruto ao documento pronto'},
        {i:'lock',t:'Cuidado com dados sensíveis',d:'CPF e afins tratados com atenção'}
      ],
      stack:['Python','Geração de documentos','Templates','Automação'],
      links:[]
    },
    {
      id:'discord', cat:'auto', title:'Bot de Vendas Discord + Roblox', company:'Produto próprio',
      tag:'PIX automático', year:'2026', metric:'24/7 · sem intervenção',
      cover:{ type:'designed', kind:'discord', icon:'cart', inner:
        '<div class="cvi"><div class="cvi__bar"><i></i><i></i><i></i><span># loja · BOT</span></div>'+
        '<div class="cvi__body"><div class="dcemb"><div class="barr"></div><div class="in"><b>Cargo VIP — R$ 29,<span style="color:var(--red)">93</span></b><br>PIX · valor único<br><span style="color:#1a9d63">✓ pago → entregue no Roblox</span></div></div></div></div>' },
      sub:['Automação','Produto próprio','Pagamentos'],
      tagline:'Vende, confere o PIX e entrega o produto sozinho — inclusive dentro do Roblox.',
      problem:'Vender itens digitais e liberar acesso sem ninguém conferir pagamento e entregar na mão, 24 horas por dia.',
      solution:'Um bot que gera cobrança PIX (Mercado Pago) com centavos aleatórios — cada valor vira único, então a confirmação é automática (webhook + polling de segurança) e idempotente: nunca entrega duas vezes nem sem o valor exato. Ao pagar, entrega o cargo no Discord e o item dentro do Roblox via script Luau autenticado.',
      result:'Uma loja que roda sozinha. Testa o fluxo de compra aqui embaixo 👇',
      demo:'discord',
      feats:[
        {i:'money',t:'PIX com centavos únicos',d:'cada cobrança é identificável automaticamente'},
        {i:'check',t:'Confirmação idempotente',d:'webhook + polling; nunca entrega em dobro'},
        {i:'game',t:'Entrega no Roblox',d:'item enviado in-game via Luau autenticado'},
        {i:'shield',t:'Anti-fraude',d:'rebusca o pagamento na API antes de creditar'}
      ],
      stack:['Python','discord.py','Mercado Pago (PIX)','SQLite','Luau/Roblox'],
      links:[]
    },
    {
      id:'mmo', cat:'game', title:'Unity — MMO Architecture', company:'Open-source',
      tag:'Server-authoritative', year:'2026', metric:'Netcode for GameObjects',
      cover:{ type:'designed', kind:'game', icon:'game', inner:'<div class="cvi">MMO Architecture<br><span style="color:var(--gray);font-weight:600;font-size:.58rem">server-authoritative · troca segura · IA</span></div>' },
      sub:['Game Dev','Open-source','C#'],
      tagline:'Arquitetura de MMO feita do jeito certo: o servidor tem a palavra final.',
      problem:'Jogos multiplayer que confiam no cliente são presa fácil para cheat e itens duplicados.',
      solution:'Uma arquitetura MMO server-authoritative com Unity Netcode for GameObjects: sistema de troca seguro, validação de inventário no servidor e máquinas de estado de IA.',
      result:'Base de referência para multiplayer com integridade: nada de item que só existe no cliente, nada de troca que o servidor não confirmou.',
      feats:[
        {i:'shield',t:'Autoridade no servidor',d:'o cliente pede, o servidor decide'},
        {i:'cart',t:'Troca segura',d:'validação de inventário server-side'},
        {i:'cog',t:'Máquinas de estado de IA',d:'comportamento previsível e testável'}
      ],
      stack:['C#','Unity','Netcode for GameObjects'],
      links:[{label:'Ver no GitHub',url:'https://github.com/Vitrolesalves/Unity-MMO-Architecture'}]
    },
    {
      id:'fps', cat:'game', title:'Base FPS Controller', company:'Open-source',
      tag:'Unity · C#', year:'2026', metric:'Controlador em 1ª pessoa',
      cover:{ type:'designed', kind:'game', icon:'game', inner:'<div class="cvi">Base FPS<br><span style="color:var(--gray);font-weight:600;font-size:.58rem">corrida · pulo · câmera</span></div>' },
      sub:['Game Dev','Open-source','C#'],
      tagline:'Um controlador de movimento em primeira pessoa, pronto pra construir em cima.',
      problem:'Todo protótipo de FPS recomeça do zero no básico: andar, correr, pular, olhar.',
      solution:'Um controlador de movimento 3D em primeira pessoa em Unity/C#: corrida, pulo, controle de câmera e travamento de cursor (com Esc pra liberar).',
      result:'Uma base limpa para prototipar mecânicas de FPS sem reinventar o movimento.',
      feats:[
        {i:'game',t:'Movimento completo',d:'andar, correr e pular'},
        {i:'cog',t:'Controle de câmera',d:'olhar + travamento de cursor'}
      ],
      stack:['C#','Unity'],
      links:[{label:'Ver no GitHub',url:'https://github.com/Vitrolesalves/BaseFps'}]
    },
    {
      id:'inv', cat:'game', title:'Inventory Manager', company:'Open-source',
      tag:'Unity · C#', year:'2026', metric:'Sistema de inventário',
      cover:{ type:'designed', kind:'game', icon:'puzzle', inner:'<div class="cvi">Inventory Manager<br><span style="color:var(--gray);font-weight:600;font-size:.58rem">pickup · interação · inventário</span></div>' },
      sub:['Game Dev','Open-source','C#'],
      tagline:'Inventário em três camadas: detectar, coletar e guardar.',
      problem:'Sistemas de inventário viram uma bola de gude de código acoplado difícil de manter.',
      solution:'Um sistema de inventário em três partes bem separadas: ItemPickup (o que pode ser coletado), PlayerInteraction (coletar) e InventoryManager (guardar os itens).',
      result:'Separação de responsabilidades clara — dá pra trocar cada parte sem quebrar as outras.',
      feats:[
        {i:'puzzle',t:'Três camadas',d:'pickup, interação e gerenciamento'},
        {i:'check',t:'Baixo acoplamento',d:'cada parte evolui sozinha'}
      ],
      stack:['C#','Unity'],
      links:[{label:'Ver no GitHub',url:'https://github.com/Vitrolesalves/InventoryManager'}]
    }
  ];

  /* ---------- QR SVG determinístico ---------- */
  function qrSVG(seed, cls) {
    var s = String(seed || 'DA'); var h = 0;
    for (var i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) >>> 0; }
    var N = 11, cells = '';
    function rnd(x, y) { var v = (h ^ (x * 73856093) ^ (y * 19349663)) >>> 0; return (v % 100) / 100; }
    for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
      var corner = (x < 3 && y < 3) || (x > N - 4 && y < 3) || (x < 3 && y > N - 4);
      var on = corner ? ((x === 0 || x === 2 || y === 0 || y === 2 || (x === 1 && y === 1)) ? 1 : (x >= N - 3 ? ((x === N - 1 || x === N - 3 || y === 0 || y === 2 || (x === N - 2 && y === 1)) ? 1 : 0) : 0)) : (rnd(x, y) > 0.5 ? 1 : 0);
      if (on) cells += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>';
    }
    return '<svg class="' + (cls || '') + '" viewBox="0 0 ' + N + ' ' + N + '" fill="currentColor" shape-rendering="crispEdges">' + cells + '</svg>';
  }

  /* ---------- carrossel ---------- */
  function carouselHTML(shots, manual) {
    if (manual) {
      var mSlides = shots.map(function (s) { return '<div class="cel__slide"><img src="' + s + '" alt="" loading="lazy"></div>'; }).join('');
      var mDots = shots.map(function (_, i) { return '<i class="' + (i === 0 ? 'on' : '') + '"></i>'; }).join('');
      return '<div class="cel cel--manual"><div class="cel__track">' + mSlides + '</div>' +
        '<button class="cel__nav cel__nav--prev" disabled aria-label="Anterior">‹</button>' +
        '<button class="cel__nav cel__nav--next" aria-label="Próxima">›</button>' +
        '<div class="cel__dots">' + mDots + '</div></div>';
    }
    // variante automática: crossfade + zoom, sem alvo de clique (evita conflito com o tilt 3D do card)
    var slides = shots.map(function (s, i) { return '<div class="cel__slide' + (i === 0 ? ' on' : '') + '"><img src="' + s + '" alt="" loading="lazy"></div>'; }).join('');
    var dots = shots.map(function (_, i) { return '<i class="' + (i === 0 ? 'on' : '') + '"></i>'; }).join('');
    return '<div class="cel cel--auto">' + slides + '<div class="cel__dots cel__dots--static">' + dots + '</div></div>';
  }
  function initCarousel(root, n, manual) {
    var idx = 0, dots = $$('.cel__dots i', root);
    if (manual) {
      var track = $('.cel__track', root), prev = $('.cel__nav--prev', root), next = $('.cel__nav--next', root);
      function go(i) {
        idx = Math.max(0, Math.min(n - 1, i));
        track.style.transform = 'translateX(' + (-idx * 100) + '%)';
        dots.forEach(function (d, k) { d.classList.toggle('on', k === idx); });
        prev.disabled = idx === 0; next.disabled = idx === n - 1;
      }
      prev.addEventListener('click', function (e) { e.stopPropagation(); go(idx - 1); });
      next.addEventListener('click', function (e) { e.stopPropagation(); go(idx + 1); });
      dots.forEach(function (d, k) { d.addEventListener('click', function (e) { e.stopPropagation(); go(k); }); });
      var x0 = null;
      root.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
      root.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1)); x0 = null; });
      return;
    }
    // automático: avança sozinho (crossfade+zoom via CSS), pausa enquanto o preview ao vivo do card está aberto
    if (n <= 1) return;
    var slides = $$('.cel__slide', root);
    function show(i) {
      idx = (i + n) % n;
      slides.forEach(function (s, k) { s.classList.toggle('on', k === idx); });
      dots.forEach(function (d, k) { d.classList.toggle('on', k === idx); });
    }
    setInterval(function () {
      var cardEl = root.closest('.card');
      if (cardEl && cardEl.classList.contains('previewing')) return;
      show(idx + 1);
    }, 3600);
  }

  function coverHTML(p) {
    if (p.cover.type === 'shots') return carouselHTML(p.cover.shots, false);
    return '<div class="cover cover--' + p.cover.kind + '"><span class="cover__ico">' + svg(p.cover.icon, 19) + '</span>' + (p.cover.inner || '') + '</div>';
  }

  /* ---------- card ---------- */
  function cardHTML(p) {
    return '<div class="card reveal" role="button" tabindex="0" data-id="' + p.id + '" data-cat="' + p.cat + '">' +
      '<div class="card__cover">' +
        '<span class="card__tagline ' + (p.tagRed ? 'is-red' : '') + '">' + p.tag + '</span>' +
        coverHTML(p) +
      '</div>' +
      '<div class="card__body">' +
        '<div class="card__row"><span class="card__title">' + p.title + '</span>' +
          '<span class="card__meta">' + svg('star', 14) + p.year + '</span></div>' +
        '<div class="card__company">para ' + p.company + '</div>' +
        '<div class="card__desc">' + p.tagline + '</div>' +
        '<div class="card__price"><b>' + p.metric + '</b></div>' +
        (p.liveDemo ? '<button class="card__ficha" data-ficha>ver a ficha completa ↗</button>' : '') +
      '</div></div>';
  }
  function byId(id) { return P.filter(function (x) { return x.id === id; })[0]; }

  /* ---------- tilt 3D (segue o cursor, com inércia + brilho) ---------- */
  function enableTilt(card) {
    if (!finePointer) return;
    var cover = $('.card__cover', card);
    var shine = el('<div class="card__shine"></div>'); cover.appendChild(shine);
    var raf = null, rect = null;
    var cur = { rx: 0, ry: 0, s: 1, ty: 0 };
    var tgt = { rx: 0, ry: 0, s: 1, ty: 0 };
    function paint() {
      var d = Math.abs(tgt.rx - cur.rx) + Math.abs(tgt.ry - cur.ry) + Math.abs(tgt.s - cur.s) * 40 + Math.abs(tgt.ty - cur.ty);
      cur.rx += (tgt.rx - cur.rx) * 0.14; cur.ry += (tgt.ry - cur.ry) * 0.14;
      cur.s += (tgt.s - cur.s) * 0.14; cur.ty += (tgt.ty - cur.ty) * 0.14;
      card.style.transform = 'perspective(1100px) translateY(' + cur.ty.toFixed(2) + 'px) scale(' + cur.s.toFixed(4) + ') rotateX(' + cur.rx.toFixed(2) + 'deg) rotateY(' + cur.ry.toFixed(2) + 'deg)';
      if (d > 0.05) raf = requestAnimationFrame(paint); else raf = null;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(paint); }
    card.addEventListener('mouseenter', function () { rect = card.getBoundingClientRect(); tgt.s = 1.055; tgt.ty = -14; kick(); });
    card.addEventListener('mousemove', function (e) {
      if (!rect) rect = card.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width, py = (e.clientY - rect.top) / rect.height;
      var MAX = 11;
      tgt.ry = (px - 0.5) * MAX * 2; tgt.rx = -(py - 0.5) * MAX * 2;
      shine.style.setProperty('--mx', (px * 100) + '%'); shine.style.setProperty('--my', (py * 100) + '%');
      kick();
    });
    card.addEventListener('mouseleave', function () { tgt = { rx: 0, ry: 0, s: 1, ty: 0 }; kick(); });
  }
  // registro das previews ao vivo montadas — qualquer overlay (modal, live-demo)
  // chama isso pra matar na hora um iframe de preview que ficou pra trás (ex.: o
  // usuário clicou no card sem tirar o mouse de cima, então nunca disparou
  // mouseleave — o iframe ficava "vivo" por baixo do overlay e vazava visualmente)
  var activePreviews = [];
  function enableHoverPreview(card, p) {
    var cover = $('.card__cover', card);
    var hint = el('<div class="card__livehint"><span>▶ clique para abrir o sistema</span></div>');
    cover.appendChild(hint);
    var liveEl = null, ro = null, hideTimer = null;
    function mount() {
      if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
      if (liveEl) return;
      liveEl = el('<div class="card__live"></div>');
      var ifr = document.createElement('iframe');
      ifr.src = p.liveDemo.url; ifr.setAttribute('scrolling', 'no'); ifr.setAttribute('tabindex', '-1'); ifr.setAttribute('aria-hidden', 'true'); ifr.title = p.liveDemo.name;
      ifr.width = 1280; ifr.height = 960;
      liveEl.appendChild(ifr); cover.insertBefore(liveEl, hint);
      var scale = function () { var w = cover.clientWidth; ifr.style.transform = 'scale(' + (w / 1280) + ')'; };
      ro = ('ResizeObserver' in window) ? new ResizeObserver(scale) : null;
      if (ro) ro.observe(cover);
      scale();
    }
    // desmonta de verdade (tira o iframe do DOM) — não só esconde via opacity.
    // um iframe fica montado, real, o tempo todo: se ele sobrevive escondido dentro
    // de um card que anima (tilt em rotateX/Y todo frame), o navegador pode perder
    // a camada de composição dele por um instante e ele "flutua" fora do lugar —
    // foi isso que vazou por cima do modal na screenshot.
    function unmountNow() {
      card.classList.remove('previewing');
      if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
      if (ro) { ro.disconnect(); ro = null; }
      if (liveEl) { liveEl.remove(); liveEl = null; }
    }
    function scheduleUnmount() {
      card.classList.remove('previewing');
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(unmountNow, 550); // depois do fade de opacity (.5s) do CSS
    }
    card.addEventListener('mouseenter', function () { mount(); card.classList.add('previewing'); });
    card.addEventListener('mouseleave', scheduleUnmount);
    card.addEventListener('focusin', function () { mount(); card.classList.add('previewing'); });
    card.addEventListener('focusout', scheduleUnmount);
    activePreviews.push(unmountNow);
  }

  /* ---------- render grid + carrosséis ---------- */
  var grid = $('#projectGrid');
  P.forEach(function (p) { grid.appendChild(el(cardHTML(p))); });
  P.forEach(function (p) { if (p.cover.type === 'shots') { var c = $('.card[data-id="' + p.id + '"] .cel', grid); if (c) initCarousel(c, p.cover.shots.length, false); } });
  $$('.card', grid).forEach(function (c) {
    var id = c.getAttribute('data-id'), p = byId(id);
    var open = function () { if (p && p.liveDemo) openLiveDemo(p.liveDemo); else openModal(id); };
    c.addEventListener('click', open);
    c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    var fb = $('[data-ficha]', c); if (fb) fb.addEventListener('click', function (e) { e.stopPropagation(); openModal(id); });
    if (p && p.liveDemo) enableHoverPreview(c, p);
    // cards com preview ao vivo (iframe real montado no hover) não recebem o tilt 3D:
    // um iframe sobrevivendo dentro de um elemento que gira/escala a cada frame via JS
    // é receita pra ele perder a camada de composição e "flutuar" fora do card
    else enableTilt(c);
  });

  /* ---------- category bar ---------- */
  var catbar = $('#catbar');
  CATS.forEach(function (c, i) {
    var b = el('<button class="cat ' + (i === 0 ? 'on' : '') + '" data-cat="' + c.id + '" role="tab">' + svg(c.icon, 22) + '<span>' + c.label + '</span></button>');
    b.addEventListener('click', function () { filter(c.id); });
    catbar.appendChild(b);
  });
  function filter(cat) {
    $$('.cat', catbar).forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-cat') === cat); });
    var shown = 0;
    $$('.card', grid).forEach(function (c) {
      var ok = cat === 'all' || c.getAttribute('data-cat') === cat;
      c.classList.toggle('is-hidden', !ok); if (ok) shown++;
    });
    $('#gridEmpty').hidden = shown > 0;
  }

  /* ---------- hero feature (GPS Vista) ---------- */
  (function () {
    var g = P[0];
    var wrap = el('<div class="card" data-id="gpsvista"><div class="card__cover">' + carouselHTML(g.cover.shots, true) + '</div>' +
      '<div class="feat-tag"><span class="em">GV</span><span><b>GPS Vista — em produção nacional</b><span>Grupo GPS · clique para ver a ficha completa</span></span></div></div>');
    var host = $('#heroFeature'); host.appendChild(wrap);
    initCarousel($('.cel', wrap), g.cover.shots.length, true);
    wrap.addEventListener('click', function () { openModal('gpsvista'); });
  })();

  /* ---------- MODAL (listing detail) ---------- */
  var modal = $('#modal');
  function galleryHTML(p) {
    if (p.cover.type === 'shots') {
      var s = p.cover.shots;
      // monta só as tags <img> que têm foto de verdade — nunca src="undefined"
      // (o grid de 5 (--multi) e o de 3 (--triple) têm layout dedicado; qualquer
      // outra quantidade cai num grid simples de 1 coluna, sem quebrar nada)
      if (s.length === 5) {
        return '<div class="modal__gallery modal__gallery--multi">' +
          s.map(function (src, i) { return '<img class="g' + i + '" src="' + src + '" alt="">'; }).join('') +
          '</div>';
      }
      if (s.length === 3) {
        return '<div class="modal__gallery modal__gallery--triple">' +
          s.map(function (src, i) { return '<img class="g' + i + '" src="' + src + '" alt="">'; }).join('') +
          '</div>';
      }
      return '<div class="modal__gallery modal__gallery--solo">' +
        s.map(function (src) { return '<img src="' + src + '" alt="">'; }).join('') +
        '</div>';
    }
    return '<div class="modal__hero"><div class="cover cover--' + p.cover.kind + '"><span class="cover__ico">' + svg(p.cover.icon, 19) + '</span>' + (p.cover.inner || '') + '</div></div>';
  }
  function featsHTML(p) {
    return '<ul class="feats">' + p.feats.map(function (f) {
      return '<li><span class="fi">' + svg(f.i, 17) + '</span><span><b>' + f.t + '</b>' + f.d + '</span></li>';
    }).join('') + '</ul>';
  }
  function tourHTML(p) {
    return '<div class="tour">' + p.tour.map(function (t) {
      return '<button class="tour__item" data-page="' + t.p + '"><span class="tour__ic">' + svg(t.i, 18) + '</span><span class="tour__tx"><b>' + t.t + '</b><small>' + t.d + '</small></span><span class="tour__go">abrir ↗</span></button>';
    }).join('') + '</div>';
  }
  function linksHTML(p) {
    if (!p.links.length) return '';
    return '<div class="gh">' + p.links.map(function (l) { return '<a href="' + l.url + '" target="_blank" rel="noopener">' + l.label + ' ↗</a>'; }).join('') + '</div>';
  }
  function demoHTML(p) {
    if (p.demo === 'discord') return discordDemoHTML();
    if (p.demo === 'qr') return qrDemoHTML();
    return '';
  }
  function openModal(id) {
    var p = P.filter(function (x) { return x.id === id; })[0]; if (!p) return;
    activePreviews.forEach(function (fn) { fn(); });
    var subline = p.sub.map(function (s, i) { return (i ? '<span class="d"></span>' : '') + s; }).join(' ');
    modal.innerHTML =
      '<div class="modal__panel">' +
        '<div class="modal__top"><div class="t">' + svg('star', 16) + '<span>' + p.title + '</span> <small>· ' + p.company + '</small></div>' +
          '<button class="modal__x" aria-label="Fechar">✕</button></div>' +
        galleryHTML(p) +
        (p.liveDemo ? '<div class="livecta"><div class="livecta__t"><span class="livecta__play">▶</span><div><b>Preview interativo do sistema real</b><span>' + p.liveDemo.note + '</span></div></div><button class="btn btn--primary" id="openLive">Abrir o sistema ↗</button></div>' : '') +
        '<div class="modal__body">' +
          '<div class="modal__main">' +
            '<h2>' + p.title + '</h2>' +
            '<div class="modal__sub">' + subline + '</div>' +
            '<p style="color:var(--ink-2);font-size:1.05rem">' + p.tagline + '</p>' +
            '<div class="pblock"><span class="lab p">● O problema</span><p>' + p.problem + '</p></div>' +
            '<div class="pblock"><span class="lab s">● A solução</span><p>' + p.solution + '</p></div>' +
            '<div class="pblock"><span class="lab r">● O resultado</span><p>' + p.result + '</p></div>' +
            (p.tour ? '<div class="pblock"><span class="lab" style="color:var(--ink)">● Tour guiado — o que cada parte faz</span><p style="color:var(--gray);margin-bottom:14px">Clique em qualquer item para abrir o sistema já naquela tela, com dados de exemplo.</p>' + tourHTML(p) + '</div>' : '') +
            (p.demo ? '<div class="pblock">' + demoHTML(p) + '</div>' : '') +
            '<div class="pblock"><span class="lab" style="color:var(--ink)">● O que foi construído</span>' + featsHTML(p) + '</div>' +
          '</div>' +
          '<div class="modal__side"><div class="sidecard">' +
            '<div class="co">' + p.company + '</div>' +
            '<div class="ln"><div>Categoria <b>' + catLabel(p.cat) + '</b></div><div>Período <b>' + p.year + '</b></div><div>Status <b>' + p.metric + '</b></div></div>' +
            '<div class="stackrow">' + p.stack.map(function (s) { return '<span>' + s + '</span>'; }).join('') + '</div>' +
            '<a class="btn btn--primary" href="#contato" data-close>Falar sobre esse projeto</a>' +
            linksHTML(p) +
          '</div></div>' +
        '</div>' +
      '</div>';
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // wire
    $('.modal__x', modal).addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    $$('.modal__gallery img', modal).forEach(function (im) { im.addEventListener('click', function () { openLB(im.src); }); });
    var cl = $('[data-close]', modal); if (cl) cl.addEventListener('click', closeModal);
    var ol = $('#openLive', modal); if (ol) ol.addEventListener('click', function () { openLiveDemo(p.liveDemo); });
    $$('.tour__item', modal).forEach(function (b) { b.addEventListener('click', function () { openLiveDemo({ url: b.getAttribute('data-page'), name: (p.liveDemo ? p.liveDemo.name : p.title) }); }); });
    if (p.demo === 'discord') wireDiscord(modal);
    if (p.demo === 'qr') wireQR(modal);
    modal.scrollTop = 0;
  }
  function catLabel(id) { var c = CATS.filter(function (x) { return x.id === id; })[0]; return c ? c.label : id; }
  function closeModal() { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; modal.innerHTML = ''; }

  /* ---------- demo: Discord ---------- */
  function discordDemoHTML() {
    return '<div class="demo"><div class="demo__head">' + svg('cart', 16) + ' Simular uma compra<span class="live">INTERATIVO</span></div>' +
      '<div class="demo__body dd" id="ddDemo">' +
        '<div class="dd__steps"><i class="on"></i><i></i><i></i></div>' +
        '<div id="ddStage"></div>' +
      '</div></div>';
  }
  function wireDiscord(scope) {
    var stage = $('#ddStage', scope), steps = $$('.dd__steps i', scope), cents = 90 + Math.floor(Math.random() * 9);
    function setStep(n) { steps.forEach(function (s, i) { s.classList.toggle('on', i <= n); }); }
    function s0() {
      setStep(0);
      stage.innerHTML = '<div class="dd__msg"><span class="dd__ava">DA</span><div class="dd__bubble"><b>Loja • BOT</b><br>Quer comprar o <b>Cargo VIP</b>? Rode <code>/comprar vip</code>.</div></div>' +
        '<button class="btn btn--primary dd__btn" id="ddBuy">/comprar vip</button>';
      $('#ddBuy', scope).addEventListener('click', s1);
    }
    function s1() {
      setStep(1);
      stage.innerHTML = '<div class="dd__msg"><span class="dd__ava">DA</span><div class="dd__bubble"><b>PIX gerado</b> · pague o valor <b>exato</b>:' +
        '<div class="dd__pix"><span class="dd__qr">' + qrSVG('vip' + cents) + '</span><div><div class="dd__val">R$ 29,<span class="cents">' + cents + '</span></div>' +
        '<small style="color:var(--gray)">os centavos deixam a cobrança única → confirmação automática</small></div></div></div></div>' +
        '<button class="btn btn--primary dd__btn" id="ddPay">Simular pagamento</button>';
      $('#ddPay', scope).addEventListener('click', s2);
    }
    function s2() {
      setStep(2);
      stage.innerHTML = '<div class="dd__msg"><span class="dd__ava">DA</span><div class="dd__bubble"><span class="dd__ok">✓ Pagamento confirmado</span><br>' +
        'Cargo <b>VIP</b> entregue no Discord · item enviado dentro do <b>Roblox</b> via Luau.<br>' +
        '<small style="color:var(--gray)">idempotente: mesmo com webhook + polling, entrega só uma vez</small></div></div>' +
        '<button class="btn btn--ghost dd__btn" id="ddReset">↺ Rodar de novo</button>';
      $('#ddReset', scope).addEventListener('click', function () { cents = 90 + Math.floor(Math.random() * 9); s0(); });
    }
    s0();
  }

  /* ---------- demo: QR ---------- */
  function qrDemoHTML() {
    return '<div class="demo"><div class="demo__head">' + svg('qr', 16) + ' Gerar uma etiqueta<span class="live">INTERATIVO</span></div>' +
      '<div class="demo__body qd">' +
        '<div><label>Código do CR</label><input id="qrIn" value="CR-1042" maxlength="14" autocomplete="off">' +
          '<div class="qd__hint">Digite um código — a etiqueta e o QR são gerados na hora (é assim no app desktop).</div></div>' +
        '<div class="qd__label" id="qrCard"></div>' +
      '</div></div>';
  }
  function wireQR(scope) {
    var input = $('#qrIn', scope), card = $('#qrCard', scope);
    function draw() {
      var v = (input.value || 'CR-0000').toUpperCase();
      card.innerHTML = qrSVG(v, 'qd__qr') + '<div class="qd__path">LOCAL → ' + v + ' → SALA TÉCNICA</div>';
    }
    input.addEventListener('input', draw); draw();
  }

  /* ---------- lightbox ---------- */
  var lb = $('#lightbox'), lbImg = $('#lbImg');
  function openLB(src) { lbImg.src = src; lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); }
  function closeLB() { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); setTimeout(function () { lbImg.src = ''; }, 150); }
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lightbox__x')) closeLB(); });

  /* ---------- live demo (iframe do frontend real) ---------- */
  var live = null;
  function ensureLive() {
    if (live) return live;
    live = el('<div class="livedemo" id="liveDemo" aria-hidden="true">' +
      '<div class="livedemo__panel">' +
        '<div class="livedemo__top">' +
          '<div class="livedemo__title"><span class="livedemo__dot"></span><b class="ld-name"></b><span class="ld-sub">· preview real navegável (dados de exemplo)</span></div>' +
          '<div class="livedemo__actions"><a class="ld-new" target="_blank" rel="noopener">abrir em nova aba ↗</a><button class="livedemo__x" aria-label="Fechar">✕ fechar</button></div>' +
        '</div>' +
        '<div class="livedemo__loading">carregando o sistema…</div>' +
        '<iframe class="livedemo__frame" title="Preview do sistema"></iframe>' +
      '</div></div>');
    document.body.appendChild(live);
    live.addEventListener('click', function (e) { if (e.target === live || e.target.classList.contains('livedemo__x')) closeLiveDemo(); });
    var ldFrame = $('.livedemo__frame', live);
    ldFrame.addEventListener('load', function () { var l = $('.livedemo__loading', live); if (l) l.style.display = 'none'; });
    // dentro do iframe (sem overlay de captura, é navegação de verdade) o mousemove
    // do documento pai nunca chega — o cursor customizado ficaria parado, "grudado"
    // na tela. Some com ele ao entrar (some no fade normal do CSS) e devolve o
    // controle ao sair de volta pro chrome do modal (topo, botão fechar).
    if (cursor) {
      ldFrame.addEventListener('mouseenter', function () { cursor.classList.remove('on'); });
      ldFrame.addEventListener('mouseleave', function () { cursor.classList.add('on'); });
    }
    return live;
  }
  function openLiveDemo(cfg) {
    activePreviews.forEach(function (fn) { fn(); });
    if (cursor) cursor.classList.remove('on');
    var L = ensureLive();
    $('.ld-name', L).textContent = cfg.name;
    $('.ld-new', L).href = cfg.url;
    var lo = $('.livedemo__loading', L); if (lo) lo.style.display = '';
    $('.livedemo__frame', L).src = cfg.url;
    L.classList.add('open'); L.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeLiveDemo() {
    if (!live) return;
    live.classList.remove('open'); live.setAttribute('aria-hidden', 'true');
    $('.livedemo__frame', live).src = 'about:blank';
    if (!modal.classList.contains('open')) document.body.style.overflow = '';
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (live && live.classList.contains('open')) closeLiveDemo();
    else if (lb.classList.contains('open')) closeLB();
    else if (modal.classList.contains('open')) closeModal();
  });

  /* ---------- host skills + serviços ---------- */
  var SKILLS = ['Python','Django','C#','PostgreSQL','JavaScript','Docker','Nginx','Playwright','Unity','Luau','Mercado Pago','Ollama / LLM','paramiko','Linux / VPS'];
  var hs = $('#hostSkills'); SKILLS.forEach(function (s) { hs.appendChild(el('<span>' + s + '</span>')); });

  var SERV = [
    { i:'window', t:'Sistemas sob medida', d:'Plataformas web completas para a sua operação — do banco de dados ao deploy em produção.' },
    { i:'robot', t:'Automação & RPA', d:'Robôs que eliminam tarefas repetitivas: faturas, documentos, cadastros e integrações entre sistemas.' },
    { i:'money', t:'Integração de pagamentos', d:'PIX, cobrança automática, confirmação idempotente e entrega de produto sem intervenção.' },
    { i:'server', t:'Infra & deploy', d:'Subir, estabilizar e monitorar sua aplicação em VPS: Nginx, Docker, túneis e continuidade.' },
    { i:'doc', t:'Geração de documentos', d:'Contratos, relatórios e etiquetas gerados automaticamente a partir dos seus dados.' },
    { i:'game', t:'Game dev & ferramentas', d:'Unity/C# e Roblox/Luau: mecânicas, netcode server-authoritative e integrações jogo ↔ backend.' }
  ];
  var sg = $('#servGrid'); SERV.forEach(function (s) {
    sg.appendChild(el('<div class="serv__c reveal"><span class="em">' + svg(s.i, 24) + '</span><h3>' + s.t + '</h3><p>' + s.d + '</p></div>'));
  });

  /* ---------- showcases: interfaces reais (lazy + escala) ---------- */
  function mountStage(stage) {
    if (stage.dataset.mounted) return; stage.dataset.mounted = '1';
    var screen = $('.frame__screen', stage);
    screen.classList.add('is-loading');
    var ifr = document.createElement('iframe');
    ifr.src = stage.getAttribute('data-demo');
    ifr.setAttribute('scrolling', 'no'); ifr.setAttribute('tabindex', '-1'); ifr.setAttribute('aria-hidden', 'true'); ifr.title = stage.getAttribute('data-name') || 'preview';
    ifr.width = 1280; ifr.height = 800;
    ifr.addEventListener('load', function () { screen.classList.remove('is-loading'); });
    screen.appendChild(ifr);
    var scale = function () { var w = screen.clientWidth; ifr.style.transform = 'scale(' + (w / 1280) + ')'; };
    if ('ResizeObserver' in window) new ResizeObserver(scale).observe(screen); else window.addEventListener('resize', scale);
    scale();
    var go = function () { var t = $('#trabalhos'); if (t) t.scrollIntoView({ behavior: 'smooth' }); };
    var c = $('.frame__catch', stage); if (c) c.addEventListener('click', go);
  }
  var stages = $$('.showcase__stage');
  if (stages.length) {
    var mountAll = function () { stages.forEach(mountStage); };
    if (document.readyState === 'complete') mountAll();
    else window.addEventListener('load', mountAll);
  }

  /* ---------- nav ---------- */
  var nav = $('#nav');
  var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 12); };
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  var burger = $('#navBurger'), navm = $('#navMobile');
  burger.addEventListener('click', function () { var o = navm.classList.toggle('open'); burger.setAttribute('aria-expanded', o ? 'true' : 'false'); });
  $$('#navMobile a').forEach(function (a) { a.addEventListener('click', function () { navm.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }); });

  /* ---------- ano ---------- */
  $('#year').textContent = new Date().getFullYear();

  /* ---------- marquee (loop sem costura) ---------- */
  // o CSS animava translateX(0) -> translateX(-50%), o que só é perfeito
  // enquanto a largura do track não muda. Como o texto usa a fonte de
  // título (web font), se ela trocar (FOUT) depois que a animação já
  // começou, a % é recalculada contra a NOVA largura no meio do ciclo —
  // e o trecho "escreve o próximo texto do nada" era exatamente isso: um
  // salto visível no ponto do loop. Medindo a largura de 1 cópia em PIXELS
  // (fixo, não recalcula sozinho) o loop fica sempre idêntico.
  var mqTrack = $('.marquee__track');
  if (mqTrack) {
    var setMarqueeWidth = function () {
      var w = mqTrack.scrollWidth / 2; // o track tem 2 cópias idênticas do conteúdo
      if (w > 0) mqTrack.style.setProperty('--mq-w', w + 'px');
    };
    setMarqueeWidth();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(setMarqueeWidth).catch(function () {});
    window.addEventListener('resize', setMarqueeWidth, { passive: true });
    // aba aberta em background (comum: "abrir em nova aba") não faz layout até
    // ganhar foco — scrollWidth pode voltar 0 na 1ª tentativa. Remedimos assim
    // que a página fica visível...
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) { setMarqueeWidth(); setTimeout(setMarqueeWidth, 300); }
    });
    // ...e mais duas tentativas às cegas, mesma rede de segurança usada no
    // reveal: garante que --mq-w acaba medido mesmo se nenhum dos gatilhos
    // acima disparar por algum motivo imprevisto.
    setTimeout(setMarqueeWidth, 500);
    setTimeout(setMarqueeWidth, 2000);
  }

  /* ---------- reveal ---------- */
  var rev = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    rev.forEach(function (r) { io.observe(r); });
  } else { rev.forEach(function (r) { r.classList.add('in'); }); }
  // rede de segurança: se o IO estiver pausado (aba oculta) ou falhar, revela mesmo assim
  setTimeout(function () { rev.forEach(function (r) { r.classList.add('in'); }); }, 3000);

  /* ---------- contadores ---------- */
  var counted = false;
  function runCounters() {
    if (counted) return; counted = true;
    $$('[data-count]').forEach(function (b) {
      var target = parseInt(b.getAttribute('data-count'), 10), suf = b.getAttribute('data-suffix') || '', t0 = performance.now();
      (function step(now) { var pr = Math.min((now - t0) / 1100, 1), e = 1 - Math.pow(1 - pr, 3); b.textContent = Math.round(e * target) + (pr === 1 ? suf : ''); if (pr < 1) requestAnimationFrame(step); })(t0);
    });
  }
  var hs2 = $('.hero__stats');
  if (hs2 && 'IntersectionObserver' in window) { var so = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { runCounters(); so.disconnect(); } }); }, { threshold: .4 }); so.observe(hs2); }
  else runCounters();
  // rede de segurança: se o IO nunca disparar (aba em 2º plano), conta mesmo assim
  setTimeout(runCounters, 2500);

  /* ---------- active nav link ---------- */
  var secs = ['trabalhos', 'sobre', 'servicos'].map(function (id) { return document.getElementById(id); }).filter(Boolean);
  var anchors = $$('.nav__center a');
  if (secs.length && 'IntersectionObserver' in window) {
    var cur = '';
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) cur = e.target.id; });
      anchors.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + cur); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(function (s) { spy.observe(s); });
  }
})();
