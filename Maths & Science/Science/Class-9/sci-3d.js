/* Shared 3D "studio" scaffolding for AIkiPadhai science models (needs THREE r128 loaded first).
   Backward compatible with the original API:
   Sci3D({ title, back:{href,label}, intro:{name,desc}, camZ,
           data:{ key:{ emoji,name,nick,desc, stats:[[label,value],...] } },   // stats optional
           controls:[{id,label,min,max,step,value,on:function(v,ctx){}}],
           build:function(ctx){...}, onFrame:function(t,ctx){}, pickHint });
   ctx = { THREE, scene, pivot, mat, addPart, model, selectKey } */
(function () {
  var CSS = ''
    + '*{box-sizing:border-box;margin:0;padding:0}'
    + 'body{font-family:"Segoe UI",system-ui,sans-serif;background:radial-gradient(circle at 50% 25%,#123b52,#050d14);color:#e2e8f0;min-height:100vh;overflow:hidden}'
    + '#s3-stage{position:fixed;inset:0;z-index:1;touch-action:none;cursor:grab}#s3-stage:active{cursor:grabbing}'
    + '.s3-glass{background:rgba(9,20,30,.82);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.12);box-shadow:0 12px 34px rgba(0,0,0,.45)}'
    /* header */
    + '.s3-top{position:fixed;top:0;left:0;right:0;z-index:8;display:flex;align-items:center;justify-content:space-between;padding:11px 16px;gap:10px;background:rgba(4,12,18,.72);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,.08)}'
    + '.s3-top a.back{color:#a7f3d0;text-decoration:none;border:1px solid rgba(167,243,208,.4);padding:7px 13px;border-radius:9px;font-size:13px;font-weight:600;white-space:nowrap}'
    + '.s3-top a.back:hover{background:rgba(167,243,208,.12)}'
    + '.s3-title{font-size:16px;font-weight:800;color:#fff;text-align:center;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
    /* panels */
    + '.s3-side{position:fixed;top:62px;bottom:70px;left:12px;width:224px;border-radius:16px;padding:14px;z-index:7;overflow-y:auto}'
    + '.s3-panel{position:fixed;top:62px;right:12px;width:300px;max-height:calc(100vh - 140px);border-radius:16px;padding:18px;z-index:7;overflow-y:auto}'
    + '.s3-h{font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:#5eead4;font-weight:800;margin-bottom:9px}'
    + '.s3-part{display:flex;align-items:center;gap:9px;width:100%;text-align:left;background:rgba(255,255,255,.05);border:1.5px solid transparent;color:#cbd5e1;padding:8px 9px;border-radius:10px;margin-bottom:6px;cursor:pointer;font-size:13px;font-family:inherit;transition:background .15s,border-color .15s}'
    + '.s3-part:hover{background:rgba(255,255,255,.1);color:#fff}'
    + '.s3-part.on{border-color:#34d399;background:rgba(52,211,153,.16);color:#fff}'
    + '.s3-part .e{font-size:17px;flex:0 0 auto}'
    + '.s3-part .t{overflow:hidden}.s3-part .t b{display:block;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
    + '.s3-part .t i{font-style:normal;font-size:11px;color:#94a3b8;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
    + '.s3-panel .emoji{font-size:36px;line-height:1}.s3-panel h2{color:#fff;font-size:19px;margin:6px 0 4px}'
    + '.s3-panel .nick{display:inline-block;background:#10b981;color:#04241c;font-size:11px;font-weight:800;padding:3px 11px;border-radius:999px;margin-bottom:10px}'
    + '.s3-panel p{color:#cbd5e1;font-size:14px;line-height:1.65}.s3-panel .ph{color:#7d8ea3;font-style:italic}'
    + '.s3-stats{margin-top:12px;border-top:1px solid rgba(255,255,255,.12);padding-top:10px}'
    + '.s3-stats div{display:flex;justify-content:space-between;gap:10px;font-size:12.5px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.06)}'
    + '.s3-stats span{color:#94a3b8}.s3-stats b{color:#fff;font-weight:600;text-align:right}'
    + '.s3-ctrls{margin-top:14px;border-top:1px solid rgba(255,255,255,.12);padding-top:12px}'
    + '.s3-ctrls label{font-size:12px;color:#94a3b8;display:block;margin-bottom:4px}'
    + '.s3-ctrls input[type=range]{width:100%;accent-color:#34d399;margin-bottom:10px}'
    /* toolbar */
    + '.s3-bar{position:fixed;left:50%;transform:translateX(-50%);bottom:14px;z-index:9;display:flex;gap:5px;padding:7px;border-radius:14px;flex-wrap:wrap;justify-content:center;max-width:calc(100vw - 24px)}'
    + '.s3-bar button{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);color:#cbd5e1;padding:8px 12px;border-radius:9px;cursor:pointer;font-size:12.5px;font-family:inherit;font-weight:600;white-space:nowrap;transition:background .15s,color .15s,border-color .15s}'
    + '.s3-bar button:hover{background:rgba(255,255,255,.16);color:#fff}'
    + '.s3-bar button.on{background:rgba(52,211,153,.22);border-color:#34d399;color:#fff}'
    + '.s3-bar .sep{width:1px;background:rgba(255,255,255,.15);margin:4px 3px}'
    /* misc */
    + '.s3-hint{position:fixed;left:50%;transform:translateX(-50%);bottom:62px;z-index:6;background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.12);border-radius:999px;padding:6px 15px;font-size:12px;color:#cbd5e1;pointer-events:none;transition:opacity .4s}'
    + '.s3-toast{position:fixed;left:50%;transform:translateX(-50%);top:70px;z-index:12;background:rgba(16,185,129,.95);color:#04241c;font-weight:700;font-size:13px;padding:9px 18px;border-radius:999px;opacity:0;transition:opacity .3s;pointer-events:none}'
    + '.s3-toast.show{opacity:1}'
    + '#s3-fallback{position:fixed;inset:0;z-index:20;display:none;align-items:center;justify-content:center;text-align:center;padding:30px;background:#050d14}#s3-fallback a{color:#34d399;font-weight:700}'
    + '.s3-drawer{display:none}'
    /* mobile */
    + '@media(max-width:900px){'
    + '.s3-side{top:auto;bottom:64px;left:8px;right:8px;width:auto;max-height:44vh;display:none}'
    + '.s3-panel{top:auto;bottom:64px;left:8px;right:8px;width:auto;max-height:46vh;display:none}'
    + '.s3-side.open,.s3-panel.open{display:block}'
    + '.s3-hint{display:none}'
    + '.s3-drawer{display:inline-block}'
    + '.s3-bar{bottom:8px;padding:6px}.s3-bar button{padding:7px 9px;font-size:11.5px}'
    + '}';

  window.Sci3D = function (cfg) {
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var data = cfg.data || {};
    var keys = Object.keys(data);

    var partsHtml = '';
    keys.forEach(function (k) {
      var d = data[k];
      partsHtml += '<button class="s3-part" data-k="' + k + '"><span class="e">' + (d.emoji || '🔹') + '</span>' +
        '<span class="t"><b>' + d.name + '</b>' + (d.nick ? '<i>' + d.nick + '</i>' : '') + '</span></button>';
    });
    var ctrlsHtml = '';
    (cfg.controls || []).forEach(function (c) {
      ctrlsHtml += '<label>' + c.label + '</label><input type="range" id="' + c.id + '" min="' + c.min +
        '" max="' + c.max + '" step="' + (c.step || 1) + '" value="' + c.value + '">';
    });

    document.body.innerHTML =
      '<div id="s3-stage"></div>' +
      '<div class="s3-top"><a class="back" href="' + cfg.back.href + '">← ' + cfg.back.label + '</a>' +
      '<div class="s3-title">' + cfg.title + '</div>' +
      '<span style="width:70px"></span></div>' +

      '<div class="s3-side s3-glass" id="s3-side">' +
      (partsHtml ? '<div class="s3-h">Parts</div>' + partsHtml : '') +
      (ctrlsHtml ? '<div class="s3-ctrls"><div class="s3-h">Controls</div>' + ctrlsHtml + '</div>' : '') +
      '</div>' +

      '<div class="s3-panel s3-glass" id="s3-panel">' +
      '<div class="s3-h">Details</div>' +
      '<div id="s3-emoji" class="emoji">👋</div><h2 id="s3-name">' + cfg.intro.name + '</h2>' +
      '<span id="s3-nick" class="nick" style="display:none"></span>' +
      '<p id="s3-desc" class="ph">' + cfg.intro.desc + '</p>' +
      '<div id="s3-stats" class="s3-stats" style="display:none"></div>' +
      '</div>' +

      '<div class="s3-bar s3-glass">' +
      '<button class="s3-drawer" id="s3-bParts">☰ Parts</button>' +
      '<button class="s3-drawer" id="s3-bInfo">ℹ️ Info</button>' +
      '<button id="s3-bIso">🎯 Isolate</button>' +
      '<button id="s3-bAll">👁️ Show all</button>' +
      '<span class="sep"></span>' +
      '<button id="s3-bIn">＋</button><button id="s3-bOut">－</button>' +
      '<button id="s3-bReset">↺ Reset view</button>' +
      '<span class="sep"></span>' +
      '<button id="s3-bSpin">🔄 Auto-rotate</button>' +
      '<button id="s3-bShot">📷</button>' +
      '</div>' +

      '<div class="s3-hint" id="s3-hint">🖱️ Drag = ghumao • Scroll = zoom' + (cfg.pickHint === false ? '' : ' • Tap part = jaano') + '</div>' +
      '<div class="s3-toast" id="s3-toast"></div>' +
      '<div id="s3-fallback"><div><h2 style="color:#fff;margin-bottom:10px">3D load nahi ho paaya 😕</h2>' +
      '<p style="color:#cbd5e1;max-width:420px;margin:0 auto 16px">Shayad internet slow hai ya device purana hai. Lesson mein wapas jaao - wahan diagram aur explanation mojood hai.</p>' +
      '<a href="' + cfg.back.href + '">← ' + cfg.back.label + '</a></div></div>';

    if (typeof THREE === 'undefined') { document.getElementById('s3-fallback').style.display = 'flex'; return; }

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 400);
    var baseZ = cfg.camZ || 16;
    camera.position.set(0, 0, baseZ);
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); }
    catch (e) { document.getElementById('s3-fallback').style.display = 'flex'; return; }
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('s3-stage').appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.72));
    var d1 = new THREE.DirectionalLight(0xffffff, 0.95); d1.position.set(6, 8, 10); scene.add(d1);
    var d2 = new THREE.DirectionalLight(0x88ccff, 0.42); d2.position.set(-8, -4, -6); scene.add(d2);
    var d3 = new THREE.DirectionalLight(0xffd9a0, 0.3); d3.position.set(0, -9, 4); scene.add(d3);

    var pivot = new THREE.Group(); scene.add(pivot);
    var clickable = [], mats = [];

    function mat(hex, o) {
      o = o || {};
      var m = new THREE.MeshPhongMaterial({
        color: hex, shininess: 55,
        transparent: !!o.transparent,
        opacity: o.opacity == null ? 1 : o.opacity
      });
      mats.push(m); return m;
    }
    function addPart(obj, key) {
      obj.userData.key = key;
      obj.traverse(function (n) {
        if (n.isMesh) { n.userData.key = key; if (!n.userData.be) n.userData.be = n.material.emissive ? n.material.emissive.getHex() : 0; }
      });
      clickable.push(obj);
    }
    var ctx = { THREE: THREE, scene: scene, pivot: pivot, mat: mat, addPart: addPart, model: {} };
    ctx.renderer = renderer; ctx.camera = camera;   // for clipping planes / advanced labs
    ctx.selectKey = function (k) { selectKey(k); };   // available inside build() too
    cfg.build(ctx);

    (cfg.controls || []).forEach(function (c) {
      var el = document.getElementById(c.id);
      if (!el) return;
      el.addEventListener('input', function () { c.on(parseFloat(el.value), ctx); });
      c.on(parseFloat(el.value), ctx);
    });

    /* ---------- selection ---------- */
    var raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
    var current = null;
    function clearHi() {
      clickable.forEach(function (o) {
        o.traverse(function (n) { if (n.isMesh && n.material.emissive) n.material.emissive.setHex(n.userData.be || 0); });
      });
    }
    function selectKey(key) {
      if (!data[key]) return;
      current = key;
      clearHi();
      clickable.forEach(function (o) {
        if (o.userData.key === key) o.traverse(function (n) { if (n.isMesh && n.material.emissive) n.material.emissive.setHex(0xffee44); });
      });
      var d = data[key];
      document.getElementById('s3-emoji').textContent = d.emoji || '🔎';
      document.getElementById('s3-name').textContent = d.name;
      var nk = document.getElementById('s3-nick');
      if (d.nick) { nk.textContent = d.nick; nk.style.display = 'inline-block'; } else { nk.style.display = 'none'; }
      var ds = document.getElementById('s3-desc'); ds.textContent = d.desc; ds.classList.remove('ph');
      var sb = document.getElementById('s3-stats');
      if (d.stats && d.stats.length) {
        sb.innerHTML = d.stats.map(function (r) { return '<div><span>' + r[0] + '</span><b>' + r[1] + '</b></div>'; }).join('');
        sb.style.display = 'block';
      } else { sb.style.display = 'none'; }
      Array.prototype.forEach.call(document.querySelectorAll('.s3-part'), function (b) {
        b.className = 's3-part' + (b.dataset.k === key ? ' on' : '');
      });
      if (isolated) applyIsolate();
    }

    Array.prototype.forEach.call(document.querySelectorAll('.s3-part'), function (b) {
      b.addEventListener('click', function () {
        selectKey(b.dataset.k);
        if (window.innerWidth <= 900) { closeDrawers(); openDrawer('s3-panel'); }
      });
    });

    /* ---------- isolate / show all ---------- */
    var isolated = false;
    function applyIsolate() {
      clickable.forEach(function (o) { o.visible = (o.userData.key === current); });
    }
    function showAll() {
      isolated = false;
      clickable.forEach(function (o) { o.visible = true; });
      document.getElementById('s3-bIso').classList.remove('on');
    }
    document.getElementById('s3-bIso').addEventListener('click', function () {
      if (!current) { toast('Pehle koi part chuno'); return; }
      isolated = !isolated;
      this.classList.toggle('on', isolated);
      if (isolated) applyIsolate(); else showAll();
    });
    document.getElementById('s3-bAll').addEventListener('click', showAll);

    /* ---------- view controls ---------- */
    function setZoom(z) { camera.position.z = Math.max(baseZ * 0.35, Math.min(baseZ * 2.4, z)); }
    document.getElementById('s3-bIn').addEventListener('click', function () { setZoom(camera.position.z - baseZ * 0.15); });
    document.getElementById('s3-bOut').addEventListener('click', function () { setZoom(camera.position.z + baseZ * 0.15); });
    document.getElementById('s3-bReset').addEventListener('click', function () {
      pivot.rotation.set(0, 0, 0); pivot.position.set(0, 0, 0);
      camera.position.set(0, 0, baseZ); vx = vy = 0; showAll();
    });
    var spin = false;
    document.getElementById('s3-bSpin').addEventListener('click', function () {
      spin = !spin; this.classList.toggle('on', spin);
    });
    document.getElementById('s3-bShot').addEventListener('click', function () {
      try {
        renderer.render(scene, camera);
        var a = document.createElement('a');
        a.download = (cfg.title || 'model').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').toLowerCase() + '.png';
        a.href = renderer.domElement.toDataURL('image/png');
        a.click(); toast('Screenshot save ho gaya 📷');
      } catch (e) { toast('Screenshot nahi ho paaya'); }
    });

    var toastT;
    function toast(msg) {
      var el = document.getElementById('s3-toast');
      el.textContent = msg; el.classList.add('show');
      clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove('show'); }, 1800);
    }

    /* ---------- mobile drawers ---------- */
    function closeDrawers() {
      document.getElementById('s3-side').classList.remove('open');
      document.getElementById('s3-panel').classList.remove('open');
    }
    function openDrawer(id) { document.getElementById(id).classList.add('open'); }
    document.getElementById('s3-bParts').addEventListener('click', function () {
      var s = document.getElementById('s3-side'), was = s.classList.contains('open');
      closeDrawers(); if (!was) s.classList.add('open');
    });
    document.getElementById('s3-bInfo').addEventListener('click', function () {
      var p = document.getElementById('s3-panel'), was = p.classList.contains('open');
      closeDrawers(); if (!was) p.classList.add('open');
    });

    /* ---------- pointer: rotate / pan / pick ---------- */
    var isDown = false, moved = false, panning = false, lx = 0, ly = 0, vx = 0, vy = 0;
    var el = renderer.domElement;
    el.addEventListener('pointerdown', function (e) {
      isDown = true; moved = false; lx = e.clientX; ly = e.clientY;
      panning = e.ctrlKey || e.shiftKey || e.button === 1;
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', function (e) {
      if (!isDown) return;
      var dx = e.clientX - lx, dy = e.clientY - ly;
      if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
      if (panning) {
        pivot.position.x += dx * 0.015 * (camera.position.z / baseZ);
        pivot.position.y -= dy * 0.015 * (camera.position.z / baseZ);
      } else {
        pivot.rotation.y += dx * 0.008; pivot.rotation.x += dy * 0.008;
        pivot.rotation.x = Math.max(-1.3, Math.min(1.3, pivot.rotation.x));
        vx = dx * 0.008; vy = dy * 0.008;
      }
      lx = e.clientX; ly = e.clientY;
    });
    function up(e) {
      if (!isDown) return; isDown = false;
      var hint = document.getElementById('s3-hint'); if (hint) hint.style.opacity = '0';
      if (!moved && keys.length) {
        var rect = el.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        var hits = raycaster.intersectObjects(clickable, true);
        if (hits.length) {
          var o = hits[0].object; while (o && !o.userData.key) o = o.parent;
          if (o && o.userData.key) selectKey(o.userData.key);
        }
      }
    }
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', function (e) {
      e.preventDefault();
      setZoom(camera.position.z + (e.deltaY > 0 ? 1 : -1) * baseZ * 0.08);
    }, { passive: false });

    window.addEventListener('resize', function () {
      camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    var clock = new THREE.Clock();
    (function loop() {
      requestAnimationFrame(loop);
      var t = clock.getElapsedTime();
      if (spin) pivot.rotation.y += 0.004;
      if (!isDown) {
        pivot.rotation.y += vx; pivot.rotation.x += vy; vx *= 0.94; vy *= 0.94;
        pivot.rotation.x = Math.max(-1.3, Math.min(1.3, pivot.rotation.x));
      }
      if (cfg.onFrame) cfg.onFrame(t, ctx);
      renderer.render(scene, camera);
    })();
  };
})();
