/**
 * CHAMELEON SWITCHER ENGINE · 变色龙多形态架构前端调度器
 * 无缝连接 Spatial, Fluid, Manual, Flux 并在保留路由状态的前提下即时转场
 */
(function() {
  'use strict';

  var MODES = [
    { id: 'spatial', name: '空间', en: 'Spatial', icon: '✦', key: '1', tip: '物理弹簧 · 悬浮毛玻璃 · 视差景深' },
    { id: 'fluid',   name: '流体', en: 'Fluid',   icon: '≈', key: '2', tip: 'WebGL 流光 · 极光 Shader · 液态粘性' },
    { id: 'manual',  name: '工程', en: 'Manual',  icon: '⊞', key: '3', tip: '瑞士12栏 · 状态遥测 · CAS 调试器' },
    { id: 'flux',    name: '通量', en: 'Flux',    icon: '❖', key: '4', tip: '三位一体 · 终极融合旗舰形态' }
  ];

  // 检测当前所在的原型模式
  function getCurrentMode() {
    var p = window.location.pathname.replace(/\\/g, '/');
    for (var i = 0; i < MODES.length; i++) {
      if (p.indexOf('/' + MODES[i].id + '/') !== -1 || p.endsWith('/' + MODES[i].id)) {
        return MODES[i].id;
      }
    }
    if (p.indexOf('/paper/') !== -1) return 'paper';
    if (p.indexOf('/washi/') !== -1) return 'washi';
    return 'manual';
  }

  // 跨形态导航，保持当前 Hash 与交互状态
  function switchToMode(targetId) {
    if (targetId === getCurrentMode()) return;
    try {
      localStorage.setItem('ey-chameleon-mode', targetId);
    } catch (e) {}

    var hash = window.location.hash || '';
    var targetUrl = '../' + targetId + '/' + hash;

    if (document.startViewTransition) {
      try {
        var vt = document.startViewTransition(function() {
          window.location.href = targetUrl;
        });
        if (vt && vt.ready) vt.ready.catch(function() {});
        if (vt && vt.finished) vt.finished.catch(function() {});
      } catch (e) {
        window.location.href = targetUrl;
      }
    } else {
      window.location.href = targetUrl;
    }
  }

  function mountDock() {
    if (document.getElementById('chameleonDock')) return;
    var cur = getCurrentMode();

    var dock = document.createElement('nav');
    dock.id = 'chameleonDock';
    dock.className = 'chameleon-dock';
    dock.setAttribute('aria-label', '变色龙多形态博客切换坞');

    var brand = document.createElement('div');
    brand.className = 'chameleon-brand';
    brand.innerHTML = '<i class="chameleon-pulse" aria-hidden="true"></i><span>CHAMELEON</span>';
    dock.appendChild(brand);

    var items = document.createElement('div');
    items.className = 'chameleon-items';

    MODES.forEach(function(m) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chameleon-btn' + (cur === m.id ? ' active' : '');
      btn.dataset.mode = m.id;
      btn.title = m.en + ' (' + m.name + ') - ' + m.tip + ' [Alt+' + m.key + ']';
      btn.innerHTML = '<span class="btn-icon">' + m.icon + '</span>' +
                      '<span class="btn-name">' + m.name + '</span>' +
                      '<span class="btn-key">Alt ' + m.key + '</span>';

      btn.addEventListener('click', function(e) {
        e.preventDefault();
        switchToMode(m.id);
      });
      items.appendChild(btn);
    });

    dock.appendChild(items);
    document.body.appendChild(dock);

    // 快捷键支持 Alt+1 ~ Alt+4
    window.addEventListener('keydown', function(e) {
      if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        for (var i = 0; i < MODES.length; i++) {
          if (e.key === MODES[i].key) {
            e.preventDefault();
            switchToMode(MODES[i].id);
            break;
          }
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountDock);
  } else {
    mountDock();
  }
})();
