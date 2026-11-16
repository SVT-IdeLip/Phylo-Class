const PAIRS10 = ANIMALS.filter(a => a.an);
let PAIRS = PAIRS10;
const byId = Object.fromEntries(ANIMALS.map(a => [a.id, a]));
const $ = s => document.querySelector(s);
const pick = a => a[Math.random() * a.length | 0];
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const q = n => "«\u00A0" + n + "\u00A0»";
const WIN = [
  n => "Boom ! C’est bien " + q(n) + ", bien vu !",
  n => "Trop fort ! " + q(n) + " : +1 point.",
  n => "Bien joué, tu gères !",
  n => "Validé : " + q(n) + " ! Tu as l’œil."
];
const TRY = [
  "Raté de peu ! Observe le squelette, les pattes et la peau. Cette fiche reviendra plus tard.",
  "Presque ! Relis bien les caractéristiques, tu vas la trouver. Cette fiche reviendra.",
  "Ce n’est pas la bonne fiche, mais continue ! Cette fiche reviendra plus tard.",
  "Courage, chaque essai t’apprend quelque chose. Cette fiche reviendra plus tard."
];
const ALL10 = PAIRS10.map(a => a.id);
let ALL = ALL10.slice();
const ATTRS_ALL = [
  { t: "Une tête et une bouche", a: ALL10 },
  { t: "Un squelette interne, des os", a: ["epervier", "lezard", "pelodyte", "renard", "truite"] },
  { t: "4 membres (2 paires)", a: ["epervier", "lezard", "pelodyte", "renard"] },
  { t: "La peau est nue", a: ["pelodyte"] },
  { t: "Des écailles non soudées, des nageoires", a: ["truite"] },
  { t: "Des écailles soudées", a: ["lezard"] },
  { t: "Des poils", a: ["renard"] },
  { t: "Des plumes", a: ["epervier"] },
  { t: "Un squelette externe", a: ["abeille", "epeire", "lithobie"] },
  { t: "Des antennes", a: ["abeille", "lithobie"] },
  { t: "3 paires de pattes", a: ["abeille"] },
  { t: "Plus de 4 paires de pattes", a: ["lithobie"] },
  { t: "4 paires de pattes", a: ["epeire"] },
  { t: "Un corps mou", a: ["escargot", "lombric"] },
  { t: "Une coquille", a: ["escargot"] },
  { t: "Des anneaux", a: ["lombric"] }
];
let ATTRS = ATTRS_ALL.map((r, o) => ({ t: r.t, a: r.a, o }));
const HUES = [28, 44, 68, 92, 118, 145, 168, 186, 204, 222, 240, 258, 276, 294, 312];
const attrColor = i => { const o = ATTRS[i] ? ATTRS[i].o : i; return o < HUES.length ? `hsl(${HUES[o]} 70% 38%)` : "hsl(0 0% 35%)"; };
let S;
function init() { R = {}; initGame(); }
function initGame() {
  S = { left: shuffle(PAIRS.map(a => a.id)), queue: shuffle(PAIRS.map(a => a.id)), found: [], score: 0, err: {}, selL: null, busy: false, flash: null, fresh: true };
  show("game"); startStep(1); D.phase = null; F = null;
  say("Regarde la fiche à droite, puis clique sur l’animal qui correspond.", "");
  render(); window.scrollTo(0, 0);
}
function say(t, k) { const m = $("#msg"); m.textContent = (k === "win" ? "🎉 " : k === "try" ? "💪 " : "") + t; m.className = "msg " + k; setXp(); }
function cardL(id) {
  const a = byId[id], cls = ["card"];
  if (S.selL === id) cls.push("sel");
  if (S.flash && S.flash.L === id) cls.push(S.flash.type);
  return `<button class="${cls.join(" ")}" data-id="${id}" aria-pressed="${S.selL === id}" aria-label="${a.name}"><img src="${a.an}" alt="${a.name}"></button>`;
}
function cardR(id) {
  const cls = ["card", "fiche"];
  if (S.flash && S.flash.R === id) cls.push(S.flash.type);
  if (S.fresh) cls.push("new");
  const badge = S.err[id] ? '<span class="badge">À revoir</span>' : "";
  return `<div class="${cls.join(" ")}"><img src="${byId[id].at}" alt="Fiche de caractéristiques à associer">${badge}</div>`;
}
function render() {
  const f = S.found;
  $("#left").innerHTML = S.left.filter(i => !f.includes(i)).map(cardL).join("");
  $("#right").innerHTML = S.queue.length ? cardR(S.queue[0]) : "";
  S.fresh = false;
  $("#strip").innerHTML = f.length ? f.map(i => `<div class="chip"><div class="imgs"><img src="${byId[i].an}" alt=""><img src="${byId[i].at}" alt=""></div><span>${byId[i].name}</span></div>`).join("") : '<span class="empty">Tes associations réussies apparaîtront ici.</span>';
  $("#strip").scrollLeft = 1e5;
  setXp();
  $("#prog").textContent = f.length + " / " + PAIRS.length + " trouvées";
  document.documentElement.style.setProperty("--hh", document.querySelector("header").offsetHeight + "px");
}
function bump() { const b = $("#xp"); b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); }
$("#left").addEventListener("click", e => {
  const c = e.target.closest(".card"); if (!c || S.busy) return;
  S.selL = c.dataset.id; render(); check();
});
function check() {
  const l = S.selL, r = S.queue[0]; S.busy = true;
  if (l === r) {
    S.score++; S.flash = { L: l, R: r, type: "ok" };
    say(pick(WIN)(byId[l].name), "win"); render(); bump();
    setTimeout(() => {
      S.found.push(l); S.queue.shift(); S.selL = null; S.flash = null; S.busy = false; S.fresh = true; render();
      if (!S.queue.length) finish();
    }, 1000);
  } else {
    S.err[r] = (S.err[r] || 0) + 1;
    let lost = 0;
    if (S.err[r] >= 2) { const before = S.score; S.score = Math.max(0, S.score - 2); lost = before - S.score; }
    S.flash = { L: l, R: r, type: "ko" };
    say(S.err[r] >= 2 ? "Encore raté" + (lost ? " : −" + lost + " point" + (lost > 1 ? "s" : "") : "") + ". Prends ton temps et relis bien la fiche, tu vas y arriver !" : pick(TRY), "try");
    render(); if (lost) bump();
    setTimeout(() => {
      S.queue.shift(); S.queue.push(r);
      S.left = shuffle(S.left); S.selL = null; S.flash = null; S.busy = false; S.fresh = true; render();
    }, 1500);
  }
}
function finish() {
  show("end"); endStep(1); R.s1 = true; fanfare(1); saveResult(1);
  const sc1 = S.score + TM.b[1]; $("#final").textContent = sc1 + " point" + (sc1 > 1 ? "s" : "");
  const s = S.score, n = PAIRS.length;
  $("#endmsg").textContent = s >= n ? "Parfait, sans aucune erreur ! Tu es un as de la classification." : s >= n - 2 ? "Très bien joué, tu connais bien les caractéristiques des animaux !" : s >= n / 2 ? "Bon travail ! Rejoue pour viser encore plus haut." : "Tu as réussi toutes les associations. Rejoue pour améliorer ton score !"; $("#endmsg").textContent += tmInfo(1);
  $("#pairs").innerHTML = PAIRS.map(a => `<div class="pair"><div class="imgs"><img src="${a.an}" alt="${a.name}"><img src="${a.at}" alt="Fiche de ${a.name}"></div><div class="n">${a.name}</div></div>`).join("");
  window.scrollTo(0, 0); $("#replay").focus({ preventScroll: true });
}
$("#replay").addEventListener("click", init);
$("#again").addEventListener("click", init);
$("#totable").addEventListener("click", () => enter(2, openTable));
$("#validate").addEventListener("click", validate);
let T = null, drag = null, F = null;
const share = (x, y) => ATTRS.some((r, i) => i > 0 && r.a.includes(x) && r.a.includes(y));
function applyOrder() {
  document.querySelectorAll("#grid tr").forEach(tr => {
    const cells = {};
    tr.querySelectorAll("[data-c]").forEach(c => cells[c.dataset.c] = c);
    T.order.forEach(id => tr.appendChild(cells[id]));
  });
}
function moveTo(id, idx) {
  T.order.splice(T.order.indexOf(id), 1); T.order.splice(idx, 0, id); applyOrder();
}
function openTable() {
  T = { order: shuffle([...S.found]), done: false };
  show("tbl"); startStep(2); tableHint(); $("#tres").hidden = true; $("#legend").hidden = true;
  $("#validate").hidden = false; $("#again").hidden = true; $("#tobox").hidden = true; $("#tinfo").hidden = false;
  const head = '<tr><th class="rowh corner" scope="col"><span class="sr">Caractéristiques</span><div class="pvbox"><img id="pv" alt="" hidden></div></th>' + T.order.map(id => { const n = byId[id].name; return `<th scope="col" class="colh" data-c="${id}" tabindex="0" title="${n} : glisse pour déplacer, touche pour agrandir"><div class="imgs"><img src="${byId[id].an}" alt=""></div><div class="nm">${n}</div><div class="tgw"></div></th>`; }).join("") + "</tr>"; let t = "<tbody>";
  ATTRS.map((r, ri) => [r, ri]).reverse().forEach(([r, ri], k) => { t += `<tr style="--c:${attrColor(ri)};--ri:${k}"><th scope="row" class="rowh">${r.t}</th>` + T.order.map(id => `<td data-r="${ri}" data-c="${id}"><label><input type="checkbox" aria-label="${r.t} : ${byId[id].name}"></label></td>`).join("") + "</tr>"; });
  PIN = null; $("#grid").style.setProperty("--rn", ATTRS.length); $("#grid").classList.remove("pal"); $("#colorbtn").textContent = "🎨 Colorier cases cochées et attributs"; $("#colorbtn").hidden = true; $("#grid").classList.remove("val"); $("#grid").innerHTML = t + "</tbody><tfoot>" + head + "</tfoot>"; T.cur = 0; T.solo = true; applySolo();
  window.scrollTo(0, 0);
}
$("#grid").addEventListener("click", e => {
  const bt = e.target.closest(".mv button"); if (!bt || !T || T.done) return;
  const id = bt.closest("th").dataset.c, i = T.order.indexOf(id), d = bt.classList.contains("mvL") ? -1 : 1, j = i + d;
  if (j < 0 || j >= T.order.length) { $("#tlive").textContent = byId[id].name + " est déjà au bout du tableau."; return; }
  moveTo(id, j);
  document.querySelector(`#grid th[data-c="${id}"] .${d < 0 ? "mvL" : "mvR"}`).focus();
  $("#tlive").textContent = byId[id].name + " est maintenant en position " + (j + 1) + " sur " + T.order.length + ".";
});
function setDrag(on) { if (drag) document.querySelectorAll(`#grid [data-c="${drag}"]`).forEach(c => c.classList.toggle("drag", on)); }
let tapC = null, Z = null;
$("#grid").addEventListener("pointerdown", e => {
  const th = e.target.closest("th.colh"); if (!th || !T || T.solo || e.target.closest("button")) return;
  e.preventDefault(); tapC = { id: th.dataset.c, x: e.clientX, y: e.clientY, moved: false };
  if (!T.done) { drag = th.dataset.c; setDrag(true); const p = $("#pv"); if (p) p.hidden = true; }
});
$("#grid").addEventListener("keydown", e => {
  const th = e.target.closest("th.colh");
  if (th && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); if (PIN === th.dataset.c) zshow(th.dataset.c); else setPin(th.dataset.c); }
  if (th && !T.done && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
    e.preventDefault(); const id = th.dataset.c, j = T.order.indexOf(id) + (e.key === "ArrowLeft" ? -1 : 1);
    if (j >= 0 && j < T.order.length) { moveTo(id, j); document.querySelector(`#grid th[data-c="${id}"]`).focus(); $("#tlive").textContent = byId[id].name + " est en position " + (j + 1) + " sur " + T.order.length + "."; }
  }
});
let PIN = null;
function showPv(id) { const p = $("#pv"); if (!p || (T && T.solo)) return; p.src = byId[id].at; p.alt = "Fiche de " + byId[id].name; p.dataset.id = id; p.hidden = false; }
function restorePv() { const p = $("#pv"); if (!p) return; if (PIN) showPv(PIN); else p.hidden = true; }
function setPin(id) {
  PIN = id;
  document.querySelectorAll("#grid [data-c]").forEach(c => { c.classList.toggle("pin", c.dataset.c === id && c.matches("th")); c.classList.toggle("pincol", c.dataset.c === id && c.matches("td")); });
  restorePv();
}
function togglePin(id) { setPin(PIN === id ? null : id); }
$("#grid").addEventListener("pointerover", e => {
  if (e.pointerType === "touch" || drag || e.target.id === "pv") return;
  const c = e.target.closest("th.colh");
  if (c) showPv(c.dataset.c); else restorePv();
});
$("#grid").addEventListener("pointerleave", restorePv);
$("#grid").addEventListener("click", e => { if (e.target.id === "pv" && e.target.dataset.id) zshow(e.target.dataset.id); });
function zshow(id) {
  Z = id; const a = byId[id];
  $("#za").src = a.an; $("#zb").src = a.at; $("#za").alt = a.name; $("#zb").alt = "Fiche de " + a.name; $("#zname").textContent = a.name;
  $("#zoom").hidden = false;
  document.querySelectorAll("#grid th.colh").forEach(t => t.classList.toggle("sel", t.dataset.c === id));
  $("#zclose").focus({ preventScroll: true });
}
function zhide() { Z = null; $("#zoom").hidden = true; document.querySelectorAll("#grid th.sel").forEach(t => t.classList.remove("sel")); }
function zstep(d) { const i = T.order.indexOf(Z) + d; if (i >= 0 && i < T.order.length) zshow(T.order[i]); }
$("#zclose").addEventListener("click", zhide);
$("#zprev").addEventListener("click", () => zstep(-1));
$("#znext").addEventListener("click", () => zstep(1));
$("#zoom").addEventListener("click", e => { if (e.target === $("#zoom")) zhide(); });
document.addEventListener("keydown", e => { if (!Z) return; if (e.key === "Escape") zhide(); else if (e.key === "ArrowLeft") zstep(-1); else if (e.key === "ArrowRight") zstep(1); });
window.addEventListener("pointermove", e => {
  if (tapC && Math.hypot(e.clientX - tapC.x, e.clientY - tapC.y) > 8) tapC.moved = true;
  if (!drag) return;
  const wrap = document.querySelector(".tablewrap"), r = wrap.getBoundingClientRect();
  if (e.clientX < r.left + 40) wrap.scrollLeft -= 14; else if (e.clientX > r.right - 40) wrap.scrollLeft += 14;
  const over = [...document.querySelectorAll("#grid th.colh")].find(t => { const b = t.getBoundingClientRect(); return e.clientX >= b.left && e.clientX < b.right; });
  if (over && over.dataset.c !== drag) moveTo(drag, T.order.indexOf(over.dataset.c));
});
const endDrag = () => { setDrag(false); drag = null; };
window.addEventListener("pointerup", () => { const t = tapC; tapC = null; endDrag(); if (t && !t.moved) togglePin(t.id); else if (t) restorePv(); });
window.addEventListener("pointercancel", () => { tapC = null; endDrag(); });
function validate() {
  endDrag(); setPin(null); $("#grid").classList.remove("pal"); $("#colorbtn").hidden = false; $("#mvhint").hidden = true;
  let pts = 0, max = 0, wrong = 0, near = 0;
  document.querySelectorAll("#grid td").forEach(td => {
    const r = ATTRS[+td.dataset.r], id = td.dataset.c, should = r.a.includes(id), inp = td.querySelector("input"), on = inp.checked;
    if (should) max++;
    let v = "";
    if (on && should) { pts++; td.classList.add("ok"); v = "juste"; }
    else if (on) { wrong++; td.classList.add("ko"); v = "cochée par erreur"; }
    else if (should) { td.classList.add("miss"); v = "oubliée"; }
    if (v) inp.setAttribute("aria-label", inp.getAttribute("aria-label") + " (" + v + ")");
    if (on) { td.classList.add("chk"); td.closest("tr").classList.add("has"); inp.setAttribute("checked", ""); }
    inp.disabled = true;
  });
  const rel = id => ALL.some(o => o !== id && share(id, o));
  const N = T.order.filter(rel).length, lone = T.order.length - N;
  T.order.forEach((id, i) => {
    const alone = !rel(id), good = !alone && [T.order[i - 1], T.order[i + 1]].some(n => n && share(id, n));
    if (good) near++;
    const th = document.querySelector(`#grid th[data-c="${id}"]`);
    th.classList.add("done");
    th.querySelector(".tgw").innerHTML = alone ? '<span class="tg alone">Seul de son groupe</span>' : `<span class="tg ${good ? "good" : "bad"}">${good ? "Bien placé" : "À rapprocher"}</span>`;
  });
  T.done = true; S.tbl = pts + near; const tb = endStep(2); $("#grid").classList.add("val");
  const total = tot(), ratio = (pts + near) / (max + N);
  const m = wrong === 0 && pts === max && near === N ? "Tableau parfait, bravo !" : ratio >= 0.8 ? "Très beau tableau, tu connais bien tes animaux !" : ratio >= 0.5 ? "Bon travail ! Les cases en rouge, en pointillés et les étiquettes « À rapprocher » te montrent ce qu’il reste à retenir." : "Bel effort ! Regarde les cases en rouge, en pointillés et les animaux à rapprocher, puis rejoue pour t’améliorer.";
  const s = n => n > 1 ? "s" : "";
  const res = $("#tres");
  res.innerHTML = `<div>Score à cette étape</div><div class="big">${total} point${s(total)}</div><div>Jeu des associations : ${S.score} point${s(S.score)}</div><div>Cases du tableau : ${pts} juste${s(pts)} sur ${max}${wrong ? ", " + wrong + " cochée" + s(wrong) + " par erreur" : ""}</div><div>Animaux rapprochés : ${near} bien placé${s(near)} sur ${N}${lone ? ` (+${lone} sans proche parent dans ta collection, non compté${s(lone)})` : ""}</div><div>⏱ Temps ${fmt(TM.dur[2])} : bonus +${tb}</div><div style="margin-top:6px;font-weight:500">${m}</div>`;
  res.hidden = false; $("#legend").hidden = false; $("#tinfo").hidden = true; { const rows = [...document.querySelectorAll("#grid tbody tr.has")]; rows.forEach(tr => tr.classList.add("blink")); setTimeout(() => rows.forEach(tr => tr.classList.remove("blink")), 2100); }
  fitTable("#tbl .tablewrap", "#grid");
  R.s2 = { grid: $("#grid").innerHTML.replace(/ id="pv"/, ""), res: [...res.children].map(d => d.textContent).join(" · ") }; fanfare(2); saveResult(2);
  $("#validate").hidden = true; $("#again").hidden = false; $("#tobox").hidden = false;
  window.scrollTo(0, 0); res.focus({ preventScroll: true });
}

