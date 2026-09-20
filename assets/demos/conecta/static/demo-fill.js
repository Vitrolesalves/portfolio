/* demo-fill.js — popula os previews com dados fictícios (apenas visual) */
(function () {
  function ri(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  var NAMES = ['Ana Souza', 'Carlos Pereira', 'Mariana Lima', 'Rafael Alves', 'Juliana Costa', 'Bruno Rocha', 'Patrícia Gomes', 'Fernando Dias', 'Camila Ribeiro', 'Lucas Martins', 'Beatriz Nunes', 'Thiago Barros', 'Renata Melo', 'Gustavo Ferreira', 'Larissa Cardoso', 'Diego Santana'];
  var LOCAIS = ['Portaria Central', 'Subsolo · Sala Técnica', 'Bloco A · 3º andar', 'Almoxarifado', 'Doca de Carga', 'Guarita 02', 'CPD', 'Refeitório', 'Pátio Externo', 'Recepção', 'Torre Norte', 'Estacionamento G2'];
  var STATUS = [['Conforme', '#16a34a'], ['Em andamento', '#d97706'], ['Pendente', '#dc2626'], ['Concluído', '#2563eb'], ['Aprovado', '#16a34a'], ['Aberto', '#0ea5e9'], ['Em análise', '#7c3aed']];
  var PRIOR = [['Alta', '#dc2626'], ['Média', '#d97706'], ['Baixa', '#16a34a'], ['Crítica', '#b91c1c']];
  var TEMAS = ['Treinamento NR-35', 'Auditoria de ronda', 'Revisão de EPI', 'Inspeção de extintores', 'Reciclagem de brigada', 'Análise de risco', 'Vistoria técnica', 'Plano de ação corretiva', 'Checklist de portaria', 'Avaliação psicossocial', 'Manutenção preventiva', 'Controle de acesso', 'Ronda noturna', 'Inspeção de hidrantes'];
  var TIPOS = ['Preventiva', 'Corretiva', 'Rotina', 'Emergencial', 'Programada'];
  var SISTEMAS = ['GPS Flow', 'Planilha', 'SAP', 'WhatsApp', 'E-mail', 'Power BI'];
  var MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set'];
  function date() { var d = ri(1, 28), m = ri(1, 12); return (d < 10 ? '0' + d : d) + '/' + (m < 10 ? '0' + m : m) + '/2026'; }
  function cr() { return 'CR-' + ri(1000, 9999); }
  function money() { return 'R$ ' + ri(1, 90) + '.' + String(ri(0, 999)).padStart(3, '0') + ',00'; }
  function badge(t, c) { return '<span style="display:inline-block;padding:3px 10px;border-radius:999px;font-size:.72rem;font-weight:700;color:#fff;background:' + c + '">' + t + '</span>'; }
  var FA = !!document.querySelector('link[href*="fontawesome"],.fas,.far,[class^="fa-"],[class*=" fa-"]');
  function acoes() { return FA ? '<i class="fas fa-eye" style="color:#2563eb;cursor:default"></i> <i class="fas fa-pen" style="color:#16a34a;margin-left:9px;cursor:default"></i> <i class="fas fa-trash" style="color:#dc2626;margin-left:9px;cursor:default"></i>' : '<span style="color:#2563eb">ver</span> · <span style="color:#dc2626">excluir</span>'; }
  function cellFor(h) {
    h = (h || '').toLowerCase();
    if (/a[çc][õo]es|^\s*$/.test(h)) return acoes();
    if (/data|dia|per[íi]odo|aberto|criad|venc|prazo/.test(h)) return date();
    if (/status|situa|conformidade/.test(h)) { var s = pick(STATUS); return badge(s[0], s[1]); }
    if (/prioridade/.test(h)) { var p = pick(PRIOR); return badge(p[0], p[1]); }
    if (/respons|gerente|colaborador|solicitante|criador|quem|usu[áa]rio|auditor|supervisor|executa/.test(h)) return pick(NAMES);
    if (/contrato|c[óo]digo|\bcr\b/.test(h)) return cr();
    if (/local|unidade|posto|sala|regional|[áa]rea|guarita/.test(h)) return pick(LOCAIS);
    if (/tema|atividade|assunto|item|t[íi]tulo|ocorr|descri|projeto|automa|entrada|sa[íi]da/.test(h)) return pick(TEMAS);
    if (/tipo|categoria/.test(h)) return pick(TIPOS);
    if (/consumo|%/.test(h)) return ri(20, 98) + '%';
    if (/valor|or[çc]ado|comprado|excesso|total|custo|pec|conta/.test(h)) return money();
    if (/email|e-mail/.test(h)) { var nm = pick(NAMES).toLowerCase().normalize('NFD').replace(/[^a-z ]/g, '').replace(/ /g, '.'); return nm + '@empresa.com.br'; }
    if (/telefone|contato|fone/.test(h)) return '(62) 9' + ri(1000, 9999) + '-' + ri(1000, 9999);
    if (/tempo|m[ée]dia/.test(h)) return ri(1, 8) + 'h ' + ri(0, 59) + 'min';
    if (/ferramenta|sistema/.test(h)) return pick(SISTEMAS);
    if (/m[êe]s/.test(h)) return pick(MESES) + '/26';
    if (/problema|risco/.test(h)) return pick(['Retrabalho manual', 'Sem rastreio', 'Prazo apertado', 'Baixa evidência', '—']);
    if (/evid|anexo/.test(h)) return '📎 ' + ri(1, 5);
    if (/#|^n[ºo]$|qtd|quant|n[úu]mero|fornecedor|pec|sup/.test(h)) return ri(1, 40);
    return pick(TEMAS);
  }
  function fillTables() {
    document.querySelectorAll('table').forEach(function (t) {
      var heads = [].map.call(t.querySelectorAll('thead th'), function (th) { return th.textContent.trim(); });
      if (!heads.length) return;
      var tb = t.querySelector('tbody'); if (!tb) return;
      var real = [].filter.call(tb.querySelectorAll('tr'), function (tr) { return tr.children.length > 1 && !/nenhum|nenhuma|sem registro|não há|vazio|no data|carregando/i.test(tr.textContent); });
      if (real.length > 0) return;
      tb.innerHTML = '';
      var n = ri(5, 9);
      for (var r = 0; r < n; r++) {
        var tr = document.createElement('tr');
        heads.forEach(function (hd) { var td = document.createElement('td'); td.innerHTML = cellFor(hd); td.style.padding = '11px 12px'; td.style.borderBottom = '1px solid #eef1f5'; td.style.fontSize = '.86rem'; td.style.verticalAlign = 'middle'; tr.appendChild(td); });
        tb.appendChild(tr);
      }
    });
  }
  function fillKPIs() {
    document.querySelectorAll('h1,h2,h3,h4,span,div,strong,b,p,td').forEach(function (el) {
      if (el.children.length !== 0) return;
      var t = el.textContent.trim();
      var fs = parseFloat(getComputedStyle(el).fontSize) || 0;
      if (t === '0' && fs >= 20) el.textContent = String(ri(1, 140));
      else if (/^R\$\s*0(,00)?$/.test(t.replace(/ /g, ' '))) el.textContent = money();
      else if (/^0\s*%$/.test(t)) el.textContent = ri(8, 96) + '%';
    });
  }
  function makeCard() {
    var c = document.createElement('div');
    c.style.cssText = 'background:#fff;border:1px solid #e6e9ef;border-left:3px solid ' + pick(['#2563eb', '#16a34a', '#d97706', '#7c3aed', '#0ea5e9']) + ';border-radius:10px;padding:11px 13px;margin:0 0 8px;box-shadow:0 2px 6px rgba(0,0,0,.05);font-family:system-ui,sans-serif';
    c.innerHTML = '<div style="font-weight:700;font-size:.86rem;color:#1f2937">' + pick(TEMAS) + '</div>' +
      '<div style="font-size:.74rem;color:#6b7280;margin-top:4px">' + cr() + ' · ' + pick(LOCAIS) + '</div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:9px">' +
      badge(pick(PRIOR)[0], pick(PRIOR)[1]) + '<span style="font-size:.72rem;color:#9ca3af">' + pick(NAMES).split(' ')[0] + ' · ' + date() + '</span></div>';
    return c;
  }
  function fillKanban() {
    // container específico de kanban
    document.querySelectorAll('.kanban-items-container,[class*="items-container"],[class*="kanban-items"]').forEach(function (c) {
      if (c.__k) return;
      var kids = [].slice.call(c.children);
      var onlyEmpty = kids.length === 0 || kids.every(function (ch) { return /sem demandas|nenhum|vazi|carregando/i.test(ch.textContent); });
      if (!onlyEmpty) return;
      c.__k = 1; c.innerHTML = '';
      var n = ri(2, 4); for (var i = 0; i < n; i++) c.appendChild(makeCard());
    });
    // fallback: "sem demandas" solto -> injeta no pai
    document.querySelectorAll('div,p,span').forEach(function (el) {
      if (el.children.length !== 0 || el.__kv) return;
      if (!/sem demandas|nenhuma? demanda|nenhum card|nenhum item nesta/i.test(el.textContent)) return;
      var col = el.parentElement; if (!col || col.__k) return; col.__k = 1; el.__kv = 1; el.style.display = 'none';
      var n = ri(2, 4); for (var i = 0; i < n; i++) col.appendChild(makeCard());
    });
  }
  function hideEmpties() {
    document.querySelectorAll('p,div,span,td,h3,h4').forEach(function (el) {
      if (el.children.length === 0 && /^(nenhum|nenhuma|sem registros|não há registros|sem dados)/i.test(el.textContent.trim()) && !el.closest('tbody')) el.style.display = 'none';
    });
  }
  function fillCharts() {
    try {
      var C = window.Chart; if (!C) return;
      var reg = C.instances || (C.registry && C.registry.instances) || {};
      Object.keys(reg).forEach(function (k) {
        var c = reg[k]; if (!c || !c.data) return;
        var ds = c.data.datasets || [];
        var empty = !ds.length || ds.every(function (d) { return !d.data || !d.data.length || d.data.every(function (v) { return !v; }); });
        if (!empty) return;
        var labels = (c.data.labels && c.data.labels.length) ? c.data.labels : null;
        if (!labels) { labels = []; var m = ri(5, 7); for (var i = 0; i < m; i++) labels.push(pick(['CR-1042', 'CR-2087', 'CR-3310', 'Portaria', 'Facilities', 'Segurança', 'Limpeza', 'Jan', 'Fev', 'Mar', 'Abr'])); c.data.labels = labels; }
        var palette = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#0ea5e9', '#7c3aed', '#0891b2'];
        ds.forEach(function (d, di) { d.data = labels.map(function () { return ri(3, 80); }); if (d.backgroundColor == null || (Array.isArray(d.backgroundColor) && !d.backgroundColor.length)) d.backgroundColor = c.config.type === 'line' ? palette[di % palette.length] : palette; if (d.borderColor == null) d.borderColor = palette[di % palette.length]; });
        c.update('none');
      });
    } catch (e) { }
  }
  function pass() { try { fillTables(); fillKanban(); fillKPIs(); hideEmpties(); } catch (e) { } }
  function run() {
    pass(); setTimeout(pass, 900); setTimeout(function () { pass(); fillCharts(); }, 1900); setTimeout(fillCharts, 3200);
    // observa render assíncrono e re-preenche (guardas evitam duplicar)
    try {
      var t, mo = new MutationObserver(function () { if (t) return; t = setTimeout(function () { t = 0; try { fillTables(); fillKanban(); } catch (e) { } }, 300); });
      mo.observe(document.body, { childList: true, subtree: true });
      setTimeout(function () { mo.disconnect(); }, 8000);
    } catch (e) { }
  }
  if (document.readyState === 'complete') setTimeout(run, 300);
  else window.addEventListener('load', function () { setTimeout(run, 350); });
})();
