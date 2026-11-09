/* Demonstração do sistema comercial (parceiro João) — 09/11/2026.
   DADOS 100% FICTÍCIOS de uma clínica (odontologia + estética), gerados no navegador com semente fixa:
   nenhum nome, telefone ou conversa é real. Este arquivo só monta os dados; o demo-banco.js responde às consultas. */
(function () {
'use strict';
var CFG = window.DEMO_CFG = {
  clinica: 'Clínica Bem-Estar', ia: 'Lia', dona: 'Dra. Camila Rocha', donaCurta: 'Dra. Camila',
  marca: 'H', endereco: 'Av. Central, 1200, sala 304'
};

/* ── sorteio com semente fixa: a demonstração é sempre igual ── */
var s = 911202611;
function R() { s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
function pick(a) { return a[Math.floor(R() * a.length)]; }
function entre(a, b) { return a + Math.floor(R() * (b - a + 1)); }
var AGORA = Date.now(), HORA = 36e5, DIA = 864e5, MIN = 6e4;
function iso(t) { return new Date(t).toISOString(); }
function ddmm(t) { var d = new Date(t - 3 * HORA); return String(d.getUTCDate()).padStart(2, '0') + '/' + String(d.getUTCMonth() + 1).padStart(2, '0'); }
var DIAS_SEM = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
function diaSem(t) { return DIAS_SEM[new Date(t - 3 * HORA).getUTCDay()]; }
function horaBR(t) { var d = new Date(t - 3 * HORA); return String(d.getUTCHours()).padStart(2, '0') + 'h' + (d.getUTCMinutes() ? String(d.getUTCMinutes()).padStart(2, '0') : ''); }
/* horário comercial em Brasília (UTC-3): dia útil, entre 8h e 18h */
function proximoHorario(aPartir, diasMin) {
  var t = aPartir + (diasMin || 1) * DIA;
  for (var i = 0; i < 14; i++) {
    var d = new Date(t - 3 * HORA), dw = d.getUTCDay();
    if (dw !== 0) { var h = pick([8, 9, 10, 11, 14, 15, 16, 17]), m = pick([0, 30]);
      if (dw === 6 && h > 12) h = pick([8, 9, 10, 11]);
      return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), h + 3, m); }
    t += DIA;
  }
  return t;
}

var FEM = ['Ana Paula', 'Juliana', 'Fernanda', 'Mariana', 'Patrícia', 'Larissa', 'Beatriz', 'Renata', 'Aline', 'Vanessa', 'Débora', 'Letícia', 'Gabriela', 'Tatiane',
  'Priscila', 'Simone', 'Cláudia', 'Luciana', 'Bruna', 'Carolina', 'Isabela', 'Natália', 'Raquel', 'Sabrina', 'Viviane', 'Elaine', 'Michele', 'Rosana', 'Thaís', 'Adriana', 'Cristiane', 'Daniela'];
var MAS = ['Carlos', 'Marcelo', 'Rodrigo', 'Eduardo', 'Fábio', 'Gustavo', 'André', 'Ricardo', 'Paulo', 'Leonardo', 'Diego', 'Bruno', 'Felipe', 'Márcio', 'Sérgio', 'Vinícius', 'Lucas', 'Henrique', 'Roberto', 'Alexandre'];
var SOB = ['Almeida', 'Barbosa', 'Cardoso', 'Carvalho', 'Costa', 'Dias', 'Ferreira', 'Gomes', 'Lima', 'Martins', 'Melo', 'Monteiro', 'Moreira', 'Nascimento', 'Oliveira',
  'Pereira', 'Ramos', 'Ribeiro', 'Santos', 'Silva', 'Souza', 'Teixeira', 'Vieira', 'Araújo', 'Campos', 'Correia', 'Freitas', 'Mendes', 'Pinto', 'Nogueira', 'Batista', 'Rezende'];

/* ── equipe da clínica ── */
var EQUIPE = [
  { id: 'a1b2c3d4-0000-4000-8000-000000000001', nome: 'Dra. Camila Rocha', papel: 'admin', email_login: 'camila@clinicabemestar.demo', ativo: true, conta: 'epos' },
  { id: 'a1b2c3d4-0000-4000-8000-000000000002', nome: 'Beatriz Souza', papel: 'vendedor', email_login: 'beatriz@clinicabemestar.demo', ativo: true, conta: 'epos' },
  { id: 'a1b2c3d4-0000-4000-8000-000000000003', nome: 'Rafael Lima', papel: 'vendedor', email_login: 'rafael@clinicabemestar.demo', ativo: true, conta: 'epos' }
];

/* ── procedimentos, campanhas e criativos ── */
var PROC = [
  { k: 'implante', art: 'do', nome: 'implante dentário', seg: 'Odontologia', v: [3800, 5200], peso: 22, camp: 'Implantes — Novembro', criat: ['Vídeo — depoimento implante', 'Antes e depois — implante'],
    pergunta: ['Oi, vi o anúncio do implante. Quanto fica?', 'Boa noite! Perdi um dente da frente, vocês fazem implante?', 'Quanto custa o implante com a coroa?'],
    duvida: ['Dói muito? Tenho pavor de dentista.', 'Precisa de enxerto? Já me falaram que meu osso é fino.', 'Quanto tempo leva tudo?'] },
  { k: 'alinhador', art: 'do', nome: 'alinhador invisível', seg: 'Odontologia', v: [6900, 8900], peso: 14, camp: 'Alinhadores — Outubro', criat: ['Carrossel — alinhador x aparelho', 'Vídeo — rotina com alinhador'],
    pergunta: ['Vocês fazem alinhador transparente? Qual o valor?', 'Oi! Queria saber do alinhador invisível pra minha filha de 16 anos'],
    duvida: ['Dá pra parcelar?', 'Quanto tempo de tratamento mais ou menos?'] },
  { k: 'lente', art: 'das', nome: 'lentes de contato dental', seg: 'Odontologia', v: [9800, 14500], peso: 10, camp: 'Sorriso novo — Lentes', criat: ['Vídeo — transformação do sorriso', 'Antes e depois — lentes'],
    pergunta: ['Queria saber das lentes de contato nos dentes', 'Quanto custa a lente de porcelana por dente?'],
    duvida: ['Desgasta o dente?', 'Fica natural ou fica muito branco?'] },
  { k: 'clareamento', art: 'do', nome: 'clareamento', seg: 'Odontologia', v: [690, 990], peso: 18, camp: 'Clareamento — Black Friday', criat: ['Story — Black Friday clareamento', 'Vídeo — clareamento em 1 sessão'],
    pergunta: ['Ainda tem a promoção do clareamento?', 'Oi, o clareamento é a laser ou de moldeira?'],
    duvida: ['Fica sensível depois?', 'Quantas sessões?'] },
  { k: 'harmonizacao', art: 'da', nome: 'harmonização facial', seg: 'Estética', v: [2200, 3800], peso: 16, camp: 'Harmonização — Black Friday', criat: ['Reels — harmonização natural', 'Antes e depois — mandíbula'],
    pergunta: ['Oi! Quero fazer harmonização, como funciona?', 'Vocês fazem preenchimento labial?'],
    duvida: ['Fica artificial?', 'Quanto tempo dura o resultado?'] },
  { k: 'botox', art: 'da', nome: 'toxina botulínica', seg: 'Estética', v: [1100, 1600], peso: 12, camp: 'Botox — Novembro', criat: ['Vídeo — botox preventivo', 'Carrossel — mitos do botox'],
    pergunta: ['Quanto custa o botox na testa?', 'Boa tarde, queria fazer botox nas rugas dos olhos'],
    duvida: ['Quem aplica é dentista mesmo?', 'Em quantos dias aparece o resultado?'] },
  { k: 'avaliacao', art: 'da', nome: 'avaliação', seg: 'Odontologia', v: [0, 0], peso: 8, camp: 'Avaliação — Google', criat: ['Pesquisa — dentista perto de mim'],
    pergunta: ['Queria marcar uma avaliação', 'Estou com um dente quebrado, vocês atendem hoje?'],
    duvida: ['A avaliação é paga?', 'Vocês aceitam convênio?'] }
];
var PESO_TOTAL = PROC.reduce(function (a, p) { return a + p.peso; }, 0);
function sortearProc() { var r = R() * PESO_TOTAL; for (var i = 0; i < PROC.length; i++) { r -= PROC[i].peso; if (r <= 0) return PROC[i]; } return PROC[0]; }

var ORIGENS = [ // utm_source, peso, canal
  { src: 'facebook', peso: 38, canal: 'ctwa' }, { src: 'instagram', peso: 30, canal: 'ctwa' }, { src: 'google', peso: 14, canal: 'whatsapp' },
  { src: null, peso: 12, canal: 'whatsapp' }, { src: 'site', peso: 6, canal: 'site' }];
function sortearOrigem() { var r = R() * 100; for (var i = 0; i < ORIGENS.length; i++) { r -= ORIGENS[i].peso; if (r <= 0) return ORIGENS[i]; } return ORIGENS[0]; }

function etapaPorIdade(d) {
  var r = R();
  if (d < 0.4) return r < 0.5 ? 'novo' : r < 0.9 ? 'em_conversa' : 'qualificado';
  if (d < 3) return r < 0.08 ? 'novo' : r < 0.45 ? 'em_conversa' : r < 0.68 ? 'qualificado' : r < 0.9 ? 'agendou' : 'perdido';
  if (d < 14) return r < 0.24 ? 'em_conversa' : r < 0.38 ? 'qualificado' : r < 0.56 ? 'agendou' : r < 0.66 ? 'compareceu' : r < 0.82 ? 'fechou' : r < 0.94 ? 'perdido' : 'desqualificado';
  if (d < 21) return r < 0.1 ? 'em_conversa' : r < 0.17 ? 'qualificado' : r < 0.21 ? 'agendou' : r < 0.29 ? 'compareceu' : r < 0.58 ? 'fechou' : r < 0.88 ? 'perdido' : 'desqualificado';
  /* depois de 3 semanas sem avançar, o Analista já marcou como perdido: não fica conversa aberta antiga */
  return r < 0.06 ? 'compareceu' : r < 0.42 ? 'fechou' : r < 0.88 ? 'perdido' : 'desqualificado';
}
var ORDEM_ETAPA = { novo: 0, em_conversa: 1, qualificado: 2, agendou: 3, compareceu: 4, fechou: 5, perdido: 6, desqualificado: 7 };
var MOTIVOS_PERDA = [
  ['preco', 'Achou o valor alto e parou de responder depois do orçamento.'],
  ['sem_resposta', 'Parou de responder depois da proposta de horário.'],
  ['concorrente', 'Disse que fechou com outra clínica mais perto de casa.'],
  ['agenda', 'Só podia aos sábados à tarde, horário em que a clínica não atende.']];

/* ── leads ── */
var LEADS = [];
var N = 176;
for (var i = 0; i < N; i++) {
  var idade = Math.pow(R(), 1.45) * 89 + R() * 0.2;           // mais leads recentes
  var hora = R() < 0.22 ? entre(20, 23) : entre(8, 19);          // 22% chegam à noite
  var criado = AGORA - idade * DIA;
  var dCriado = new Date(criado - 3 * HORA);
  criado = Date.UTC(dCriado.getUTCFullYear(), dCriado.getUTCMonth(), dCriado.getUTCDate(), hora + 3, entre(0, 59), entre(0, 59));
  if (criado > AGORA - 10 * MIN) criado = AGORA - entre(12, 300) * MIN;
  var fem = R() < 0.68, primeiro = fem ? pick(FEM) : pick(MAS), nome = primeiro + ' ' + pick(SOB);
  var p = sortearProc(), o = sortearOrigem(), etapa = etapaPorIdade((AGORA - criado) / DIA);
  if (p.k === 'avaliacao' && o.src && o.src !== 'google') o = ORIGENS[2];
  var camp = o.src === 'facebook' || o.src === 'instagram' ? p.camp : o.src === 'google' ? 'Avaliação — Google' : null;
  var criat = camp ? (o.src === 'google' ? 'Pesquisa — dentista perto de mim' : pick(p.criat)) : null;
  var l = {
    id: 5000 + i, telefone: '5561000' + String(100100 + i * 7), nome: nome, canal: o.canal, criado_em: iso(criado),
    utm_source: o.src, utm_medium: o.src === 'google' ? 'cpc' : o.src ? 'paid_social' : null, utm_campaign: camp, utm_content: criat,
    utm_term: null, utm_id: null, ad_id: camp ? '1200' + (PROC.indexOf(p) * 10 + p.criat.indexOf(criat) + 1) : null, adset_id: null, placement: o.src === 'instagram' ? 'instagram_reels' : o.src === 'facebook' ? 'facebook_feed' : null,
    fbclid: o.src === 'facebook' && R() < 0.5 ? 'demo-fb-' + i : null, ctwa_clid: o.canal === 'ctwa' ? 'demo-ctwa-' + i : null,
    crm_stage: etapa, segmento: p.seg, servico_prestado: p.nome, perfil: p.seg, cidade: null, patologia: null, paga_ir: null, valor_ir: null,
    _proc: p.k, _fem: fem, _primeiro: primeiro,
    qualificado: ORDEM_ETAPA[etapa] >= 2 && ORDEM_ETAPA[etapa] <= 5, agendou: ORDEM_ETAPA[etapa] >= 3 && ORDEM_ETAPA[etapa] <= 5,
    compareceu: etapa === 'compareceu' || etapa === 'fechou', fechou: etapa === 'fechou', descartado: etapa === 'desqualificado' && R() < 0.5,
    em_atendimento: false, dify_ativo: true, dify_conversation_id: 'demo-conv-' + i, chatwoot_conversation_id: String(2100 + i), crm_person_id: null,
    tempo_resposta_medio_min: Math.round((0.15 + R() * 0.9) * 100) / 100, tempo_resposta_max_min: Math.round((1 + R() * 3) * 100) / 100,
    crm_stage_bloqueado: false, sugestao_stage: null, stage_historico: [], rmkt_historico: [], ultimo_remarketing: null, eh_prospeccao: false, prospeccao: null,
    quiz_respostas: null, historico_site: null, lp_session_id: null, email: null, notas: null, typebot_concluido: false, nutricao_step: 0, nutricao_pausada: false,
    reativacao_enviada: false, remarketing_enviado: false, fechou_pendente: false, lembrete_enviado: false, agendamento_sem_evento: false,
    thiago_notificado_timeout: false, motivo_perda_categoria: null, atendido_por: 'ia', responsavel_id: null, valor_servico: null, fechou_em: null,
    dia_agendamento: null, periodo_agendamento: null, data_agendamento: null, google_event_id: null, consulta_realizada_em: null, consulta_confirmada_por: null,
    primeiro_atendimento_humano_em: null, ultima_interacao_humano: null, ia_pausada_ate: null, ia_sem_resposta_em: null, ia_pediu_ajuda_em: null, aguardando_desde: null
  };
  // linha do tempo
  var tUltLead = criado + entre(2, 40) * MIN, tUltResp = tUltLead + entre(10, 50) * 1000;
  var hist = [];
  if (ORDEM_ETAPA[etapa] >= 1 && etapa !== 'perdido' && etapa !== 'desqualificado') hist.push({ de: null, para: 'em_conversa', em: iso(criado + 2 * MIN), por: 'IA' });
  if (ORDEM_ETAPA[etapa] >= 2 && ORDEM_ETAPA[etapa] <= 5) hist.push({ de: 'em_conversa', para: 'qualificado', em: iso(criado + entre(15, 300) * MIN), por: 'IA' });
  if (l.agendou) {
    var tAg = criado + entre(1, 26) * HORA;
    var consulta = etapa === 'agendou' ? proximoHorario(Math.max(AGORA - 3 * HORA, tAg), entre(0, 6)) : proximoHorario(tAg, entre(1, 4));
    if (etapa !== 'agendou' && consulta > AGORA - 2 * HORA) consulta = AGORA - entre(2, 9) * DIA;
    l.dia_agendamento = iso(consulta); l.data_agendamento = iso(consulta); l.periodo_agendamento = new Date(consulta - 3 * HORA).getUTCHours() < 12 ? 'manhã' : 'tarde';
    l.google_event_id = 'demo-evt-' + i; l._consulta = consulta;
    hist.push({ de: 'qualificado', para: 'agendou', em: iso(tAg), por: 'IA' });
    tUltLead = Math.max(tUltLead, tAg - 2 * MIN); tUltResp = Math.max(tUltResp, tAg);
    if (l.compareceu) { l.consulta_realizada_em = iso(consulta + HORA); l.consulta_confirmada_por = 'Beatriz Souza'; hist.push({ de: 'agendou', para: 'compareceu', em: iso(consulta + HORA), por: 'Beatriz Souza' }); }
    if (etapa === 'fechou') {
      var fe = consulta + entre(1, 72) * HORA; if (fe > AGORA) fe = AGORA - entre(1, 20) * HORA;
      l.fechou_em = iso(fe); l.valor_servico = p.v[1] ? Math.round(entre(p.v[0], p.v[1]) / 50) * 50 : 180;
      hist.push({ de: 'compareceu', para: 'fechou', em: iso(fe), por: 'Dra. Camila Rocha' });
    }
  }
  if (etapa === 'perdido') { var mp = pick(MOTIVOS_PERDA); l.motivo_perda_categoria = mp[0]; l._motivo = mp[1]; hist.push({ de: 'em_conversa', para: 'perdido', em: iso(criado + entre(3, 12) * DIA), por: 'Analista' }); }
  if (etapa === 'desqualificado') { l._motivo = pick(['Procurava atendimento pelo convênio, que a clínica não aceita.', 'Mora em outro estado; perguntou só por curiosidade.', 'Era fornecedor oferecendo material, não paciente.']); hist.push({ de: 'em_conversa', para: 'desqualificado', em: iso(criado + entre(1, 3) * DIA), por: 'Analista' }); }
  l.stage_historico = hist;
  // quem atende e quando falaram por último
  var parada = etapa === 'em_conversa' || etapa === 'qualificado';
  if (parada && (AGORA - criado) > 20 * HORA) { tUltLead = criado + entre(10, 90) * MIN; tUltResp = tUltLead + 30 * 1000; }
  if (parada && R() < 0.22 && (AGORA - criado) < 5 * DIA) { tUltLead = AGORA - entre(70, 600) * MIN; tUltResp = tUltLead - entre(5, 60) * MIN; }   // paciente escreveu e está esperando
  if (l.agendou || etapa === 'qualificado') {
    if (R() < 0.45) { l.atendido_por = 'equipe'; l.responsavel_id = pick(EQUIPE.slice(1)).id; l.primeiro_atendimento_humano_em = iso(criado + entre(20, 240) * MIN); l.ultima_interacao_humano = l.primeiro_atendimento_humano_em; }
  }
  if (etapa === 'agendou' && l.atendido_por === 'equipe' && R() < 0.5) { l.em_atendimento = true; l.dify_ativo = false; }
  if (etapa === 'perdido' || etapa === 'desqualificado' || etapa === 'fechou' || etapa === 'compareceu') l.dify_ativo = false;
  if (etapa === 'novo') { tUltLead = criado; tUltResp = criado + entre(8, 40) * 1000; }
  l.ultima_msg_lead_em = iso(Math.min(tUltLead, AGORA - 60 * 1000)); l.ultima_mensagem_lead_em = l.ultima_msg_lead_em;
  l.ultima_resposta_em = iso(Math.min(tUltResp, AGORA - 30 * 1000)); l._ultLead = Math.min(tUltLead, AGORA - 60 * 1000); l._ultResp = Math.min(tUltResp, AGORA - 30 * 1000);
  LEADS.push(l);
}

/* ── o que o Analista escreveu sobre cada lead ── */
function auditoria(l) {
  var p = PROC.filter(function (x) { return x.k === l._proc; })[0], pn = l._primeiro, et = l.crm_stage || 'novo', quando = ddmm(Date.parse(l.criado_em));
  var r = { resumo: '', prox: '', motivo: null, nota: 3 };
  if (et === 'novo') { r.resumo = 'Chegou em ' + quando + ' perguntando sobre ' + p.nome + '. A ' + CFG.ia + ' já respondeu e está esperando a resposta.'; r.prox = 'Deixar a ' + CFG.ia + ' conduzir; reavaliar se não responder em 24 h.'; r.nota = 4; }
  else if (et === 'em_conversa') { r.resumo = pn + ' perguntou sobre ' + p.nome + ' em ' + quando + ' e tirou dúvidas com a ' + CFG.ia + ', mas ainda não aceitou horário de avaliação.'; r.prox = 'Retomar com a dúvida que ficou aberta e oferecer dois horários de avaliação.'; r.nota = entre(4, 6); }
  else if (et === 'qualificado') { r.resumo = pn + ' quer ' + p.nome + ', já sabe que o valor sai na avaliação e perguntou sobre parcelamento. Falta escolher o horário.'; r.prox = 'Oferecer dois horários desta semana e confirmar a forma de pagamento.'; r.nota = entre(6, 8); }
  else if (et === 'agendou') { r.resumo = pn + ' marcou avaliação de ' + p.nome + ' para ' + diaSem(l._consulta) + ', ' + ddmm(l._consulta) + ', às ' + horaBR(l._consulta) + '.'; r.prox = 'Lembrete automático na véspera; confirmar presença no dia.'; r.nota = entre(7, 9); }
  else if (et === 'compareceu') { r.resumo = pn + ' fez a avaliação de ' + p.nome + ' em ' + ddmm(l._consulta) + ' e recebeu o plano de tratamento.'; r.prox = 'Ligar em até 2 dias para tirar dúvidas do plano e fechar.'; r.nota = 8; }
  else if (et === 'fechou') { r.resumo = pn + ' fechou ' + p.nome + ' (R$ ' + (l.valor_servico || 0).toLocaleString('pt-BR') + ') depois da avaliação de ' + ddmm(l._consulta) + '.'; r.prox = 'Pedir avaliação no Google depois da primeira sessão.'; r.nota = 10; }
  else if (et === 'perdido') { r.resumo = pn + ' perguntou sobre ' + p.nome + ' em ' + quando + '. ' + l._motivo; r.prox = 'Nada agora. Voltar em 60 dias com condição de pagamento.'; r.motivo = l._motivo; r.nota = 2; }
  else { r.resumo = l._motivo; r.prox = 'Nada a fazer.'; r.motivo = l._motivo; r.nota = 1; }
  return r;
}
LEADS.forEach(function (l) {
  var a = auditoria(l);
  l.auditoria_ia_resumo = a.resumo; l.auditoria_ia_proxima_acao = a.prox; l.auditoria_ia_motivo_perda = a.motivo;
  l.crm_score = a.nota; l.score = a.nota; l.auditoria_ia_em = iso(Math.min(AGORA - entre(20, 400) * MIN, Math.max(Date.parse(l.criado_em) + HORA, l._ultLead + 15 * MIN)));
  l.crm_auditoria_at = l.auditoria_ia_em; l.auditoria_disparada_em = l.auditoria_ia_em;
});

/* ── conversas (WhatsApp) ── */
function conversa(l) {
  var p = PROC.filter(function (x) { return x.k === l._proc; })[0], t = Date.parse(l.criado_em), m = [], pn = l._primeiro, et = l.crm_stage || 'novo';
  function add(de, texto, dt) { t += (dt || entre(1, 3)) * (de === 'ia' ? 1000 * entre(8, 25) / 2 : MIN); m.push({ de: de, texto: texto, t: Math.min(t, AGORA - 30 * 1000) }); }
  var h0 = new Date(t - 3 * HORA).getUTCHours(), noite = h0 >= 20 || h0 < 7;
  add('paciente', pick(p.pergunta), 0);
  add('ia', 'Oi, ' + pn + '! Aqui é a ' + CFG.ia + ', da ' + CFG.clinica + '.' + (noite ? ' Pode falar, estou por aqui a qualquer hora.' : '') + ' ' +
    (p.k === 'avaliacao' ? 'Consigo te encaixar na avaliação, sim. Você está sentindo dor agora ou é para uma revisão?' :
      'O valor ' + p.art + ' ' + p.nome + ' depende do que a ' + CFG.donaCurta + ' encontrar na avaliação, porque cada caso pede um plano diferente. Me conta: é a primeira vez que você vai fazer?'), 1);
  if (et === 'novo') return m;
  add('paciente', pick(['É sim, primeira vez.', 'Já fiz uma vez em outra clínica, mas não gostei.', 'Primeira vez. Tô pesquisando.', 'Sim! Tenho vontade faz tempo.']));
  add('ia', 'Entendi. ' + (p.seg === 'Estética' ? 'Aqui o procedimento é feito pela ' + CFG.donaCurta + ', com foco em resultado natural.' : 'Na avaliação a ' + CFG.donaCurta + ' examina, tira as dúvidas e já te passa o plano com o valor exato.') + ' A avaliação dura 30 minutos e não tem custo. Posso ver um horário para você?', 1);
  add('paciente', pick(p.duvida));
  add('ia', pick(['Ótima pergunta. ', 'Muita gente pergunta isso. ', 'Entendo a preocupação. ']) + (p.duvida.indexOf(m[m.length - 1].texto) === 0 ? 'A ' + CFG.donaCurta + ' explica tudo com calma na avaliação, e o conforto do paciente é prioridade aqui.' : 'Na avaliação ela te mostra cada etapa e o que esperar.') + (function () { var a = proximoHorario(t, 1), b = proximoHorario(a, 1); return ' Tenho ' + diaSem(a) + ' às ' + horaBR(a) + ' ou ' + diaSem(b) + ' às ' + horaBR(b) + '. Algum fica bom?'; })(), 1);
  if (et === 'em_conversa') { if (R() < 0.5) add('paciente', pick(['Vou ver minha agenda e te falo.', 'Deixa eu confirmar com meu marido.', 'Essa semana tá corrido, depois te chamo.'])); return m; }
  if (et === 'desqualificado') { add('paciente', pick(['Vocês aceitam Amil?', 'Na verdade queria saber se atendem pelo convênio.'])); add('ia', 'Hoje a clínica atende só particular, com parcelamento no cartão. Se mudar de ideia, é só me chamar.'); return m; }
  add('paciente', pick(['Dá pra parcelar?', 'Aceita cartão? Em quantas vezes?', 'Tem desconto no Pix?']));
  add('ia', 'Dá sim: até 12x no cartão, e no Pix tem condição especial. A ' + CFG.donaCurta + ' te passa os números certinhos na avaliação.', 1);
  if (et === 'qualificado') { add('paciente', pick(['Legal. Vou me organizar e já te falo o dia.', 'Perfeito, vou ver o melhor dia.'])); return m; }
  if (et === 'perdido') { add('paciente', pick(['Achei um pouco caro, vou pensar.', 'Fechei com uma clínica perto de casa, obrigada!', 'Vou deixar pra depois do fim do ano.'])); add('ia', 'Entendo, ' + pn + '. Qualquer coisa estou por aqui.'); return m; }
  if (l._consulta) {
    add('paciente', pick(['Pode ser ' + diaSem(l._consulta) + ' às ' + horaBR(l._consulta) + '?', 'Tem ' + diaSem(l._consulta) + '?', 'Prefiro ' + diaSem(l._consulta) + '.']));
    add('ia', 'Agendado ✅ ' + diaSem(l._consulta) + ', ' + ddmm(l._consulta) + ', às ' + horaBR(l._consulta) + ', com a ' + CFG.donaCurta + '. Endereço: ' + CFG.endereco + '. Na véspera eu te mando um lembrete.', 1);
    if (l.atendido_por === 'equipe') { t = Math.max(t, Date.parse(l.primeiro_atendimento_humano_em)); m.push({ de: 'equipe', quem: 'Beatriz', texto: 'Oi, ' + pn + '! Aqui é a Beatriz, da recepção. Vi seu agendamento e já deixei sua ficha pronta. Qualquer dúvida é só falar comigo.', t: Math.min(t, AGORA - 60 * 1000) }); }
    if (l.compareceu) {
      m.push({ de: 'ia', texto: 'Oi, ' + pn + '! Lembrete: sua avaliação é amanhã às ' + horaBR(l._consulta) + '. Posso confirmar?', t: l._consulta - DIA });
      m.push({ de: 'paciente', texto: 'Confirmado!', t: l._consulta - DIA + entre(5, 90) * MIN });
      m.push({ de: 'equipe', quem: 'Dra. Camila', texto: pn + ', foi um prazer te receber hoje. Mandei o plano por aqui; qualquer dúvida me chame.', t: l._consulta + 2 * HORA });
      if (l.fechou) { m.push({ de: 'paciente', texto: 'Vamos fechar! Pode ser no cartão em 10x?', t: Date.parse(l.fechou_em) - 30 * MIN }); m.push({ de: 'equipe', quem: 'Dra. Camila', texto: 'Fechado! Já reservei sua primeira sessão. 😊', t: Date.parse(l.fechou_em) }); }
    }
  }
  return m.sort(function (a, b) { return a.t - b.t; });
}
var CONVERSAS = {};
LEADS.forEach(function (l) { CONVERSAS[l.telefone] = conversa(l); });

/* ── pedidos para responder, planos de retomada, ligações ── */
var TAREFAS = [], RMKT = [], AGENDADAS = [], NOTIF = [], NOTAS = [];
function uuid(n) { return 'd0e1f2a3-0000-4000-8000-' + String(100000000000 + n).slice(-12); }
var recentes = LEADS.filter(function (l) { return AGORA - Date.parse(l.criado_em) < 6 * DIA; });
var abertos = LEADS.filter(function (l) { return (l.crm_stage === 'em_conversa' || l.crm_stage === 'qualificado') && AGORA - l._ultLead > 26 * HORA && AGORA - Date.parse(l.criado_em) < 20 * DIA; });
var PEDIDOS = [
  { trecho: 'Consegue me mandar o orçamento do alinhador por escrito? Quero mostrar pro meu marido.', proc: 'alinhador', rasc: 'Oi, {n}! Aqui é a Dra. Camila. Para o orçamento sair certo eu preciso ver seus dentes: a avaliação leva 30 minutos e já sai com o plano por escrito. Tenho amanhã às 9h ou às 16h. Qual fica melhor?' },
  { trecho: 'Vocês parcelam o implante em 12x? Se sim quero fechar essa semana.', proc: 'implante', rasc: 'Oi, {n}! Aqui é a Dra. Camila. Parcelamos em até 12x no cartão, sim. Para fechar ainda esta semana, consigo sua avaliação na quinta às 10h. Posso reservar?' },
  { trecho: 'Tem encaixe amanhã cedo? Estou com muita dor no dente.', proc: 'avaliacao', rasc: 'Oi, {n}! Aqui é a Beatriz, da recepção. Consegui um encaixe amanhã às 8h com a Dra. Camila. Posso confirmar?' }];
var usados = {};
PEDIDOS.forEach(function (pd, k) {
  var livre = function (x) { return !usados[x.telefone] && (x.crm_stage === 'qualificado' || x.crm_stage === 'em_conversa') && (k !== 0 || x._fem); };
  var l = recentes.filter(function (x) { return livre(x) && x._proc === pd.proc; })[0] || recentes.filter(livre)[0];
  if (!l) return;
  usados[l.telefone] = true;
  var tp = AGORA - entre(25, 140) * MIN;
  l._ultLead = tp; l.ultima_msg_lead_em = iso(tp); l.ultima_mensagem_lead_em = iso(tp); l.crm_score = 9; l.score = 9; l.crm_stage = 'qualificado'; l.qualificado = true;
  CONVERSAS[l.telefone].push({ de: 'paciente', texto: pd.trecho, t: tp }, { de: 'ia', texto: 'Claro! Já passei seu pedido para a equipe e a ' + CFG.donaCurta + ' te responde em instantes.', t: tp + 20 * 1000 });
  l.auditoria_ia_resumo = l._primeiro + ' pediu: "' + pd.trecho + '" A ' + CFG.ia + ' avisou a equipe.';
  l.auditoria_ia_proxima_acao = 'Responder o pedido agora: a ' + CFG.donaCurta + ' ou a recepção.';
  TAREFAS.push({ id: uuid(1 + k), conta: 'epos', lead_telefone: l.telefone, responsavel_id: EQUIPE[0].id, tipo: 'aviso', status: 'pendente', origem: 'analista', criada_por: 'O Analista (aviso)',
    acao: 'Responder o pedido: "' + pd.trecho + '"', quando: iso(tp + MIN), criada_em: iso(tp + MIN), lembrete_enviado: true, mensagem_sugerida: pd.rasc.replace('{n}', l._primeiro),
    plano: { nome: l.nome, nota: 10, aviso: { pedido: l._primeiro + ' pediu: "' + pd.trecho + '"', rascunho: pd.rasc.replace('{n}', l._primeiro), dados_faltando: [] },
      canal: l.canal, nicho: l.segmento, modelo: 'aviso', resumo: l.auditoria_ia_resumo, conversa_id: Number(l.chatwoot_conversation_id),
      sinal_mais_forte: { data: ddmm(tp), onde: 'donna', trecho: pd.trecho } } });
  NOTIF.push({ id: 9000 + k, conta: 'epos', lead_telefone: l.telefone, lead_nome: l.nome, tipo: 'quente', titulo: '🔥 ' + l.nome + ' pediu resposta', descricao: pd.trecho, lida: false, criado_em: iso(tp + MIN) });
});
abertos = abertos.filter(function (l) { return !usados[l.telefone]; });
abertos.slice(0, 9).forEach(function (l, k) {
  var p = PROC.filter(function (x) { return x._k === l._proc || x.k === l._proc; })[0];
  var h1 = proximoHorario(AGORA, 1), h2 = proximoHorario(h1, 1), quando = AGORA + (k % 2 ? 4 : 1) * HORA;
  var msg = 'Oi, ' + l._primeiro + '! Aqui é a ' + CFG.ia + ', da ' + CFG.clinica + '. No dia ' + ddmm(Date.parse(l.criado_em)) + ' você perguntou sobre ' + p.nome +
    ' e a conversa parou. É comum adiar e acabar deixando para depois; a avaliação é rápida e já sai com o plano e o valor. Tenho ' + diaSem(h1) + ' às ' + horaBR(h1) + ' ou ' + diaSem(h2) + ' às ' + horaBR(h2) + '. Qual fica melhor?';
  TAREFAS.push({ id: uuid(20 + k), conta: 'epos', lead_telefone: l.telefone, responsavel_id: null, tipo: 'contato', status: 'sugerida', origem: 'analista', criada_por: 'O Analista (plano)',
    acao: 'Retomar: perguntou sobre ' + p.nome + ' em ' + ddmm(Date.parse(l.criado_em)) + ' e não marcou a avaliação.', quando: iso(quando), criada_em: iso(AGORA - entre(30, 300) * MIN), lembrete_enviado: false,
    mensagem_sugerida: msg, plano: { nome: l.nome, canal: l.canal, nicho: l.segmento, modelo: 'v2', numero: 'donna', resumo: l.auditoria_ia_resumo,
      sinais: { recusou: false, so_robo: false, interesse: l.crm_stage === 'qualificado' ? 'alto' : 'medio', pergunta_pendente: false }, retomada: 1,
      conversa_id: Number(l.chatwoot_conversation_id), janela_24h_ate: iso(l._ultLead + DIA), precisa_apresentar: false, ultima_msg_lead_em: l.ultima_msg_lead_em,
      possivel_fechamento: true, ultima_msg_conversa_em: l.ultima_resposta_em } });
});
/* remarketing já aprovado e enviado (histórico da fila) */
abertos.slice(9, 21).forEach(function (l, k) {
  var p = PROC.filter(function (x) { return x.k === l._proc; })[0], enviada = k < 8;
  var quando = enviada ? Math.min(AGORA - 3 * HORA, Math.max(l._ultLead, l._ultResp) + entre(24, 40) * HORA) : AGORA + entre(1, 7) * HORA;
  var txt = 'Oi, ' + l._primeiro + '! Aqui é a ' + CFG.ia + ', da ' + CFG.clinica + '. Você perguntou sobre ' + p.nome + ' no dia ' + ddmm(Date.parse(l.criado_em)) + '. Ainda tenho horário de avaliação nesta semana; quer que eu reserve um para você?';
  var rid = uuid(60 + k);
  RMKT.push({ id: rid, conta: 'epos', lead_telefone: l.telefone, lead_nome: l.nome, conversa_id: Number(l.chatwoot_conversation_id), canal_aquisicao: l.canal, stage: l.crm_stage,
    sinais: { recusou: false, so_robo: false, interesse: 'medio', pergunta_pendente: false }, resumo: l.auditoria_ia_resumo, decisao: 'enviar', motivo: 'Parou de responder depois das dúvidas; retomar com horário.',
    mensagem: txt, mensagem_final: txt, numero: 'donna', janela_24h_ate: null, ultima_msg_lead_em: l.ultima_msg_lead_em, ultima_msg_conversa_em: l.ultima_resposta_em,
    status: enviada ? 'enviada' : 'aprovada', aprovada_por: 'camila@clinicabemestar.demo', aprovada_em: iso(quando - 3 * HORA), agendada_para: iso(quando),
    enviada_em: enviada ? iso(quando + 40 * 1000) : null, id_envio: enviada ? 'demo-wamid-' + k : null, erro: null, modelo: 'analista', criada_em: iso(quando - 5 * HORA), tarefa_id: uuid(80 + k) });
  if (enviada) { l.rmkt_historico = [{ em: iso(quando), tipo: '1º remarketing', texto: txt }]; l.remarketing_enviado = true; CONVERSAS[l.telefone].push({ de: 'ia', texto: txt, t: quando });
    if (k % 3 === 0) { CONVERSAS[l.telefone].push({ de: 'paciente', texto: pick(['Oi! Desculpa a demora. Pode ser sexta?', 'Quero sim, tem sábado?']), t: quando + 2 * HORA }); l._ultLead = quando + 2 * HORA; l.ultima_msg_lead_em = iso(l._ultLead); l.ultima_mensagem_lead_em = l.ultima_msg_lead_em; } }
  else TAREFAS.push({ id: uuid(80 + k), conta: 'epos', lead_telefone: l.telefone, responsavel_id: null, tipo: 'contato', status: 'pendente', origem: 'analista', criada_por: 'O Analista (plano)',
    acao: 'Retomada aprovada: sai ' + diaSem(quando) + ' às ' + horaBR(quando) + '.', quando: iso(quando), criada_em: iso(quando - 5 * HORA), lembrete_enviado: true, mensagem_sugerida: txt, remarketing_id: rid, plano: null });
});
Object.keys(CONVERSAS).forEach(function (t) { CONVERSAS[t].sort(function (a, b) { return a.t - b.t; }); });
/* lembretes de consulta programados */
LEADS.filter(function (l) { return l.crm_stage === 'agendou' && l._consulta > AGORA + 20 * HORA; }).slice(0, 6).forEach(function (l, k) {
  AGENDADAS.push({ id: uuid(120 + k), conta: 'epos', lead_telefone: l.telefone, texto: 'Oi, ' + l._primeiro + '! Lembrete: sua avaliação é amanhã às ' + horaBR(l._consulta) + ', com a ' + CFG.donaCurta + '. Posso confirmar?',
    agendada_para: iso(l._consulta - DIA), criada_por: 'Lembrete automático', status: 'pendente', enviada_em: null, erro: null, criada_em: l.stage_historico.slice(-1)[0].em });
});
/* notificações do sino */
LEADS.filter(function (l) { return l.agendou; }).sort(function (a, b) { return Date.parse(b.stage_historico.slice(-1)[0].em) - Date.parse(a.stage_historico.slice(-1)[0].em); }).slice(0, 6).forEach(function (l, k) {
  var em = l.stage_historico.filter(function (h) { return h.para === 'agendou'; })[0];
  NOTIF.push({ id: 9100 + k, conta: 'epos', lead_telefone: l.telefone, lead_nome: l.nome, tipo: 'agendamento', titulo: '📅 ' + l.nome + ' agendou avaliação', descricao: l.auditoria_ia_resumo, lida: k > 2, criado_em: em ? em.em : l.criado_em });
});
LEADS.filter(function (l) { return l.crm_stage === 'perdido'; }).slice(0, 3).forEach(function (l, k) {
  NOTIF.push({ id: 9200 + k, conta: 'epos', lead_telefone: l.telefone, lead_nome: l.nome, tipo: 'sugestao_stage', titulo: l.nome + ' -> perdido', descricao: 'Analista sugeriu mudança: ' + (l._motivo || ''), lida: true, criado_em: l.stage_historico.slice(-1)[0].em });
});
NOTIF.sort(function (a, b) { return Date.parse(b.criado_em) - Date.parse(a.criado_em); });
/* nota do atendimento humano (Analista avalia a equipe) */
LEADS.filter(function (l) { return l.atendido_por === 'equipe' && l.responsavel_id; }).forEach(function (l) {
  var v = EQUIPE.filter(function (e) { return e.id === l.responsavel_id; })[0];
  var c = { velocidade: entre(6, 10), qualificacao: entre(6, 10), objecao: entre(5, 9), proximo_passo: entre(6, 10), tom: entre(8, 10) };
  var nota = Math.round((c.velocidade * .2 + c.qualificacao * .25 + c.objecao * .2 + c.proximo_passo * .25 + c.tom * .1) * 10) / 10;
  NOTAS.push({ conta: 'epos', lead_telefone: l.telefone, dia: l.primeiro_atendimento_humano_em.slice(0, 10), vendedor: v.nome, nota: nota, criterios: c,
    justificativa: 'Respondeu em ' + entre(3, 25) + ' min, confirmou o procedimento e ofereceu horário.', dica: pick(['Perguntar o melhor período antes de oferecer horários.', 'Reforçar o parcelamento logo na primeira resposta.', 'Mandar a localização junto da confirmação.']), evidencia: null });
});

/* ── laboratório: testes da IA antes de ir ao ar ── */
var LAB = [
  { titulo: 'Paciente pergunta preço do implante às 23h → ' + CFG.ia + ' → avaliação marcada', nicho: 'odontologia', dur: 74, conversa: [
    ['cliente', 'Boa noite, quanto custa o implante?'], ['donna', 'Boa noite! Aqui é a ' + CFG.ia + ', da ' + CFG.clinica + '. O valor depende da avaliação, que é gratuita e leva 30 minutos. Você perdeu o dente faz tempo?'],
    ['cliente', 'Uns 2 anos'], ['donna', 'Entendi. Tenho quinta às 9h ou sexta às 15h30. Qual prefere?'], ['cliente', 'Sexta'], ['donna', 'Agendado ✅ sexta às 15h30 com a ' + CFG.donaCurta + '. Te mando um lembrete na véspera.']],
    final: { agendou: true, crm_stage: 'agendou' } },
  { titulo: 'Áudio pedindo encaixe por dor → ' + CFG.ia + ' → aviso para a recepção', nicho: 'odontologia', dur: 41, conversa: [
    ['cliente', '[áudio] Oi, tô com muita dor no dente, vocês têm encaixe amanhã cedo?'], ['donna', 'Sinto muito pela dor. Já avisei a recepção para encontrar um encaixe amanhã cedo e te respondem em instantes.']],
    final: { agendou: false, crm_stage: 'qualificado' } },
  { titulo: 'Paciente diz "vou pensar" → Analista sugere retomada em 2 dias', nicho: 'estética', dur: 58, conversa: [
    ['cliente', 'Quanto custa o botox na testa?'], ['donna', 'O valor sai na avaliação, que é gratuita. É a primeira vez que você vai aplicar?'], ['cliente', 'É sim. Vou pensar e te falo'],
    ['donna', 'Claro! Fico por aqui. Se quiser, já deixo reservado um horário sem compromisso.']], final: { agendou: false, crm_stage: 'em_conversa' } },
  { titulo: 'Pergunta sobre convênio → ' + CFG.ia + ' explica que é particular, sem insistir', nicho: 'odontologia', dur: 22, conversa: [
    ['cliente', 'Vocês atendem Amil?'], ['donna', 'Hoje atendemos só particular, com parcelamento em até 12x no cartão. Se quiser, te passo como funciona a avaliação.']],
    final: { agendou: false, crm_stage: 'em_conversa' } }];
var LAB_ROWS = LAB.map(function (x, k) {
  var t0 = AGORA - (k * 26 + 3) * HORA;
  return { id: 70 - k, criado_em: iso(t0), titulo: x.titulo, conta: 'epos', demo_nicho: x.nicho, resultado: 'ok', falhas: 0, duracao_s: x.dur,
    conversa: x.conversa.map(function (c, j) { return { de: c[0], texto: c[1], audio: /^\[áudio\]/.test(c[1]) ? c[1].replace('[áudio] ', '') : undefined, quando: iso(t0 + j * 9000) }; }),
    lead_final: { agendou: x.final.agendou, crm_stage: x.final.crm_stage, dia_agendamento: null, google_event_id: x.final.agendou ? 'demo-lab' : null, prospeccao: null } };
});

/* ── anúncios (Meta) ── */
function thumb(txt, c1, c2) {
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient></defs>' +
    '<rect width="160" height="160" fill="url(#g)"/><text x="80" y="86" font-family="DM Sans,Arial" font-size="15" font-weight="700" fill="#fff" text-anchor="middle">' + txt + '</text></svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
var ADS = [];
PROC.forEach(function (p, pi) {
  p.criat.forEach(function (c, ci) {
    var leads = LEADS.filter(function (l) { return l.utm_content === c && AGORA - Date.parse(l.criado_em) < 30 * DIA; }).length;
    if (!leads && pi === 6) return;
    var spend = Math.round((leads * (14 + R() * 12) + 25) * 100) / 100, imp = Math.round(spend * (55 + R() * 30)), clicks = Math.round(imp * (0.018 + R() * 0.03));
    ADS.push({ cpc: String(spend / Math.max(clicks, 1)), ctr: String(clicks / imp * 100), date_start: iso(AGORA - 30 * DIA).slice(0, 10), date_stop: iso(AGORA).slice(0, 10),
      clicks: String(clicks), unique_clicks: String(Math.round(clicks * 0.82)), frequency: String(1.2 + R() * 0.6), impressions: String(imp), reach: String(Math.round(imp * 0.72)), spend: String(spend),
      ad_id: '1200' + (pi * 10 + ci + 1), ad_name: c, adset_name: 'Público — 25 a 55 anos, 8 km da clínica', campaign_name: p.camp, ctwa: Math.round(leads * 0.7), lead_form: 0, offsite_lead: Math.round(leads * 0.3),
      video_3s: Math.round(imp * 0.3), video_plays: Math.round(imp * 0.55), video_thruplay: Math.round(imp * 0.08), video_p25: Math.round(imp * 0.12), video_p75: Math.round(imp * 0.05), video_p100: Math.round(imp * 0.03),
      roas: 0, purchase_value: 0, roi: null, meta_leads: leads, thumbnail_url: thumb(p.nome.split(' ')[0].replace(/^./, function (x) { return x.toUpperCase(); }), '#16305E', ci ? '#315181' : '#0F214A') });
  });
});
var gasto = ADS.reduce(function (a, x) { return a + Number(x.spend); }, 0), impT = ADS.reduce(function (a, x) { return a + Number(x.impressions); }, 0), clkT = ADS.reduce(function (a, x) { return a + Number(x.clicks); }, 0);
var INSIGHTS = { success: true, action: 'meta_ads_insights', spend: Math.round(gasto * 100) / 100, impressions: impT, clicks: clkT, cpm: gasto / impT * 1000, cpc: gasto / clkT, ctr: clkT / impT * 100, date_preset: 'last_30d' };

/* cliques no link do WhatsApp (bio, site, Google) */
var CLIQUES = [];
for (var c = 0; c < 64; c++) CLIQUES.push({ src: pick(['instagram_bio', 'instagram_bio', 'site', 'google_perfil', 'site']), content: null, px: 'epos', created_at: iso(AGORA - R() * 29 * DIA) });

window.DEMO_DADOS = { CFG: CFG, LEADS: LEADS, CONVERSAS: CONVERSAS, EQUIPE: EQUIPE, TAREFAS: TAREFAS, RMKT: RMKT, AGENDADAS: AGENDADAS, NOTIF: NOTIF, NOTAS: NOTAS,
  LAB: LAB_ROWS, ADS: ADS, INSIGHTS: INSIGHTS, CLIQUES: CLIQUES, PROC: PROC, util: { iso: iso, ddmm: ddmm, diaSem: diaSem, horaBR: horaBR, AGORA: AGORA, HORA: HORA, DIA: DIA, MIN: MIN } };
})();
