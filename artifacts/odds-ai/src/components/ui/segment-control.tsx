export function SegmentControl({ options, value, onChange }: { options: { label: string, value: string }[], value: string, onChange: (val: string) => void }) {
  return (
    <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted/80 p-1 text-muted-foreground border border-border/50 shadow-inner">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${
            value === opt.value
              ? 'bg-background text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.3)] border border-border/50'
              : 'hover:bg-background/30 hover:text-foreground border border-transparent'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}