// ---------- Classification par emboîtement ----------
let NODES = [], ANC = {};
function buildModel(ids) {
  ALL = ALL10.filter(a => ids.includes(a)); PAIRS = PAIRS10.filter(p => ALL.includes(p.id));
  ATTRS = ATTRS_ALL.map((r, o) => ({ t: r.t, a: r.a.filter(x => ALL.includes(x)), o })).filter(r => r.a.length);
  const ns = ATTRS.map((r, i) => ({ i, t: r.t, a: r.a })).sort((x, y) => y.a.length - x.a.length || x.i - y.i);
  ns.forEach((n, k) => { n.k = k; n.p = -1; for (let j = k - 1; j >= 0; j--) if (n.a.every(a => ns[j].a.includes(a))) { n.p = j; break; } n.d = n.p < 0 ? 0 : ns[n.p].d + 1; });
  ns.forEach(n => n.kids = ns.filter(m => m.p === n.k).map(m => m.k));
  NODES = ns; ANC = {}; ALL.forEach(a => ANC[a] = NODES.reduce((m, n) => n.a.includes(a) ? n.k : m, 0));
}
buildModel(ALL10);
const availN = k => NODES[k].p < 0 || F.ins.has(NODES[k].p);
let B = null, P = { box: 0, tree: 0 };
const D = { sel: null, drag: null, phase: null };
const tot = () => S.score + (S.tbl || 0) + P.box + P.tree + TM.bonus;
const pl = n => n > 1 ? "s" : "";
const say2 = say;

// glisser-déposer (ou clic sur la carte puis clic sur la cible)
function tap(el) {
  const { k, v } = el.dataset;
  D.sel = D.sel && D.sel.k === k && D.sel.v === v ? null : { k, v };
  document.querySelectorAll(".dg.sel").forEach(x => x.classList.remove("sel"));
  if (D.sel) el.classList.add("sel");
}
function drop(k, v, z) { if (D.phase === "box") { if (k === "a") boxDrop(v, z); } else if (D.phase === "front") frontDrop(k, v, z); }
document.addEventListener("pointerdown", e => {
  const el = e.target.closest(".dg"); if (!el || !D.phase) return;
  e.preventDefault(); D.drag = { el, x: e.clientX, y: e.clientY, moved: false, ghost: null };
});
document.addEventListener("pointermove", e => {
  const d = D.drag; if (!d) return;
  if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6) {
    d.moved = true; const g = d.el.cloneNode(true); g.className = "an ghost"; if (d.el.classList.contains("attr")) g.className = "attr ghost";
    document.body.appendChild(g); d.ghost = g; d.el.classList.add("lift");
  }
  if (d.ghost) { d.ghost.style.left = e.clientX + "px"; d.ghost.style.top = e.clientY + "px"; }
});
document.addEventListener("pointerup", e => {
  const d = D.drag; if (!d) return; D.drag = null;
  if (d.ghost) d.ghost.remove(); d.el.classList.remove("lift");
  if (d.moved) { const z = document.elementFromPoint(e.clientX, e.clientY); const dz = z && z.closest(".dz"); if (dz) drop(d.el.dataset.k, d.el.dataset.v, dz); }
  else tap(d.el);
});
document.addEventListener("click", e => {
  if (e.target.closest(".dg")) return;
  const st = e.target.closest && e.target.closest("[data-star]"); if (st && F) { starClick(+st.dataset.star); return; }
  if (F && F.done) { const t = e.target.closest(".tipf"); if (t) compare(t.dataset.a); return; }
  const z = e.target.closest(".dz");
  if (z && D.sel && D.phase) drop(D.sel.k, D.sel.v, z);
});
$("#tobox").addEventListener("click", () => enter(3, startBox));
$("#tofront").addEventListener("click", () => enter(4, startFront));
$("#fagain").addEventListener("click", init);

