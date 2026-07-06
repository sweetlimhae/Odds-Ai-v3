import { Router, type IRouter } from "express";
import {
  GetGamesResponse,
  GetRecommendationsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const KST_OFFSET = 9 * 60 * 60 * 1000; // UTC+9

function nowKST() {
  return new Date(Date.now() + KST_OFFSET);
}

function demoGames(sport = "all") {
  const now = nowKST();

  const games = [
    {
      sport: "soccer",
      league: "EPL",
      home: "Arsenal",
      away: "Chelsea",
      starts_at: new Date(now.getTime() + 45 * 60 * 1000).toISOString(),
      markets: [
        {
          pick: "Arsenal 승",
          type: "1X2",
          odds: 1.78,
          open_odds: 1.91,
          sharp_odds: 1.72,
          score: 88,
          risk: "low" as const,
          reasons: ["Pinnacle 홈승 하락", "BMBets 시장 평균 대비 괴리", "홈 마핸 흐름 양호"],
        },
        {
          pick: "무승부",
          type: "1X2",
          odds: 3.45,
          open_odds: 3.30,
          sharp_odds: 3.55,
          score: 52,
          risk: "high" as const,
          reasons: ["배당 상승", "Sharp 신호 약함"],
        },
      ],
    },
    {
      sport: "soccer",
      league: "LaLiga",
      home: "Valencia",
      away: "Sevilla",
      starts_at: new Date(now.getTime() + 58 * 60 * 1000).toISOString(),
      markets: [
        {
          pick: "언더 2.5",
          type: "U/O",
          odds: 1.82,
          open_odds: 1.95,
          sharp_odds: 1.77,
          score: 82,
          risk: "medium" as const,
          reasons: ["언더 배당 하락", "경기 시작 전 시장 방향 일치"],
        },
        {
          pick: "Sevilla +0.5",
          type: "Handicap",
          odds: 1.91,
          open_odds: 2.02,
          sharp_odds: 1.87,
          score: 77,
          risk: "medium" as const,
          reasons: ["원정 플러스핸디 하락", "무승부 방어 가능"],
        },
      ],
    },
    {
      sport: "baseball",
      league: "KBO",
      home: "LG",
      away: "Doosan",
      starts_at: new Date(now.getTime() + 35 * 60 * 1000).toISOString(),
      markets: [
        {
          pick: "LG 승",
          type: "Moneyline",
          odds: 1.75,
          open_odds: 1.86,
          sharp_odds: 1.70,
          score: 85,
          risk: "low" as const,
          reasons: ["Pinnacle 홈승 하락", "국내 배당 유지", "마핸 동반 하락"],
        },
        {
          pick: "Doosan +1.5",
          type: "Handicap",
          odds: 1.79,
          open_odds: 1.68,
          sharp_odds: 1.79,
          score: 48,
          risk: "high" as const,
          reasons: ["흐름 충돌", "추천 제외 후보"],
        },
      ],
    },
    {
      sport: "baseball",
      league: "MLB",
      home: "Dodgers",
      away: "Padres",
      starts_at: new Date(now.getTime() + 28 * 60 * 1000).toISOString(),
      markets: [
        {
          pick: "Dodgers 승",
          type: "Moneyline",
          odds: 1.91,
          open_odds: 2.05,
          sharp_odds: 1.84,
          score: 79,
          risk: "medium" as const,
          reasons: ["배당 하락", "시장 평균보다 낮은 sharp odds", "수익성 후보"],
        },
        {
          pick: "오버 8.5",
          type: "U/O",
          odds: 2.12,
          open_odds: 2.22,
          sharp_odds: 2.02,
          score: 69,
          risk: "high" as const,
          reasons: ["고배당 후보", "공격형 전용"],
        },
      ],
    },
  ];

  if (sport === "all") return games;
  return games.filter((g) => g.sport === sport);
}

function filterGames(sport = "all", window = 60) {
  const now = nowKST();
  const result = [];

  for (const game of demoGames(sport)) {
    const startsAt = new Date(game.starts_at);
    const minutesLeft = Math.trunc((startsAt.getTime() - now.getTime()) / 60000);
    if (minutesLeft >= 0 && minutesLeft <= window) {
      result.push({ ...game, start_in_minutes: minutesLeft });
    }
  }

  return result;
}

function flattenPicks(games: ReturnType<typeof filterGames>) {
  const picks = [];
  for (const game of games) {
    for (const market of game.markets) {
      picks.push({
        ...market,
        sport: game.sport,
        league: game.league,
        home: game.home,
        away: game.away,
        game_key: `${game.league}|${game.home}|${game.away}`,
        start_in_minutes: game.start_in_minutes,
        ev: Math.round(((market.open_odds - market.odds) / market.odds) * 1000) / 10,
      });
    }
  }
  return picks;
}

type Pick = ReturnType<typeof flattenPicks>[number];

function makeCombo(title: string, candidates: Pick[]) {
  const valid: Array<{ type: string; total_odds: number; avg_score: number; picks: Pick[] }> = [];

  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      const a = candidates[i];
      const b = candidates[j];
      if (a.game_key === b.game_key) continue;
      valid.push({
        type: title,
        total_odds: Math.round(a.odds * b.odds * 100) / 100,
        avg_score: Math.round(((a.score + b.score) / 2) * 10) / 10,
        picks: [a, b],
      });
    }
  }

  if (!valid.length) {
    return { type: title, total_odds: 0, avg_score: 0, picks: [] as Pick[] };
  }

  if (title === "신중형") {
    return valid.sort((a, b) => b.avg_score - a.avg_score || a.total_odds - b.total_odds)[0];
  }
  if (title === "균형형") {
    return valid.sort((a, b) => b.avg_score * b.total_odds - a.avg_score * a.total_odds)[0];
  }
  return valid.sort((a, b) => b.total_odds - a.total_odds || b.avg_score - a.avg_score)[0];
}

const VALID_SPORTS = new Set(["all", "soccer", "baseball"]);
const VALID_WINDOWS = new Set([30, 60]);

function parseSport(raw: unknown): string {
  const s = typeof raw === "string" ? raw : "all";
  return VALID_SPORTS.has(s) ? s : "all";
}

function parseWindow(raw: unknown): number {
  const n = parseInt(typeof raw === "string" ? raw : "60", 10);
  return VALID_WINDOWS.has(n) ? n : 60;
}

router.get("/games", async (req, res): Promise<void> => {
  const sport = parseSport(req.query.sport);
  const window = parseWindow(req.query.window);

  const games = filterGames(sport, window);
  const data = GetGamesResponse.parse({ count: games.length, games });
  res.json(data);
});

router.get("/recommendations", async (req, res): Promise<void> => {
  const sport = parseSport(req.query.sport);
  const window = parseWindow(req.query.window);

  const games = filterGames(sport, window);
  const picks = flattenPicks(games);

  const safe = picks.filter((p) => p.score >= 78 && (p.risk === "low" || p.risk === "medium"));
  const balanced = picks.filter((p) => p.score >= 70);
  const aggressive = picks.filter((p) => p.score >= 60);
  const excluded = picks.filter((p) => p.score < 60 || p.risk === "high");

  const data = GetRecommendationsResponse.parse({
    sport,
    window,
    games,
    recommendations: [
      makeCombo("신중형", safe),
      makeCombo("균형형", balanced),
      makeCombo("공격형", aggressive),
    ],
    excluded,
    mode: "demo",
    notice: "현재는 데모 데이터입니다. 다음 단계에서 공개 Odds API/BMBets/Pinnacle 데이터 연결 구조를 붙이면 됩니다.",
  });

  res.json(data);
});

export default router;
