/* =====================================================================
   GSSO — 공통 스크립트 · Shared script
   2026-09-02 개정 · revised

   1) 상단 메뉴 : 노란 «밑줄»이 미끄러지듯 따라다닙니다 (배경은 칠하지 않음)
   2) 02 MONITOR : 기록된 사건의 «연도 선택» 단추를 자동으로 만듭니다
   3) 최종 갱신 시각 표시

   1) Top menu: an amber underline slides to the active tab (no filled background)
   2) Monitor page: year buttons are generated from the event log
   3) Last-updated stamp
   ===================================================================== */
(function () {

  /* ==================================================================
     1) 상단 메뉴 · Top menu
     ------------------------------------------------------------------
     <nav class="menu"> 안에 <span class="ink"> 라는 «노란 막대» 하나가 들어 있습니다.
     이 막대의 가로 길이와 좌우 위치만 바꿔서, 현재 탭 아래로 미끄러지게 만듭니다.
     탭마다 밑줄을 켰다 껐다 하지 않으므로 깜빡임이 생기지 않습니다.

     A single amber bar (.ink) is moved and resized under the active tab.
     Because nothing is toggled per-tab, there is no flicker.
     ================================================================== */
  var nav = document.querySelector('.menu');

  if (nav) {
    var ink     = nav.querySelector('.ink');
    var page    = nav.getAttribute('data-page') || 'home';
    /* 윗줄 탭만 고릅니다. 상세메뉴(.subin) 안의 링크는 밑줄 대상이 아닙니다.
       Only the top-level tabs; links inside a dropdown are excluded. */
    var links   = Array.prototype.slice.call(nav.querySelectorAll('.mi > a'));
    var current = null;

    /* 지금 열려 있는 페이지의 탭을 찾아 표시합니다.
       Mark the tab of the page we are on. */
    links.forEach(function (a) {
      if (a.getAttribute('data-key') === page) {
        current = a;
        a.classList.add('on');
        a.setAttribute('aria-current', 'page');
      }
    });

    if (ink) {

      /* 막대를 특정 탭 아래로 옮깁니다 · Move the bar under one tab. */
      var move = function (a) {
        if (!a) { ink.style.opacity = '0'; return; }
        /* 탭이 .mi 상자 안에 들어가 있으므로 offsetLeft 를 그대로 쓸 수 없습니다.
           화면에서 실제로 차지한 자리를 재서 메뉴 왼쪽 끝으로부터의 거리를 구합니다.
           Measured from the rendered boxes, since each tab now sits inside .mi. */
        var nr = nav.getBoundingClientRect();
        var ar = a.getBoundingClientRect();
        ink.style.opacity   = '';
        ink.style.width     = ar.width + 'px';
        ink.style.transform = 'translateX(' + (ar.left - nr.left + nav.scrollLeft) + 'px)';
      };

      /* 원래 자리(현재 페이지 탭)로 되돌립니다 · Return to the active tab. */
      var place = function () { move(current); };

      /* 글꼴이 늦게 도착하면 글자 너비가 달라지므로 다시 계산합니다.
         Recalculate once the web fonts have actually loaded. */
      place();
      requestAnimationFrame(function () { nav.classList.add('ink-ready'); });
      window.addEventListener('load', place);
      window.addEventListener('resize', place);
      if (document.fonts && document.fonts.ready) { document.fonts.ready.then(place); }

      /* 마우스를 올리면 막대가 따라오고, 떼면 제자리로 돌아옵니다.
         (손가락으로 쓰는 화면에서는 동작하지 않습니다.)
         The bar follows the pointer on hover; it does not run on touch screens. */
      if (window.matchMedia('(hover: hover)').matches) {
        links.forEach(function (a) {
          /* 상세메뉴 위에 마우스가 있는 동안에도 막대가 그 탭에 머물러야 하므로,
             탭이 아니라 «감싸는 상자(.mi)» 에 겁니다.
             Bound to the wrapper so the bar stays put while the panel is open. */
          var box = a.parentNode;
          box.addEventListener('mouseenter', function () { move(a); });
        });
        nav.addEventListener('mouseleave', place);
      }

      /* 누른 «즉시» 밑줄을 옮깁니다 — 새 페이지가 열릴 때까지 기다리지 않습니다.
         Move the underline on click, without waiting for the next page to load. */
      links.forEach(function (a) {
        a.addEventListener('click', function () {
          links.forEach(function (x) {
            x.classList.remove('on');
            x.removeAttribute('aria-current');
          });
          a.classList.add('on');
          a.setAttribute('aria-current', 'page');
          current = a;
          move(a);
        });
      });
    }

    /* 홈에서 HOME 탭을 다시 누르면 맨 위로 올라갑니다.
       On the home page, the HOME tab scrolls back to the top. */
    links.forEach(function (a) {
      a.addEventListener('click', function (e) {
        if (page === 'home' && a.getAttribute('data-key') === 'home' && window.pageYOffset > 10) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });
  }


  /* ==================================================================
     2) 02 MONITOR — 연도 선택 · Year filter
     ------------------------------------------------------------------
     monitor.html 의 <details class="erow" data-year="2026"> 들을 읽어
     연도 단추를 «자동으로» 만듭니다. 새 연도를 추가해도 손댈 곳이 없습니다.

     Reads the data-year attribute of every logged event and builds the
     year buttons automatically. Adding a new year needs no code change.
     ================================================================== */
  var log = document.getElementById('eventLog');
  var bar = document.getElementById('yearBar');

  if (log && bar) {
    var rows  = Array.prototype.slice.call(log.querySelectorAll('.erow'));
    var empty = document.getElementById('noEvent');
    var years = [];

    rows.forEach(function (r) {
      var y = r.getAttribute('data-year');
      if (y && years.indexOf(y) === -1) years.push(y);
    });
    years.sort().reverse();          /* 최신 연도가 왼쪽에 · newest first */

    var html = '<button type="button" data-year="all" aria-pressed="true">ALL <small>전체</small></button>';
    years.forEach(function (y) {
      html += '<button type="button" data-year="' + y + '" aria-pressed="false">' + y + '</button>';
    });
    bar.innerHTML = html;

    var applyYear = function (sel) {
      var shown = 0;
      rows.forEach(function (r) {
        var ok = (sel === 'all' || r.getAttribute('data-year') === sel);
        r.hidden = !ok;
        if (!ok) { r.open = false; }   /* 숨길 때는 펼침도 닫아 둡니다 */
        else { shown++; }
      });
      if (empty) empty.hidden = (shown > 0);
    };

    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      Array.prototype.forEach.call(bar.querySelectorAll('button'), function (x) {
        x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
      });
      applyYear(b.getAttribute('data-year'));
    });

    applyYear('all');
  }


  /* ==================================================================
     3) 최종 갱신 시각 · Last updated
     ================================================================== */
  var d  = new Date(document.lastModified);
  var p  = function (n) { return String(n).padStart(2, '0'); };
  var tx = d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
           ' ' + p(d.getHours()) + ':' + p(d.getMinutes());

  var lu = document.getElementById('lastUpdated');
  if (lu) { lu.setAttribute('datetime', d.toISOString()); lu.innerHTML = tx + ' <span>KST</span>'; }

  var fs = document.getElementById('footStamp');
  if (fs) { fs.textContent = 'Page build ' + tx; }

})();


