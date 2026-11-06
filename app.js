/* ================= 今日热榜 · 前端逻辑 =================
   纯静态：不打包、不依赖框架，直接读 sources.js 的配置。
   数据源分两类：
     ① codelife 聚合接口（自带 CORS，直连即可，国内可访问）
     ② 官方接口（Hacker News / dev.to，均带 CORS）
   任一失败只影响自己那张卡，不会拖累整页。 */
(function () {
  'use strict';
  var CATS = window.HOT_CATS, SOURCES = window.HOT_SOURCES;
  var SHOW = 10;                       // 折叠时显示条数
  var REFRESH_MS = 5 * 60 * 1000;      // 自动刷新周期：5 分钟
  var TIMEOUT = 12000;
  var API_CODELIFE = function (id) { return 'https://api.codelife.cc/api/top/list?lang=cn&id=' + encodeURIComponent(id); };
  var API_HN = 'https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=20';
  var API_DEVTO = 'https://dev.to/api/articles?top=7&per_page=20';
  var SITE_BIRTH = new Date('2026-10-15T00:00:00+08:00').getTime();

  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
  var FLAME = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/></svg>';

  /* ---------------- 取数 ---------------- */
  function getJSON(url) {
    var ctrl = ('AbortController' in window) ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, TIMEOUT);
    return fetch(url, { signal: ctrl ? ctrl.signal : undefined, headers: { Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (j) { clearTimeout(timer); return j; }, function (e) { clearTimeout(timer); throw e; });
  }
  function loadSourceOnce(src) {
    if (src.api === 'hn') {
      return getJSON(API_HN).then(function (j) {
        if (!j || !j.hits || !j.hits.length) throw new Error('数据异常');
        return j.hits.map(function (h) {
          return { title: h.title, hot: h.points, url: h.url || ('https://news.ycombinator.com/item?id=' + h.objectID) };
        });
      });
    }
    if (src.api === 'devto') {
      return getJSON(API_DEVTO).then(function (j) {
        if (!j || !j.length) throw new Error('数据异常');
        return j.map(function (a) { return { title: a.title, hot: a.positive_reactions_count, url: a.url || ('https://dev.to' + a.path) }; });
      });
    }
    return getJSON(API_CODELIFE(src.cid)).then(function (j) {
      if (!j || j.code !== 200 || !j.data || !j.data.length) throw new Error('数据异常');
      return j.data.map(function (it) {
        return { title: it.title, hot: src.nohot ? '' : it.hotValue, url: it.link };
      });
    });
  }
  /* 上游偶发空回/超时(实测豆瓣榜整块被上游清空过) —— 自动重试两次, 第二次多等一会儿 */
  function loadSource(src) {
    var tries = 0;
    function attempt() {
      tries++;
      return loadSourceOnce(src).catch(function (e) {
        if (tries >= 2) throw e;
        return new Promise(function (r) { setTimeout(r, 800); }).then(attempt);
      });
    }
    return attempt();
  }

  /* ---------------- 渲染 ---------------- */
  function fmtHot(v) {
    if (v == null || v === '') return '';
    var s = String(v).trim();
    var n = parseFloat(s.replace(/[^\d.]/g, ''));
    if (isNaN(n)) return s;
    return s;                                  // codelife 已经给了「113万」这种可读格式
  }
  function listHTML(items) {
    return '<ol class="ranklist' + (items.length > SHOW ? ' collapsed' : '') + '">' + items.map(function (it, i) {
      var r = i + 1, hot = fmtHot(it.hot);
      return '<li class="rk">'
        + '<span class="rank' + (r <= 3 ? ' r' + r : '') + '">' + r + '</span>'
        + '<a class="rk-t" href="' + esc(it.url || '#') + '" target="_blank" rel="noopener noreferrer" title="' + esc(it.title) + '">' + esc(it.title) + '</a>'
        + (hot ? '<span class="rk-h">' + FLAME + esc(hot) + '</span>' : '')
        + '</li>';
    }).join('') + '</ol>';
  }
  function skeleton() {
    var out = '<div class="sk">';
    for (var i = 0; i < 6; i++) out += '<div class="sk-row"><i></i><b></b></div>';
    return out + '</div>';
  }
  function buildCard(src) {
    var el = document.createElement('article');
    el.className = 'card reveal';
    el.dataset.cat = src.cat;
    var small = src.char.length > 1 ? ' small' : '';
    el.innerHTML = '<header class="card-hd">'
      + '<span class="pbadge' + small + '" style="--pc:' + src.color + '">' + esc(src.char) + '</span>'
      + '<div class="pmeta"><h3><a href="' + esc(src.home) + '" target="_blank" rel="noopener noreferrer" title="访问「' + esc(src.name) + '」官方榜单">'
      + esc(src.name) + '<svg class="ext" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg></a></h3>'
      + '<p><span>' + esc(src.sub) + '</span><span class="ptime">加载中…</span></p></div>'
      + '<button class="iconbtn card-refresh" aria-label="刷新' + esc(src.name) + '" title="刷新本榜"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15"/></svg></button>'
      + '</header><div class="card-bd">' + skeleton() + '</div>'
      + '<footer class="card-ft" hidden><button class="more"></button></footer>';
    el.querySelector('.card-refresh').addEventListener('click', function () { loadCard(src, el); });
    el.querySelector('.more').addEventListener('click', function () {
      var ol = el.querySelector('.ranklist');
      var open = ol.classList.toggle('collapsed');
      this.textContent = open ? ('展开全部（共 ' + src._count + ' 条）') : '收起榜单';
    });
    cardMap.set(src.id, el);
    return el;
  }
  function loadCard(src, el) {
    var body = el.querySelector('.card-bd'), ft = el.querySelector('.card-ft'), btn = el.querySelector('.card-refresh');
    btn.classList.add('spin'); ft.hidden = true;
    return loadSource(src).then(function (items) {
      src._count = items.length;
      body.innerHTML = listHTML(items);
      el.querySelector('.ptime').textContent = '更新于 ' + new Date().toTimeString().slice(0, 8);
      if (items.length > SHOW) {
        ft.hidden = false;
        el.querySelector('.more').textContent = '展开全部（共 ' + items.length + ' 条）';
      }
      applySearch();
    }).catch(function () {
      body.innerHTML = '<div class="card-err"><p>榜单加载失败，可能是网络波动</p><button class="retry">重新加载</button></div>';
      el.querySelector('.ptime').textContent = '加载失败';
      body.querySelector('.retry').addEventListener('click', function () { loadCard(src, el); });
    }).then(function () { btn.classList.remove('spin'); });
  }

  /* ---------------- 组装页面 ---------------- */
  var board = $('#board'), cardMap = new Map(), stats = { ok: 0, bad: 0 };
  var idx = 0;
  CATS.forEach(function (cat) {
    var label = document.createElement('div');
    label.className = 'cat-label reveal';
    label.dataset.cat = cat.id;
    label.innerHTML = '<span class="bar" aria-hidden="true"></span><h2>' + cat.name + '</h2><span>' + cat.en + '</span>';
    board.appendChild(label);
    var grid = document.createElement('div');
    grid.className = 'grid';
    SOURCES.filter(function (s) { return s.cat === cat.id; }).forEach(function (s) {
      var el = buildCard(s);
      el.style.transitionDelay = (idx++ % 4) * 70 + 'ms';
      grid.appendChild(el);
    });
    board.appendChild(grid);
  });

  /* 滚动浮现 */
  if (typeof window.IntersectionObserver === 'function') {
    var io = new window.IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.06 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* 分类页签 */
  var tabsBox = $('#tabs');
  (function buildTabs() {
    var all = [{ id: 'all', name: '全部', n: SOURCES.length }].concat(CATS.map(function (c) {
      return { id: c.id, name: c.name, n: SOURCES.filter(function (s) { return s.cat === c.id; }).length };
    }));
    tabsBox.innerHTML = all.map(function (t, i) {
      return '<button class="tab' + (i === 0 ? ' on' : '') + '" role="tab" aria-selected="' + (i === 0) + '" data-cat="' + t.id + '">' + t.name + '<b>' + t.n + '</b></button>';
    }).join('');
    tabsBox.querySelectorAll('.tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        tabsBox.querySelectorAll('.tab').forEach(function (b) { b.classList.remove('on'); b.setAttribute('aria-selected', 'false'); });
        btn.classList.add('on'); btn.setAttribute('aria-selected', 'true');
        var cat = btn.dataset.cat;
        board.querySelectorAll('.card, .cat-label').forEach(function (el) {
          el.classList.toggle('off', cat !== 'all' && el.dataset.cat !== cat);
        });
      });
    });
  })();

  /* 搜索过滤 */
  var qInput = $('#q'), sstat = $('#sstat');
  function applySearch() {
    var q = qInput.value.trim().toLowerCase();
    document.body.classList.toggle('searching', !!q);
    var total = 0;
    cardMap.forEach(function (el) {
      if (!q) {
        el.classList.remove('dim');
        el.querySelectorAll('.rk.hide').forEach(function (li) { li.classList.remove('hide'); });
        return;
      }
      var n = 0;
      el.querySelectorAll('.rk').forEach(function (li) {
        var t = li.querySelector('.rk-t');
        var hit = t && t.textContent.toLowerCase().indexOf(q) >= 0;
        li.classList.toggle('hide', !hit);
        if (hit) n++;
      });
      total += n;
      el.classList.toggle('dim', n === 0);
    });
    sstat.hidden = !q;
    if (q) sstat.textContent = '匹配 ' + total + ' 条';
  }
  qInput.addEventListener('input', applySearch);
  $('#q-clr').addEventListener('click', function () { qInput.value = ''; applySearch(); qInput.focus(); });

  /* 提示条 */
  function toast(msg) {
    var box = $('#toasts'), el = document.createElement('div');
    el.className = 'toast'; el.textContent = msg;
    box.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('show'); });
    setTimeout(function () { el.classList.remove('show'); setTimeout(function () { el.remove(); }, 400); }, 3600);
  }

  /* 主题：预渲染脚本已设过一次，这里只管切换 */
  $('#btn-theme').addEventListener('click', function () {
    var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('hotboard-theme', next); } catch (e) {}
  });

  /* 时钟 */
  var WD = '日一二三四五六';
  function tickClock() {
    var d = new Date();
    $('#clock-time').innerHTML = pad(d.getHours()) + '<i>:</i>' + pad(d.getMinutes()) + '<i>:</i>' + pad(d.getSeconds());
    $('#clock-date').textContent = d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日 星期' + WD[d.getDay()];
  }
  tickClock(); setInterval(tickClock, 1000);

  /* 运行时长 + 加载速度 */
  function tickUptime() {
    var s = Math.max(0, Math.floor((Date.now() - SITE_BIRTH) / 1000));
    var d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
    $('#stat-uptime').textContent = d + ' 天 ' + pad(h) + ' 时 ' + pad(m) + ' 分 ' + pad(sec) + ' 秒';
  }
  tickUptime(); setInterval(tickUptime, 1000);
  (function reportLoadTime() {
    var el = $('#stat-load'), ms = null;
    try {
      var nav = performance.getEntriesByType('navigation')[0];
      if (nav && nav.loadEventEnd > 0) ms = nav.loadEventEnd - nav.startTime;
    } catch (e) {}
    if (ms === null && performance.timing && performance.timing.loadEventEnd) {
      ms = performance.timing.loadEventEnd - performance.timing.navigationStart;
    }
    if (ms === null) ms = performance.now();
    el.textContent = ms >= 1000 ? (ms / 1000).toFixed(2) + ' 秒' : Math.round(ms) + ' 毫秒';
  })();

  /* 刷新：先加载优先级最高的几张卡（首屏快的体感），其余紧随其后 */
  var running = false;
  function refreshAll(silent) {
    if (running) return;
    running = true; stats.ok = 0; stats.bad = 0;
    var jobs = SOURCES.map(function (s) { return function () { return loadCard(s, cardMap.get(s.id)); }; });
    var CONC = 6, i = 0, active = 0, done = 0;
    return new Promise(function (resolve) {
      function next() {
        if (i >= jobs.length && active === 0) { running = false; return resolve(); }
        while (active < CONC && i < jobs.length) {
          active++;
          jobs[i++]().then(function () { stats.ok++; }, function () { stats.bad++; }).then(function () {
            active--; done++; next();
          });
        }
      }
      next();
    }).then(function () {
      if (!silent) toast('已刷新 ' + SOURCES.length + ' 个榜单');
    });
  }
  $('#btn-refresh').addEventListener('click', function () { refreshAll(false); });

  /* 5 分钟自动刷新 + 回到页面时若已过期就补一次 */
  var nextAt = Date.now() + REFRESH_MS;
  setInterval(function () {
    if (Date.now() >= nextAt) { nextAt = Date.now() + REFRESH_MS; if (!document.hidden) refreshAll(true); }
  }, 1000);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && Date.now() > nextAt) { nextAt = Date.now() + REFRESH_MS; refreshAll(true); }
  });
  window.addEventListener('offline', function () { toast('网络已断开，数据可能不是最新'); });
  window.addEventListener('online', function () { toast('网络已恢复'); });

  /* 一键到顶 / 到底 */
  var fTop = $('#f-top'), fBot = $('#f-bottom');
  function floatCheck() {
    var y = window.scrollY || document.documentElement.scrollTop;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    fTop.hidden = y < 400;
    fBot.hidden = y > max - 400;
  }
  window.addEventListener('scroll', function () { requestAnimationFrame(floatCheck); }, { passive: true });
  floatCheck();
  fTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  fBot.addEventListener('click', function () { window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' }); });

  /* 开跑 */
  refreshAll(true);
})();
