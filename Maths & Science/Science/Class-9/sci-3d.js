/* Shared 3D scaffolding for AIkiPadhai science models (needs THREE r128 loaded first).
   Usage: Sci3D({ title, back:{href,label}, intro:{name,desc}, data:{key:{emoji,name,nick,desc}},
                  camZ, build:function(ctx){...}, controls:[{id,label,min,max,step,value,on:function(v,ctx){}}],
                  onFrame:function(t,ctx){} }); */
(function () {
  var CSS = ''
    + '*{box-sizing:border-box;margin:0;padding:0}'
    + 'body{font-family:"Segoe UI",system-ui,sans-serif;background:radial-gradient(circle at 50% 30%,#123b52,#06121c);color:#e2e8f0;min-height:100vh;overflow:hidden}'
    + '.s3-top{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;background:rgba(0,0,0,.35);position:relative;z-index:5;flex-wrap:wrap;gap:10px}'
    + '.s3-top a.back{color:#a7f3d0;text-decoration:none;border:1px solid rgba(167,243,208,.4);padding:7px 14px;border-radius:8px;font-size:14px;font-weight:600}'
    + '.s3-top a.back:hover{background:rgba(167,243,208,.12)}'
    + '.s3-title{font-size:18px;font-weight:800;color:#fff}'
    + '#s3-stage{position:fixed;inset:0;z-index:1;touch-action:none;cursor:grab}#s3-stage:active{cursor:grabbing}'
    + '.s3-panel{position:fixed;top:74px;right:16px;width:320px;max-width:calc(100vw - 32px);background:rgba(8,20,28,.9);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:20px;z-index:6;box-shadow:0 12px 30px rgba(0,0,0,.5)}'
    + '.s3-panel .emoji{font-size:40px}.s3-panel h2{color:#fff;font-size:20px;margin:6px 0 4px}'
    + '.s3-panel .nick{display:inline-block;background:#10b981;color:#04241c;font-size:12px;font-weight:800;padding:3px 12px;border-radius:999px;margin-bottom:10px}'
    + '.s3-panel p{color:#cbd5e1;font-size:15px;line-height:1.65}.s3-panel .ph{color:#64748b;font-style:italic}'
    + '.s3-ctrls{margin-top:16px;border-top:1px solid rgba(255,255,255,.12);padding-top:14px}'
    + '.s3-ctrls label{font-size:13px;color:#94a3b8;display:block;margin-bottom:4px}'
    + '.s3-ctrls input[type=range]{width:100%;accent-color:#34d399;margin-bottom:10px}'
    + '.s3-hud{position:fixed;left:0;right:0;bottom:0;z-index:4;display:flex;justify-content:center;pointer-events:none;padding:14px}'
    + '.s3-hint{background:rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.12);border-radius:999px;padding:8px 18px;font-size:13px;color:#cbd5e1}'
    + '#s3-fallback{position:fixed;inset:0;z-index:20;display:none;align-items:center;justify-content:center;text-align:center;padding:30px;background:#06121c}#s3-fallback a{color:#34d399;font-weight:700}'
    + '@media(max-width:720px){.s3-panel{position:fixed;top:auto;bottom:64px;right:8px;left:8px;width:auto;padding:16px}.s3-hud{display:none}}';

  window.Sci3D = function (cfg) {
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var ctrlsHtml = '';
    (cfg.controls || []).forEach(function (c) {
      ctrlsHtml += '<label>' + c.label + '</label><input type="range" id="' + c.id + '" min="' + c.min + '" max="' + c.max + '" step="' + (c.step || 1) + '" value="' + c.value + '">';
    });
    document.body.innerHTML =
      '<div class="s3-top"><a class="back" href="' + cfg.back.href + '">← ' + cfg.back.label + '</a>' +
      '<div class="s3-title">' + cfg.title + '</div><span style="width:60px"></span></div>' +
      '<div id="s3-stage"></div>' +
      '<div class="s3-panel"><div id="s3-emoji" class="emoji">👋</div><h2 id="s3-name">' + cfg.intro.name + '</h2>' +
      '<span id="s3-nick" class="nick" style="display:none"></span>' +
      '<p id="s3-desc" class="ph">' + cfg.intro.desc + '</p>' +
      (ctrlsHtml ? '<div class="s3-ctrls">' + ctrlsHtml + '</div>' : '') + '</div>' +
      '<div class="s3-hud"><div class="s3-hint">🖱️ Drag = ghumao' + (cfg.pickHint === false ? '' : ' • 👆 Tap part = jaano') + '</div></div>' +
      '<div id="s3-fallback"><div><h2 style="color:#fff;margin-bottom:10px">3D load nahi ho paaya 😕</h2>' +
      '<p style="color:#cbd5e1;max-width:420px;margin:0 auto 16px">Shayad internet slow hai ya device purana hai. Lesson mein wapas jaao - wahan diagram aur explanation mojood hai.</p>' +
      '<a href="' + cfg.back.href + '">← ' + cfg.back.label + '</a></div></div>';

    if (typeof THREE === 'undefined') { document.getElementById('s3-fallback').style.display = 'flex'; return; }

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, cfg.camZ || 16);
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
    catch (e) { document.getElementById('s3-fallback').style.display = 'flex'; return; }
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('s3-stage').appendChild(renderer.domElement);
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    var d1 = new THREE.DirectionalLight(0xffffff, 0.9); d1.position.set(6, 8, 10); scene.add(d1);
    var d2 = new THREE.DirectionalLight(0x88ccff, 0.4); d2.position.set(-8, -4, -6); scene.add(d2);

    var pivot = new THREE.Group(); scene.add(pivot);
    var clickable = [];
    function mat(hex, o) { o = o || {}; return new THREE.MeshPhongMaterial({ color: hex, shininess: 55, transparent: !!o.transparent, opacity: o.opacity == null ? 1 : o.opacity }); }
    function addPart(obj, key) {
      obj.userData.key = key;
      obj.traverse(function (n) { if (n.isMesh) { n.userData.key = key; if (!n.userData.be) n.userData.be = n.material.emissive ? n.material.emissive.getHex() : 0; } });
      clickable.push(obj);
    }
    var ctx = { THREE: THREE, scene: scene, pivot: pivot, mat: mat, addPart: addPart, model: {} };
    cfg.build(ctx);

    // wire control sliders
    (cfg.controls || []).forEach(function (c) {
      var el = document.getElementById(c.id);
      el.addEventListener('input', function () { c.on(parseFloat(el.value), ctx); });
      c.on(parseFloat(el.value), ctx); // apply initial
    });

    var raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
    function clearHi() { clickable.forEach(function (o) { o.traverse(function (n) { if (n.isMesh && n.material.emissive) n.material.emissive.setHex(n.userData.be || 0); }); }); }
    function selectKey(key) {
      if (!cfg.data || !cfg.data[key]) return;
      clearHi();
      clickable.forEach(function (o) { if (o.userData.key === key) o.traverse(function (n) { if (n.isMesh && n.material.emissive) n.material.emissive.setHex(0xffee44); }); });
      var d = cfg.data[key];
      document.getElementById('s3-emoji').textContent = d.emoji || '🔎';
      document.getElementById('s3-name').textContent = d.name;
      var nk = document.getElementById('s3-nick');
      if (d.nick) { nk.textContent = d.nick; nk.style.display = 'inline-block'; } else { nk.style.display = 'none'; }
      var ds = document.getElementById('s3-desc'); ds.textContent = d.desc; ds.classList.remove('ph');
    }
    ctx.selectKey = selectKey;

    var isDown = false, moved = false, lx = 0, ly = 0, vx = 0, vy = 0, autoRotate = cfg.autoRotate !== false, idle = null;
    var el = renderer.domElement;
    el.addEventListener('pointerdown', function (e) { isDown = true; moved = false; lx = e.clientX; ly = e.clientY; autoRotate = false; el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointermove', function (e) {
      if (!isDown) return;
      var dx = e.clientX - lx, dy = e.clientY - ly;
      if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
      pivot.rotation.y += dx * 0.008; pivot.rotation.x += dy * 0.008;
      pivot.rotation.x = Math.max(-1.3, Math.min(1.3, pivot.rotation.x));
      vx = dx * 0.008; vy = dy * 0.008; lx = e.clientX; ly = e.clientY;
    });
    function up(e) {
      if (!isDown) return; isDown = false;
      if (!moved && cfg.data) {
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
      if (idle) clearTimeout(idle);
      idle = setTimeout(function () { autoRotate = true; }, 3500);
    }
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);

    window.addEventListener('resize', function () {
      camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    var clock = new THREE.Clock();
    (function loop() {
      requestAnimationFrame(loop);
      var t = clock.getElapsedTime();
      if (autoRotate) pivot.rotation.y += 0.0035;
      else if (!isDown) { pivot.rotation.y += vx; pivot.rotation.x += vy; vx *= 0.94; vy *= 0.94; pivot.rotation.x = Math.max(-1.3, Math.min(1.3, pivot.rotation.x)); }
      if (cfg.onFrame) cfg.onFrame(t, ctx);
      renderer.render(scene, camera);
    })();
  };
})();