/* =====================================================================
   GSSO — 분석 글 목록 자동 표시 · Analysis list, rendered from one file
   ---------------------------------------------------------------------
   assets/analysis-data.js 의 GSSO_ANALYSIS 목록을 읽어
     · 랜딩 페이지  → <div class="latest">        안에 최신 카드
     · 01 ANALYSIS → <div class="cards" data-cat="CASE"> 등에 분류별 카드
   를 만들어 넣습니다. 두 페이지의 HTML 을 각각 고칠 필요가 없습니다.

   Reads the single list in analysis-data.js and fills both the landing
   page and the Analysis index. Neither page's HTML needs editing.
   ===================================================================== */
(function () {

  if (typeof GSSO_ANALYSIS === 'undefined') return;   /* 목록 파일이 없으면 아무것도 하지 않습니다 */

  /* 분류에 따라 딱지 색을 정합니다 · Tag colour per category */
  var TAGCLASS = { CASE: 't-red', METHOD: 't-teal', REVIEW: 't-amber' };

  /* 최신순 정렬 — 날짜가 같으면 일련번호가 큰 쪽이 먼저.
     Newest first; ties broken by the higher serial. */
  var list = GSSO_ANALYSIS.slice().sort(function (a, b) {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.sn < b.sn ? 1 : -1;
  });

  var esc = function (t) { return String(t == null ? '' : t); };
  var tag = function (c) { return TAGCLASS[c] || 't-amber'; };
  var lvl = function (l) { return 'lv-' + String(l || 'L1').replace(/[^0-9]/g, ''); };

  /* ---- 링크 경로 보정 ------------------------------------------------
     목록의 href 는 사이트 뿌리 기준("analysis/…")으로 적혀 있습니다.
     이 스크립트가 하위 폴더의 글에서 실행될 때는 앞에 ../ 를 붙입니다.
     The list stores root-relative paths; prefix ../ inside sub-folders. */
  var depth = (location.pathname.replace(/\/[^\/]*$/, '/').match(/\//g) || []).length;
  var root  = '';
  if (document.querySelector('.mark')) {
    var mark = document.querySelector('.mark').getAttribute('href') || '';
    root = mark.indexOf('../') === 0 ? '../' : '';
  }
  var url = function (p) { return root + p; };


  /* ==================================================================
     1) 랜딩 페이지 · Landing page — .latest
     ================================================================== */
  var latest = document.querySelector('.latest');

  if (latest) {
    var n = (typeof GSSO_LATEST_COUNT === 'number') ? GSSO_LATEST_COUNT : 2;
    var out = '';

    list.slice(0, n).forEach(function (a) {
      out +=
      '<a class="lcard" href="' + url(a.href) + '">' +
        '<span class="thumb" data-sn="' + esc(a.sn) + '">' +
          '<img src="' + url('assets/analysis/' + a.sn + '-thumb.jpg') + '" alt="" loading="lazy" decoding="async"' +
               ' onerror="this.parentNode.classList.add(\'noimg\');this.remove()">' +
        '</span>' +
        '<span class="lbody">' +
          '<span class="lmeta">' +
            '<b class="sn">' + esc(a.sn) + '</b>' +
            '<span class="tag ' + tag(a.cat) + '">' + esc(a.cat) + '</span>' +
            '<span class="lv ' + lvl(a.level) + '">' + esc(a.level) + '</span>' +
            '<time datetime="' + esc(a.date) + '">' + esc(a.date) + '</time>' +
          '</span>' +
          '<span class="ltitle">' + esc(a.titleKo) +
            '<span class="en" lang="en">' + esc(a.titleEn) + '</span></span>' +
          '<span class="ldesc">' + esc(a.descKo) +
            '<span class="en" lang="en">' + esc(a.shortEn || a.descEn) + '</span></span>' +
        '</span>' +
      '</a>';
    });

    latest.innerHTML = out;
  }


  /* ==================================================================
     2) 01 ANALYSIS 페이지 · Analysis index — .cards[data-cat]
     ================================================================== */
  var boxes = document.querySelectorAll('.cards[data-cat]');

  Array.prototype.forEach.call(boxes, function (box) {
    var cat  = box.getAttribute('data-cat');
    var rows = list.filter(function (a) { return a.cat === cat; });

    /* 아직 글이 없는 분류는 «비었다»고 적습니다 — 감추지 않습니다.
       An empty category says so, rather than disappearing. */
    if (!rows.length) {
      box.className = 'noevent';
      box.innerHTML = '아직 공개된 글이 없습니다. 01.4 예정된 글에서 준비 중인 항목을 볼 수 있습니다.' +
        '<span class="en" lang="en">Nothing published yet — see 01.4 below for what is in preparation.</span>';
      return;
    }

    var out = '';
    rows.forEach(function (a) {
      out +=
      '<a class="card" href="' + url(a.href) + '">' +
        '<span class="meta">' +
          '<b class="sn">' + esc(a.sn) + '</b>' +
          '<span>' + esc(a.date) + '</span>' +
          '<span class="tag ' + tag(a.cat) + '">' + esc(a.cat) + '</span>' +
          '<span class="lv ' + lvl(a.level) + '">' + esc(a.level) + '</span>' +
        '</span>' +
        '<h3>' + esc(a.titleKo) +
          '<span class="en" lang="en">' + esc(a.titleEn) + '</span></h3>' +
        '<p>' + esc(a.descKo) +
          '<span class="en" lang="en">' + esc(a.descEn) + '</span></p>' +
        '<span class="go">READ →</span>' +
      '</a>';
    });

    box.innerHTML = out;
  });

})();
