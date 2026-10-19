/* ============================================================
   MENÚ DE PREGUNTAS DE SUPERVIVENCIA - TEACHER MARISOL
   Uso: agregar esta línea al final del <body>, DESPUÉS del
   <script> principal de la lección:

   <script src="marisol-menu.js" data-menu="basic"></script>

   data-menu="basic" -> 6 opciones (lecciones 1 a 10)
   data-menu="full"  -> 10 opciones (lecciones 11 a 20)
   ============================================================ */
(function () {
  var script = document.currentScript;
  var mode = (script && script.getAttribute('data-menu')) || 'basic';

  /* pre = texto antes del cursor, post = texto después del cursor */
  var ITEMS = {
    say:        { type: 'fill',   en: 'How do you say… in English?',  es: '¿Cómo se dice… en inglés?',        pre: 'How do you say ',               post: ' in English?' },
    mean:       { type: 'fill',   en: 'What does… mean?',             es: '¿Qué significa…?',                 pre: 'What does ',                    post: ' mean?' },
    pronounce:  { type: 'fill',   en: 'How do you pronounce…?',       es: '¿Cómo se pronuncia…?',             pre: 'How do you pronounce ',         post: '?' },
    spell:      { type: 'fill',   en: 'How do you spell…?',           es: '¿Cómo se escribe…?',               pre: 'How do you spell ',             post: '?' },
    example:    { type: 'fill',   en: 'Can you give me an example?',  es: '¿Me das un ejemplo?',              pre: 'Can you give me an example of ', post: '?' },
    difference: { type: 'fill',   en: "What's the difference between… and…?", es: '¿Cuál es la diferencia entre… y…?', pre: 'What is the difference between ', post: ' and ?' },
    correct:    { type: 'fill',   en: 'Is my sentence correct?',      es: '¿Está correcta mi oración?',       pre: 'Is this sentence correct: ',    post: '' },
    repeat:     { type: 'repeat', en: 'Can you repeat that, please?', es: '¿Puedes repetirlo, por favor?' },
    slow:       { type: 'slow',   en: 'Can you speak more slowly?',   es: '¿Puedes hablar más despacio?' },
    other:      { type: 'other',  en: 'I have another question.',     es: 'Tengo otra pregunta.' }
  };

  var ORDER = {
    basic: ['say', 'mean', 'pronounce', 'repeat', 'slow', 'other'],
    full:  ['say', 'mean', 'pronounce', 'spell', 'example', 'difference', 'correct', 'repeat', 'slow', 'other']
  };
  var keys = ORDER[mode] || ORDER.basic;

  var box = document.getElementById('marisol-chat-box');
  if (!box) { return; }
  var footer = box.querySelector('.marisol-chat-footer');
  var input = document.getElementById('marisol-user-input');
  if (!footer || !input) { return; }

  /* ---------- Estilos ----------
     La ventana del chat nunca puede ser más alta que la pantalla:
     el encabezado (detener voz, idioma, cerrar) y el campo de texto
     siempre quedan visibles; lo que se encoge es la zona de mensajes. */
  var style = document.createElement('style');
  style.textContent =
    '#marisol-chat-box{max-height:calc(100vh - 120px);}' +
    '#marisol-chat-box .marisol-chat-header{flex-shrink:0;}' +
    '#marisol-chat-box .marisol-chat-body{height:230px;min-height:90px;flex:0 1 auto;}' +
    '#marisol-chat-box .marisol-chat-footer{flex-shrink:0;}' +
    '#marisol-menu{flex:0 0 auto;padding:4px 10px 8px;background:#f1f5f9;border-top:1px solid #e2e8f0;}' +
    '#marisol-menu .mm-toggle{display:flex;align-items:center;justify-content:space-between;width:100%;margin:0;padding:4px 2px;background:none;border:none;color:#475569;font-family:inherit;font-size:11px;font-weight:700;text-align:left;cursor:pointer;}' +
    '#marisol-menu .mm-chevron{font-size:11px;transition:transform .2s;}' +
    '#marisol-menu.mm-collapsed .mm-chevron{transform:rotate(-90deg);}' +
    '#marisol-menu.mm-collapsed .mm-grid{display:none;}' +
    '#marisol-menu .mm-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:4px;max-height:160px;overflow-y:auto;}' +
    '#marisol-menu .mm-btn{margin:0;padding:6px 8px;border-radius:10px;border:1px solid #cbd5e1;background:#ffffff;color:#123c69;font-family:inherit;font-size:11px;font-weight:600;line-height:1.25;text-align:left;cursor:pointer;}' +
    '#marisol-menu .mm-btn:hover{background:#e0f2fe;}' +
    '#marisol-menu .mm-btn:focus-visible,#marisol-menu .mm-toggle:focus-visible{outline:2px solid #0ea5e9;outline-offset:1px;}' +
    '#marisol-menu .mm-es{display:block;font-size:10px;font-weight:400;color:#64748b;}' +
    '#marisol-menu .mm-other{background:#123c69;color:#ffffff;border-color:#123c69;}' +
    '#marisol-menu .mm-other:hover{background:#0d2b4a;}' +
    '#marisol-menu .mm-other .mm-es{color:#cbd5e1;}' +
    '@media (max-width:420px){#marisol-chat-box{right:10px;width:calc(100vw - 20px);}}';
  document.head.appendChild(style);

  /* ---------- Menú ---------- */
  var menu = document.createElement('div');
  menu.id = 'marisol-menu';
  menu.style.display = 'none';

  var toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'mm-toggle';
  toggle.setAttribute('aria-expanded', 'true');
  var toggleText = document.createElement('span');
  toggleText.textContent = 'Quick questions (Preguntas rápidas)';
  var chevron = document.createElement('span');
  chevron.className = 'mm-chevron';
  chevron.textContent = '▾';
  toggle.appendChild(toggleText);
  toggle.appendChild(chevron);
  toggle.addEventListener('click', function () {
    var collapsed = menu.classList.toggle('mm-collapsed');
    toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  });
  menu.appendChild(toggle);

  var grid = document.createElement('div');
  grid.className = 'mm-grid';
  menu.appendChild(grid);

  keys.forEach(function (k) {
    var item = ITEMS[k];
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mm-btn' + (item.type === 'other' ? ' mm-other' : '');
    var en = document.createElement('span');
    en.textContent = item.en;
    var es = document.createElement('span');
    es.className = 'mm-es';
    es.textContent = item.es;
    btn.appendChild(en);
    btn.appendChild(es);
    btn.addEventListener('click', function () { handleClick(item); });
    grid.appendChild(btn);
  });

  footer.parentNode.insertBefore(menu, footer);

  /* ---------- Lógica ---------- */
  var lastTeacherText = '';

  function ready() {
    try { return !!(studentName && preferredLanguage); } catch (e) { return false; }
  }

  function refresh() {
    menu.style.display = ready() ? 'block' : 'none';
  }

  function speak(text, rate) {
    if (!('speechSynthesis' in window) || !text) { return; }
    window.speechSynthesis.cancel();
    var lang = 'en-US';
    try { if (preferredLanguage === 'es') { lang = 'es-MX'; } } catch (e) {}
    var u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate;
    try {
      var v = getVoiceForCharacter('Teacher Marisol', lang);
      if (v) { u.voice = v; }
    } catch (e) {}
    window.speechSynthesis.speak(u);
  }

  function handleClick(item) {
    if (typeof stopMarisolVoice === 'function') { stopMarisolVoice(); }

    if (item.type === 'fill') {
      input.value = item.pre + item.post;
      input.focus();
      var pos = item.pre.length;
      try { input.setSelectionRange(pos, pos); } catch (e) {}
      return;
    }

    if (item.type === 'other') {
      input.value = '';
      input.focus();
      return;
    }

    /* repeat / slow: se resuelven en el navegador, sin llamar a la API */
    if (!lastTeacherText) { input.focus(); return; }
    speak(lastTeacherText, item.type === 'slow' ? 0.6 : 0.9);
  }

  /* ---------- Conexión con el código existente (sin modificarlo) ---------- */
  var originalAppend = window.appendMarisolMessage;
  if (typeof originalAppend === 'function') {
    window.appendMarisolMessage = function (text, sender) {
      originalAppend(text, sender);
      if (sender === 'teacher') { lastTeacherText = text; }
      refresh();
    };
  }

  var originalToggle = window.toggleMarisolChat;
  if (typeof originalToggle === 'function') {
    window.toggleMarisolChat = function () {
      originalToggle();
      refresh();
    };
  }

  refresh();
})();
