/* Demonstração (parceiro João), 09/11/2026: responde, NO NAVEGADOR, às mesmas consultas que o painel faz ao banco e aos webhooks.
   Nada sai para a internet: o fetch do Supabase e dos webhooks é atendido aqui, sobre os dados fictícios do demo-dados.js.
   Escritas (aprovar, programar, mover etapa) valem só nesta aba e somem ao recarregar. */
(function () {
'use strict';
var D = window.DEMO_DADOS, U = D.util, CFG = D.CFG;
try { localStorage.setItem('epos-theme', 'light'); localStorage.setItem('_lp_equipe', '1'); localStorage.removeItem('epos_meta_cache'); } catch (e) {}
document.documentElement.setAttribute('data-theme', 'light');
window._ACCESS_TOKEN = 'demo';

var TABELAS = {
  leads: D.LEADS, tarefas: D.TAREFAS, remarketing_sugestoes: D.RMKT, mensagens_agendadas: D.AGENDADAS, crm_notificacoes: D.NOTIF,
  atendimento_notas: D.NOTAS, equipe: D.EQUIPE, laboratorio_testes: D.LAB, wa_clicks: D.CLIQUES,
  system_config: [{ projeto: 'principal', silencio_humano_horas: 12, robo_ativo: true, modo_dono_ativo: false, transcricao_audio_ativa: true, disparo_oficial_ativo: false,
    lote_oficial_em: null, lote_oficial_origem: null, reativacao_limite_dia: 35, sessao_claude_ate: null }],
  epos_clientes: [], prospeccao_empresas: [], prospeccao_disparos: [], lp_events: [], analista_fila_sessao: []
};

/* ── filtros no formato do PostgREST ── */
function valorCampo(row, col) {
  var m = col.match(/^([a-z_0-9]+)->>?([a-z_0-9]+)$/);
  if (m) { var o = row[m[1]]; return o && typeof o === 'object' ? o[m[2]] : undefined; }
  return row[col];
}
function cmp(a, b) {
  if (a == null || b == null) return NaN;
  if (typeof a === 'number' || (/^-?\d+(\.\d+)?$/.test(String(a)) && /^-?\d+(\.\d+)?$/.test(String(b)))) return Number(a) - Number(b);
  var ta = Date.parse(a), tb = Date.parse(b);
  if (!isNaN(ta) && !isNaN(tb) && /\d{4}-\d{2}-\d{2}/.test(String(a)) && /\d{4}-\d{2}-\d{2}/.test(String(b))) return ta - tb;
  return String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0;
}
function lista(v) { return v.replace(/^\(|\)$/g, '').split(',').map(function (x) { return x.replace(/^"|"$/g, ''); }); }
function teste(row, col, expr) {
  var neg = false;
  if (expr.indexOf('not.') === 0) { neg = true; expr = expr.slice(4); }
  var i = expr.indexOf('.'), op = expr.slice(0, i), v = expr.slice(i + 1), x = valorCampo(row, col), ok;
  switch (op) {
    case 'eq': ok = x != null && (typeof x === 'boolean' ? String(x) === v : cmp(x, v) === 0 || String(x) === v); break;
    case 'neq': ok = x == null ? false : !(String(x) === v || cmp(x, v) === 0); break;
    case 'gt': ok = cmp(x, v) > 0; break; case 'gte': ok = cmp(x, v) >= 0; break;
    case 'lt': ok = cmp(x, v) < 0; break; case 'lte': ok = cmp(x, v) <= 0; break;
    case 'is': ok = v === 'null' ? x == null : v === 'true' ? x === true : v === 'false' ? x === false : false; break;
    case 'in': ok = lista(v).indexOf(String(x)) >= 0; break;
    case 'like': case 'ilike': { var re = new RegExp('^' + v.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/%/g, '.*') + '$', op === 'ilike' ? 'i' : ''); ok = x != null && re.test(String(x)); break; }
    case 'cs': ok = Array.isArray(x) && lista(v).every(function (y) { return x.indexOf(y) >= 0; }); break;
    default: ok = true;
  }
  return neg ? !ok : ok;
}
function partes(s) {   // separa por vírgula fora de parênteses
  var out = [], prof = 0, cur = '', aspas = false;
  for (var i = 0; i < s.length; i++) { var c = s[i];
    if (c === '"') aspas = !aspas;
    if (!aspas && c === '(') prof++; if (!aspas && c === ')') prof--;
    if (c === ',' && !prof && !aspas) { out.push(cur); cur = ''; } else cur += c; }
  if (cur) out.push(cur); return out;
}
function condLogica(row, tipo, corpo) {   // or=(a.eq.1,and(b.gt.2,c.lt.3))
  var itens = partes(corpo.replace(/^\(|\)$/g, '')), res = itens.map(function (it) {
    var m = it.match(/^(and|or)\((.*)\)$/); if (m) return condLogica(row, m[1], '(' + m[2] + ')');
    var mn = it.match(/^not\.(and|or)\((.*)\)$/); if (mn) return !condLogica(row, mn[1], '(' + mn[2] + ')');
    var j = it.indexOf('.'); return teste(row, it.slice(0, j), it.slice(j + 1));
  });
  return tipo === 'or' ? res.some(Boolean) : res.every(Boolean);
}
function consulta(nome, params) {
  var linhas = (TABELAS[nome] || []).slice(), sel = null, ordem = null, lim = null, off = 0;
  params.forEach(function (kv) {
    var k = kv[0], v = kv[1];
    if (k === 'select') sel = v; else if (k === 'order') ordem = v; else if (k === 'limit') lim = Number(v); else if (k === 'offset') off = Number(v);
    else if (k === 'or' || k === 'and') linhas = linhas.filter(function (r) { return condLogica(r, k, v); });
    else if (k === 'not.or' || k === 'not.and') linhas = linhas.filter(function (r) { return !condLogica(r, k.slice(4), v); });
    else linhas = linhas.filter(function (r) { return teste(r, k, v); });
  });
  if (ordem) {
    var chaves = ordem.split(',').map(function (o) { var p = o.split('.'); return { c: p[0], desc: p.indexOf('desc') > 0, nf: p.indexOf('nullsfirst') > 0 }; });
    linhas.sort(function (a, b) {
      for (var i = 0; i < chaves.length; i++) { var k = chaves[i], x = valorCampo(a, k.c), y = valorCampo(b, k.c);
        if (x == null && y == null) continue; if (x == null) return k.nf ? -1 : 1; if (y == null) return k.nf ? 1 : -1;
        var r = cmp(x, y); if (isNaN(r)) r = String(x).localeCompare(String(y)); if (r) return k.desc ? -r : r; }
      return 0; });
  }
  var total = linhas.length;
  linhas = linhas.slice(off, lim != null ? off + lim : undefined);
  if (sel && sel !== '*' && sel.indexOf('*') < 0) {
    var cols = partes(sel).map(function (c) { return c.split(':').pop().split('(')[0].trim(); });
    linhas = linhas.map(function (r) { var o = {}; cols.forEach(function (c) { var m = c.match(/^([a-z_0-9]+)->>?([a-z_0-9]+)$/); if (m) o[m[2]] = valorCampo(r, c); else o[c] = r[c] === undefined ? null : r[c]; }); return o; });
  } else linhas = linhas.map(function (r) { var o = {}; for (var k in r) if (k[0] !== '_') o[k] = r[k]; return o; });
  return { linhas: linhas, total: total, ini: off };
}

/* ── funções do banco (RPC) calculadas sobre os dados ── */
var AG = U.AGORA, HORA = U.HORA, DIA = U.DIA, MIN = U.MIN;
function emAndamento(l) { return !l.descartado && ['perdido', 'desqualificado', 'fechou', 'compareceu'].indexOf(l.crm_stage) < 0; }
function nomeEquipe(id) { var e = D.EQUIPE.filter(function (x) { return x.id === id; })[0]; return e ? e.nome : null; }
function faixa(min) { return min < 5 ? null : min < 120 ? '5min' : min < 480 ? '2h' : min < 1440 ? '8h' : min < 4320 ? '1d' : min < 10080 ? '3d' : min < 21600 ? '7d' : min < 43200 ? '15d' : '30d'; }
var ORD_FAIXA = { '30d': 8, '15d': 7, '7d': 6, '3d': 5, '1d': 4, '8h': 3, '2h': 2, '5min': 1 };
var RPC = {
  epos_eh_admin: function () { return true; },
  epos_vagas_restantes: function () { return 4; },
  whatsapp_reativacao_hoje: function () { return { restantes: 29, limite: 35 }; },
  painel_registrar_uso: function () { return null; },
  crm_atendimento_resumo: function () {
    var ab = D.LEADS.filter(emAndamento), ia = ab.filter(function (l) { return !l.em_atendimento && l.atendido_por !== 'equipe'; }), eq = ab.filter(function (l) { return l.atendido_por === 'equipe'; });
    var semResp = function (l) { return l._ultLead > l._ultResp && AG - l._ultLead > HORA; };
    var porEtapa = {}; ab.forEach(function (l) { var k = l.crm_stage || 'sem_etapa'; porEtapa[k] = (porEtapa[k] || 0) + 1; });
    return { em_andamento: ab.length, ia: ia.length, equipe: eq.length, ninguem: ab.length - ia.length - eq.length, ia_sem_resposta: ia.filter(semResp).length,
      equipe_sem_resposta: eq.filter(semResp).length, ninguem_sem_resposta: 0, sem_resposta: ab.filter(semResp).length, silencio_horas: 12, equipe_silencio: eq.filter(function (l) { return l.em_atendimento; }).length,
      equipe_48h: 0, ia_ligada_no_geral: true, por_etapa: porEtapa };
  },
  crm_quem_atende: function (b) {
    var l = D.LEADS.filter(function (x) { return x.telefone === b.p_telefone; })[0]; if (!l) return null;
    if (l.em_atendimento) return { estado: 'equipe', atendido_por: nomeEquipe(l.responsavel_id) || 'Equipe', humano_em: l.ultima_interacao_humano, silencio_horas: 12, ia_quieta_ate: U.iso(Date.parse(l.ultima_interacao_humano || l.criado_em) + 12 * HORA), fixo: false, ia_ligada_no_geral: true };
    return { estado: 'ia', atendido_por: CFG.ia, humano_em: l.atendido_por === 'equipe' ? l.ultima_interacao_humano : null, silencio_horas: 12, fixo: false, ia_ligada_no_geral: true,
      sem_resposta_desde: l._ultLead > l._ultResp ? l.ultima_msg_lead_em : null };
  },
  epos_novos_leads: function () {
    return D.LEADS.filter(function (l) { return AG - Date.parse(l.criado_em) < 30 * DIA; }).sort(function (a, b) { return Date.parse(b.criado_em) - Date.parse(a.criado_em); }).map(function (l) {
      var t = Date.parse(l.criado_em), min = Math.round((AG - t) / MIN), h = new Date(AG - 3 * HORA), meiaNoite = Date.UTC(h.getUTCFullYear(), h.getUTCMonth(), h.getUTCDate()) + 3 * HORA;
      return { telefone: l.telefone, nome: l.nome, crm_stage: l.crm_stage || 'novo', canal: l.canal, utm_source: l.utm_source, utm_campaign: l.utm_campaign, criado_em: l.criado_em, minutos: min,
        atendido_humano: l.atendido_por === 'equipe', hoje: t >= meiaNoite, ontem: t >= meiaNoite - DIA && t < meiaNoite, semana: AG - t < 7 * DIA, d7: AG - t < 7 * DIA, d15: AG - t < 15 * DIA, d30: true };
    });
  },
  epos_torneira: function () {
    var aviso = {}; D.TAREFAS.forEach(function (t) { if (t.status === 'pendente' || t.status === 'sugerida') aviso[t.lead_telefone] = true; });
    return D.LEADS.filter(emAndamento).filter(function (l) { return l.crm_stage !== 'agendou'; }).map(function (l) {
      var semResp = l._ultLead > l._ultResp, desde = semResp ? l._ultLead : Math.max(l._ultLead, l._ultResp), min = Math.round((AG - desde) / MIN), f = faixa(min);
      return { telefone: l.telefone, nome: l.nome, crm_stage: l.crm_stage, responsavel_id: l.responsavel_id, situacao: f ? (semResp ? 'sem_resposta' : 'parado') : null, desde: U.iso(desde), minutos: min,
        faixa: f, faixa_ordem: f ? ORD_FAIXA[f] : 0, sem_proximo_passo: !aviso[l.telefone], resumo: l.auditoria_ia_resumo, proxima_acao: l.auditoria_ia_proxima_acao,
        ultima_msg_lead: l.ultima_msg_lead_em, ultima_resposta: l.ultima_resposta_em, aguardando_equipe: semResp };
    }).filter(function (x) { return x.situacao; });
  },
  epos_precisa_ligacao: function () {
    return D.LEADS.filter(function (l) { return l.crm_stage === 'compareceu'; }).slice(0, 3).concat(D.LEADS.filter(function (l) { return l.crm_stage === 'qualificado' && l.remarketing_enviado; }).slice(0, 2))
      .map(function (l, k) { return { telefone: l.telefone, nome: l.nome, nicho: l.segmento,
        motivo: l.crm_stage === 'compareceu' ? 'Ligar: fez a avaliação e ainda não fechou o tratamento.' : 'Ligar: recebeu a retomada e não respondeu.',
        desde: l.auditoria_ia_em, tentativas: 0, ultimo_resultado: null, ultima_tentativa: null, prioridade: l.crm_stage === 'compareceu' ? 1 : 2, ligar_para: l.telefone, falar_com: l._primeiro,
        contexto: l.auditoria_ia_resumo, video_em: null }; });
  },
  crm_notas_vendedores: function () {
    var por = {}; D.NOTAS.forEach(function (n) { var v = por[n.vendedor] = por[n.vendedor] || { vendedor: n.vendedor, atendimentos: 0, soma: 0, c: {}, dica_mais_recente: n.dica };
      v.atendimentos++; v.soma += n.nota; for (var k in n.criterios) v.c[k] = (v.c[k] || 0) + n.criterios[k]; });
    return Object.keys(por).map(function (k) { var v = por[k], o = { vendedor: v.vendedor, atendimentos: v.atendimentos, nota_media: Math.round(v.soma / v.atendimentos * 10) / 10, dica_mais_recente: v.dica_mais_recente };
      for (var c in v.c) o[c] = Math.round(v.c[c] / v.atendimentos * 10) / 10; return o; });
  },
  epos_relatorio_vendas: function (b) {
    var ini = b.p_inicio ? Date.parse(b.p_inicio) : 0, fim = b.p_fim ? Date.parse(b.p_fim) : AG;
    var coorte = D.LEADS.filter(function (l) { var t = Date.parse(l.criado_em); return t >= ini && t < fim && !l.descartado; });
    var fechPer = D.LEADS.filter(function (l) { return l.fechou_em && Date.parse(l.fechou_em) >= ini && Date.parse(l.fechou_em) < fim; });
    var n = function (f) { return coorte.filter(f).length; };
    var receita = fechPer.reduce(function (a, l) { return a + (l.valor_servico || 0); }, 0);
    var orig = function (l) { return l.utm_campaign ? 'Campanha: ' + l.utm_campaign : l.utm_source === 'site' ? 'Site da clínica' : 'Indicação / orgânico'; };
    function agrupa(chave) { var m = {}; coorte.forEach(function (l) { var k = chave(l); var o = m[k] = m[k] || { leads: 0, fechados_da_coorte: 0, fechamentos: 0, receita: 0 };
      o.leads++; if (l.fechou) { o.fechados_da_coorte++; } }); fechPer.forEach(function (l) { var k = chave(l); var o = m[k] = m[k] || { leads: 0, fechados_da_coorte: 0, fechamentos: 0, receita: 0 }; o.fechamentos++; o.receita += l.valor_servico || 0; }); return m; }
    var mo = agrupa(orig), mc = {}, mv = agrupa(function (l) { return nomeEquipe(l.responsavel_id) || CFG.ia + ' (IA)'; });
    coorte.forEach(function (l) { if (!l.utm_content) return; var k = l.utm_campaign + '|' + l.utm_content; var o = mc[k] = mc[k] || { campanha: l.utm_campaign, criativo: l.utm_content, leads: 0, fechados_da_coorte: 0 }; o.leads++; if (l.fechou) o.fechados_da_coorte++; });
    var perdas = {}; coorte.filter(function (l) { return l.crm_stage === 'perdido'; }).forEach(function (l) { var c = { preco: 'Preço', sem_resposta: 'Parou de responder', concorrente: 'Fechou com outra clínica', agenda: 'Horário' }[l.motivo_perda_categoria] || 'Outro'; perdas[c] = (perdas[c] || 0) + 1; });
    var dias = fechPer.map(function (l) { return (Date.parse(l.fechou_em) - Date.parse(l.criado_em)) / DIA; }).sort(function (a, b) { return a - b; });
    var fechados = coorte.filter(function (l) { return l.fechou; }).length;
    return {
      resumo: { leads_novos: coorte.length, receita: receita, ticket_medio: fechPer.length ? Math.round(receita / fechPer.length) : 0, fechamentos: fechPer.length, fechamentos_com_valor: fechPer.length,
        fechamentos_sem_valor: 0, fechados_sem_data: 0, aguardando_confirmacao: 0, fechados_da_coorte: fechados, dias_ate_fechar: dias.length ? Math.round(dias[Math.floor(dias.length / 2)] * 10) / 10 : null,
        primeiro_atendimento_min: 7, primeiro_atendimento_n: coorte.filter(function (l) { return l.primeiro_atendimento_humano_em; }).length },
      situacao: { em_aberto: n(emAndamento), fechados: fechados, perdidos: n(function (l) { return l.crm_stage === 'perdido'; }), desqualificados: n(function (l) { return l.crm_stage === 'desqualificado'; }), fechou_sem_confirmar: 0 },
      funil: [{ etapa: 'chegaram', n: coorte.length }, { etapa: 'qualificados', n: n(function (l) { return l.qualificado; }) }, { etapa: 'agendaram', n: n(function (l) { return l.agendou; }) },
        { etapa: 'compareceram', n: n(function (l) { return l.compareceu; }) }, { etapa: 'fecharam', n: fechados }],
      origens: Object.keys(mo).map(function (k) { var o = mo[k]; o.origem = k; return o; }).sort(function (a, b) { return b.leads - a.leads; }),
      criativos: Object.keys(mc).map(function (k) { return mc[k]; }).sort(function (a, b) { return b.leads - a.leads; }),
      perdas: Object.keys(perdas).map(function (k) { return { categoria: k, n: perdas[k] }; }).sort(function (a, b) { return b.n - a.n; }),
      vendedores: Object.keys(mv).map(function (k) { var o = mv[k]; o.nome = k; return o; }),
      fechamentos: fechPer.sort(function (a, b) { return Date.parse(b.fechou_em) - Date.parse(a.fechou_em); }).map(function (l) { return { nome: l.nome, origem: orig(l), responsavel: nomeEquipe(l.responsavel_id), valor: l.valor_servico, fechou_em: l.fechou_em, etapa: 'fechou', telefone: l.telefone }; }),
      tempo_etapas: [{ etapa: 'qualificado', n: n(function (l) { return l.qualificado; }), horas_mediana: 2.1 }, { etapa: 'agendou', n: n(function (l) { return l.agendou; }), horas_mediana: 19 },
        { etapa: 'compareceu', n: n(function (l) { return l.compareceu; }), horas_mediana: 52 }, { etapa: 'fechou', n: fechados, horas_mediana: 70 }],
      linhas: coorte.map(function (l) { return { nome: l.nome, etapa: l.crm_stage || 'novo', valor: l.valor_servico, fechou: l.fechou, origem: orig(l), campanha: l.utm_campaign, criativo: l.utm_content, telefone: l.telefone,
        chegou_em: l.criado_em, fechou_em: l.fechou_em, responsavel: nomeEquipe(l.responsavel_id), motivo_perda: l.auditoria_ia_motivo_perda }; })
    };
  },
  metodo_funil_stats: function () { return { quiz: { erros: [], steps: {}, enviaram: 0, respostas: [] }, tempo: {}, blocos: {}, equipe: { visitas: 0, aparelhos: 0 }, cliques: [] }; },
  quiz_funil_stats: function () { return { erros: [], steps: {}, enviaram: 0, respostas: [] }; },
  site_funil_stats: function () { return { visitas: 0, cliques: [] }; }
};

/* ── ações dos webhooks (anúncios, status, envio) ── */
function acao(corpo) {
  var a = corpo.action || corpo.acao;
  if (a === 'meta_ads_insights') return D.INSIGHTS;
  if (a === 'meta_ads_creatives') { var ads = D.ADS.slice().sort(function (x, y) { return corpo.sort_by === 'ctr' ? Number(y.ctr) - Number(x.ctr) : Number(y.spend) - Number(x.spend); }); return { success: true, action: a, ads: ads }; }
  if (a === 'health_status') return { success: true, action: a, allOk: true, checks: [{ name: 'WhatsApp', ok: true, detail: 'open' }, { name: 'Banco', ok: true, detail: 'online' }, { name: 'IA (' + CFG.ia + ')', ok: true, detail: 'respondendo' }, { name: 'Agenda', ok: true, detail: 'sincronizada' }] };
  if (a === 'enviar_mensagem' && corpo.telefone && (corpo.mensagem || corpo.texto)) {
    (D.CONVERSAS[corpo.telefone] = D.CONVERSAS[corpo.telefone] || []).push({ de: 'equipe', quem: 'Você', texto: corpo.mensagem || corpo.texto, t: Date.now() });
  }
  return { success: true, ok: true, action: a, demo: true };
}

/* ── escritas: valem só nesta aba ── */
function escrever(nome, metodo, params, corpo) {
  var tab = TABELAS[nome] = TABELAS[nome] || [];
  if (metodo === 'POST') { var novos = (Array.isArray(corpo) ? corpo : [corpo]).map(function (r, i) { var o = Object.assign({ id: 'demo-' + Date.now() + '-' + i, criada_em: new Date().toISOString(), criado_em: new Date().toISOString() }, r); tab.push(o); return o; }); return novos; }
  var alvo = consultaBruta(nome, params);
  if (metodo === 'PATCH') { alvo.forEach(function (r) { Object.assign(r, corpo || {}); }); return alvo; }
  if (metodo === 'DELETE') { TABELAS[nome] = tab.filter(function (r) { return alvo.indexOf(r) < 0; }); return []; }
  return [];
}
function consultaBruta(nome, params) {
  var linhas = (TABELAS[nome] || []);
  params.forEach(function (kv) { var k = kv[0], v = kv[1]; if (['select', 'order', 'limit', 'offset'].indexOf(k) >= 0) return;
    linhas = linhas.filter(k === 'or' || k === 'and' ? function (r) { return condLogica(r, k, v); } : function (r) { return teste(r, k, v); }); });
  return linhas;
}

/* ── o fetch do painel passa por aqui ── */
var fetchOriginal = window.fetch.bind(window);
function resposta(corpo, status, extra) {
  return Promise.resolve(new Response(corpo === undefined ? '' : JSON.stringify(corpo), { status: status || 200, headers: Object.assign({ 'Content-Type': 'application/json' }, extra || {}) }));
}
window.fetch = function (entrada, opcoes) {
  var url = typeof entrada === 'string' ? entrada : entrada.url, op = opcoes || {}, metodo = (op.method || 'GET').toUpperCase(), corpo = null;
  try { corpo = op.body ? JSON.parse(op.body) : null; } catch (e) { corpo = null; }
  if (/supabase\.co\/rest\/v1\//.test(url)) {
    var resto = url.split('/rest/v1/')[1], q = resto.indexOf('?'), alvo = q >= 0 ? resto.slice(0, q) : resto;
    var params = []; new URLSearchParams(q >= 0 ? resto.slice(q + 1) : '').forEach(function (v, k) { params.push([k, v]); });
    if (alvo.indexOf('rpc/') === 0) { var f = RPC[alvo.slice(4)]; return resposta(f ? f(corpo || {}) : null); }
    if (metodo !== 'GET' && metodo !== 'HEAD') return resposta(escrever(alvo, metodo, params, corpo), metodo === 'POST' ? 201 : 200);
    var r = consulta(alvo, params);
    return resposta(r.linhas, 200, { 'Content-Range': (r.linhas.length ? r.ini + '-' + (r.ini + r.linhas.length - 1) : '*') + '/' + r.total });
  }
  if (/supabase\.co\/auth\//.test(url)) return resposta({});
  if (/webhook\.eposmktfilmsia\.com\.br/.test(url)) return resposta(acao(corpo || {}));
  if (/eposmktfilmsia|chatwoot|sentry/.test(url)) return resposta({});
  return fetchOriginal(entrada, opcoes);
};

/* ── cliente do Supabase de mentira (login e tempo real) ── */
var canal = function () { var c = { on: function () { return c; }, subscribe: function (cb) { if (cb) setTimeout(function () { cb('SUBSCRIBED'); }, 50); return c; }, unsubscribe: function () {} }; return c; };
window.supabase = { createClient: function () { return {
  auth: { setSession: function () { return Promise.resolve({ data: { session: null } }); }, onAuthStateChange: function () { return { data: { subscription: { unsubscribe: function () {} } } }; },
    signOut: function () { return Promise.resolve({}); }, getSession: function () { return Promise.resolve({ data: { session: { access_token: 'demo', user: { email: 'camila@clinicabemestar.demo' } } } }); } },
  channel: canal, removeChannel: function () {} }; } };
window.Sentry = window.Sentry || { init: function () {}, captureException: function () {}, captureMessage: function () {} };
})();