// ---------- Phase 1 : les boîtes vues de dessus ----------
function startBox() {
  P = { box: 0, tree: 0 }; B = { step: 1, loc: {}, over: false }; ALL.forEach(a => B.loc[a] = 0);
  show("box"); startStep(3); D.phase = "box"; D.sel = null;
  say2("Tous les animaux ont une tête et une bouche : ils sont déjà tous dans la grande boîte. Passons à la suite !", "");
  renderBox(); window.scrollTo(0, 0);
}
function boxH(k) {
  const n = NODES[k], cur = !B.over && k === B.step;
  const cards = T.order.filter(a => B.loc[a] === k).map(a => `<div class="an dg" data-k="a" data-v="${a}"><img src="${byId[a].an}" alt=""><span>${byId[a].name}</span></div>`).join("");
  const kids = n.kids.filter(c => B.over || c <= B.step).map(boxH).join("");
  return `<div class="bx${cur ? " cur dz" : ""}" data-z="${k}" style="--d:${n.d};--c:${attrColor(n.i)}"><span class="bt">${n.t}</span><div class="bc">${cards}${kids}</div></div>`;
}
function renderBox() {
  $("#topin").innerHTML = boxH(0);
  $("#bstep").innerHTML = B.over ? "Toutes les boîtes sont remplies ! Plus une boîte est profonde, plus les animaux qu’elle contient ont d’attributs en commun." + tmInfo(3) : `Étape ${B.step} sur ${NODES.length - 1} : dépose dans la nouvelle boîte (en pointillés) les animaux qui ont <b>« ${NODES[B.step].t} »</b>. Glisse une carte, ou clique la carte puis la boîte.`;
  $("#tofront").hidden = !B.over; D.sel = null; setXp(); fitTop();
}
function boxDrop(v, z) {
  if (B.over || !z.classList.contains("cur")) return;
  const n = NODES[B.step], nm = byId[v].name;
  if (n.a.includes(v)) {
    if (B.loc[v] === B.step) return;
    B.loc[v] = B.step; P.box++;
    const done = n.a.every(a => B.loc[a] === B.step);
    if (done) { B.step++; if (B.step >= NODES.length) { B.over = true; endStep(3); R.s3 = true; fanfare(3); saveResult(3); } }
    renderBox(); say2(pick(WIN)(nm) + (done ? " La boîte est complète !" : ""), "win");
  } else say2(`Ce n’est pas le bon chemin : ${nm} n’a pas « ${n.t} ». Relis sa fiche et réessaie, tu y es presque !`, "try");
}

