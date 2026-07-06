const sportEl = document.getElementById("sport");
const windowEl = document.getElementById("window");
const resultsEl = document.getElementById("results");

document.getElementById("gamesBtn")?.addEventListener("click", loadGames);
document.getElementById("analyzeBtn")?.addEventListener("click", analyze);

async function analyze() {
  const sport = sportEl.value;
  const minutes = windowEl.value;

  resultsEl.innerHTML = "<p>AI 분석 중...</p>";

  const res = await fetch(`/api/recommendations?sport=${sport}&minutes=${minutes}`);
  const data = await res.json();

  let html = "";

  if (data.notice) {
    html += `<div class="notice">${data.notice}</div>`;
  }

  data.recommendations.forEach(combo => {
    html += `
      <div class="card">
        <h2>${combo.type}</h2>
        <div class="badge">총배당 ${combo.total_odds}</div>
        <div class="badge">평균점수 ${combo.avg_score}</div>
    `;

    combo.picks.forEach(p => {
      html += `
        <div class="pick">
          <h3>${p.league} | ${p.home} vs ${p.away}</h3>
          <p>추천: ${p.pick}</p>
          <p>배당 ${p.odds} / 점수 ${p.score} / 시작까지 ${p.start_in_minutes}분</p>
          <p>${p.reasons.join(" · ")}</p>
        </div>
      `;
    });

    html += `</div>`;
  });

  if (data.excluded && data.excluded.length > 0) {
    html += `<div class="card"><h2>제외 경기</h2>`;
    data.excluded.forEach(g => {
      html += `<p>${g.league} | ${g.home} vs ${g.away} - ${g.reason || "위험도 높음"}</p>`;
    });
    html += `</div>`;
  }

  resultsEl.innerHTML = html;
}

async function loadGames() {
  analyze();
}
