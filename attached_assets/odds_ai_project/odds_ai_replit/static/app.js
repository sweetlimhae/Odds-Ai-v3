const $ = (id) => document.getElementById(id);

function sportLabel(value) {
  if (value === 'soccer') return '축구';
  if (value === 'baseball') return '야구';
  return '전체';
}

function renderMarket(m) {
  const reasons = (m.reasons || []).map(r => `<li>${r}</li>`).join('');
  return `
    <div class="market ${m.risk}">
      <div class="row">
        <strong>${m.pick}</strong>
        <span>${m.type}</span>
      </div>
      <p>배당 ${m.odds} / 오픈 ${m.open_odds} / 샤프 ${m.sharp_odds}</p>
      <p>AI 점수 ${m.score} / EV ${m.ev ?? '-'}%</p>
      <ul>${reasons}</ul>
    </div>
  `;
}

function renderGames(data) {
  if (!data.games.length) {
    $('results').innerHTML = `<div class="card"><h2>조건에 맞는 경기가 없습니다.</h2></div>`;
    return;
  }
  const html = data.games.map(g => `
    <div class="card">
      <div class="tag">${sportLabel(g.sport)} · ${g.league} · ${g.start_in_minutes}분 전</div>
      <h2>${g.home} vs ${g.away}</h2>
      ${g.markets.map(renderMarket).join('')}
    </div>
  `).join('');
  $('results').innerHTML = html;
}

function renderCombo(combo) {
  if (!combo.picks || combo.picks.length < 2) {
    return `<div class="card"><h2>${combo.type}</h2><p>조합할 경기 부족</p></div>`;
  }
  const picksHtml = combo.picks.map(p => `
    <div class="pick">
      <strong>${p.league} | ${p.home} vs ${p.away}</strong>
      <p>추천: ${p.pick}</p>
      <p>배당 ${p.odds} / 점수 ${p.score} / 시작까지 ${p.start_in_minutes}분</p>
      <ul>${(p.reasons || []).map(r => `<li>${r}</li>`).join('')}</ul>
    </div>
  `).join('');
  return `
    <div class="card combo">
      <h2>${combo.type}</h2>
      <div class="summary">
        <span>총배당 ${combo.total_odds}</span>
        <span>평균점수 ${combo.avg_score}</span>
      </div>
      ${picksHtml}
    </div>
  `;
}

async function loadGames() {
  const sport = $('sport').value;
  const windowValue = $('window').value;
  $('results').innerHTML = '<div class="card"><p>오늘 경기 불러오는 중...</p></div>';
  const res = await fetch(`/api/games?sport=${sport}&window=${windowValue}`);
  const data = await res.json();
  renderGames(data);
}

async function analyze() {
  const sport = $('sport').value;
  const windowValue = $('window').value;
  $('results').innerHTML = '<div class="card"><p>AI 분석 중...</p></div>';
  const res = await fetch(`/api/recommendations?sport=${sport}&window=${windowValue}`);
  const data = await res.json();
  let html = `<div class="notice">${data.notice}</div>`;
  html += data.recommendations.map(renderCombo).join('');
  if (data.excluded.length) {
    html += `<div class="card danger"><h2>제외 경기</h2>${data.excluded.map(p => `<p>${p.league} ${p.pick} · 점수 ${p.score} · 위험도 ${p.risk}</p>`).join('')}</div>`;
  }
  $('results').innerHTML = html;
}

$('gamesBtn').addEventListener('click', loadGames);
$('analyzeBtn').addEventListener('click', analyze);
