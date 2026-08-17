/* =====================================================================
   GSSO — USGS 실시간 피드 · Live feed
   자료원 Source: USGS Earthquake Hazards Program, 2.5_day.geojson
   이 파일은 index.html(기록지·지표)과 monitor.html(콘솔 표)에서 함께 씁니다.
   ===================================================================== */
var FEED = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson';

/* ---------- 숫자 카운트업 · Count-up ---------- */
function countUp(el, target, decimals) {
  if (!el) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = target.toFixed(decimals); return;
  }
  var start = performance.now(), dur = 700;
  function step(t) {
    var k = Math.min(1, (t - start) / dur);
    k = 1 - Math.pow(1 - k, 3);
    el.textContent = (target * k).toFixed(decimals);
    if (k < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ---------- 24시간 기록지 · Recorder strip ---------- */
var HELI = { lanes: 6, hours: 4, x0: 58, w: 826, laneH: 38, top: 16 };
function seeded(i) { var x = Math.sin(i * 127.1) * 43758.5453; return x - Math.floor(x); }

function drawHeli(events, endMs) {
  var svg = document.getElementById('heli');
  if (!svg) return;
  var L = HELI, out = [], laneMs = L.hours * 3600 * 1000;
  var startMs = endMs - L.lanes * laneMs;

  for (var g = 0; g <= L.hours; g++) {
    var gx = L.x0 + g * L.w / L.hours;
    out.push('<line x1="' + gx + '" y1="' + (L.top - 4) + '" x2="' + gx + '" y2="' +
      (L.top + L.lanes * L.laneH - L.laneH / 2 + 8) + '" stroke="#1D262C" stroke-width="1"/>');
    out.push('<text x="' + gx + '" y="' + (L.top + L.lanes * L.laneH - L.laneH / 2 + 22) +
      '" text-anchor="middle" font-family="IBM Plex Mono,ui-monospace,monospace" font-size="9" ' +
      'fill="#4E5C64">+' + g + 'h</text>');
  }

  for (var i = 0; i < L.lanes; i++) {
    var baseY = L.top + i * L.laneH + L.laneH / 2;
    var t0 = startMs + i * laneMs;
    var lab = String(new Date(t0).getHours()).padStart(2, '0') + ':00';

    out.push('<text x="' + (L.x0 - 12) + '" y="' + (baseY + 3.5) + '" text-anchor="end" ' +
      'font-family="IBM Plex Mono,ui-monospace,monospace" font-size="9.5" fill="#63737C">' + lab + '</text>');
    out.push('<line x1="' + L.x0 + '" y1="' + baseY + '" x2="' + (L.x0 + L.w) + '" y2="' + baseY +
      '" stroke="#26313A" stroke-width="1"/>');

    var here = events.filter(function (e) { return e.t >= t0 && e.t < t0 + laneMs; });
    var N = 280, d = 'M' + L.x0 + ' ' + baseY.toFixed(1), maxMag = 0;

    for (var s = 1; s <= N; s++) {
      var x = L.x0 + s * L.w / N, frac = s / N;
      var y = baseY + (seeded(i * N + s) - 0.5) * 1.5;
      for (var k = 0; k < here.length; k++) {
        var ev = here[k];
        var ef = (ev.t - t0) / laneMs, dist = (frac - ef) * N;
        if (dist > -2 && dist < 28) {
          var amp = Math.min(15.5, Math.pow(Math.max(ev.mag, 2.5), 2.15) / 4.2);
          var env = Math.exp(-Math.pow(Math.max(dist, 0) / 9.5, 1.7));
          y -= Math.sin(dist * 1.25) * amp * env;
          if (ev.mag > maxMag) maxMag = ev.mag;
        }
      }
      d += ' L' + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    var col = maxMag >= 6 ? '#D25A46' : maxMag >= 4.5 ? '#E5A93C' : '#5B92C7';
    out.push('<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="1.05" ' +
      'stroke-linejoin="round" opacity="' + (maxMag ? 1 : .5) + '"/>');
  }
  svg.innerHTML = out.join('');
}

/* ---------- 상태 표시 · Status ---------- */
function setStatus(text, color) {
  var t = document.getElementById('statusText'), dt = document.getElementById('statusDot');
  if (!t) return;
  t.textContent = text;
  if (dt) dt.style.background = color;
  var p = document.querySelector('.pulse'); if (p) p.style.color = color;
}

/* ---------- 콘솔 표 · Console table (monitor.html) ---------- */
var LIVE = [], liveFilter = 0;

function renderTable() {
  var tb = document.getElementById('eqBody');
  if (!tb) return;
  var rows = LIVE.filter(function (e) { return e.mag >= liveFilter; })
                 .sort(function (a, b) { return b.t - a.t; });
  if (!rows.length) {
    tb.innerHTML = '<tr><td colspan="6" style="padding:26px;text-align:center">' +
      '해당 조건의 지진이 없습니다 · No events match this filter</td></tr>';
    return;
  }
  tb.innerHTML = rows.map(function (e) {
    var col = e.mag >= 6 ? '#D25A46' : e.mag >= 4.5 ? '#E5A93C' : '#94A3AB';
    var alert = e.alert
      ? '<span class="tag t-' + (e.alert === 'green' ? 'teal' : e.alert === 'yellow' ? 'amber' : 'red') +
        '">PAGER ' + e.alert + '</span>' : '<span style="color:#63737C">—</span>';
    return '<tr>' +
      '<td class="t">' + new Date(e.t).toISOString().slice(0, 16).replace('T', ' ') + 'Z</td>' +
      '<td class="mag" style="color:' + col + '">' + e.mag.toFixed(1) +
        ' <span style="font-size:10px;color:#63737C">' + e.magType + '</span></td>' +
      '<td class="t">' + (e.depth != null ? e.depth.toFixed(1) + ' km' : '—') + '</td>' +
      '<td class="pl">' + e.place + '</td>' +
      '<td>' + alert + '</td>' +
      '<td>' + (e.tsunami === 1 ? '<span class="tag t-red">TSUNAMI</span>'
                                : '<span style="color:#63737C">—</span>') + '</td>' +
      '</tr>';
  }).join('');
}

/* 필터 버튼 · Filter buttons */
(function () {
  var box = document.querySelector('.filters');
  if (!box) return;
  box.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    liveFilter = parseFloat(b.getAttribute('data-min'));
    box.querySelectorAll('button').forEach(function (x) {
      x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
    });
    renderTable();
  });
})();

/* ---------- 피드 호출 · Fetch ---------- */
fetch(FEED, { cache: 'no-store' })
  .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
  .then(function (json) {
    var now = Date.now();
    var ev = json.features.map(function (f) {
      return { t: f.properties.time, mag: f.properties.mag || 0,
               magType: f.properties.magType || 'M',
               alert: f.properties.alert, tsunami: f.properties.tsunami,
               place: f.properties.place || '—',
               depth: f.geometry && f.geometry.coordinates ? f.geometry.coordinates[2] : null };
    }).filter(function (e) { return e.t > now - 24 * 3600 * 1000; });

    LIVE = ev;
    drawHeli(ev, now);
    renderTable();

    var m5  = ev.filter(function (e) { return e.mag >= 5; }).length;
    var big = ev.reduce(function (a, b) { return b.mag > a.mag ? b : a; },
                        { mag: 0, place: '—', magType: '' });
    var alerts = ev.filter(function (e) { return e.alert; }).length;
    var tsu    = ev.filter(function (e) { return e.tsunami === 1; }).length;

    countUp(document.getElementById('s1'), m5, 0);
    countUp(document.getElementById('s2'), big.mag, 1);
    countUp(document.getElementById('s3'), alerts, 0);
    countUp(document.getElementById('s4'), tsu, 0);

    var s2sub = document.getElementById('s2sub');
    if (s2sub && big.place !== '—') {
      s2sub.innerHTML = big.magType + ' · ' + big.place +
        ' <span class="en">Scale as reported by USGS (magType)</span>';
    }
    var note = document.getElementById('heliNote');
    if (note) {
      note.innerHTML = ev.length + ' events · retrieved ' +
        new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
    }
    setStatus('LIVE · USGS', '#4FA893');
  })
  .catch(function (err) {
    drawHeli([], Date.now());
    ['s1', 's2', 's3', 's4'].forEach(function (id) {
      var el = document.getElementById(id); if (el) el.textContent = 'n/a';
    });
    var note = document.getElementById('heliNote');
    if (note) {
      note.innerHTML = '<em>피드를 불러오지 못했습니다 — 새로고침하거나 잠시 후 다시 시도하세요. ' +
        'Feed unavailable — reload or try again shortly. (' + err.message + ')</em>';
    }
    var tb = document.getElementById('eqBody');
    if (tb) {
      tb.innerHTML = '<tr><td colspan="6" style="padding:26px;text-align:center;color:#D25A46">' +
        '피드를 불러오지 못했습니다 · Feed unavailable (' + err.message + ')</td></tr>';
    }
    setStatus('OFFLINE', '#D25A46');
  });
