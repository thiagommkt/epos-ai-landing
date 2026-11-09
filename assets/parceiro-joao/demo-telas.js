/* Demonstração (parceiro João), 09/11/2026: telas que no sistema real vêm do Chatwoot e do Google Agenda
   (caixa de conversas, conversa do lead e agenda), montadas aqui com os dados fictícios, mais a marca. */
(function () {
'use strict';
var D = window.DEMO_DADOS, CFG = D.CFG, U = D.util;
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function hhmm(t) { var d = new Date(t - 3 * U.HORA); return String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0'); }
function quando(t) { var hoje = U.ddmm(Date.now()), d = U.ddmm(t); return d === hoje ? hhmm(t) : d === U.ddmm(Date.now() - U.DIA) ? 'ontem' : d; }
var PROC_NOME = {}; D.PROC.forEach(function (p) { PROC_NOME[p.k] = p.nome; });
var ETAPA = { novo: 'Novo', em_conversa: 'Em conversa', qualificado: 'Qualificado', agendou: 'Agendou', compareceu: 'Compareceu', fechou: 'Fechou', perdido: 'Perdido', desqualificado: 'Desqualificado' };
var CSS_BASE = '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet"><style>' +
  ':root{--navy:#061030;--azul:#16305E;--azul2:#315181;--claro:#E8EEF7;--fundo:#F5F7FB;--txt:#0F214A;--mut:#5B6B86;--bd:#DCE3EE;--ok:#0E8A5F}' +
  '*{box-sizing:border-box;margin:0;padding:0}body{font-family:"DM Sans",system-ui,sans-serif;background:var(--fundo);color:var(--txt);font-size:14px;height:100vh;overflow:hidden}' +
  '.bolha{max-width:78%;padding:9px 12px;border-radius:14px;margin:4px 0;line-height:1.45;font-size:13.5px;white-space:pre-wrap;word-wrap:break-word;box-shadow:0 1px 1px rgba(6,16,48,.06)}' +
  '.pac{background:#fff;border:1px solid var(--bd);align-self:flex-start;border-bottom-left-radius:4px}.ia{background:var(--claro);align-self:flex-end;border-bottom-right-radius:4px}' +
  '.eq{background:var(--azul);color:#fff;align-self:flex-end;border-bottom-right-radius:4px}.quem{font-size:10.5px;font-weight:700;letter-spacing:.02em;margin-bottom:2px;opacity:.75}' +
  '.hora{font-size:10px;opacity:.55;text-align:right;margin-top:3px}.msgs{display:flex;flex-direction:column;padding:16px 18px;overflow-y:auto;gap:2px}' +
  '.chip{display:inline-block;font-size:10.5px;font-weight:700;padding:2px 8px;border-radius:999px;background:var(--claro);color:var(--azul);margin-right:4px}' +
  '.chip.ok{background:#DDF3EA;color:var(--ok)}.chip.al{background:#FDE8E8;color:#B42318}' +
  '.dia{align-self:center;font-size:10.5px;color:var(--mut);background:#fff;border:1px solid var(--bd);padding:2px 10px;border-radius:999px;margin:10px 0 6px}' +
  '</style>';

function bolhas(msgs) {
  var html = '', ult = '';
  msgs.forEach(function (m) {
    var d = U.ddmm(m.t); if (d !== ult) { html += '<div class="dia">' + (d === U.ddmm(Date.now()) ? 'Hoje' : d) + '</div>'; ult = d; }
    var cls = m.de === 'paciente' ? 'pac' : m.de === 'ia' ? 'ia' : 'eq';
    var quem = m.de === 'ia' ? CFG.ia + ' · IA' : m.de === 'equipe' ? (m.quem || 'Equipe') : '';
    html += '<div class="bolha ' + cls + '">' + (quem ? '<div class="quem">' + esc(quem) + '</div>' : '') + esc(m.texto) + '<div class="hora">' + hhmm(m.t) + '</div></div>';
  });
  return html;
}
function leadPorConv(id) { return D.LEADS.filter(function (l) { return String(l.chatwoot_conversation_id) === String(id); })[0]; }
function leadPorTel(t) { return D.LEADS.filter(function (l) { return l.telefone === t; })[0]; }
function situacao(l) {
  if (l.em_atendimento) return '<span class="chip">Equipe atendendo</span>';
  if (l._ultLead > l._ultResp && Date.now() - l._ultLead > U.HORA) return '<span class="chip al">Aguardando resposta</span>';
  return ['perdido', 'desqualificado', 'fechou', 'compareceu'].indexOf(l.crm_stage) >= 0 ? '' : '<span class="chip ok">' + esc(CFG.ia) + ' atendendo</span>';
}

/* ── conversa de um lead (janela por cima do painel) ── */
function htmlConversa(l) {
  if (!l) return '<!doctype html><html><head><meta charset="utf-8">' + CSS_BASE + '</head><body><div style="padding:30px;color:#5B6B86">Conversa não encontrada.</div></body></html>';
  return '<!doctype html><html><head><meta charset="utf-8">' + CSS_BASE + '</head><body style="display:flex;flex-direction:column">' +
    '<div style="padding:12px 18px;background:#fff;border-bottom:1px solid var(--bd);display:flex;align-items:center;gap:10px;flex-wrap:wrap"><b>' + esc(l.nome) + '</b>' +
    '<span class="chip">' + esc(PROC_NOME[l._proc]) + '</span><span class="chip">' + esc(ETAPA[l.crm_stage || 'novo']) + '</span>' + situacao(l) + '</div>' +
    '<div class="msgs" style="flex:1">' + bolhas(D.CONVERSAS[l.telefone] || []) + '</div><script>var m=document.querySelector(".msgs");m.scrollTop=m.scrollHeight<\/script></body></html>';
}

/* ── caixa de conversas (aba Chat) ── */
function htmlCaixa(selecionada) {
  var lista = D.LEADS.filter(function (l) { return (D.CONVERSAS[l.telefone] || []).length; }).map(function (l) {
    var ms = D.CONVERSAS[l.telefone]; return { l: l, ult: ms[ms.length - 1] }; }).sort(function (a, b) { return b.ult.t - a.ult.t; }).slice(0, 45);
  var dados = lista.map(function (x) { var l = x.l; return { id: l.chatwoot_conversation_id, nome: l.nome, proc: PROC_NOME[l._proc], etapa: ETAPA[l.crm_stage || 'novo'], sit: situacao(l),
    ult: (x.ult.de === 'paciente' ? '' : x.ult.de === 'ia' ? CFG.ia + ': ' : (x.ult.quem || 'Equipe') + ': ') + x.ult.texto, quando: quando(x.ult.t), bolhas: bolhas(D.CONVERSAS[l.telefone]),
    ini: l.nome.split(' ').map(function (p) { return p[0]; }).slice(0, 2).join(''), espera: l._ultLead > l._ultResp && Date.now() - l._ultLead > U.HORA }; });
  var sel = selecionada || (dados[0] && dados[0].id);
  return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + CSS_BASE + '<style>' +
    '.cx{display:flex;height:100vh}.lista{width:330px;flex-shrink:0;background:#fff;border-right:1px solid var(--bd);display:flex;flex-direction:column}' +
    '.busca{padding:12px;border-bottom:1px solid var(--bd)}.busca input{width:100%;padding:9px 12px;border:1px solid var(--bd);border-radius:10px;font:inherit;background:var(--fundo)}' +
    '.abas{display:flex;gap:6px;padding:8px 12px;border-bottom:1px solid var(--bd)}.abas span{font-size:11.5px;font-weight:700;padding:4px 10px;border-radius:999px;cursor:pointer;color:var(--mut)}.abas span.on{background:var(--azul);color:#fff}' +
    '.itens{overflow-y:auto;flex:1}.it{display:flex;gap:10px;padding:11px 12px;border-bottom:1px solid #EEF2F7;cursor:pointer}.it:hover{background:var(--fundo)}.it.on{background:var(--claro)}' +
    '.av{width:38px;height:38px;border-radius:12px;background:linear-gradient(135deg,var(--azul),var(--azul2));color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0}' +
    '.it b{font-size:13.5px}.prev{font-size:12px;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px}.qd{font-size:10.5px;color:var(--mut);margin-left:auto;white-space:nowrap}' +
    '.esp{width:8px;height:8px;border-radius:50%;background:#D92D20;display:inline-block;margin-left:6px}' +
    '.conv{flex:1;display:flex;flex-direction:column;min-width:0}.topo{padding:12px 18px;background:#fff;border-bottom:1px solid var(--bd);display:flex;align-items:center;gap:8px;flex-wrap:wrap}' +
    '.topo button{margin-left:auto;font:inherit;font-size:12px;font-weight:700;padding:7px 12px;border-radius:10px;border:1px solid var(--azul);background:#fff;color:var(--azul);cursor:pointer}' +
    '.rod{display:flex;gap:8px;padding:10px 14px;background:#fff;border-top:1px solid var(--bd)}.rod input{flex:1;padding:10px 12px;border:1px solid var(--bd);border-radius:10px;font:inherit}' +
    '.rod button{padding:0 16px;border:0;border-radius:10px;background:var(--azul);color:#fff;font:inherit;font-weight:700;cursor:pointer}' +
    '@media(max-width:700px){.lista{width:100%}.conv{display:none}.cx.aberta .lista{display:none}.cx.aberta .conv{display:flex}.voltar{display:inline-block!important}}' +
    '</style></head><body><div class="cx" id="cx"><div class="lista"><div class="busca"><input id="q" placeholder="Buscar paciente…" oninput="filtrar()"></div>' +
    '<div class="abas"><span class="on" data-f="todas" onclick="aba(this)">Todas</span><span data-f="esp" onclick="aba(this)">Aguardando</span><span data-f="eq" onclick="aba(this)">Com a equipe</span></div>' +
    '<div class="itens" id="itens"></div></div><div class="conv"><div class="topo" id="topo"></div><div class="msgs" id="msgs" style="flex:1"></div>' +
    '<div class="rod"><input id="txt" placeholder="Responder como equipe…" onkeydown="if(event.key===\'Enter\')enviar()"><button onclick="enviar()">Enviar</button></div></div></div>' +
    '<script>var C=' + JSON.stringify(dados).replace(/<\//g, '<\\/') + ',sel=' + JSON.stringify(String(sel)) + ',f="todas";' +
    'function esc(s){return String(s).replace(/[&<>]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;"}[c]})}' +
    'function lista(){var q=document.getElementById("q").value.toLowerCase();document.getElementById("itens").innerHTML=C.filter(function(c){return(!q||c.nome.toLowerCase().indexOf(q)>=0)&&(f==="todas"||(f==="esp"&&c.espera)||(f==="eq"&&c.sit.indexOf("Equipe")>=0))}).map(function(c){' +
    'return \'<div class="it\'+(String(c.id)===sel?" on":"")+\'" onclick="abrir(\\\'\'+c.id+\'\\\')"><div class="av">\'+c.ini+\'</div><div style="min-width:0;flex:1"><div style="display:flex;align-items:center"><b>\'+esc(c.nome)+\'</b>\'+(c.espera?\'<span class="esp"></span>\':"")+\'<span class="qd">\'+c.quando+\'</span></div><div class="prev">\'+esc(c.ult)+\'</div></div></div>\'}).join("")}' +
    'function abrir(id){sel=String(id);var c=C.filter(function(x){return String(x.id)===sel})[0];if(!c)return;document.getElementById("cx").classList.add("aberta");' +
    'document.getElementById("topo").innerHTML=\'<span class="voltar" style="display:none;cursor:pointer;font-weight:700;margin-right:6px" onclick="document.getElementById(\\\'cx\\\').classList.remove(\\\'aberta\\\')">‹</span><b>\'+esc(c.nome)+\'</b><span class="chip">\'+esc(c.proc)+\'</span><span class="chip">\'+esc(c.etapa)+\'</span>\'+c.sit+\'<button onclick="assumir()">Assumir conversa</button>\';' +
    'var m=document.getElementById("msgs");m.innerHTML=c.bolhas;m.scrollTop=m.scrollHeight;lista()}' +
    'function aba(el){f=el.getAttribute("data-f");[].forEach.call(document.querySelectorAll(".abas span"),function(s){s.classList.toggle("on",s===el)});lista()}function filtrar(){lista()}' +
    'function assumir(){var c=C.filter(function(x){return String(x.id)===sel})[0];c.sit=\'<span class="chip">Equipe atendendo</span>\';abrir(sel)}' +
    'function enviar(){var i=document.getElementById("txt"),t=i.value.trim();if(!t)return;var c=C.filter(function(x){return String(x.id)===sel})[0];var d=new Date();c.bolhas+=\'<div class="bolha eq"><div class="quem">Você</div>\'+esc(t)+\'<div class="hora">\'+String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")+\'</div></div>\';c.ult="Você: "+t;c.quando="agora";i.value="";abrir(sel)}' +
    'lista();function talvez(){if(window.innerWidth>700&&!document.getElementById("topo").innerHTML)abrir(sel)}talvez();window.addEventListener("resize",talvez);<\/script></body></html>';
}

/* ── agenda da clínica (aba Agenda) ── */
function htmlAgenda() {
  var ev = D.LEADS.filter(function (l) { return l._consulta; }).map(function (l) { var g = D.PROC.filter(function (p) { return p.k === l._proc; })[0]; return { t: l._consulta, nome: l.nome, proc: PROC_NOME[l._proc], seg: g ? g.grp : '', ok: l.compareceu, fechou: l.fechou }; });
  var hoje = new Date(Date.now() - 3 * U.HORA), dw = hoje.getUTCDay(), seg0 = Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate() - (dw === 0 ? 6 : dw - 1)) + 3 * U.HORA;
  return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + CSS_BASE + '<style>' +
    'body{overflow:auto}.top{display:flex;align-items:center;gap:10px;padding:14px 16px;background:#fff;border-bottom:1px solid var(--bd);position:sticky;top:0;z-index:3}' +
    '.top button{font:inherit;font-weight:700;border:1px solid var(--bd);background:#fff;border-radius:10px;padding:6px 12px;cursor:pointer;color:var(--azul)}.top b{font-size:15px}' +
    '.leg{margin-left:auto;display:flex;gap:10px;font-size:11.5px;color:var(--mut)}.leg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:4px;vertical-align:-1px}' +
    '.grade{display:grid;grid-template-columns:52px repeat(6,minmax(120px,1fr));min-width:780px}.cab{position:sticky;top:57px;background:var(--fundo);z-index:2;padding:8px 6px;font-size:12px;font-weight:700;text-align:center;border-bottom:1px solid var(--bd)}' +
    '.cab.hj{color:#fff;background:var(--azul);border-radius:10px 10px 0 0}.hr{font-size:10.5px;color:var(--mut);text-align:right;padding:4px 6px 0 0;height:56px;border-top:1px solid #E9EEF5}' +
    '.cel{height:56px;border-top:1px solid #E9EEF5;border-left:1px solid #E9EEF5;position:relative}.ev{position:absolute;left:3px;right:3px;top:3px;bottom:3px;border-radius:8px;padding:4px 7px;font-size:11px;line-height:1.3;color:#fff;overflow:hidden;box-shadow:0 2px 6px rgba(6,16,48,.15)}' +
    '.ev.o{background:linear-gradient(135deg,#16305E,#315181)}.ev.e{background:linear-gradient(135deg,#2B4B7B,#5B7DB0)}.ev.f{opacity:.55}.ev b{display:block;font-size:11.5px}' +
    '</style></head><body><div class="top"><button onclick="sem(-1)">‹</button><button onclick="sem(0)">Hoje</button><button onclick="sem(1)">›</button><b id="tit"></b>' +
    '<div class="leg"><span><i style="background:#16305E"></i>Injetáveis</span><span><i style="background:#5B7DB0"></i>Pele e laser</span><span><i style="background:#9AA9C0"></i>Já atendido</span></div></div><div class="grade" id="g"></div>' +
    '<script>var E=' + JSON.stringify(ev).replace(/<\//g, '<\\/') + ',S0=' + seg0 + ',H=36e5,DIA=864e5,off=0,DS=["seg","ter","qua","qui","sex","sáb"];' +
    'function br(t){return new Date(t-3*H)}function dd(t){var d=br(t);return String(d.getUTCDate()).padStart(2,"0")+"/"+String(d.getUTCMonth()+1).padStart(2,"0")}' +
    'function sem(n){off=n===0?0:off+n;var ini=S0+off*7*DIA,hj=dd(Date.now()),h="<div></div>";document.getElementById("tit").textContent="Semana de "+dd(ini)+" a "+dd(ini+5*DIA);' +
    'for(var d=0;d<6;d++)h+=\'<div class="cab\'+(dd(ini+d*DIA)===hj?" hj":"")+\'">\'+DS[d]+" "+dd(ini+d*DIA)+"</div>";' +
    'for(var hr=8;hr<19;hr++){h+=\'<div class="hr">\'+hr+"h</div>";for(var d2=0;d2<6;d2++){var a=ini+d2*DIA+(hr-0)*H,ev=E.filter(function(e){var x=br(e.t);return dd(e.t)===dd(a)&&x.getUTCHours()===hr});' +
    'h+=\'<div class="cel">\'+ev.map(function(e){var x=br(e.t);return \'<div class="ev \'+(e.seg==="Pele e laser"?"e":"o")+(e.t<Date.now()?" f":"")+\'"><b>\'+String(x.getUTCHours()).padStart(2,"0")+":"+String(x.getUTCMinutes()).padStart(2,"0")+" · "+e.nome.split(" ")[0]+" "+e.nome.split(" ").slice(-1)+"</b>"+e.proc+(e.fechou?" · fechou":"")+"</div>"}).join("")+"</div>"}}' +
    'document.getElementById("g").innerHTML=h}sem(0);<\/script></body></html>';
}

/* ── liga tudo quando o painel termina de carregar ── */
document.addEventListener('DOMContentLoaded', function () {
  var cx = document.getElementById('chatwoot-iframe'); if (cx) { cx.removeAttribute('src'); cx.srcdoc = htmlCaixa(); }
  var ag = document.getElementById('agenda-iframe'); if (ag) { ag.removeAttribute('src'); ag.srcdoc = htmlAgenda(); }
  var orig = window.cwModalAbrir;
  if (typeof orig === 'function') window.cwModalAbrir = function (id, titulo, ev) {
    if (ev && (ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.button === 1)) { if (ev.preventDefault) ev.preventDefault(); }
    orig(id, titulo, null);
    var f = document.getElementById('cw-modal-frame'); if (f) { f.removeAttribute('src'); f.srcdoc = htmlConversa(leadPorConv(id)); }
    var nova = document.getElementById('cw-modal-nova'); if (nova) nova.style.display = 'none';
    var tt = document.getElementById('cw-modal-titulo'); if (tt) tt.textContent = 'Conversa' + (titulo ? ' · ' + titulo : '');
    return false;
  };
  window.openConversationInChat = function (convId) {
    var f = document.getElementById('chatwoot-iframe'); if (f) f.srcdoc = htmlCaixa(String(convId));
    if (window.navTo) window.navTo('chat'); if (window.closeLeadPanel) window.closeLeadPanel();
  };
  window.doLogout = function () { location.href = 'parceiro-joao.html'; };
});
window.DEMO_TELAS = { htmlConversa: htmlConversa, leadPorTel: leadPorTel };
})();
