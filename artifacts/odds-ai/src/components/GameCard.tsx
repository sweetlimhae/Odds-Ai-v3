import { GamesResponse } from '@workspace/api-client-react';
import { Trophy, Clock, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getRiskDetails } from '@/lib/utils';

type Game = GamesResponse['games'][number];

export function GameCard({ game }: { game: Game }) {
  return (
    <Card className="overflow-hidden border-card-border bg-card/50 transition-all hover:bg-card">
      <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Trophy className="h-4 w-4" />
          <span className="font-medium text-foreground">{game.league}</span>
          <span>•</span>
          <span className="capitalize">{game.sport === 'soccer' ? '축구' : '야구'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-medium text-amber-500">
          <Clock className="h-4 w-4" />
          {game.start_in_minutes}분 전 시작
        </div>
      </div>
      
      <div className="p-5">
        <div className="mb-6 flex items-center justify-center gap-4 text-center">
          <div className="flex-1 font-bold text-lg">{game.home}</div>
          <div className="text-sm font-semibold text-muted-foreground">VS</div>
          <div className="flex-1 font-bold text-lg">{game.away}</div>
        </div>

        <div className="space-y-3">
          {game.markets.map((market, i) => {
            const risk = getRiskDetails(market.risk);
            const RiskIcon = risk.icon;
            
            return (
              <div key={i} className={`rounded-md border ${risk.borderClass} ${risk.bgClass} p-3`}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`border-current ${risk.colorClass} bg-background/50`}>
                      {market.type}
                    </Badge>
                    <span className="font-bold">{market.pick}</span>
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${risk.colorClass}`}>
                    <RiskIcon className="h-4 w-4" />
                    {risk.label} ({market.score}점)
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground mb-1">배당 흐름</span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-muted-foreground line-through">{market.open_odds.toFixed(2)}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="font-bold text-foreground">{market.odds.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground mb-1">적정 배당</span>
                    <span className="font-mono font-medium">{market.sharp_odds.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">AI 스코어</span>
                    </div>
                    <Progress value={market.score} indicatorClass={risk.indicatorClass} className="h-1.5 bg-background/50" />
                  </div>
                </div>
                
                {market.reasons && market.reasons.length > 0 && (
                  <div className="mt-3 border-t border-border/50 pt-2">
                    <ul className="space-y-1">
                      {market.reasons.map((reason, idx) => (
                        <li key={idx} className="flex text-xs text-muted-foreground">
                          <span className="mr-2 opacity-70">•</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}