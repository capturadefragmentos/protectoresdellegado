/* =====================================================================
   PROTECTORES DEL LEGADO — FUNCIONAMIENTO
   No necesitas editar este archivo para cambiar contenidos:
   usa el panel /admin (o los archivos de la carpeta /contenido)
   ===================================================================== */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var archivos = ["sitio", "podcast", "documentales", "comunidad", "tienda", "equipo", "cultura"];
  Promise.all(archivos.map(function (n) {
    return fetch("contenido/" + n + ".json", { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(n + ".json"); return r.json(); });
  })).then(function (d) {
    iniciar({
      sitio: d[0].sitio || {}, contacto: d[0].contacto || {}, redes: d[0].redes || {},
      podcast: d[1] || {}, documentales: d[2].documentales || [], comunidad: d[3].comunidad || [],
      tienda: d[4].productos || [], equipo: d[5].equipo || []
    }, d[6] || {});
  }).catch(function (e) {
    var a = document.createElement("p"); a.className = "aviso-carga";
    a.textContent = "No se pudo cargar el contenido (" + e.message + "). Si abriste index.html con doble clic, revisa la web publicada: el navegador bloquea la lectura de archivos locales.";
    document.body.insertBefore(a, document.body.firstChild);
  });

function iniciar(C, K) {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (t) { return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  // En la vista previa de Claude no se pueden incrustar videos; en tu dominio sí.
  var puedeIncrustar = !/claude|anthropic/i.test(location.hostname);
  var guardar = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  var leer = function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  var wa = function (texto) { return "https://wa.me/" + (C.contacto && C.contacto.whatsapp || "") + "?text=" + encodeURIComponent(texto); };
  // Acepta el enlace completo de YouTube o solo el código del video
  var ytId = function (v) { v = String(v || "").trim(); var m = v.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([\w-]{11})/); return m ? m[1] : v; };
  var yt = function (id) { return "https://www.youtube.com/watch?v=" + encodeURIComponent(ytId(id)); };

  /* ---------- Portada ---------- */
  (function portada() {
    var palabras = ["Explora", "Escucha", "Descubre"], i = 0, el = $("#palabraRota");
    if (el && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInterval(function () {
        i = (i + 1) % palabras.length;
        el.classList.remove("cambia"); void el.offsetWidth;
        el.textContent = palabras[i]; el.classList.add("cambia");
      }, 2600);
    }
    var s = C.sitio || {};
    if (s.videoPortada) {
      var v = $("#videoPortada"); v.src = s.videoPortada; v.hidden = false;
      v.play && v.play().catch(function () {});
    }
    if (s.teaserYoutube) {
      var b = $("#btnTeaser"); b.hidden = false;
      b.addEventListener("click", function () { abrirVideo("Teaser · Protectores del Legado", s.teaserYoutube); });
    }
  })();

  /* ---------- Navegación ---------- */
  (function nav() {
    var btn = $("#hamburguesa"), menu = $("#nav");
    btn.addEventListener("click", function () {
      var abierto = menu.classList.toggle("abierto");
      btn.setAttribute("aria-expanded", abierto ? "true" : "false");
      btn.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
    });
    $$("a", menu).forEach(function (a) {
      a.addEventListener("click", function () { menu.classList.remove("abierto"); btn.setAttribute("aria-expanded", "false"); });
    });
    if ("IntersectionObserver" in window) {
      var mapa = {};
      $$("a", menu).forEach(function (a) { mapa[a.getAttribute("href").slice(1)] = a; });
      var io = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
          if (e.isIntersecting) {
            $$("a", menu).forEach(function (a) { a.classList.remove("actual"); });
            var id = e.target.id === "relatos" || e.target.id === "glosario" ? "descubre" : e.target.id;
            if (mapa[id]) mapa[id].classList.add("actual");
          }
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      $$("main section[id]").forEach(function (s) { io.observe(s); });
    }
  })();

  /* ---------- Sonido del mar (generado, sin archivos) ---------- */
  (function sonido() {
    var btn = $("#btnSonido"), ctx = null, salida = null;
    btn.addEventListener("click", function () {
      var on = btn.getAttribute("aria-pressed") !== "true";
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      try {
        if (!ctx) {
          var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
          ctx = new AC();
          var largo = ctx.sampleRate * 4, buf = ctx.createBuffer(1, largo, ctx.sampleRate), d = buf.getChannelData(0), ultimo = 0;
          for (var i = 0; i < largo; i++) { var b = Math.random() * 2 - 1; ultimo = (ultimo + 0.02 * b) / 1.02; d[i] = ultimo * 3.2; }
          var ruido = ctx.createBufferSource(); ruido.buffer = buf; ruido.loop = true;
          var filtro = ctx.createBiquadFilter(); filtro.type = "lowpass"; filtro.frequency.value = 700;
          var ola = ctx.createGain(); ola.gain.value = 0.5;
          var lfo = ctx.createOscillator(); lfo.frequency.value = 0.11;
          var lfoG = ctx.createGain(); lfoG.gain.value = 0.42;
          lfo.connect(lfoG); lfoG.connect(ola.gain);
          salida = ctx.createGain(); salida.gain.value = 0;
          ruido.connect(filtro); filtro.connect(ola); ola.connect(salida); salida.connect(ctx.destination);
          ruido.start(); lfo.start();
        }
        if (ctx.state === "suspended") ctx.resume();
        salida.gain.setTargetAtTime(on ? 0.35 : 0, ctx.currentTime, 0.6);
      } catch (e) {}
    });
  })();

  /* ---------- Línea de tiempo ---------- */
  (function linea() {
    var datos = K.lineaTiempo || [], pista = $("#lineaPista"), det = $("#lineaDetalle");
    pista.innerHTML = datos.map(function (h, i) {
      return '<button class="hito" type="button" role="tab" aria-selected="false" data-i="' + i + '">' +
        '<span class="hito__punto"></span><span class="hito__anio">' + esc(h.anio) + '</span><span class="hito__tit">' + esc(h.titulo) + "</span></button>";
    }).join("");
    function ver(i) {
      var h = datos[i]; if (!h) return;
      $$(".hito", pista).forEach(function (b) { b.setAttribute("aria-selected", b.dataset.i == i ? "true" : "false"); });
      det.innerHTML = '<span class="grande">' + esc(h.anio) + "</span><h3>" + esc(h.titulo) + "</h3><p>" + esc(h.texto) + "</p>";
    }
    pista.addEventListener("click", function (e) { var b = e.target.closest(".hito"); if (b) ver(+b.dataset.i); });
    ver(0);
  })();

  /* ---------- Relatos ---------- */
  (function relatos() {
    var cont = $("#relatos-lista");
    cont.innerHTML = (K.relatos || []).map(function (r, i) {
      var ep = r.episodio ? '<a class="relato__link" href="#murmullu">Escúchalo en El Murmullu · EP ' + esc(r.episodio) + " →</a>" : "";
      r.texto = Array.isArray(r.texto) ? r.texto : String(r.texto || "").split(/\n\s*\n/);
      return '<article class="relato"><span class="relato__et">' + esc(r.etiqueta) + "</span><h3>" + esc(r.titulo) + "</h3>" +
        '<p class="relato__gancho">' + esc(r.gancho) + "</p>" +
        '<div class="relato__cuerpo" id="rel' + i + '" hidden>' + r.texto.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + "</div>" +
        '<div class="relato__acc"><button class="relato__btn" type="button" aria-expanded="false" aria-controls="rel' + i + '">Leer el relato</button>' + ep + "</div></article>";
    }).join("");
    cont.addEventListener("click", function (e) {
      var b = e.target.closest(".relato__btn"); if (!b) return;
      var c = document.getElementById(b.getAttribute("aria-controls")), ab = c.hidden;
      c.hidden = !ab; b.setAttribute("aria-expanded", ab ? "true" : "false"); b.textContent = ab ? "Cerrar" : "Leer el relato";
    });
  })();

  /* ---------- Glosario ---------- */
  (function glosario() {
    var cont = $("#glosarioLista");
    cont.innerHTML = (K.glosario || []).map(function (g) {
      return '<button class="carta" type="button" aria-pressed="false"><span class="carta__in">' +
        '<span class="carta__cara carta__frente"><strong>' + esc(g.termino) + "</strong><small>Toca para descubrir</small></span>" +
        '<span class="carta__cara carta__reverso"><span>' + esc(g.definicion) + "</span><em>" + esc(g.dato) + "</em></span></span></button>";
    }).join("");
    cont.addEventListener("click", function (e) {
      var c = e.target.closest(".carta"); if (!c) return;
      var v = c.classList.toggle("volteada"); c.setAttribute("aria-pressed", v ? "true" : "false");
    });
  })();

  /* ---------- El Murmullu ---------- */
  (function podcast() {
    var p = C.podcast || {}, R = C.redes || {};
    $("#podcastDesc").textContent = p.descripcion || "";
    $("#podcastOrigen").textContent = p.origenNombre || "";
    var plats = "";
    if (R.youtube) plats += '<a class="btn btn--oro btn--chico" href="' + esc(R.youtube) + '" target="_blank" rel="noopener">Ver en YouTube</a>';
    if (R.spotify) plats += '<a class="btn btn--linea btn--chico" href="' + esc(R.spotify) + '" target="_blank" rel="noopener">Escuchar en Spotify</a>';
    if (!plats) plats = '<span class="etiqueta-prox">Pronto en YouTube y Spotify</span>';
    $("#plataformasPodcast").innerHTML = plats;

    var lista = $("#episodios");
    function pintar(seg) {
      lista.innerHTML = (p.episodios || []).filter(function (e) { return seg === "todos" || e.segmento === seg; }).map(function (e) {
        var acc = "";
        if (e.youtube) acc += '<button class="btn-plat" type="button" data-yt="' + esc(e.youtube) + '" data-tit="' + esc(e.titulo) + '"><span class="ico-play"></span>Ver</button>';
        if (e.spotify) acc += '<a class="btn-plat btn-plat--sp" href="' + esc(e.spotify) + '" target="_blank" rel="noopener">Spotify</a>';
        if (!acc) acc = '<span class="etiqueta-prox">Próximamente</span>';
        return '<li class="ep"><div class="ep__portada c-' + esc(e.color || "noche") + '">' + esc(e.num) + (e.portada ? '<img src="' + esc(e.portada) + '" alt="">' : "") + "</div>" +
          '<div><p class="ep__seg">EP ' + esc(e.num) + " · " + esc(e.segmento) + '</p><h3 class="ep__tit">' + esc(e.titulo) + "</h3>" +
          '<p class="ep__gancho">' + esc(e.gancho) + '</p><p class="ep__meta">' + esc(e.duracion) + "</p></div>" +
          '<div class="ep__acc">' + acc + "</div></li>";
      }).join("");
    }
    pintar("todos");
    $("#filtrosPodcast").addEventListener("click", function (e) {
      var b = e.target.closest(".chip"); if (!b) return;
      $$(".chip", this).forEach(function (c) { c.classList.toggle("activo", c === b); });
      pintar(b.dataset.seg);
    });
    lista.addEventListener("click", function (e) {
      var b = e.target.closest("[data-yt]"); if (b) abrirVideo(b.dataset.tit, b.dataset.yt);
    });
  })();

  /* ---------- Documentales ---------- */
  (function docs() {
    var datos = C.documentales || [], cont = $("#docsLista"), fil = $("#filtrosDocs");
    var fondos = { "Arqueología": "var(--teja)", "Tradiciones vivas": "var(--esmeralda)", "Danzas y arte": "var(--rojo)", "Gastronomía": "var(--petroleo)" };
    var cats = ["Todos"].concat(datos.map(function (d) { return d.categoria; }).filter(function (c, i, a) { return a.indexOf(c) === i; }));
    fil.innerHTML = cats.map(function (c, i) { return '<button type="button" class="chip' + (i ? "" : " activo") + '" data-cat="' + esc(c) + '">' + esc(c) + "</button>"; }).join("");
    cont.innerHTML = datos.map(function (d) {
      var tiene = !!d.youtube;
      return '<article class="doc" data-cat="' + esc(d.categoria) + '">' +
        '<button class="doc__cuadro" type="button" style="--fondo:' + (d.portada ? 'url(&quot;' + esc(d.portada) + '&quot;) center / cover' : (fondos[d.categoria] || "var(--petroleo)")) + '"' + (tiene ? ' data-yt="' + esc(d.youtube) + '" data-tit="' + esc(d.titulo) + '"' : ' data-prox="1"') + ">" +
        (tiene ? '<span class="play"><span class="ico-play"></span></span>' : '<span class="play" style="background:transparent;border:1.5px dashed var(--oro);color:var(--oro);width:auto;height:auto;border-radius:999px;padding:4px 10px;font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase">Próximamente</span>') +
        '<span class="doc__cat">' + esc(d.categoria) + '</span><span class="doc__tit">' + esc(d.titulo) + "</span></button>" +
        '<p class="doc__desc">' + esc(d.descripcion) + '</p><p class="doc__meta">' + esc(d.duracion) + "</p></article>";
    }).join("");
    fil.addEventListener("click", function (e) {
      var b = e.target.closest(".chip"); if (!b) return;
      $$(".chip", fil).forEach(function (c) { c.classList.toggle("activo", c === b); });
      $$(".doc", cont).forEach(function (d) { d.hidden = !(b.dataset.cat === "Todos" || d.dataset.cat === b.dataset.cat); });
    });
    cont.addEventListener("click", function (e) {
      var b = e.target.closest("[data-yt]"); if (b) abrirVideo(b.dataset.tit, b.dataset.yt);
    });
  })();

  /* ---------- Mapa cultural ---------- */
  (function mapa() {
    var svg = $("#mapaSvg"), lugares = K.lugares || [], ficha = $("#mapaFicha"), lista = $("#mapaLista");
    var X = function (lon) { return (lon + 80.15) * 1000; }, Y = function (lat) { return (-6.05 - lat) * 1000; };
    var colores = { museo: "var(--rojo)", sitio: "var(--esmeralda)", fiesta: "var(--oro)" };
    var nombresTipo = { museo: "Museo", sitio: "Sitio arqueológico", fiesta: "Festividad" };
    var costa = [[0, 330], [90, 470], [160, 610], [190, 710], [220, 790], [270, 870], [350, 950]];
    var mar = "M0 0 L0 330 " + costa.map(function (p) { return "L" + p[0] + " " + p[1]; }).join(" ") + " L0 950 Z";
    var linea = "M" + costa.map(function (p) { return p[0] + " " + p[1]; }).join(" L");
    var olas = "";
    for (var y = 380; y < 940; y += 44) for (var x = 14; x < 200; x += 70) {
      var lim = 0; for (var k = 0; k < costa.length - 1; k++) if (y >= costa[k][1] && y <= costa[k + 1][1]) lim = costa[k][0] + (costa[k + 1][0] - costa[k][0]) * (y - costa[k][1]) / (costa[k + 1][1] - costa[k][1]);
      if (x + 34 < lim - 10) olas += '<path d="M' + x + " " + y + " q8 -8 16 0 t16 0" + '" />';
    }
    var ciudades = [["Chiclayo", -6.771, -79.841], ["Lambayeque", -6.70, -79.906], ["Ferreñafe", -6.639, -79.787], ["Motupe", -6.152, -79.714], ["Zaña", -6.92, -79.58]];
    var html = '<defs><pattern id="tierra" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.3" fill="rgba(13,44,49,.08)"/></pattern></defs>' +
      '<rect width="650" height="950" fill="var(--papel)"/><rect width="650" height="950" fill="url(#tierra)"/>' +
      '<path d="' + mar + '" fill="rgba(11,183,211,.16)"/><path d="' + linea + '" fill="none" stroke="var(--petroleo)" stroke-width="2.5"/>' +
      '<g fill="none" stroke="rgba(0,73,88,.35)" stroke-width="2" stroke-linecap="round">' + olas + "</g>" +
      '<text x="40" y="620" transform="rotate(-62 40 620)" font-family="var(--f-titular)" font-size="34" letter-spacing="6" fill="rgba(0,73,88,.45)">OCÉANO PACÍFICO</text>' +
      '<g font-family="var(--f-texto)" font-size="15" font-weight="600" fill="rgba(13,44,49,.5)">' +
      ciudades.map(function (c) { return '<circle cx="' + X(c[2]) + '" cy="' + Y(c[1]) + '" r="3" fill="rgba(13,44,49,.35)"/><text x="' + (X(c[2]) + 8) + '" y="' + (Y(c[1]) - 8) + '">' + c[0] + "</text>"; }).join("") + "</g>" +
      '<g transform="translate(590 60)"><path d="M0 -26 L9 6 L0 0 L-9 6 Z" fill="var(--petroleo)"/><text y="26" text-anchor="middle" font-family="var(--f-titular)" font-size="20" fill="var(--petroleo)">N</text></g>';
    html += lugares.map(function (l, i) {
      var x = X(l.lon), y = Y(l.lat);
      if (l.nombre.indexOf("Brüning") > -1) { x -= 14; y += 10; }
      var izq = x > 450;
      return '<g class="pin" data-i="' + i + '" data-tipo="' + l.tipo + '" tabindex="0" role="button" aria-label="' + esc(l.nombre) + '">' +
        '<circle class="halo" cx="' + x + '" cy="' + y + '" r="22" fill="' + colores[l.tipo] + '"/>' +
        '<circle cx="' + x + '" cy="' + y + '" r="10" fill="' + colores[l.tipo] + '" stroke="var(--papel)" stroke-width="3"/>' +
        '<text x="' + (izq ? x - 16 : x + 16) + '" y="' + (y + 5) + '" text-anchor="' + (izq ? "end" : "start") + '" visibility="hidden">' + esc(l.nombre) + "</text></g>";
    }).join("");
    svg.innerHTML = html;
    lista.innerHTML = lugares.map(function (l, i) {
      return '<li data-tipo="' + l.tipo + '"><button type="button" data-i="' + i + '"><i class="punto punto--' + l.tipo + '"></i>' + esc(l.nombre) + "</button></li>";
    }).join("");
    function ver(i) {
      var l = lugares[i]; if (!l) return;
      $$(".pin", svg).forEach(function (p) { var a = +p.dataset.i === i; p.classList.toggle("activo", a); $("text", p).setAttribute("visibility", a ? "visible" : "hidden"); if (a) p.parentNode.appendChild(p); });
      $$("button", lista).forEach(function (b) { b.classList.toggle("activo", +b.dataset.i === i); });
      var ep = l.episodio ? '<a class="btn btn--linea btn--chico" href="#murmullu">Escuchar EP ' + l.episodio + "</a>" : "";
      ficha.innerHTML = '<span class="tipo" style="color:' + colores[l.tipo] + '">' + nombresTipo[l.tipo] + "</span><h3>" + esc(l.nombre) + "</h3><p>" + esc(l.texto) + "</p>" +
        '<div class="acciones"><a class="btn btn--oro btn--chico" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=' + l.lat + "," + l.lon + '">Cómo llegar</a>' + ep + "</div>";
    }
    function clic(e) { var t = e.target.closest("[data-i]"); if (t) ver(+t.dataset.i); }
    svg.addEventListener("click", clic); lista.addEventListener("click", clic);
    svg.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.closest(".pin")) { e.preventDefault(); clic(e); } });
    $("#filtrosMapa").addEventListener("click", function (e) {
      var b = e.target.closest(".chip"); if (!b) return;
      $$(".chip", this).forEach(function (c) { c.classList.toggle("activo", c === b); });
      var t = b.dataset.tipo;
      $$(".pin", svg).forEach(function (p) { p.classList.toggle("oculto", !(t === "todos" || p.dataset.tipo === t)); });
      $$("li", lista).forEach(function (li) { li.hidden = !(t === "todos" || li.dataset.tipo === t); });
      var primero = lugares.findIndex(function (l) { return t === "todos" || l.tipo === t; });
      if (primero > -1) ver(primero);
    });
    ver(0);
  })();

  /* ---------- Trivia ---------- */
  (function trivia() {
    var preguntas = K.trivia || [], caja = $("#trivia"), med = $("#medallas");
    var niveles = [{ min: 4, nombre: "Aprendiz del Legado" }, { min: 6, nombre: "Guardián de Chot" }, { min: preguntas.length, nombre: "Protector del Legado" }];
    var actual = 0, aciertos = 0, marcas = [];
    function medallas() {
      var mejor = leer("pdl-mejor", 0);
      med.innerHTML = niveles.map(function (n) {
        return '<div class="medalla' + (mejor >= n.min ? " ganada" : "") + '"><span class="medalla__disco"><i></i></span>' + esc(n.nombre) + "<br><small>" + n.min + "+ aciertos</small></div>";
      }).join("");
    }
    function prog() {
      return '<div class="trivia__prog" aria-hidden="true">' + preguntas.map(function (_, i) {
        return "<i class=\"" + (marcas[i] === true ? "ok" : marcas[i] === false ? "mal" : i === actual ? "ahora" : "") + "\"></i>";
      }).join("") + "</div>";
    }
    function pregunta() {
      var q = preguntas[actual];
      caja.innerHTML = prog() + '<p class="trivia__num">Pregunta ' + (actual + 1) + " de " + preguntas.length + "</p><h3>" + esc(q.pregunta) + "</h3>" +
        '<div class="opciones">' + q.opciones.map(function (o, i) { return '<button class="opcion" type="button" data-o="' + i + '">' + esc(o) + "</button>"; }).join("") + "</div>";
    }
    function responder(o) {
      var q = preguntas[actual], ok = o === q.correcta;
      marcas[actual] = ok; if (ok) aciertos++;
      $$(".opcion", caja).forEach(function (b) {
        b.disabled = true; var n = +b.dataset.o;
        if (n === q.correcta) b.classList.add("correcta"); else if (n === o) b.classList.add("incorrecta");
      });
      $(".trivia__prog", caja).outerHTML = prog();
      var ult = actual === preguntas.length - 1;
      caja.insertAdjacentHTML("beforeend", '<p class="trivia__exp"><strong>' + (ok ? "¡Correcto! " : "Casi. ") + "</strong>" + esc(q.explicacion) + "</p>" +
        '<button class="btn btn--oro" type="button" data-sig="1">' + (ult ? "Ver resultado" : "Siguiente") + "</button>");
      $("[data-sig]", caja).focus();
    }
    function fin() {
      var mejor = Math.max(leer("pdl-mejor", 0), aciertos); guardar("pdl-mejor", mejor);
      var ganada = niveles.filter(function (n) { return aciertos >= n.min; }).pop();
      var hashtag = (C.sitio && C.sitio.hashtag) || "";
      var msg = "Saqué " + aciertos + "/" + preguntas.length + " en la trivia de Protectores del Legado" + (ganada ? " y gané la medalla " + ganada.nombre : "") + ". " + hashtag;
      caja.innerHTML = prog() + '<div class="trivia__fin"><p class="trivia__num">Tu resultado</p><p class="trivia__puntaje">' + aciertos + "/" + preguntas.length + "</p>" +
        "<h3>" + (ganada ? "Ganaste: " + esc(ganada.nombre) : "Sigue explorando y vuelve a intentarlo") + "</h3>" +
        '<p>Comparte tu resultado en historias y etiquétanos con <strong>' + esc(hashtag) + "</strong>.</p>" +
        '<div class="portada__acciones"><button class="btn btn--oro" type="button" data-copiar="' + esc(msg) + '">Copiar mi resultado</button>' +
        '<button class="btn btn--linea" type="button" data-reiniciar="1">Jugar otra vez</button></div></div>';
      medallas();
    }
    caja.addEventListener("click", function (e) {
      var o = e.target.closest(".opcion");
      if (o && !o.disabled) return responder(+o.dataset.o);
      if (e.target.closest("[data-sig]")) { actual++; return actual < preguntas.length ? pregunta() : fin(); }
      if (e.target.closest("[data-reiniciar]")) { actual = 0; aciertos = 0; marcas = []; return pregunta(); }
      var cp = e.target.closest("[data-copiar]"); if (cp) copiar(cp.dataset.copiar, cp);
    });
    medallas(); if (preguntas.length) pregunta();
  })();

  /* ---------- Comunidad ---------- */
  (function comunidad() {
    var posts = C.comunidad || [], muro = $("#muro");
    $("#hashtag").textContent = (C.sitio && C.sitio.hashtag) || "";
    muro.innerHTML = posts.length ? posts.map(function (p) {
      return '<article class="post"><span class="post__lugar">' + esc(p.lugar) + "</span><p>" + esc(p.texto) + '</p><span class="post__autor">— ' + esc(p.nombre) + "</span></article>";
    }).join("") : '<div class="muro__vacio"><strong>Aquí aparecerán las experiencias de la comunidad.</strong>Envía la tuya con el formulario y podrías ser el primer Protector del Legado en este muro.</div>';
    var f = $("#formComunidad"), msg = $("#formMsg");
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var n = $("#fNombre").value.trim(), l = $("#fLugar").value.trim(), t = $("#fTexto").value.trim();
      if (!n || !l || !t) { msg.textContent = "Completa tu nombre, el lugar y tu experiencia."; return; }
      if (!$("#fPermiso").checked) { msg.textContent = "Marca la casilla de permiso para que podamos publicarla."; return; }
      var texto = "Hola Protectores del Legado. Soy " + n + ". Visité " + l + ". " + t + " (Acepto que publiquen mi experiencia.)";
      msg.innerHTML = 'Listo. <a href="' + wa(texto) + '" target="_blank" rel="noopener" style="color:inherit;font-weight:700">Abre WhatsApp para enviarla →</a>';
    });
  })();

  /* ---------- Tienda ---------- */
  (function tienda() {
    var ic = {
      polo: '<path d="M30 18 L46 10 Q60 20 74 10 L90 18 L104 38 L88 48 L84 40 L84 100 L36 100 L36 40 L32 48 L16 38 Z"/>',
      pin: '<circle cx="60" cy="58" r="40"/>',
      sticker: '<path d="M22 22 H88 L98 32 V98 H22 Z"/>',
      llavero: '<circle cx="60" cy="22" r="10" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="60" cy="68" r="32"/>',
      vaso: '<path d="M36 14 H84 L78 104 H42 Z"/>',
      gorra: '<path d="M20 74 Q24 26 64 26 Q100 26 102 70 Z"/><path d="M58 70 H112 Q112 82 96 82 H58 Z"/>'
    };
    $("#tiendaLista").innerHTML = (C.tienda || []).map(function (p) {
      return '<article class="producto"><div class="producto__img">' + (p.imagen ? '<img src="' + esc(p.imagen) + '" alt="' + esc(p.producto) + '">' : '<svg viewBox="0 0 120 120" aria-hidden="true" style="color:var(--oro)"><g fill="var(--oro)">' + (ic[p.icono] || ic.pin) + "</g></svg>") + "</div>" +
        '<div class="producto__fila"><h3>' + esc(p.producto) + '</h3><span class="producto__precio">' + esc(p.precio || "Consultar") + "</span></div>" +
        '<p class="producto__det">' + esc(p.detalle) + "</p>" +
        '<a class="btn btn--rojo btn--chico" target="_blank" rel="noopener" href="' + wa("Hola, quiero el producto: " + p.producto) + '">Pedir por WhatsApp</a></article>';
    }).join("");
  })();

  /* ---------- Equipo, contacto y pie ---------- */
  (function nosotros() {
    $("#equipoLista").innerHTML = (C.equipo || []).map(function (p) {
      var ini = String(p.nombre || "").split(" ").slice(0, 2).map(function (x) { return x[0]; }).join("");
      return '<li class="persona"><span class="persona__foto">' + (p.foto ? '<img src="' + esc(p.foto) + '" alt="">' : esc(ini)) + "</span><div><strong>" + esc(p.nombre) + "</strong><span>" + esc(p.rol) + "</span></div></li>";
    }).join("");
    var c = C.contacto || {}, R = C.redes || {};
    var ig = R.instagram ? "@" + R.instagram.replace(/\/$/, "").split("/").pop() : "";
    var filas = [["Correo", c.correo], ["WhatsApp", c.whatsappVisible], ["Instagram", ig], ["Ciudad", c.ciudad]].filter(function (f) { return f[1]; });
    $("#contactoLista").innerHTML = filas.map(function (f) {
      return '<li><span class="k">' + f[0] + '</span><span class="v">' + esc(f[1]) + "</span>" + (f[0] !== "Ciudad" ? '<button class="copiar" type="button" data-copiar="' + esc(f[1]) + '">Copiar</button>' : "") + "</li>";
    }).join("");
    $("#pieLema").textContent = (C.sitio && C.sitio.lema) || "";
    $("#pieAnio").textContent = (C.sitio && C.sitio.anio) || "";
    var redes = [["Instagram", R.instagram], ["TikTok", R.tiktok], ["YouTube", R.youtube], ["Spotify", R.spotify], ["Facebook", R.facebook]];
    $("#redesPie").innerHTML = redes.map(function (r) {
      return r[1] ? '<a class="red" href="' + esc(r[1]) + '" target="_blank" rel="noopener">' + r[0] + "</a>" : '<span class="red red--off" title="Próximamente">' + r[0] + "</span>";
    }).join("");
  })();

  document.addEventListener("click", function (e) {
    var b = e.target.closest(".copiar"); if (b) copiar(b.dataset.copiar, b);
  });

  /* ---------- Utilidades ---------- */
  function copiar(texto, boton) {
    var orig = boton.textContent;
    var ok = function () { boton.textContent = "Copiado"; setTimeout(function () { boton.textContent = orig; }, 1600); };
    try {
      navigator.clipboard.writeText(texto).then(ok, function () { boton.textContent = "Selecciona y copia"; });
    } catch (e) { boton.textContent = "Selecciona y copia"; }
  }

  var modal = $("#modal"), ultimoFoco = null;
  function abrirVideo(titulo, id) {
    ultimoFoco = document.activeElement;
    $("#modalTitulo").textContent = titulo;
    $("#modalVideo").innerHTML = puedeIncrustar
      ? '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(ytId(id)) + '?autoplay=1&rel=0" title="' + esc(titulo) + '" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>'
      : '<div><p style="margin-bottom:14px">En la vista previa el video se abre en YouTube. En tu dominio se reproducirá aquí mismo.</p><a class="btn btn--oro" href="' + yt(id) + '" target="_blank" rel="noopener">Abrir en YouTube</a></div>';
    modal.hidden = false; $("#modalCerrar").focus();
  }
  function cerrar() { modal.hidden = true; $("#modalVideo").innerHTML = ""; if (ultimoFoco) ultimoFoco.focus(); }
  $("#modalCerrar").addEventListener("click", cerrar);
  modal.addEventListener("click", function (e) { if (e.target === modal) cerrar(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !modal.hidden) cerrar(); });
}
})();
