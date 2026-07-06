import { useState } from 'react';
import { useGetGames, useGetRecommendations, getGetGamesQueryKey, getGetRecommendationsQueryKey } from '@workspace/api-client-react';
import { RefreshCw, Activity, Layers, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { GameCard } from '@/components/GameCard';
import { ComboCard } from '@/components/ComboCard';
import { ExcludedPickCard } from '@/components/ExcludedPickCard';
import { SegmentControl } from '@/components/ui/segment-control';

export default function Dashboard() {
  const [mode, setMode] = useState<'games' | 'ai'>('games');
  const [sport, setSport] = useState<'all' | 'soccer' | 'baseball'>('all');
  const [windowTime, setWindowTime] = useState<30 | 60>(30);

  const { data: gamesData, isLoading: isLoadingGames, isFetching: isFetchingGames, refetch: refetchGames } = useGetGames(
    { sport: sport, window: windowTime },
    { query: { enabled: mode === 'games', queryKey: getGetGamesQueryKey({ sport, window: windowTime }) } }
  );

  const { data: aiData, isLoading: isLoadingAi, isFetching: isFetchingAi, refetch: refetchAi } = useGetRecommendations(
    { sport: sport, window: windowTime },
    { query: { enabled: mode === 'ai', queryKey: getGetRecommendationsQueryKey({ sport, window: windowTime }) } }
  );

  const isLoading = mode === 'games' ? isLoadingGames : isLoadingAi;
  const isFetching = mode === 'games' ? isFetchingGames : isFetchingAi;

  const handleRefetch = () => {
    if (mode === 'games') refetchGames();
    else refetchAi();
  };

  return (
    <div className="min-h-screen w-full bg-background pb-20">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Activity className="h-5 w-5" />
              </div>
              <h1 className="text-xl font-black tracking-tight text-foreground">Odds AI</h1>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefetch} disabled={isFetching} className="h-8 gap-1.5 border-border bg-muted/50 hover:bg-muted">
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">새로고침</span>
            </Button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <SegmentControl 
                options={[
                  { label: '오늘 경기', value: 'games' },
                  { label: 'AI 분석', value: 'ai' }
                ]}
                value={mode}
                onChange={(val) => setMode(val as 'games' | 'ai')}
              />
            </div>
            <div className="flex items-center gap-2">
              <SegmentControl 
                options={[
                  { label: '전체', value: 'all' },
                  { label: '축구', value: 'soccer' },
                  { label: '야구', value: 'baseball' }
                ]}
                value={sport}
                onChange={(val) => setSport(val as 'all' | 'soccer' | 'baseball')}
              />
              <SegmentControl 
                options={[
                  { label: '30분 전', value: '30' },
                  { label: '1시간 전', value: '60' }
                ]}
                value={windowTime.toString()}
                onChange={(val) => setWindowTime(parseInt(val) as 30 | 60)}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {mode === 'ai' && aiData?.notice && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/10 p-4 text-sm text-primary-foreground">
            <Bell className="h-5 w-5 shrink-0 text-primary mt-0.5" />
            <p className="leading-relaxed">{aiData.notice}</p>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-xl bg-muted/50" />
            <Skeleton className="h-48 w-full rounded-xl bg-muted/50" />
            <Skeleton className="h-48 w-full rounded-xl bg-muted/50" />
          </div>
        ) : mode === 'games' ? (
          <div className="space-y-6">
            {!gamesData?.games || gamesData.games.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
                <Layers className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-bold">조건에 맞는 경기가 없습니다</h3>
                <p className="text-sm text-muted-foreground mt-1">다른 필터를 선택하거나 잠시 후 다시 시도해주세요.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {gamesData.games.map((game, idx) => (
                  <GameCard key={`${game.home}-${game.away}-${idx}`} game={game} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {!aiData?.recommendations || aiData.recommendations.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
                <Activity className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-bold">조건에 맞는 경기가 없습니다</h3>
                <p className="text-sm text-muted-foreground mt-1">AI 분석을 위한 충분한 경기가 없습니다.</p>
              </div>
            ) : (
              <>
                <div>
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    AI 추천 조합
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {aiData.recommendations.map((combo, idx) => (
                      <ComboCard key={idx} combo={combo} />
                    ))}
                  </div>
                </div>

                {aiData.excluded && aiData.excluded.length > 0 && (
                  <div className="pt-6 border-t border-border/50">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Layers className="h-5 w-5 text-muted-foreground" />
                      제외 경기 리스트
                      <span className="text-xs font-normal text-muted-foreground ml-2">위험도가 높아 추천에서 제외되었습니다</span>
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {aiData.excluded.map((pick, idx) => (
                        <ExcludedPickCard key={idx} pick={pick} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}