/* =====================================================================
   GSSO — 공통 스크립트 · Shared script
   1) 상단 메뉴의 활성 표시  2) 홈에서 같은 메뉴 재클릭 시 페이지 이동
   3) 최종 갱신 시각 표시
   ===================================================================== */
(function () {

  /* ---------- 1) 상단 메뉴 · Top menu -------------------------------- */
  var nav = document.querySelector('.menu');
  if (nav) {
    /* <nav class="menu" data-page="home"> 처럼 현재 페이지 이름이 적혀 있습니다. */
    var page  = nav.getAttribute('data-page') || 'home';
    var links = Array.prototype.slice.call(nav.querySelectorAll('a'));

    if (page !== 'home') {
      /* 하위 페이지: 해당 탭의 배경 자체를 노란색으로.
         Sub-page: the matching tab is filled amber. */
      links.forEach(function (a) {
        if (a.getAttribute('data-key') === page) {
          a.classList.add('on');
          a.setAttribute('aria-current', 'page');
        }
      });

    } else {
      /* 홈: 스크롤 위치에 따라 노란 밑줄이 따라다님.
         Home: the amber underline follows the section in view. */
      var spy = links
        .filter(function (a) { return a.getAttribute('data-anchor'); })
        .map(function (a) {
          return { key: a.getAttribute('data-key'),
                   el:  document.querySelector(a.getAttribute('data-anchor')) };
        })
        .filter(function (s) { return s.el; });

      function setActive(key) {
        links.forEach(function (a) {
          if (a.getAttribute('data-key') === key) a.setAttribute('aria-current', 'section');
          else a.removeAttribute('aria-current');
        });
      }

      function onScroll() {
        var y = window.pageYOffset + 140, key = 'home';
        spy.forEach(function (s) {
          if (s.el.getBoundingClientRect().top + window.pageYOffset <= y) key = s.key;
        });
        if (window.pageYOffset < 80) key = 'home';
        setActive(key);
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      onScroll();

      /* 클릭 규칙 · Click rule
         1회차 — 해당 구역으로 스크롤(밑줄 이동)
         2회차 — 같은 메뉴를 다시 누르면 그 메뉴의 전용 페이지로 이동 */
      links.forEach(function (a) {
        a.addEventListener('click', function (e) {
          var anchor = a.getAttribute('data-anchor');

          if (!anchor) {                       /* HOME 탭 */
            if (window.pageYOffset > 10) {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            return;
          }
          if (a.getAttribute('aria-current') === 'section') {
            a.classList.add('on');             /* 배경 노랑으로 바뀐 뒤 페이지 이동 */
            return;                            /* href 그대로 따라감 */
          }
          e.preventDefault();
          var target = document.querySelector(anchor);
          if (target) target.scrollIntoView({ behavior: 'smooth' });
          setActive(a.getAttribute('data-key'));
        });
      });
    }
  }

  /* ---------- 2) 최종 갱신 시각 · Last updated ----------------------- */
  var d  = new Date(document.lastModified);
  var p  = function (n) { return String(n).padStart(2, '0'); };
  var tx = d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
           ' ' + p(d.getHours()) + ':' + p(d.getMinutes());

  var lu = document.getElementById('lastUpdated');
  if (lu) { lu.setAttribute('datetime', d.toISOString()); lu.innerHTML = tx + ' <span>KST</span>'; }

  var fs = document.getElementById('footStamp');
  if (fs) { fs.textContent = 'Page build ' + tx; }

})();
