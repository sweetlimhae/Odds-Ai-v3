import { RecommendationsResponse } from '@workspace/api-client-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ShieldCheck, Target, Flame } from 'lucide-react';
import { getRiskDetails } from '@/lib/utils';

type Combo = RecommendationsResponse['recommendations'][number];

export function ComboCard({ combo }: { combo: Combo }) {
  const isAggressive = combo.type === '공격형';
  const isConservative = combo.type === '신중형';

  const typeColor = isAggressive ? 'text-red-500' : isConservative ? 'text-emerald-500' : 'text-primary';
  const bgGradient = isAggressive 
    ? 'from-red-500/20 to-transparent' 
    : isConservative 
      ? 'from-emerald-500/20 to-transparent' 
      : 'from-primary/20 to-transparent';
  const headerBg = isAggressive ? 'bg-red-500' : isConservative ? 'bg-emerald-500' : 'bg-primary';

  const TypeIcon = isAggressive ? Flame : isConservative ? ShieldCheck : Target;

  return (
    <Card className="relative overflow-hidden border-card-border bg-card">
      <div className={`absolute top-0 left-0 h-1 w-full ${headerBg}`} />
      <div className={`bg-gradient-to-b ${bgGradient} p-5`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-background/50 border border-border ${typeColor}`}>
              <TypeIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{combo.type} 추천</h3>
              <p className="text-xs text-muted-foreground">최적의 2폴더 조합</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground mb-0.5">합계 배당</div>
            <div className={`text-2xl font-black font-mono tracking-tight ${typeColor}`}>
              {combo.total_odds.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {combo.picks.map((pick, i) => {
            const risk = getRiskDetails(pick.risk);
            
            return (
              <div key={i} className="rounded-md bg-background/50 border border-border/50 p-4 relative">
                {i > 0 && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-border text-xs text-muted-foreground z-10 border-4 border-card">
                    +
                  </div>
                )}
                
                <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">{pick.league}</span>
                    <span>•</span>
                    <span>{pick.start_in_minutes}분 전</span>
                  </div>
                </div>

                <div className="mb-3 text-sm font-semibold text-foreground">
                  {pick.home} <span className="text-muted-foreground mx-1">vs</span> {pick.away}
                </div>

                <div className={`rounded bg-card border ${risk.borderClass} p-3`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`border-current ${risk.colorClass} bg-background text-[10px] px-1.5 py-0`}>
                        {pick.type}
                      </Badge>
                      <span className="font-bold text-sm">{pick.pick}</span>
                    </div>
                    <span className="font-mono font-bold">{pick.odds.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-muted-foreground">AI 스코어</span>
                        <span className={`font-medium ${risk.colorClass}`}>{pick.score}점</span>
                      </div>
                      <Progress value={pick.score} indicatorClass={risk.indicatorClass} className="h-1 bg-background" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}