// ---------- Phase 2 : vue de face, arbre de parenté ----------
function startFront() {
  show("front"); startStep(4); D.phase = "front"; D.sel = null;
  document.title = APPTITLE; $("#front h2").textContent = "Niveau 4 : relie et place";
  BX = null; F = { lab: {}, used: {}, tips: {}, tipAt: {}, pick: [], star: null, done: false, newK: null, given: new Set(), ins: new Set([0]), q: shuffle(NODES.map(n => n.k)), q2: shuffle(T.order) };
  $("#fres").hidden = true; $("#fagain").hidden = true; $("#fprint").hidden = true; $("#frecap").hidden = true; $("#fbilan").hidden = true; $("#bank").hidden = false;
  const insA = k => { for (; k >= 0; k = NODES[k].p) F.ins.add(k); };
  shuffle(NODES.map(n => n.k)).slice(0, 3).forEach(k => { F.lab[k] = k; F.used[k] = 1; F.given.add("l" + k); insA(k); });
  shuffle(T.order).slice(0, 2).forEach(a => { F.tips[a] = 1; F.tipAt[ANC[a]] = a; F.given.add("a" + ANC[a]); insA(ANC[a]); });
  renderBank(); buildTree(); say2("Pour t’aider, 3 attributs et 2 animaux sont déjà placés (📌). L’arbre pousse : glisse chaque étiquette sur la branche en pointillés qui lui correspond, et chaque animal au bout de sa branche.", "");
}
function buildTree(ws = "#treewrap", ts = "#tree") {
  const wrap = $(ws), W = wrap.clientWidth, H = wrap.clientHeight;
  if (!W || !H || !F) return;
  const uid = ts.replace(/\W/g, "");
  const land = W >= H * 1.1, N = ALL.length, m = 24, su = ((land ? W : H) - 2 * m) / N, maxD = Math.max(...NODES.map(n => n.d));
  const stub = 26, tw = land ? Math.min(su * .66, 92) : 130, th = land ? 80 : Math.min(su * .62, 46);
  const trunk = land ? 60 : 170, zone = (land ? th : tw) + stub + 12 + 4 * maxD, sd = ((land ? H : W) - trunk - zone) / maxD;
  const lw = Math.round(Math.min(land ? su * .86 : sd * .78, 150));
  const ad = d => land ? H - trunk - d * sd : trunk + d * sd;
  const pt = (c, d) => land ? { x: c, y: ad(d) } : { x: ad(d), y: c };
  const leaves = [];
  (function walk(k) { NODES[k].kids.forEach(walk); T.order.filter(a => ANC[a] === k).forEach(a => leaves.push(a)); })(0);
  const cI = {}; leaves.forEach((a, i) => cI[a] = m + (i + .5) * su);
  NODES.forEach(n => { const cs = n.a.map(a => cI[a]); n.lo = Math.min(...cs); n.hi = Math.max(...cs); n.c = (n.lo + n.hi) / 2; });
  const main = [0];
  for (let k = 0; ;) { const big = NODES[k].kids.map(c => NODES[c]).filter(c => c.a.length > 1).sort((x, y) => y.a.length - x.a.length)[0]; if (!big) break; main.push(k = big.k); }
  const isMain = n => main.includes(n.k);
  main.forEach(k => NODES[k].c = NODES[main[main.length - 1]].c);
  const par = n => n.p < 0 ? (land ? { x: n.c, y: H - 6 } : { x: 6, y: n.c }) : pt(NODES[n.p].c, NODES[n.p].d);
  const cor = (p, q) => land ? { x: q.x, y: p.y } : { x: p.x, y: q.y };
  // animaux : image juste après le nœud, avec un court trait
  const tipPos = {}, obst = [];
  leaves.forEach(a => {
    const n = NODES[ANC[a]], q = pt(cI[a], n.d);
    const lvl = ad(maxD), tc = land ? { x: cI[a], y: lvl - stub - th / 2 } : { x: lvl + stub + tw / 2, y: cI[a] };
    tipPos[a] = { q, tc, e: land ? { x: tc.x, y: tc.y + th / 2 } : { x: tc.x - tw / 2, y: tc.y } };
    obst.push({ x: tc.x - tw / 2, y: tc.y - th / 2, w: tw, h: th });
  });
  // étiquettes : sur le trait, avant le nœud, sans chevaucher
  const REM = typeof getComputedStyle === "function" ? parseFloat(getComputedStyle(document.documentElement).fontSize) || 16 : 16;
  const est = t => Math.max(34, Math.ceil(t.length / Math.max(6, Math.floor((lw - 16) / (REM * .369)))) * REM * .72 + 12);
  const nodePts = NODES.map(n => Object.assign(pt(n.c, n.d), { r: (n.a.length > 1 ? (isMain(n) ? 14 : 11) : 7) + 3 }));
  const hit = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  const hitC = (r, c) => { const dx = Math.max(r.x - c.x, 0, c.x - r.x - r.w), dy = Math.max(r.y - c.y, 0, c.y - r.y - r.h); return dx * dx + dy * dy < c.r * c.r; };
  const lpos = {};
  [...NODES].sort((a, b) => (isMain(b) - isMain(a)) || a.d - b.d).forEach(n => {
    const q = pt(n.c, n.d), k0 = cor(par(n), q), hh = est(n.t); let best = null;
    for (const t of [.55, .45, .65, .35, .75, .25, .85, .15, .92, .6, .5, .7, .4, .8, .3, .9, .2, .1]) {
      const cx = Math.min(Math.max(k0.x + (q.x - k0.x) * t, lw / 2 + 2), W - lw / 2 - 2), cy = Math.min(Math.max(k0.y + (q.y - k0.y) * t, hh / 2 + 2), H - hh / 2 - 2);
      const r = { x: cx - lw / 2, y: cy - hh / 2, w: lw, h: hh };
      const bad = obst.filter(o => hit(r, o)).length + nodePts.filter(c => hitC(r, c)).length;
      if (!best || bad < best.bad) best = { bad, cx, cy, r };
      if (!bad) break;
    }
    obst.push(best.r); lpos[n.k] = best;
  });
  const defs = '<defs><filter id="sh-' + uid + '" filterUnits="userSpaceOnUse" x="0" y="0" width="' + W + '" height="' + H + '"><feDropShadow dx="0" dy="3" stdDeviation="2.4" flood-color="#000" flood-opacity=".38"/></filter><radialGradient id="ng-' + uid + '" cx=".35" cy=".3" r=".8"><stop offset="0" style="stop-color:#fff"/><stop offset="1" style="stop-color:var(--panel)"/></radialGradient></defs>';
  const rect = (x, y, w, hh, col, k) => `<rect data-box="${k}" filter="url(#sh-${uid})" x="${x}" y="${y}" width="${Math.max(w, 0)}" height="${Math.max(hh, 0)}" rx="12" style="fill:${col};fill-opacity:.15;stroke:${col};stroke-width:3"/>`;
  let s = defs, sl = "", dots = "";
  [...NODES].sort((a, b) => a.d - b.d).forEach(n => {
    if (!F.ins.has(n.k)) return;
    const hp = (land ? tw : th) / 2 + 3 + (maxD - n.d) * 4, a0 = n.lo - hp, len = n.hi - n.lo + 2 * hp, e = 6 + n.d * 4, col = attrColor(n.i);
    s += land ? rect(a0, e, len, ad(n.d) - e, col, n.k) : rect(ad(n.d), a0, W - e - ad(n.d), len, col, n.k);
  });
  [...NODES].sort((a, b) => isMain(a) - isMain(b)).forEach(n => {
    const ins = F.ins.has(n.k); if (!ins && !availN(n.k)) return;
    const q = pt(n.c, n.d), p = par(n), k = cor(p, q), col = attrColor(n.i), big = n.a.length > 1;
    if (ins) {
      s += `<path data-edge="${n.k}" filter="url(#sh-${uid})"${n.k === F.newK ? ' class="grow" pathLength="1"' : ""} d="M${p.x} ${p.y}L${k.x} ${k.y}L${q.x} ${q.y}" style="fill:none;stroke:${col};stroke-width:${isMain(n) ? 11 : 5};stroke-linecap:round;stroke-linejoin:round"/>`;
      const r = big ? (isMain(n) ? 14 : 11) : 7;
      dots += `<circle filter="url(#sh-${uid})"${big ? ` data-star="${n.k}"` : ""} cx="${q.x}" cy="${q.y}" r="${r}" style="fill:url(#ng-${uid});stroke:${col};stroke-width:4"/>`;
      if (big) dots += `<text x="${q.x}" y="${q.y + 1}" text-anchor="middle" dominant-baseline="central" style="font-size:${r + 2}px;fill:${col};pointer-events:none">★</text>`;
      if (n.k === F.newK) dots += `<circle class="pulse" cx="${q.x}" cy="${q.y}" r="${r}" style="fill:none;stroke:var(--sun);stroke-width:5"/>`;
    } else s += `<path d="M${p.x} ${p.y}L${k.x} ${k.y}L${q.x} ${q.y}" style="fill:none;stroke:${col};stroke-width:4;stroke-dasharray:7 9;opacity:.55;stroke-linecap:round;stroke-linejoin:round"/>`;
    const L = lpos[n.k], ch = F.lab[n.k] !== undefined;
    sl += `<div class="slot lab${ch ? " filled" : " dz"}${ins ? "" : " pend"}" data-z="${n.k}" style="left:${L.cx}px;top:${L.cy}px;width:${lw}px;height:${L.r.h}px;border-color:${col}">${ch ? NODES[F.lab[n.k]].t + (F.given.has("l" + n.k) ? " 📌" : "") : "?"}</div>`;
  });
  s += dots;
  leaves.forEach(a => {
    const n = NODES[ANC[a]]; if (!F.ins.has(ANC[a])) return;
    const { q, tc, e } = tipPos[a], f = F.tipAt[ANC[a]];
    s += `<line data-tipline="${a}" filter="url(#sh-${uid})" x1="${q.x}" y1="${q.y}" x2="${e.x}" y2="${e.y}" style="stroke:${attrColor(n.i)};stroke-width:5;stroke-linecap:round"/>`;
    sl += `<div class="slot tip${f ? " filled tipf" : " dz"}" data-z="${ANC[a]}"${f ? ` data-a="${f}"` : ""} style="left:${tc.x}px;top:${tc.y}px;width:${tw}px;height:${th}px;border-color:${attrColor(n.i)}">${f ? `<img src="${byId[f].an}" alt=""><span>${byId[f].name}${F.given.has("a" + ANC[a]) ? " 📌" : ""}</span>` : ""}</div>`;
  });
  const tr = $(ts); tr.className = "tree " + (land ? "land" : "port");
  tr.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">${s}</svg>` + sl; F.newK = null; if (typeof applyHl === "function") applyHl();
}
function renderBank() {
  const remL = F.q.filter(k => !F.used[k]), remA = F.q2.filter(a => !F.tips[a]);
  const L = remL.filter(availN).slice(0, 4), A = remA.filter(a => F.ins.has(ANC[a])).slice(0, 3);
  $("#bank").innerHTML = L.map(k => `<div class="attr dg" data-k="l" data-v="${k}">${NODES[k].t}</div>`).join("") + A.map(a => `<div class="an dg" data-k="a" data-v="${a}"><img src="${byId[a].an}" alt=""><span>${byId[a].name}</span></div>`).join("");
  $("#fstep").textContent = `Fais pousser l’arbre : glisse les étiquettes sur les branches en pointillés et les animaux au bout de leur branche (ou ${tapW()} l’élément, puis l’emplacement). Branche épaisse = branche principale ; nœud ★ = ancêtre commun du groupe qui suit. Restants : ${remL.length} attribut${pl(remL.length)}, ${remA.length} animal${remA.length > 1 ? "aux" : ""}.`;
  D.sel = null; setXp();
}
function frontDrop(k, v, z) {
  if (F.done) return;
  if (k === "l" && z.classList.contains("lab")) {
    const sn = NODES[+z.dataset.z], cn = NODES[+v];
    if (F.lab[sn.k] !== undefined) return;
    if (sn.a.length === cn.a.length && sn.a.every(a => cn.a.includes(a))) {
      F.lab[sn.k] = cn.k; F.used[cn.k] = 1; P.tree++; F.ins.add(sn.k); F.newK = sn.k;
      const all = Object.keys(F.lab).length === NODES.length;
      renderBank(); buildTree();
      const grp = sn.a.length === ALL.length ? "tous les animaux" : sn.a.length <= 4 ? sn.a.map(x => byId[x].name).join(", ") : "les " + sn.a.length + " animaux qui suivent";
      const msg = sn.a.length > 1 ? `Nouveau nœud ★ : ancêtre commun de ${grp}. Tous partagent « ${cn.t} ».` : `Bien vu ! « ${cn.t} » est une nouveauté propre à ${byId[sn.a[0]].name}.`;
      say2(msg + (all && Object.keys(F.tips).length < ALL.length ? " Tous les attributs sont en place : il reste des animaux à placer !" : ""), "win");
    } else say2(`Ce n’est pas le bon chemin : « ${cn.t} » est partagé par ${cn.a.length} animal${cn.a.length > 1 ? "aux" : ""}, mais ce trait en mène ${sn.a.length}. Regarde les animaux au-dessus de chaque trait !`, "try");
  } else if (k === "a" && z.classList.contains("tip")) {
    if (F.tipAt[+z.dataset.z]) return;
    const nm = byId[v].name;
    if (ANC[v] === +z.dataset.z) {
      F.tips[v] = 1; F.tipAt[ANC[v]] = v; P.tree++;
      renderBank(); buildTree(); say2(pick(WIN)(nm), "win");
    } else say2(`${nm} ne va pas au bout de ce chemin. Suis les traits depuis le bas et vérifie chaque attribut, tu vas y arriver !`, "try");
  }
  if (Object.keys(F.lab).length === NODES.length && Object.keys(F.tips).length === ALL.length) finishFront();
}
function finishFront() {
  F.done = true; R.s4 = true; fanfare(4); D.phase = "front"; endStep(4); endTotal(); $("#bank").innerHTML = ""; $("#bank").hidden = true; buildTree(); saveResult(4);
  const sc = n => n + " point" + pl(n);
  const r = $("#fres");
  r.innerHTML = `<div>🏆 Score final</div><div class="big">${sc(tot())}</div><div>Jeu des associations : ${sc(S.score)}</div><div>Tableau et rapprochements : ${sc(S.tbl)}</div><div>Boîtes emboîtées : ${sc(P.box)}</div><div>Arbre de parenté : ${sc(P.tree)}</div><div>⏱ Bonus de temps : ${sc(TM.bonus)} (étape 4 : ${fmt(TM.dur[4])}, total : ${fmt(TM.total)})</div><div style="margin-top:6px;font-weight:500">Bravo, l’arbre est complet ! Sur la branche principale, chaque nœud marque l’apparition d’une innovation que partagent tous les animaux situés après lui. Clique sur deux animaux pour comparer leurs attributs : plus ils en partagent, plus ils sont proches parents.</div>`;
  r.hidden = false; $("#fagain").hidden = false; $("#front h2").textContent = DOCNAME; document.title = DOCNAME; $("#fprint").hidden = false; $("#frecap").hidden = false; $("#fbilan").hidden = false; $("#fstep").textContent = `Document réalisé par ${PLAYER || "…"}, le ${new Date().toLocaleDateString("fr-FR")}. Le chemin entre deux animaux montre leur degré de parenté.`;
  say2("Classification terminée !", "win"); window.scrollTo(0, 0); r.focus({ preventScroll: true });
  requestAnimationFrame(() => buildTree());
}
let BX = null;
function addOvl(e) {
  const c = e.cloneNode(false);
  ["filter", "pathLength", "data-edge", "data-tipline", "class"].forEach(a => c.removeAttribute(a));
  c.setAttribute("class", "bxovl"); e.parentNode.appendChild(c);
}
function boxHl(k) {
  document.querySelectorAll(".bxhl,.bxhl-l,.bxhl-e,.bxhl-t").forEach(e => e.classList.remove("bxhl", "bxhl-l", "bxhl-e", "bxhl-t"));
  document.querySelectorAll(".bxovl").forEach(e => e.remove());
  document.querySelectorAll(".tree").forEach(t => t.classList.toggle("bxon", k != null && !!NODES[k]));
  BX = k; if (k == null || !NODES[k]) return;
  { const chain = []; for (let j = k; j >= 0; j = NODES[j].p) chain.unshift(NODES[j].t);
    const nm = NODES[k].a.length === ALL.length ? "tous les animaux" : NODES[k].a.map(a => byId[a].name).join(", ");
    say2(`📦 Boîte « ${NODES[k].t} » : ${nm}. Attributs partagés : ${chain.join(" → ")}.`, ""); }
  const ids = []; for (let j = k; j >= 0; j = NODES[j].p) ids.push(j);
  (function w(j) { if (j !== k) ids.push(j); NODES[j].kids.forEach(w); })(k);
  document.querySelectorAll(`[data-box="${k}"]`).forEach(e => e.classList.add("bxhl"));
  ids.forEach(j => {
    document.querySelectorAll(`.slot.lab[data-z="${j}"]`).forEach(e => e.classList.add("bxhl-l"));
    document.querySelectorAll(`[data-edge="${j}"]`).forEach(e => { e.classList.add("bxhl-e"); addOvl(e); });
  });
  NODES[k].a.forEach(a => {
    document.querySelectorAll(`.tipf[data-a="${a}"]`).forEach(e => e.classList.add("bxhl-t"));
    document.querySelectorAll(`[data-tipline="${a}"]`).forEach(e => { e.classList.add("bxhl-e"); addOvl(e); });
  });
}
function applyHl() {
  document.querySelectorAll(".hl,.hlc,.hlg,.starhl").forEach(e => e.classList.remove("hl", "hlc", "hlg", "starhl"));
  if (!F) return;
  if (BX != null) boxHl(BX);
  (F.pick || []).forEach(a => document.querySelectorAll(`.tipf[data-a="${a}"]`).forEach(e => e.classList.add("hl")));
  if (F.pick && F.pick.length === 2) NODES.filter(n => n.a.includes(F.pick[0]) && n.a.includes(F.pick[1])).forEach(n => document.querySelectorAll(`.slot.lab[data-z="${n.k}"]`).forEach(e => e.classList.add("hlc")));
  if (F.star != null && NODES[F.star]) {
    const n = NODES[F.star];
    document.querySelectorAll(`[data-star="${n.k}"]`).forEach(e => e.classList.add("starhl"));
    n.a.forEach(a => document.querySelectorAll(`.tipf[data-a="${a}"]`).forEach(e => e.classList.add("hlg")));
    document.querySelectorAll(`.slot.lab[data-z="${n.k}"]`).forEach(e => e.classList.add("hlc"));
  }
}
function compare(a) {
  F.star = null;
  if (F.pick.includes(a)) F.pick = F.pick.filter(x => x !== a);
  else if (F.pick.length >= 2) F.pick = [a];
  else F.pick.push(a);
  applyHl();
  if (F.pick.length === 2) {
    const [x, y] = F.pick, c = NODES.filter(n => n.a.includes(x) && n.a.includes(y));
    say2(`${byId[x].name} et ${byId[y].name} partagent ${c.length} attribut${pl(c.length)} : ${c.map(n => n.t).join(" ; ")}.`, "win");
  } else if (F.pick.length === 1) say2(`${byId[F.pick[0]].name} est en surbrillance : choisis un second animal pour comparer leurs attributs communs.`, "");
  else say2("", "");
}
function starClick(k) {
  F.pick = []; F.star = F.star === k ? null : k; applyHl();
  const n = NODES[k];
  if (F.star != null) say2(`★ Ancêtre commun placé au nœud « ${n.t} » : il regroupe ${n.a.length === ALL.length ? "tous les animaux" : n.a.map(a => byId[a].name).join(", ")}.`, "win"); else say2("", "");
}

