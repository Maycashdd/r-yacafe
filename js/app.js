/* ============================================================
   RÜYA — experience engine
   Lenis smooth scroll · GSAP ScrollTrigger · light steam canvas
   Degrades gracefully: content is visible if any library fails.
   ============================================================ */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = !!window.gsap;
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* failsafe: never trap content behind hidden reveal states */
  function revealAll() {
    document.documentElement.classList.remove("js");
    $$("[data-reveal]").forEach(function (el) { el.style.opacity = 1; el.style.transform = "none"; });
    $$(".r-line > span").forEach(function (el) { el.style.transform = "none"; });
    $$(".hero-mark,.hero-tag,.hero-sub,.hero-actions,.hero-scroll").forEach(function (el) { el.style.opacity = 1; });
    $$(".hero-title span").forEach(function (el) { el.style.opacity = 1; el.style.transform = "none"; el.style.filter = "none"; });
  }
  if (!hasGSAP || REDUCED) { revealAll(); }
  setTimeout(function () {
    var p = $(".preloader"); if (p) p.classList.add("done");
    if (!document.body.dataset.revealed) revealAll();
  }, 4200);

  /* ---------- Lenis smooth scroll ---------- */
  var lenis = null;
  if (window.Lenis && !REDUCED) {
    lenis = new Lenis({ duration: 1.1, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
    if (hasGSAP && window.ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
    }
  }
  function scrollTo(target) {
    var el = typeof target === "string" ? $(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -10 });
    else el.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" });
  }
  $$('a[href^="#"]').forEach(function (a) {
    var href = a.getAttribute("href");
    if (href.length < 2) return;
    a.addEventListener("click", function (e) {
      var t = $(href);
      if (t) { e.preventDefault(); closeNav(); scrollTo(t); }
    });
  });

  /* ---------- custom cursor ---------- */
  (function cursor() {
    if (window.matchMedia("(hover:none),(pointer:coarse)").matches) return;
    var c = document.createElement("div"); c.className = "cursor"; document.body.appendChild(c);
    var x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    document.addEventListener("mousemove", function (e) { x = e.clientX; y = e.clientY; }, { passive: true });
    (function loop() { cx += (x - cx) * .2; cy += (y - cy) * .2; c.style.transform = "translate(" + cx + "px," + cy + "px) translate(-50%,-50%)"; requestAnimationFrame(loop); })();
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest("a,button,input,select,textarea,.tcard,.gallery-grid figure,.cat-btn")) c.classList.add("is-link");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest("a,button,input,select,textarea,.tcard,.gallery-grid figure,.cat-btn")) c.classList.remove("is-link");
    });
  })();

  /* ---------- nav ---------- */
  var nav = $(".nav"), burger = $(".nav-burger"), navLinks = $(".nav-links"), floatCta = $(".float-cta");
  function closeNav() { if (burger) burger.classList.remove("open"); if (navLinks) navLinks.classList.remove("open"); document.body.style.overflow = ""; }
  if (burger) burger.addEventListener("click", function () {
    var open = burger.classList.toggle("open"); navLinks.classList.toggle("open", open);
    document.body.style.overflow = open ? "hidden" : "";
  });
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle("is-solid", y > 40);
    if (floatCta) floatCta.classList.toggle("is-on", y > innerHeight * 0.6);
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------- marquee ---------- */
  (function marquee() {
    var track = $(".marquee-track"); if (!track) return;
    var html = track.innerHTML; track.innerHTML = html + html;
    if (REDUCED) return;
    var x = 0, w = track.scrollWidth / 2;
    (function move() { x -= 0.4; if (-x >= w) x = 0; track.style.transform = "translateX(" + x + "px)"; requestAnimationFrame(move); })();
  })();

  /* ---------- reveals ---------- */
  function setupReveals() {
    if (!hasGSAP || REDUCED) { revealAll(); return; }
    document.body.dataset.revealed = "1";
    $$(".r-line > span").forEach(function (el) {
      gsap.fromTo(el, { yPercent: 110 }, {
        yPercent: 0, duration: 1.05, ease: "expo.out",
        scrollTrigger: { trigger: el.closest(".r-line"), start: "top 88%" }
      });
    });
    if (window.ScrollTrigger && ScrollTrigger.batch) {
      ScrollTrigger.batch("[data-reveal]", {
        start: "top 90%",
        onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: .9, ease: "expo.out", stagger: .08, overwrite: true }); }
      });
    } else {
      $$("[data-reveal]").forEach(function (el) {
        gsap.to(el, { opacity: 1, y: 0, duration: .9, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%" } });
      });
    }
  }

  /* ---------- preloader + hero entrance ---------- */
  function heroEntrance() {
    var hero = $(".hero"); if (!hero) return;
    if (!hasGSAP || REDUCED) { revealAll(); startSteam(); return; }
    var tl = gsap.timeline();
    tl.to(".hero-mark", { opacity: 1, duration: 1, ease: "power2.out" })
      .to(".hero-title span", { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.1, ease: "expo.out", stagger: .09 }, "-=.5")
      .to(".hero-tag", { opacity: 1, duration: .8 }, "-=.6")
      .to(".hero-sub", { opacity: 1, duration: .8 }, "-=.6")
      .to(".hero-actions", { opacity: 1, duration: .8 }, "-=.55")
      .to(".hero-scroll", { opacity: 1, duration: .8 }, "-=.5");
    startSteam();
  }
  (function preloader() {
    var pre = $(".preloader");
    if (!pre || !hasGSAP || REDUCED) { if (pre) pre.classList.add("done"); heroEntrance(); setupReveals(); return; }
    var tl = gsap.timeline({ onComplete: function () { heroEntrance(); setupReveals(); } });
    tl.to(".pre-mark", { opacity: 1, y: 0, scale: 1, duration: .7, ease: "power2.out" })
      .to(".pre-word span", { opacity: 1, y: 0, duration: .7, ease: "expo.out", stagger: .07 }, "-=.3")
      .to(".pre-line i", { scaleX: 1, duration: .7, ease: "power2.inOut" }, "-=.2")
      .to(".pre-sub", { opacity: 1, duration: .5 }, "-=.4")
      .to({}, { duration: .35 })
      .to(pre, { opacity: 0, duration: .7, ease: "power2.inOut", onStart: function () { pre.classList.add("done"); } });
  })();

  /* ---------- hero WebGL smoke + embers (degrades gracefully) ---------- */
  var smokeStarted = false;
  function startSteam() {
    if (smokeStarted) return; smokeStarted = true;
    var canvas = $("#smoke-canvas"), hero = $(".hero");
    if (!canvas || !hero) return;
    if (REDUCED || typeof THREE === "undefined") { document.body.classList.add("no-webgl"); return; }
    var isMobile = window.matchMedia("(max-width:760px)").matches;
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: false, powerPreference: "high-performance" }); }
    catch (e) { document.body.classList.add("no-webgl"); return; }
    var DPR = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.75);
    renderer.setPixelRatio(DPR);
    var scene = new THREE.Scene();
    var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
    var smokeUniforms = { uTime: { value: 0 }, uScroll: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uMouse: { value: new THREE.Vector2(.5, .5) } };
    var smokeMat = new THREE.ShaderMaterial({
      uniforms: smokeUniforms, depthWrite: false,
      vertexShader: "void main(){gl_Position=vec4(position,1.0);}",
      fragmentShader: [
        "precision highp float;",
        "uniform float uTime;uniform float uScroll;uniform vec2 uRes;uniform vec2 uMouse;",
        "float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}",
        "float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*(3.0-2.0*f);",
        " return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}",
        "float fbm(vec2 p){float v=0.;float a=.5;mat2 r=mat2(1.6,1.2,-1.2,1.6);",
        " for(int i=0;i<5;i++){v+=a*noise(p);p=r*p;a*=.5;}return v;}",
        "void main(){",
        " vec2 uv=gl_FragCoord.xy/uRes.xy;",
        " vec2 p=uv;p.x*=uRes.x/uRes.y;",
        " float t=uTime*.05;",
        " float stretch=1.0+uScroll*2.6;",
        " vec2 q=vec2(p.x*1.4,(p.y+uScroll*1.1)*1.4/stretch);",
        " float m=fbm(q*2.2+vec2(t*.8,-t*1.6));",
        " m+=.45*fbm(q*4.5+vec2(-t*1.4,-t*2.4)+m);",
        " float rise=smoothstep(-.15,.85,1.0-uv.y+ (m-.5)*.9);",
        " float cone=1.0-smoothstep(.05,.62+uScroll*.4,abs(uv.x-.5+(m-.5)*.22));",
        " float smoke=m*rise*cone;",
        " smoke=smoothstep(.18,.95,smoke);",
        " smoke*= (1.0-uScroll*.55);",
        " vec3 cold=vec3(.10,.085,.065);",
        " vec3 warm=vec3(.78,.62,.40);",
        " vec3 hot =vec3(.95,.52,.22);",
        " vec3 col=vec3(.039,.035,.027);",
        " vec3 sm=mix(cold,warm,smoke);",
        " sm=mix(sm,hot,pow(smoke,3.2)*(.35+uScroll*.9));",
        " col=mix(col,sm,smoke*.85);",
        " float glow=pow(max(0.,1.-distance(uv,vec2(.5,.32))*1.5),2.4);",
        " col+=vec3(.45,.30,.14)*glow*.30*(1.0-uScroll*.5);",
        " gl_FragColor=vec4(col,1.0);}"
      ].join("\n")
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), smokeMat));

    var COUNT = isMobile ? 90 : 220;
    var pos = new Float32Array(COUNT * 3), seed = new Float32Array(COUNT);
    for (var i = 0; i < COUNT; i++) { pos[i * 3] = Math.random() * 2 - 1; pos[i * 3 + 1] = Math.random() * 2 - 1; pos[i * 3 + 2] = 0; seed[i] = Math.random(); }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    var emberMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: smokeUniforms.uTime, uScroll: smokeUniforms.uScroll, uDPR: { value: DPR } },
      vertexShader: [
        "attribute float aSeed;uniform float uTime;uniform float uScroll;uniform float uDPR;varying float vA;",
        "void main(){",
        " float t=uTime*.08*(.5+aSeed);",
        " float x=position.x+sin(t*2.0+aSeed*40.0)*.12;",
        " float y=mod(position.y+t*(.55+aSeed*.8),2.2)-1.1;",
        " y-=uScroll*1.6*(.4+aSeed);",
        " vA=(.25+aSeed*.75)*smoothstep(0.,.25,1.-abs(y))*(.18+uScroll*1.4);",
        " gl_Position=vec4(x,y,0.,1.);",
        " gl_PointSize=(1.4+aSeed*3.2)*uDPR*(1.0+uScroll*1.2);}"
      ].join("\n"),
      fragmentShader: [
        "precision mediump float;varying float vA;",
        "void main(){",
        " float d=length(gl_PointCoord-vec2(.5));",
        " float a=smoothstep(.5,.05,d)*vA;",
        " gl_FragColor=vec4(vec3(1.0,.58,.22),a);}"
      ].join("\n")
    });
    scene.add(new THREE.Points(geo, emberMat));

    function resize() { var w = hero.clientWidth, h = hero.clientHeight; renderer.setSize(w, h, false); smokeUniforms.uRes.value.set(w * DPR, h * DPR); }
    resize(); window.addEventListener("resize", resize);
    var clock = new THREE.Clock(), heroVisible = true;
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { heroVisible = en[0].isIntersecting; }, { threshold: 0 }).observe(hero);
    renderer.render(scene, camera); // paint first frame immediately
    (function loop() {
      requestAnimationFrame(loop);
      if (!heroVisible) return;
      smokeUniforms.uTime.value = clock.getElapsedTime();
      smokeUniforms.uScroll.value = Math.min(1, (window.scrollY || window.pageYOffset || 0) / (hero.clientHeight || 1));
      renderer.render(scene, camera);
    })();
  }
  /* kick off the smoke immediately (independent of preloader/rAF timing) */
  if (document.querySelector("#smoke-canvas")) startSteam();

  /* ---------- signature horizontal scroll ---------- */
  (function signatures() {
    var track = $(".sig-track"); if (!track || !hasGSAP || !window.ScrollTrigger) return;
    if (window.matchMedia("(max-width:900px)").matches || REDUCED) return;
    var panels = $$(".sig-panel", track), bars = $$(".sig-progress i");
    var stage = $(".sig-stage");
    var getX = function () { return -(track.scrollWidth - innerWidth); };
    gsap.to(track, {
      x: getX, ease: "none",
      scrollTrigger: {
        trigger: stage, start: "top top", end: function () { return "+=" + (track.scrollWidth - innerWidth); },
        scrub: 1, pin: true, invalidateOnRefresh: true,
        onUpdate: function (self) {
          var p = self.progress * panels.length;
          bars.forEach(function (b, i) { b.style.setProperty("--p", Math.max(0, Math.min(1, p - i))); });
        }
      }
    });
  })();

  /* ---------- dessert tilt cards ---------- */
  (function tilt() {
    if (window.matchMedia("(hover:none),(pointer:coarse)").matches || REDUCED) return;
    $$(".tcard").forEach(function (card) {
      var inner = $(".tcard-inner", card), shine = $(".tshine", card);
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        if (inner) inner.style.transform = "rotateY(" + (px - .5) * 9 + "deg) rotateX(" + (.5 - py) * 9 + "deg)";
        if (shine) { shine.style.setProperty("--mx", px * 100 + "%"); shine.style.setProperty("--my", py * 100 + "%"); }
      });
      card.addEventListener("mouseleave", function () { if (inner) inner.style.transform = ""; });
    });
  })();

  /* ---------- request forms (reservation + cake) ---------- */
  (function thanksForms() {
    function wire(formSel, doneSel, doneTextSel, makeMsg) {
      var form = $(formSel); if (!form) return;
      var date = form.querySelector('input[type="date"]');
      if (date) date.min = new Date().toISOString().split("T")[0];
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        var name = (form.querySelector('[name="name"]') || {}).value || "";
        var txt = $(doneTextSel);
        if (txt && name && makeMsg) txt.textContent = makeMsg(name.split(" ")[0]);
        var done = $(doneSel); if (done) done.classList.add("show");
      });
    }
    wire("#resForm", "#resDone", "#resDoneText", function (n) { return "Danke, " + n + ". Ihre Anfrage ist bei uns, wir bestätigen sie in Kürze."; });
    wire("#cakeForm", "#cakeDone", "#cakeDoneText", function (n) { return "Danke, " + n + ". Ihre Tortenanfrage ist bei uns, wir melden uns mit einem Angebot."; });
  })();

  /* ---------- gallery lightbox ---------- */
  (function gallery() {
    var grid = $(".gallery-grid"); if (!grid) return;
    var figs = $$("figure", grid);
    var box = document.createElement("div");
    box.className = "lightbox"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true");
    box.innerHTML = '<button class="lightbox-close" aria-label="Schließen">×</button>' +
      '<button class="lightbox-nav prev" aria-label="Zurück">‹</button>' +
      '<img alt=""><button class="lightbox-nav next" aria-label="Weiter">›</button>';
    document.body.appendChild(box);
    var imgEl = $("img", box), idx = 0;
    function show(i) {
      idx = (i + figs.length) % figs.length;
      var src = figs[idx].dataset.full || $("img", figs[idx]).src;
      imgEl.src = src; imgEl.alt = ($("img", figs[idx]).alt || "");
      box.classList.add("show"); document.body.style.overflow = "hidden";
    }
    function close() { box.classList.remove("show"); document.body.style.overflow = ""; }
    figs.forEach(function (f, i) { f.addEventListener("click", function () { show(i); }); });
    box.addEventListener("click", function (e) {
      if (e.target.classList.contains("lightbox-close") || e.target === box) close();
      else if (e.target.classList.contains("next")) show(idx + 1);
      else if (e.target.classList.contains("prev")) show(idx - 1);
    });
    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("show")) return;
      if (e.key === "Escape") close(); else if (e.key === "ArrowRight") show(idx + 1); else if (e.key === "ArrowLeft") show(idx - 1);
    });
  })();

  /* expose smooth scroll for other scripts (menu page) */
  window.lenisScrollTo = function (top) { if (lenis) lenis.scrollTo(top); else window.scrollTo({ top: top, behavior: REDUCED ? "auto" : "smooth" }); };

  /* ---------- footer year ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* refresh ScrollTrigger after images load */
  if (hasGSAP && window.ScrollTrigger) {
    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  }
})();
