function ArchitecturalWindow({
  className,
  panes = 12,
}: {
  className: string;
  panes?: number;
}) {
  const columns = panes >= 10 ? 3 : 2;
  const rows = Math.ceil(panes / columns);
  const width = 360;
  const height = 480;
  const frameInset = 28;
  const innerWidth = width - frameInset * 2;
  const innerHeight = height - frameInset * 2;
  const cellWidth = innerWidth / columns;
  const cellHeight = innerHeight / rows;

  return (
    <svg
      viewBox="0 0 360 480"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="18" y="18" width="324" height="404" rx="18" />
        <rect x={frameInset} y={frameInset} width={innerWidth} height={innerHeight} rx="12" />
        <path d="M18 422h324" />
        <path d="M4 422h352" />
        <path d="M4 422v26h352v-26" />
        {Array.from({ length: columns - 1 }).map((_, index) => {
          const x = frameInset + cellWidth * (index + 1);
          return <path key={`v-${x}`} d={`M${x} ${frameInset}v${innerHeight}`} />;
        })}
        {Array.from({ length: rows - 1 }).map((_, index) => {
          const y = frameInset + cellHeight * (index + 1);
          return <path key={`h-${y}`} d={`M${frameInset} ${y}h${innerWidth}`} />;
        })}
      </g>

      <g className="landing-background__glints" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M76 84 122 132" />
        <path d="M218 104 258 148" />
        <path d="M98 228 144 274" />
        <path d="M222 254 274 308" />
        <path d="M134 336 172 376" />
      </g>
    </svg>
  );
}

export function LandingBackground() {
  return (
    <div className="landing-background" aria-hidden="true">
      <div className="landing-background__layer landing-background__layer--top" />
      <div className="landing-background__layer landing-background__layer--bottom" />
      <div className="landing-background__glow landing-background__glow--hero" />
      <div className="landing-background__glow landing-background__glow--mid" />
      <div className="landing-background__glow landing-background__glow--base" />

      <ArchitecturalWindow className="landing-background__window landing-background__window--hero" panes={12} />
      <ArchitecturalWindow className="landing-background__window landing-background__window--mid" panes={8} />
      <ArchitecturalWindow className="landing-background__window landing-background__window--footer" panes={6} />

      <div className="landing-background__frame landing-background__frame--hero" />
      <div className="landing-background__frame landing-background__frame--mid" />
    </div>
  );
}