// ---------- chronomètres et bonus de temps ----------
const BON = { 1: [10, 180], 2: [10, 300], 3: [10, 300], 4: [10, 300], t: [20, 1200] };
const bonus = (k, s) => { const [m, L0] = BON[k], L = L0 * Math.max(.5, ALL.length / 10); return Math.round(m * Math.max(0, Math.min(1, (L - s) / (L * .75)))); };
const fmt = s => { s = Math.round(s); return String(s / 60 | 0).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); };
const TM = { t0: null, n: 1, total: 0, dur: {}, b: { 1: 0, 2: 0, 3: 0, 4: 0 }, tb: 0, get bonus() { return this.b[1] + this.b[2] + this.b[3] + this.b[4] + this.tb; } };
function pauseTm() { if (TM.t0) { TM.pa = Date.now() - TM.t0; TM.t0 = null; } }
function resumeTm() { if (TM.pa != null) { TM.t0 = Date.now() - TM.pa; TM.pa = null; } }
function startStep(n) { TM.pa = null; if (n === 1) { TM.total = 0; TM.dur = {}; TM.b = { 1: 0, 2: 0, 3: 0, 4: 0 }; TM.tb = 0; } TM.n = n; TM.t0 = Date.now(); tickTm(); }
function endStep(n) { if (!TM.t0) return TM.b[n] || 0; const d = (Date.now() - TM.t0) / 1000; TM.t0 = null; TM.dur[n] = d; TM.total += d; TM.b[n] = bonus(n, d); tickTm(); return TM.b[n]; }
function endTotal() { TM.tb = bonus("t", TM.total); }
const tmInfo = n => ` ⏱ ${fmt(TM.dur[n] || 0)} : bonus de temps +${TM.b[n]}.`;
function tickTm() { const pz = TM.pa != null, live = TM.t0 ? (Date.now() - TM.t0) / 1000 : pz ? TM.pa / 1000 : 0; $("#tmStep").textContent = fmt(TM.t0 || pz ? live : TM.dur[TM.n] || 0); $("#tmTot").textContent = fmt(TM.total + live); }
setInterval(tickTm, 500);

// ---------- écrans, niveaux, adaptation à l’écran ----------
let CUR = null, R = {};
const REV = { tab: 1, mode: "ok", from: null };
const LV = { pick: 0, hub: 0, review: 4, recap: 4, home: 0, admin: 0, game: 1, end: 1, tbl: 2, box: 3, front: 4 };
const setXp = () => { $("#xp").textContent = S ? tot() : 0; };
function show(id) {
  zhide(); CUR = id; { const mg = $("#msg"); mg.textContent = ""; mg.className = "msg"; } $("#rev").hidden = !PLAYER || !R.s1 || id === "home" || id === "admin" || id === "review"; $("#hubbtn").hidden = !PLAYER || id === "home" || id === "admin" || id === "hub" || id === "pick";
  document.querySelectorAll(".screen").forEach(s => s.hidden = s.id !== id);
  const l = (id === "review" ? LV[REV.from] : LV[id]) || 0; document.querySelector(".app").dataset.lv = l;
  document.querySelectorAll(".lv li").forEach((li, i) => { li.classList.toggle("on", i + 1 === l); li.classList.toggle("past", i + 1 < l); });
  $("#tm").hidden = !LV[id]; setXp();
}
function fitTop() { fitBox($("#top"), $("#topin")); }
function fitBox(c, i) {
  if (!c.clientWidth) return;
  for (let s = 1; s >= .4; s -= .05) { i.style.width = (c.clientWidth - 12) / s + "px"; i.style.transform = `scale(${s})`; if (i.scrollHeight * s <= c.clientHeight - 8) break; }
}
window.addEventListener("resize", () => { applyDevice(); if (CUR === "review") renderReview(); else if (D.phase === "box") fitTop(); else if (D.phase === "front") buildTree(); });

