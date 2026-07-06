from flask import Flask, jsonify, render_template, request
from datetime import datetime, timedelta, timezone
from itertools import combinations

app = Flask(__name__)
KST = timezone(timedelta(hours=9))


def demo_games(sport='all'):
    now = datetime.now(KST)
    games = [
        {
            'sport': 'soccer', 'league': 'EPL', 'home': 'Arsenal', 'away': 'Chelsea',
            'starts_at': (now + timedelta(minutes=45)).isoformat(),
            'markets': [
                {'pick': 'Arsenal 승', 'type': '1X2', 'odds': 1.78, 'open_odds': 1.91, 'sharp_odds': 1.72, 'score': 88, 'risk': 'low', 'reasons': ['Pinnacle 홈승 하락', 'BMBets 시장 평균 대비 괴리', '홈 마핸 흐름 양호']},
                {'pick': '무승부', 'type': '1X2', 'odds': 3.45, 'open_odds': 3.30, 'sharp_odds': 3.55, 'score': 52, 'risk': 'high', 'reasons': ['배당 상승', 'Sharp 신호 약함']},
            ],
        },
        {
            'sport': 'soccer', 'league': 'LaLiga', 'home': 'Valencia', 'away': 'Sevilla',
            'starts_at': (now + timedelta(minutes=58)).isoformat(),
            'markets': [
                {'pick': '언더 2.5', 'type': 'U/O', 'odds': 1.82, 'open_odds': 1.95, 'sharp_odds': 1.77, 'score': 82, 'risk': 'medium', 'reasons': ['언더 배당 하락', '경기 시작 전 시장 방향 일치']},
                {'pick': 'Sevilla +0.5', 'type': 'Handicap', 'odds': 1.91, 'open_odds': 2.02, 'sharp_odds': 1.87, 'score': 77, 'risk': 'medium', 'reasons': ['원정 플러스핸디 하락', '무승부 방어 가능']},
            ],
        },
        {
            'sport': 'baseball', 'league': 'KBO', 'home': 'LG', 'away': 'Doosan',
            'starts_at': (now + timedelta(minutes=35)).isoformat(),
            'markets': [
                {'pick': 'LG 승', 'type': 'Moneyline', 'odds': 1.75, 'open_odds': 1.86, 'sharp_odds': 1.70, 'score': 85, 'risk': 'low', 'reasons': ['Pinnacle 홈승 하락', '국내 배당 유지', '마핸 동반 하락']},
                {'pick': 'Doosan +1.5', 'type': 'Handicap', 'odds': 1.79, 'open_odds': 1.68, 'sharp_odds': 1.79, 'score': 48, 'risk': 'high', 'reasons': ['흐름 충돌', '추천 제외 후보']},
            ],
        },
        {
            'sport': 'baseball', 'league': 'MLB', 'home': 'Dodgers', 'away': 'Padres',
            'starts_at': (now + timedelta(minutes=28)).isoformat(),
            'markets': [
                {'pick': 'Dodgers 승', 'type': 'Moneyline', 'odds': 1.91, 'open_odds': 2.05, 'sharp_odds': 1.84, 'score': 79, 'risk': 'medium', 'reasons': ['배당 하락', '시장 평균보다 낮은 sharp odds', '수익성 후보']},
                {'pick': '오버 8.5', 'type': 'U/O', 'odds': 2.12, 'open_odds': 2.22, 'sharp_odds': 2.02, 'score': 69, 'risk': 'high', 'reasons': ['고배당 후보', '공격형 전용']},
            ],
        },
    ]
    if sport == 'all':
        return games
    return [g for g in games if g['sport'] == sport]


def filter_games(sport='all', window=60):
    now = datetime.now(KST)
    out = []
    for game in demo_games(sport):
        starts_at = datetime.fromisoformat(game['starts_at'])
        minutes_left = int((starts_at - now).total_seconds() / 60)
        if 0 <= minutes_left <= window:
            game = dict(game)
            game['start_in_minutes'] = minutes_left
            out.append(game)
    return out


def flatten_picks(games):
    picks = []
    for game in games:
        for market in game['markets']:
            item = dict(market)
            item['sport'] = game['sport']
            item['league'] = game['league']
            item['home'] = game['home']
            item['away'] = game['away']
            item['game_key'] = f"{game['league']}|{game['home']}|{game['away']}"
            item['start_in_minutes'] = game['start_in_minutes']
            item['ev'] = round((item['open_odds'] - item['odds']) / item['odds'] * 100, 1)
            picks.append(item)
    return picks


def make_combo(title, candidates):
    valid = []
    for a, b in combinations(candidates, 2):
        if a['game_key'] == b['game_key']:
            continue
        total_odds = round(a['odds'] * b['odds'], 2)
        avg_score = round((a['score'] + b['score']) / 2, 1)
        valid.append({
            'type': title,
            'total_odds': total_odds,
            'avg_score': avg_score,
            'picks': [a, b],
        })
    if not valid:
        return {'type': title, 'total_odds': 0, 'avg_score': 0, 'picks': []}
    if title == '신중형':
        return sorted(valid, key=lambda x: (x['avg_score'], -x['total_odds']), reverse=True)[0]
    if title == '균형형':
        return sorted(valid, key=lambda x: (x['avg_score'] * x['total_odds']), reverse=True)[0]
    return sorted(valid, key=lambda x: (x['total_odds'], x['avg_score']), reverse=True)[0]


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/games')
def games():
    sport = request.args.get('sport', 'all')
    window = int(request.args.get('window', 60))
    filtered = filter_games(sport, window)
    return jsonify({'count': len(filtered), 'games': filtered})


@app.route('/api/recommendations')
def recommendations():
    sport = request.args.get('sport', 'all')
    window = int(request.args.get('window', 60))
    games = filter_games(sport, window)
    picks = flatten_picks(games)

    safe = [p for p in picks if p['score'] >= 78 and p['risk'] in ['low', 'medium']]
    balanced = [p for p in picks if p['score'] >= 70]
    aggressive = [p for p in picks if p['score'] >= 60]
    excluded = [p for p in picks if p['score'] < 60 or p['risk'] == 'high']

    return jsonify({
        'sport': sport,
        'window': window,
        'games': games,
        'recommendations': [
            make_combo('신중형', safe),
            make_combo('균형형', balanced),
            make_combo('공격형', aggressive),
        ],
        'excluded': excluded,
        'mode': 'demo',
        'notice': '현재는 데모 데이터입니다. 다음 단계에서 공개 Odds API/BMBets/Pinnacle 데이터 연결 구조를 붙이면 됩니다.'
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
