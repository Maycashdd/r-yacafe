/* ============================================================
   RÜYA — menu page: render, search, category filter
   Depends on menu-data.js (MENU, CATS, LEGEND)
   ============================================================ */
(function () {
  "use strict";
  if (typeof MENU === "undefined") return;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var listEl = $("#menuRoot"), catsEl = $("#menuCats"), searchEl = $("#menuSearch"),
      emptyEl = $("#menuEmpty"), legendEl = $("#menuLegend");
  if (!listEl) return;

  var esc = function (s) { return (s || "").replace(/[&<>"]/g, function (m) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[m]; }); };

  /* ---- render sections ---- */
  CATS.forEach(function (cat) {
    var items = MENU.filter(function (m) { return m.c === cat.id; });
    if (!items.length) return;
    var sec = document.createElement("section");
    sec.className = "menu-section";
    sec.id = "cat-" + cat.id.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    sec.dataset.cat = cat.id;
    var rows = items.map(function (m) {
      var tr = m.t ? '<span class="tr">' + esc(m.t) + "</span>" : "";
      var desc = m.d ? '<p class="desc">' + esc(m.d) + "</p>" : "";
      return '<div class="menu-item" data-search="' + esc((m.n + " " + m.t + " " + m.d).toLowerCase()) + '">' +
        '<span class="nr">' + esc(m.nr) + "</span>" +
        '<div class="body"><span class="name">' + esc(m.n) + tr + "</span>" + desc + "</div>" +
        '<span class="price">' + esc(m.p) + "&nbsp;€</span></div>";
    }).join("");
    sec.innerHTML =
      '<div class="menu-section-head"><h2>' + esc(cat.id) + '</h2><span class="tr">' + esc(cat.tr) + "</span></div>" +
      '<p class="menu-section-tag">' + esc(cat.tag) + "</p>" +
      '<div class="menu-section-rule"></div>' +
      '<div class="menu-list">' + rows + "</div>";
    listEl.appendChild(sec);
  });

  /* ---- category buttons ---- */
  var buttons = [];
  function makeBtn(label, cat) {
    var b = document.createElement("button");
    b.className = "cat-btn"; b.type = "button"; b.textContent = label; b.dataset.cat = cat || "";
    b.addEventListener("click", function () { setCat(cat || ""); });
    catsEl.appendChild(b); buttons.push(b); return b;
  }
  if (catsEl) {
    makeBtn("Alle", "").classList.add("active");
    CATS.forEach(function (c) { if (MENU.some(function (m) { return m.c === c.id; })) makeBtn(c.id, c.id); });
  }

  var activeCat = "";
  function setCat(cat) {
    activeCat = cat;
    buttons.forEach(function (b) { b.classList.toggle("active", b.dataset.cat === cat); });
    applyFilters();
    if (cat) {
      var sec = listEl.querySelector('.menu-section[data-cat="' + cat + '"]');
      if (sec) {
        var top = sec.getBoundingClientRect().top + (window.scrollY || 0) - 130;
        if (window.lenisScrollTo) window.lenisScrollTo(top); else window.scrollTo({ top: top, behavior: "smooth" });
      }
    }
  }

  /* ---- search + filter ---- */
  function applyFilters() {
    var q = (searchEl && searchEl.value || "").trim().toLowerCase();
    var anyVisible = false;
    Array.prototype.forEach.call(listEl.querySelectorAll(".menu-section"), function (sec) {
      var catOk = !activeCat || sec.dataset.cat === activeCat;
      var shown = 0;
      Array.prototype.forEach.call(sec.querySelectorAll(".menu-item"), function (it) {
        var match = catOk && (!q || it.dataset.search.indexOf(q) !== -1);
        it.style.display = match ? "" : "none";
        if (match) shown++;
      });
      sec.style.display = shown ? "" : "none";
      if (shown) anyVisible = true;
    });
    if (emptyEl) emptyEl.classList.toggle("show", !anyVisible);
  }
  if (searchEl) {
    var t;
    searchEl.addEventListener("input", function () { clearTimeout(t); t = setTimeout(applyFilters, 110); });
  }

  /* ---- legend ---- */
  if (legendEl && typeof LEGEND !== "undefined") {
    legendEl.innerHTML = LEGEND.map(function (l) {
      return "<span><b>" + esc(l.k) + "</b>" + esc(l.v) + "</span>";
    }).join("");
  }
})();
