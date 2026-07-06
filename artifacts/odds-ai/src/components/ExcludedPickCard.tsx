import { RecommendationsResponse } from '@workspace/api-client-react';
import { AlertCircle } from 'lucide-react';

type PickType = RecommendationsResponse['excluded'][number];

export function ExcludedPickCard({ pick }: { pick: PickType }) {
  return (
    <div className="flex flex-col rounded-md border border-red-500/20 bg-red-500/5 p-4 transition-colors hover:bg-red-500/10">
      <div className="mb-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <span className="font-medium text-foreground">{pick.league}</span>
          <span>•</span>
          <span>{pick.home} vs {pick.away}</span>
        </div>
        <span className="font-mono text-red-500">{pick.odds.toFixed(2)}</span>
      </div>
      
      <div className="flex items-start gap-2">
        <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
        <div>
          <div className="text-sm font-bold text-foreground mb-1">
            {pick.pick} <span className="text-muted-foreground font-normal text-xs ml-1">({pick.type})</span>
          </div>
          {pick.reasons && pick.reasons.length > 0 && (
            <ul className="space-y-0.5 mt-1">
              {pick.reasons.map((r, i) => (
                <li key={i} className="text-xs text-muted-foreground/80">• {r}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}