// ---------- Joueur, codes d’étapes, mode paramétrage ----------
const recapName = () => `Tableau des attributs communs d’une collection de ${ALL.length} animaux`;
const APPTITLE = document.title, DOCNAME = "Schéma d’un arbre de parenté de la collection d’animaux";
let PLAYER = null, DB = null, UID = null, CFG = { admin: null, codes: [null, null, null, null] };
const UNLOCK = new Set();
const hsh = async s => { try { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("bq|" + String(s).trim().toLowerCase())); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join(""); } catch (e) { return "p:" + String(s).trim().toLowerCase(); } };
const DEFAULT_CFG = {"admin": "b7dfb718dca254912b66d43c0e3926afbced22e0df5a1c3613870bf75f344e62", "codes": ["44de175f55442a792f412440839b052647bf1a3d937d5468fab41bf4efd944f9", "1e514d3b72a0db9c649a07eedc5c5c486ffcc8bfe1652dbe66e55ca36f3ce7f5", "da695dbb4275a7ebfb9e3710eb52e5983749d72bc4f7ffd2a7a96bd0b2939c93", "a7e6c67a5a4e277e2f5fa5e6def4471503e5dc3b1e1633a88da0e681d4fc4d5e"]};
async function loadCfg() {
  try { DB = window.claude && claude.use ? await claude.use("db") : null; } catch (e) { DB = null; }
  try { const u = window.claude && claude.use ? await claude.use("user") : null; UID = u ? await u.id() : null; } catch (e) { UID = null; }
  let c = null;
  try { if (DB) { const d = await DB.doc("config/main").get(); if (d.exists) c = d.data(); } } catch (e) {}
  if (!c) { try { c = JSON.parse(localStorage.getItem("bq-cfg")); } catch (e) {} }
  if (!c) c = DEFAULT_CFG;
  if (c) CFG = { admin: c.admin || null, codes: [0, 1, 2, 3].map(i => (c.codes || [])[i] || null) };
}
async function saveCfg() {
  let shared = false;
  try { if (DB) { await DB.doc("config/main").set({ admin: CFG.admin || "", codes: CFG.codes.map(c => c || "") }); shared = true; } } catch (e) {}
  try { localStorage.setItem("bq-cfg", JSON.stringify(CFG)); } catch (e) {}
  return shared;
}
async function saveResult(level) {
  if (!DB || !PLAYER || !UID) return;
  try {
    const ref = DB.doc("results/" + UID), d = await ref.get(), ps = d.exists ? (d.data().players || []) : [];
    let p = ps.find(x => x.name === PLAYER); if (!p) { p = { name: PLAYER }; ps.push(p); }
    p["l" + level] = tot(); p.n = ALL.length; p.at = Date.now();
    await ref.set({ players: ps });
  } catch (e) {}
}
function askCode({ title, help, secret = true, info = false, validate }) {
  return new Promise(res => {
    const g = $("#gate"), i = $("#gi"), m = $("#gm");
    $("#gt").textContent = title; $("#gh").textContent = help || ""; i.type = secret ? "password" : "text"; i.value = ""; m.textContent = "";
    i.hidden = info; $("#gno").hidden = info; $("#gok").textContent = info ? "OK" : "Valider"; g.hidden = false;
    setTimeout(() => (info ? $("#gok") : i).focus(), 50);
    const done = v => { g.hidden = true; $("#gok").onclick = $("#gno").onclick = i.onkeydown = null; res(v); };
    const ok = async () => {
      if (info) return done(null);
      const v = i.value.trim(); if (!v) return;
      if (validate) { const r = await validate(v); if (r !== true) { m.textContent = r; i.select(); return; } }
      done(v);
    };
    $("#gok").onclick = ok; $("#gno").onclick = () => done(null);
    i.onkeydown = e => { if (e.key === "Enter") ok(); else if (e.key === "Escape") done(null); };
  });
}
async function enter(n, fn) {
  if (!UNLOCK.has(n)) {
    await loadCfg();
    const h = CFG.codes[n - 1];
    if (!h) { await askCode({ info: true, title: "Étape " + n + " fermée 🔒", help: "Cette étape n’est pas encore ouverte. Demande à ton enseignant de l’ouvrir." }); return; }
    const c = await askCode({ title: "Étape " + n + " : entre le code", help: "Ton enseignant te donne le code de l’étape.", validate: async v => (await hsh(v)) === h ? true : "Code incorrect, réessaie !" });
    if (!c) return; UNLOCK.add(n);
  }
  fn();
}
function goHome() { document.title = APPTITLE; TM.t0 = null; TM.pa = null; R = {}; PLAYER = null; S = null; F = null; D.phase = null; UNLOCK.clear(); $("#who").hidden = true; $("#pn").value = ""; $("#hmsg").textContent = ""; show("home"); }
async function startPlayer() {
  const n = $("#pn").value.trim();
  if (!n) { $("#hmsg").textContent = "Écris ton prénom ou ton pseudo pour commencer !"; $("#pn").focus(); return; }
  PLAYER = n.slice(0, 24); $("#pname").textContent = PLAYER; $("#who").hidden = false; UNLOCK.clear();
  R = {}; S = null; resetTm(); goPick();
}
$("#go").addEventListener("click", startPlayer);
$("#pn").addEventListener("keydown", e => { if (e.key === "Enter") startPlayer(); });
$("#quit").addEventListener("click", goHome);
$("#fprint").addEventListener("click", () => { try { window.print(); } catch (e) {} });
$("#rprint").addEventListener("click", () => { try { window.print(); } catch (e) {} });
$("#rback").addEventListener("click", () => { show("front"); document.title = DOCNAME; buildTree(); });
$("#frecap").addEventListener("click", showRecap);
function recapHTML() {
  const cols = T.order;
  let t = "<tbody>";
  ATTRS.map((r, ri) => [r, ri]).reverse().forEach(([r, ri], k) => { t += `<tr class="has" style="--c:${attrColor(ri)};--ri:${k}"><th scope="row" class="rowh">${r.t}</th>` + cols.map(id => r.a.includes(id) ? '<td class="chk"><span class="tk" aria-label="oui">✓</span></td>' : "<td></td>").join("") + "</tr>"; });
  const head = '<tr><th class="rowh" scope="col"></th>' + cols.map(id => `<th scope="col" class="colh" style="cursor:default"><div class="imgs"><img src="${byId[id].an}" alt=""></div><div class="nm">${byId[id].name}</div></th>`).join("") + "</tr>";
  return t + "</tbody><tfoot>" + head + "</tfoot>";
}
function showRecap() {
  $("#grid2").innerHTML = recapHTML();
  const rn = recapName(); $("#rtitle").textContent = rn; document.title = rn;
  $("#rsub").textContent = `Document réalisé par ${PLAYER || "…"}, le ${new Date().toLocaleDateString("fr-FR")}.`;
  show("recap"); fitTable("#recap .tablewrap", "#grid2");
}
// ---------- revoir les étapes / bilan ----------
function openReview(tab) {
  if (CUR !== "review") { REV.from = CUR; pauseTm(); }
  if (tab) REV.tab = tab;
  show("review"); renderReview();
}
function closeReview() {
  const f = REV.from || "game"; show(f); resumeTm(); if (f === "hub") renderHub();
  if (f === "front") buildTree(); else if (f === "box") fitTop();
}
function renderReview() {
  const fin = !!R.s4, done = fin ? { 1: 1, 2: 1, 3: 1, 4: 1 } : { 1: R.s1, 2: R.s2, 3: R.s3, 4: R.s4 }, names = ["Associe", "Décode", "Empile", "Relie"];
  if (!done[REV.tab]) REV.tab = [1, 2, 3, 4].find(n => done[n]) || 1;
  const tab = REV.tab, b = $("#vbody"), inf = $("#vinfo");
  const order = S && S.found && S.found.length === ALL.length ? S.found : (T && T.order) || ALL;
  $("#vtitle").textContent = fin ? "📖 Bilan : la correction, étape par étape" : "📖 Revoir les étapes terminées";
  $("#vtabs").innerHTML = [1, 2, 3, 4].map(n => `<button class="btn s${REV.tab === n ? "" : " alt"}" data-t="${n}"${done[n] ? "" : " disabled"}>${done[n] ? "" : "🔒 "}Étape ${n} · ${names[n - 1]}</button>`).join("");
  $("#vmode").hidden = tab !== 2;
  document.querySelectorAll("#vmode .btn").forEach(x => x.classList.toggle("alt", x.dataset.m !== REV.mode));
  if (tab === 1) {
    inf.textContent = `Les ${ALL.length} associations correctes entre chaque animal et sa fiche.`;
    b.innerHTML = '<div class="pairs">' + order.map(id => `<div class="pair"><div class="imgs"><img src="${byId[id].an}" alt="${byId[id].name}"><img src="${byId[id].at}" alt="Fiche de ${byId[id].name}"></div><div class="n">${byId[id].name}</div></div>`).join("") + "</div>";
  } else if (tab === 2) {
    b.innerHTML = '<div class="tablewrap"><table id="rgrid" class="val pal"></table></div>';
    if (REV.mode === "mine" && R.s2) { $("#rgrid").innerHTML = R.s2.grid; inf.textContent = "Ton tableau validé : " + R.s2.res; }
    else { $("#rgrid").innerHTML = recapHTML(); inf.textContent = "Correction : toutes les caractéristiques de chaque animal."; }
    fitTable("#vbody .tablewrap", "#rgrid");
  } else if (tab === 3) {
    inf.textContent = "Les boîtes emboîtées, vues de dessus, toutes remplies." + (R.s3 ? tmInfo(3) : "");
    b.innerHTML = '<div class="topview" id="vtop"><div id="vtopin"></div></div>';
    const keep = B; if (!R.s3) B = { over: true, step: NODES.length, loc: Object.fromEntries(ALL.map(a => [a, ANC[a]])) };
    $("#vtopin").innerHTML = boxH(0).replace(/ dg"/g, '"'); B = keep; fitBox($("#vtop"), $("#vtopin"));
  } else {
    inf.textContent = "L’arbre de parenté complet. Clique sur deux animaux pour comparer leurs attributs communs.";
    b.innerHTML = '<div class="treewrap" id="vtw"><div class="tree" id="vtree"></div></div><div class="tlegend">★ Étoile = ancêtre commun du groupe qui suit, placé au nœud (clique sur l’étoile pour le mettre en surbrillance) · Clique sur deux animaux pour les comparer</div>';
    buildTree("#vtw", "#vtree");
  }
}
$("#vtabs").addEventListener("click", e => { const t = e.target.closest("[data-t]"); if (t && !t.disabled) { REV.tab = +t.dataset.t; renderReview(); } });
$("#vmode").addEventListener("click", e => { const m = e.target.closest("[data-m]"); if (m) { REV.mode = m.dataset.m; renderReview(); } });
$("#vback").addEventListener("click", closeReview);
function bankTm() { if (TM.t0) { TM.total += (Date.now() - TM.t0) / 1000; TM.t0 = null; } if (TM.pa != null) { TM.total += TM.pa / 1000; TM.pa = null; } }
function resetTm() { TM.t0 = null; TM.pa = null; TM.total = 0; TM.dur = {}; TM.b = { 1: 0, 2: 0, 3: 0, 4: 0 }; TM.tb = 0; }
const HUB = [["Associe", "Associe chaque fiche à son animal.", "var(--vio)", "#fff"], ["Décode", "Complète le tableau des caractéristiques.", "var(--cyan)", "#1B1340"], ["Empile", "Range les animaux dans des boîtes emboîtées.", "var(--pink)", "#1B1340"], ["Relie", "Construis l’arbre de parenté.", "var(--lime)", "#1B1340"]];
let SEL = new Set();
function goPick() { bankTm(); D.phase = null; show("pick"); renderPick(); }
function renderPick() {
  $("#pickgrid").innerHTML = PAIRS10.map(a => `<button class="card pk${SEL.has(a.id) ? " on" : ""}" data-id="${a.id}" aria-pressed="${SEL.has(a.id)}"><img src="${a.an}" alt=""><span>${a.name}</span></button>`).join("");
  const n = SEL.size, s = n > 1 ? "s" : "", len = n <= 6 ? "partie rapide" : n <= 8 ? "partie moyenne" : "partie longue";
  const lonely = [...SEL].filter(id => ![...SEL].some(o => o !== id && ATTRS_ALL.some((r, i) => i > 0 && r.a.includes(id) && r.a.includes(o))));
  $("#pickcnt").textContent = (n < 5 ? `${n} animal${s} choisi${s} : il en faut au moins 5.` : `${n} animaux choisis · ${len}, environ ${n * 2} min.`) + (n >= 5 && lonely.length ? ` ⚠️ Sans proche parent dans ta sélection : ${lonely.map(i => byId[i].name).join(", ")} (il ne pourra pas être rapproché d’un autre animal).` : "");
  $("#pickgo").disabled = n < 5;
}
$("#pickgrid").addEventListener("click", e => { const c = e.target.closest(".pk"); if (!c) return; SEL.has(c.dataset.id) ? SEL.delete(c.dataset.id) : SEL.add(c.dataset.id); renderPick(); });
$("#pickpre").addEventListener("click", e => { const b = e.target.closest("[data-n]"); if (b) { SEL = new Set(shuffle(ALL10).slice(0, +b.dataset.n)); renderPick(); } });
function applyCollection() { const r = document.documentElement.style, N = ALL.length; r.setProperty("--gc", Math.min(5, N)); r.setProperty("--gr", N > 5 ? 2 : 1); r.setProperty("--pr", Math.ceil(N / 2)); }
$("#pickgo").addEventListener("click", () => {
  if (SEL.size < 5) return;
  buildModel([...SEL]); applyCollection();
  R = {}; S = null; T = null; B = null; F = null; P = { box: 0, tree: 0 }; resetTm(); goHub();
});
$("#hubchg").addEventListener("click", goPick);
async function goHub() { bankTm(); D.phase = null; show("hub"); renderHub(); await loadCfg(); if (CUR === "hub") renderHub(); }
function renderHub() {
  $("#hubt").textContent = `Salut ${PLAYER || ""} ! Choisis ton étape (${ALL.length} animaux)`;
  $("#hubgrid").innerHTML = HUB.map((c, i) => {
    const n = i + 1, done = R["s" + n], open = UNLOCK.has(n), closed = !open && !CFG.codes[i];
    const st = done ? "✅ Terminée" : open ? "🔓 Code validé" : closed ? "🔒 Fermée par l’enseignant" : "🔐 Code demandé";
    return `<div class="hcard" style="--hc:${c[2]};--hon:${c[3]}"><b class="num">${n}</b><h3>${c[0]}</h3><p>${c[1]}</p><span class="pill">${st}</span><div class="actions"><button class="btn s" data-go="${n}">${done ? "Revoir" : "Y aller"}</button>${done ? `<button class="btn alt s" data-redo="${n}">↻ Refaire</button>` : ""}</div></div>`;
  }).join("");
}
$("#hubgrid").addEventListener("click", e => {
  const g = e.target.closest("[data-go]"), r = e.target.closest("[data-redo]");
  if (g) { const n = +g.dataset.go; if (R["s" + n]) openReview(n); else enter(n, () => launch(n)); }
  else if (r) launch(+r.dataset.redo);
});
$("#hubbtn").addEventListener("click", goHub);
function pipGo(n) {
  if (!PLAYER || CUR === "home" || CUR === "admin") return;
  const done = R["s" + n];
  if (CUR === "review") {
    if (done) { REV.tab = n; renderReview(); return; }
    if (LV[REV.from] === n) { closeReview(); return; }
  } else if (LV[CUR] === n) return;
  if (done) { openReview(n); return; }
  enter(n, () => launch(n));
}
function launch(n) {
  bankTm(); D.phase = null; zhide();
  if (!S) S = { left: shuffle(PAIRS.map(a => a.id)), queue: shuffle(PAIRS.map(a => a.id)), found: [], score: 0, err: {}, selL: null, busy: false, flash: null, fresh: true };
  if (n === 1) {
    const sv = { tbl: S && S.tbl, total: TM.total, dur: { ...TM.dur }, b: { ...TM.b }, tb: TM.tb };
    initGame(); S.tbl = sv.tbl || 0; delete sv.dur[1];
    Object.assign(TM, { total: sv.total, dur: sv.dur, b: { ...sv.b, 1: 0 }, tb: sv.tb }); return;
  }
  const f = S.found || [];
  if (f.length < ALL.length) S.found = [...f, ...shuffle(ALL.filter(a => !f.includes(a)))];
  S.tbl = S.tbl || 0;
  if (n >= 3 && (!T || !T.order)) T = { order: [...S.found], done: false };
  ({ 2: openTable, 3: startBox, 4: startFront })[n]();
}
document.querySelectorAll(".lv li").forEach((li, i) => {
  li.setAttribute("role", "button"); li.tabIndex = 0; li.title = "Étape " + (i + 1) + " : revoir si terminée, sinon y aller (code demandé)";
  li.addEventListener("click", () => pipGo(i + 1));
  li.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pipGo(i + 1); } });
});
$("#rev").addEventListener("click", () => { REV.mode = "mine"; openReview(R.s4 ? 1 : (R.s3 ? 3 : R.s2 ? 2 : 1)); });
$("#fbilan").addEventListener("click", () => { REV.mode = "ok"; openReview(1); });
$("#adm").addEventListener("click", async () => {
  await loadCfg();
  if (!CFG.admin) {
    const c = await askCode({ title: "Crée le code administrateur", help: "Ce code protège le mode paramétrage. Note-le bien (4 caractères ou plus).", secret: false, validate: v => v.length < 4 ? "Au moins 4 caractères." : true });
    if (!c) return; CFG.admin = await hsh(c); await saveCfg();
  } else {
    const c = await askCode({ title: "Mode paramétrage", help: "Entre le code administrateur.", validate: async v => (await hsh(v)) === CFG.admin ? true : "Code incorrect." });
    if (!c) return;
  }
  showAdmin();
});
$("#aquit").addEventListener("click", goHome);
const STEPS = ["Associe", "Décode", "Empile", "Relie"];
function astat(t) { $("#astat").textContent = t; }
function renderAdmin() {
  $("#acodes").innerHTML = STEPS.map((s, i) => `<div class="arow"><b>Étape ${i + 1} · ${s}</b><span class="pill ${CFG.codes[i] ? "on" : "off"}">${CFG.codes[i] ? "ouverte" : "fermée"}</span><input class="in s" id="ac${i + 1}" type="text" placeholder="Code" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Code de l’étape ${i + 1}"><button class="btn s" data-set="${i + 1}">Définir</button><button class="btn alt s" data-close="${i + 1}">Fermer</button></div>`).join("");
}
async function adminSave(msg) {
  const shared = await saveCfg(); renderAdmin();
  astat((shared ? "✅ " : "⚠️ Enregistré sur cet appareil seulement. ") + msg);
}
$("#acodes").addEventListener("click", async e => {
  const bs = e.target.closest("[data-set]"), bc = e.target.closest("[data-close]");
  if (bs) { const i = +bs.dataset.set, v = $("#ac" + i).value.trim(); if (v.length < 3) { astat("Le code d’une étape doit avoir au moins 3 caractères."); return; } CFG.codes[i - 1] = await hsh(v); await adminSave("Étape " + i + " ouverte avec le nouveau code."); }
  else if (bc) { CFG.codes[+bc.dataset.close - 1] = null; await adminSave("Étape " + bc.dataset.close + " fermée."); }
});
$("#aadmok").addEventListener("click", async () => {
  const v = $("#aadm").value.trim(); if (v.length < 4) { astat("Le code administrateur doit avoir au moins 4 caractères."); return; }
  CFG.admin = await hsh(v); $("#aadm").value = ""; await adminSave("Code administrateur modifié.");
});
async function showAdmin() {
  show("admin"); renderAdmin(); astat(DB ? "Les codes sont partagés avec tous les joueurs." : "Partage indisponible : les réglages restent sur cet appareil.");
  const box = $("#ares"); box.textContent = "Chargement…";
  try {
    if (!DB) throw 0;
    const q = await DB.collection("results").get();
    const rows = q.docs.flatMap(d => d.data().players || []).sort((a, b) => b.at - a.at).slice(0, 60);
    box.innerHTML = rows.length ? `<table><thead><tr><th>Joueur</th><th>Nb</th><th>É1</th><th>É2</th><th>É3</th><th>É4</th><th>Dernière partie</th></tr></thead><tbody>${rows.map(r => `<tr><td>${String(r.name).replace(/[<>&]/g, "")}</td><td>${r.n ?? "–"}</td><td>${r.l1 ?? "–"}</td><td>${r.l2 ?? "–"}</td><td>${r.l3 ?? "–"}</td><td>${r.l4 ?? "–"}</td><td>${new Date(r.at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</td></tr>`).join("")}</tbody></table>` : "Aucun résultat pour l’instant.";
  } catch (e) { box.textContent = "Résultats indisponibles."; }
}

// ---------- détection de l’écran (PC, Mac, iPad, Android) ----------
const DEVNAME = { ipad: "iPad", iphone: "iPhone", android: "Android", mac: "Mac", pc: "PC" };
const DEV = (() => {
  const ua = navigator.userAgent || "", pf = navigator.platform || "", tp = navigator.maxTouchPoints || 0;
  if (/iPad/.test(ua) || (pf === "MacIntel" && tp > 1)) return "ipad";
  if (/iPhone|iPod/.test(ua)) return "iphone";
  if (/Android/.test(ua)) return "android";
  if (/Mac/.test(pf + ua)) return "mac";
  return "pc";
})();
const isTouch = () => document.documentElement.dataset.input === "touch";
const tapW = () => isTouch() ? "touche" : "clique sur";
function tableHint() {
  const el = $("#tinfo"); if (!el || (T && T.done)) return;
  if (T && T.solo) { el.textContent = `Animal ${T.cur + 1} sur ${T.order.length} : coche les caractéristiques de ${byId[T.order[T.cur]].name}, en t’aidant de sa fiche. Tu pourras tout revoir, déplacer les colonnes et valider à la fin.`; return; }
  el.textContent = "Coche les caractéristiques de chaque animal (+1 par case juste). Glisse l’image d’un animal pour déplacer sa colonne et rapprocher les animaux qui se ressemblent (+1 par animal bien placé). " + (isTouch() ? "Touche l’image d’un animal (en bas du tableau) : sa fiche s’affiche en bas à gauche, touche la fiche pour l’agrandir." : "Survole ou clique l’image d’un animal (en bas du tableau) pour voir sa fiche en bas à gauche, clique la fiche pour l’agrandir.") + (isTouch() ? " Appui long sur une ligne : elle est surlignée." : " Survole une ligne : elle est surlignée.");
}
function applyDevice() {
  const r = document.documentElement, w = innerWidth, hg = innerHeight;
  const k = Math.min(1.2, Math.max(.85, Math.min(w / 1100, hg / 720)));
  r.style.setProperty("--rem", (16 * k).toFixed(2) + "px");
  r.dataset.device = DEV; r.dataset.size = w < 700 ? "s" : w < 1100 ? "m" : "l"; r.dataset.orient = w >= hg ? "land" : "port";
  if (!r.dataset.input) r.dataset.input = matchMedia("(pointer: coarse)").matches ? "touch" : "mouse";
  const d = $("#devhint");
  if (d) d.textContent = `Écran détecté : ${DEVNAME[DEV]} · ${isTouch() ? "tactile" : "souris"} · ${w >= hg ? "paysage" : "portrait"}` + (w < 700 ? ". Pour plus de confort, utilise une tablette ou un ordinateur." : ".");
  tableHint();
}
addEventListener("orientationchange", () => setTimeout(applyDevice, 150));
addEventListener("pointerdown", e => { const t = e.pointerType === "touch" ? "touch" : "mouse"; if (document.documentElement.dataset.input !== t) { document.documentElement.dataset.input = t; applyDevice(); } }, true);
applyDevice();

// ---------- couleurs ligne par ligne et clignotement d’une ligne ----------
$("#colorbtn").addEventListener("click", () => {
  const g = $("#grid"); g.classList.toggle("pal"); const on = g.classList.contains("pal");
  $("#colorbtn").textContent = on ? "🎨 Retirer les couleurs" : "🎨 Colorier cases cochées et attributs";
});
$("#grid").addEventListener("change", e => {
  const td = e.target.closest("td"); if (!td) return; const tr = td.closest("tr");
  td.classList.toggle("on", e.target.checked); tr.classList.toggle("has", !!tr.querySelector("input:checked"));
});
let LP = null, lpDone = false;
const rowOf = e => e.target.closest && e.target.closest("tbody tr");
["#grid", "#grid2", "#vbody"].forEach(sel => {
  const el = $(sel);
  el.addEventListener("pointerover", e => { if (e.pointerType === "touch") return; const tr = rowOf(e); if (tr) tr.classList.add("blink"); });
  el.addEventListener("pointerout", e => { const tr = rowOf(e); if (tr && !tr.contains(e.relatedTarget)) tr.classList.remove("blink"); });
  el.addEventListener("pointerdown", e => {
    if (e.pointerType !== "touch") return; const tr = rowOf(e); if (!tr) return;
    clearTimeout(LP); lpDone = false; tr._p = { x: e.clientX, y: e.clientY };
    LP = setTimeout(() => { lpDone = true; tr.classList.add("blink"); setTimeout(() => tr.classList.remove("blink"), 2800); try { navigator.vibrate && navigator.vibrate(20); } catch (_) {} }, 500);
  });
  el.addEventListener("pointermove", e => { if (LP && e.pointerType === "touch") { const tr = rowOf(e); if (!tr || !tr._p || Math.hypot(e.clientX - tr._p.x, e.clientY - tr._p.y) > 10) { clearTimeout(LP); LP = null; } } });
  ["pointerup", "pointercancel"].forEach(ev => el.addEventListener(ev, () => { clearTimeout(LP); LP = null; }));
  el.addEventListener("click", e => { if (lpDone) { e.preventDefault(); e.stopPropagation(); lpDone = false; } }, true);
});

// ---------- étape 2 : un animal à la fois ----------
function applySolo() {
  if (!T) return;
  const id = T.order[T.cur], last = T.cur === T.order.length - 1;
  $("#grid").classList.toggle("solo", !!T.solo);
  document.querySelectorAll("#grid [data-c]").forEach(c => c.classList.toggle("hid", !!T.solo && c.dataset.c !== id));
  $("#solo").hidden = !T.solo; $("#mvhint").hidden = !!T.solo || !!T.done;
  if (T.solo) $("#soloDots").textContent = T.order.map((_, i) => i < T.cur ? "●" : i === T.cur ? "◉" : "○").join(" ");
  $("#validate").hidden = !!T.solo; $("#nextanimal").hidden = !T.solo; $("#prevanimal").hidden = !T.solo || T.cur === 0;
  $("#nextanimal").textContent = last ? "Voir le tableau complet ▶" : "Animal suivant ▶";
  if (T.solo) { const a = byId[id]; $("#soloN").textContent = `Animal ${T.cur + 1} / ${T.order.length}`; $("#soloAt").src = a.at; $("#soloAt").alt = "Fiche de " + a.name; $("#soloAn").src = a.an; $("#soloName").textContent = a.name; }
  tableHint(); fitTable("#tbl .tablewrap", "#grid");
}
$("#nextanimal").addEventListener("click", () => {
  const id = T.order[T.cur];
  if (!document.querySelector(`#grid td[data-c="${id}"] input:checked`)) { say("Coche au moins une caractéristique pour cet animal.", "try"); return; }
  say("", "");
  if (T.cur < T.order.length - 1) T.cur++; else T.solo = false;
  applySolo();
  if (!T.solo) {
    say("Voici le tableau complet. Tu peux encore déplacer les colonnes : fais glisser l’image d’un animal pour rapprocher ceux d’un même groupe, puis valide.", "");
    const hs = document.querySelectorAll("#grid th.colh"); hs.forEach(t => t.classList.add("nudge")); setTimeout(() => hs.forEach(t => t.classList.remove("nudge")), 3400);
  }
});
$("#prevanimal").addEventListener("click", () => { if (T.cur > 0) { T.cur--; applySolo(); } });
$("#soloAt").addEventListener("click", () => zshow(T.order[T.cur]));
$("#soloAn").addEventListener("click", () => zshow(T.order[T.cur]));

// ---------- icônes animées d’animaux de la collection ----------
const EMO = { abeille: "🐝", epeire: "🕷️", epervier: "🦅", escargot: "🐌", lezard: "🦎", lithobie: "🐛", lombric: "🪱", pelodyte: "🐸", renard: "🦊", truite: "🐟" };
(function () {
  const mas = document.querySelectorAll(".mascot");
  const setM = i => mas.forEach(m => { m.textContent = EMO[ALL10[(i + (+m.dataset.o || 0)) % ALL10.length]]; m.classList.remove("hop"); void m.offsetWidth; m.classList.add("hop"); });
  let mi = 0; setM(0); setInterval(() => setM(++mi), 2600);
  const EAT = { truite: ["lombric"], epeire: ["abeille"], renard: ["lezard"], epervier: ["truite"], escargot: ["salade"], lombric: ["feuilles"] };
  const FOOD = { salade: "🥬", feuilles: "🍃" }, SLOW = { escargot: 30, lombric: 38 };
  const layers = [];
  const addLayer = (sel, ids, op) => {
    const lay = document.createElement("div"); lay.className = "critters"; lay.setAttribute("aria-hidden", "true"); if (op) lay.style.opacity = op;
    const items = ids.map(id => {
      const d = document.createElement("div"); d.className = "cr"; d.innerHTML = `<span style="--b:${(.5 + Math.random() * .5).toFixed(2)}s">${EMO[id] || FOOD[id]}</span>`; lay.appendChild(d);
      const a = Math.random() * 6.283, v = 25 + Math.random() * 45;
      return { id, d, food: !!FOOD[id], x: Math.random() * 600, y: Math.random() * 300, vx: Math.cos(a) * v, vy: Math.sin(a) * v, tx: 0, ty: 0, t: 0, gone: false, back: 0, cool: 0, buzz: 2 + Math.random() * 3 };
    });
    $(sel).prepend(lay); layers.push({ lay, items });
  };
  const bubble = (c, txt) => { const b = document.createElement("i"); b.className = "bub"; b.textContent = txt; c.d.appendChild(b); setTimeout(() => b.remove(), 1600); };
  const buzzSound = () => {
    if (!SND.on || !SND.ctx || SND.ctx.state !== "running") return;
    const c = SND.ctx, t = c.currentTime, o = c.createOscillator(), l = c.createOscillator(), lg = c.createGain(), g = c.createGain();
    o.type = "sawtooth"; o.frequency.value = 210; l.frequency.value = 38; lg.gain.value = 40; l.connect(lg); lg.connect(o.frequency);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.05, t + .05); g.gain.exponentialRampToValueAtTime(.0001, t + .55);
    o.connect(g); g.connect(SND.master); o.start(t); l.start(t); o.stop(t + .6); l.stop(t + .6);
  };
  addLayer("#home", [...ALL10, "salade", "feuilles"]);
  addLayer("#hub", ["abeille", "epeire", "renard", "lezard"], .45);
  addLayer("#pick", ["escargot", "salade", "truite", "epervier", "lombric", "feuilles"], .45);
  let last = performance.now();
  (function loop(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    layers.forEach(({ lay, items }) => {
      if (!lay.offsetParent) return;
      const W = lay.clientWidth - 44, H = lay.clientHeight - 44;
      items.forEach(c => {
        if (c.gone) { c.back -= dt; if (c.back <= 0) { c.gone = false; c.x = Math.random() * W; c.y = Math.random() * H; c.d.classList.remove("gone"); } return; }
        if (c.food) { c.d.style.transform = `translate(${Math.min(c.x, W).toFixed(1)}px,${Math.min(c.y, H).toFixed(1)}px)`; return; }
        c.cool -= dt; c.t -= dt;
        const live = items.filter(o => !o.gone && o !== c), near = (list) => list.map(o => ({ o, d: Math.hypot(o.x - c.x, o.y - c.y) })).sort((p, q) => p.d - q.d)[0];
        const pred = near(live.filter(o => (EAT[o.id] || []).includes(c.id))), prey = near(live.filter(o => (EAT[c.id] || []).includes(o.id)));
        let mode = "wander", sp = 0, ax = 0, ay = 0;
        if (pred && pred.d < 150) { const L = pred.d || 1; mode = "flee"; sp = SLOW[c.id] ? 55 : 88; ax = (c.x - pred.o.x) / L; ay = (c.y - pred.o.y) / L; }
        else if (prey) {
          const L = prey.d || 1; mode = "chase"; sp = c.cool > 0 ? 0 : (SLOW[c.id] || 66); ax = (prey.o.x - c.x) / L; ay = (prey.o.y - c.y) / L;
          if (prey.d < 28 && c.cool <= 0) { prey.o.gone = true; prey.o.back = 4 + Math.random() * 3; prey.o.d.classList.add("gone"); c.cool = 1.2; bubble(c, "miam !"); }
        }
        if (mode === "wander") { if (c.t <= 0) { const a = Math.random() * 6.283, v = 20 + Math.random() * 55; c.tx = Math.cos(a) * v; c.ty = Math.sin(a) * v; c.t = 1 + Math.random() * 3; } }
        else { c.tx = ax * sp; c.ty = ay * sp; c.t = .3; }
        const k = Math.min(1, dt * 2); c.vx += (c.tx - c.vx) * k; c.vy += (c.ty - c.vy) * k;
        c.x += c.vx * dt; c.y += c.vy * dt;
        if (c.x < 0) { c.x = 0; c.vx = Math.abs(c.vx); c.tx = Math.abs(c.tx); } else if (c.x > W) { c.x = W; c.vx = -Math.abs(c.vx); c.tx = -Math.abs(c.tx); }
        if (c.y < 0) { c.y = 0; c.vy = Math.abs(c.vy); c.ty = Math.abs(c.ty); } else if (c.y > H) { c.y = H; c.vy = -Math.abs(c.vy); c.ty = -Math.abs(c.ty); }
        c.d.style.transform = `translate(${c.x.toFixed(1)}px,${c.y.toFixed(1)}px)`;
        if (c.id === "abeille") { c.buzz -= dt; if (c.buzz <= 0) { c.buzz = 3.5 + Math.random() * 3; bubble(c, "bzzz…"); buzzSound(); } }
      });
    });
    requestAnimationFrame(loop);
  })(last);
})();
if (window.ResizeObserver) new ResizeObserver(() => { if (CUR === "front" && F) buildTree(); }).observe($("#treewrap"));

// ---------- fond sonore, mode silence et fanfares de réussite ----------
const SND = { ctx: null, on: true, master: null, bgm: null, step: 0, next: 0 };
try { SND.on = localStorage.getItem("bq-snd") !== "off"; } catch (e) {}
const MEL = [76, 79, 76, 72, 74, 76, 74, 0, 72, 76, 79, 76, 81, 79, 76, 0, 74, 77, 81, 77, 79, 77, 76, 74, 76, 74, 72, 74, 76, 0, 72, 0];
const BAS = [48, 43, 48, 43, 45, 40, 45, 40, 53, 48, 50, 43, 48, 43, 48, 43];
const hz = m => 440 * Math.pow(2, (m - 69) / 12), SPB = 60 / 112 / 2;
function tone(f, t, d, type, v, dest) {
  const c = SND.ctx, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(g); g.connect(dest); o.start(t); o.stop(t + d + .03);
}
function schedule() {
  const c = SND.ctx; if (!c || c.state !== "running") return;
  while (SND.next < c.currentTime + .35) {
    const s = SND.step % 32, t = Math.max(SND.next, c.currentTime);
    if (MEL[s]) tone(hz(MEL[s]), t, SPB * .85, "square", .22, SND.bgm);
    if (s % 2 === 0) tone(hz(BAS[s / 2]), t, SPB * 1.8, "triangle", .5, SND.bgm);
    SND.step++; SND.next += SPB;
  }
}
function startAudio() {
  if (SND.ctx) return;
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  const c = SND.ctx = new AC();
  SND.master = c.createGain(); SND.master.gain.value = .6; SND.master.connect(c.destination);
  SND.bgm = c.createGain(); SND.bgm.gain.value = .35; SND.bgm.connect(SND.master);
  SND.next = c.currentTime + .1; setInterval(schedule, 100);
  if (!SND.on) c.suspend();
}
function wake() { if (!SND.on) return; startAudio(); if (SND.ctx && SND.ctx.state === "suspended") SND.ctx.resume(); }
function fanfare(n) {
  if (!SND.on) return; wake(); const c = SND.ctx; if (!c) return;
  const seqs = { 1: [72, 76, 79, 84], 2: [74, 78, 81, 86], 3: [76, 80, 83, 88], 4: [72, 76, 79, 84, 79, 84, 88, 91] };
  const sq = seqs[n] || seqs[1], t0 = c.currentTime + .05, st = n === 4 ? .13 : .11, last = sq[sq.length - 1], tail = n === 4 ? 1.1 : .6, end = t0 + sq.length * st;
  SND.bgm.gain.setTargetAtTime(.06, t0 - .05, .05);
  sq.forEach((m, i) => { tone(hz(m), t0 + i * st, .28, "square", .3, SND.master); tone(hz(m - 12), t0 + i * st, .28, "triangle", .3, SND.master); });
  [0, 4, 7].forEach(d => tone(hz(last - 12 + d), end, tail, "triangle", .3, SND.master));
  tone(hz(last), end, tail * .8, "square", .22, SND.master);
  SND.bgm.gain.setTargetAtTime(.35, end + tail, .25);
}
function paintSnd() {
  const b = $("#snd"); b.textContent = SND.on ? "🔊" : "🔇"; b.setAttribute("aria-pressed", String(!SND.on));
  b.setAttribute("aria-label", SND.on ? "Couper le son (mode silence)" : "Remettre le son"); b.title = SND.on ? "Mode silence" : "Remettre le son";
}
$("#snd").addEventListener("click", () => {
  SND.on = !SND.on; try { localStorage.setItem("bq-snd", SND.on ? "on" : "off"); } catch (e) {}
  paintSnd(); if (SND.on) wake(); else if (SND.ctx) SND.ctx.suspend();
});
["pointerdown", "click", "touchend", "keydown"].forEach(ev => addEventListener(ev, wake, true));
document.addEventListener("visibilitychange", () => { if (!SND.ctx) return; if (document.hidden) SND.ctx.suspend(); else wake(); });
paintSnd();

// ---------- boîtes de l’arbre en surbrillance (survol ou appui long, après validation) ----------
let LPB = null, lpbDone = false, bxPt = null, bxTimer = null;
const boxOf = e => { const t = e.target; if (!t || !t.closest) return null; const r = t.closest("[data-box]"); if (r) return +r.dataset.box; const s = t.closest(".slot.lab,.slot.tip"); return s ? +s.dataset.z : null; };
document.addEventListener("pointerover", e => { if (e.pointerType === "touch" || !F || !F.done) return; const k = boxOf(e); if (k != null) boxHl(k); else if (e.target.closest && e.target.closest(".tree")) boxHl(null); });
document.addEventListener("pointerout", e => { if (e.pointerType === "touch" || !F || !F.done) return; const t = e.target.closest && e.target.closest(".tree"); if (t && !t.contains(e.relatedTarget)) boxHl(null); });
document.addEventListener("pointerdown", e => {
  if (e.pointerType !== "touch" || !F || !F.done) return; const k = boxOf(e); if (k == null) return;
  clearTimeout(LPB); lpbDone = false; bxPt = { x: e.clientX, y: e.clientY };
  LPB = setTimeout(() => { lpbDone = true; boxHl(k); clearTimeout(bxTimer); bxTimer = setTimeout(() => boxHl(null), 4000); try { navigator.vibrate && navigator.vibrate(20); } catch (_) {} }, 500);
}, true);
document.addEventListener("pointermove", e => { if (LPB && bxPt && Math.hypot(e.clientX - bxPt.x, e.clientY - bxPt.y) > 10) { clearTimeout(LPB); LPB = null; } });
["pointerup", "pointercancel"].forEach(ev => document.addEventListener(ev, () => { clearTimeout(LPB); LPB = null; }));
document.addEventListener("click", e => { if (lpbDone) { e.preventDefault(); e.stopPropagation(); lpbDone = false; } }, true);

// ---------- tableaux et boîtes toujours visibles en entier ----------
function fitTable(wsel, tsel) {
  const w = $(wsel), t = $(tsel); if (!w || !t || !w.clientWidth) return;
  t.style.transform = ""; t.style.width = ""; t.style.height = ""; w.classList.remove("fit");
  t.style.height = "auto"; const nat = t.offsetHeight, ch = w.clientHeight - 4; t.style.height = "";
  if (nat > ch && ch > 50) { const s = Math.max(.5, ch / nat); t.style.transformOrigin = "0 0"; t.style.width = (100 / s) + "%"; t.style.transform = `scale(${s})`; t.style.height = "auto"; w.classList.add("fit"); }
}
const refitAll = () => { fitTable("#tbl .tablewrap", "#grid"); fitTable("#recap .tablewrap", "#grid2"); if (CUR === "box") fitTop(); };
if (window.ResizeObserver) {
  const ro = new ResizeObserver(() => requestAnimationFrame(refitAll));
  [$("#tbl .tablewrap"), $("#recap .tablewrap"), $("#top")].forEach(el => el && ro.observe(el));
}
addEventListener("resize", () => requestAnimationFrame(refitAll));
if (document.fonts && document.fonts.ready) document.fonts.ready.then(refitAll);

show("home");
