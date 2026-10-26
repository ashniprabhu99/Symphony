const MESSAGE = "Free shipping across India";

export function AnnouncementBar() {
  return (
    <div className="w-full overflow-hidden bg-primary text-primary-foreground">
      <div className="flex w-max animate-marquee-ltr py-3.5">
        {Array.from({ length: 2 }).map((_, group) => (
          <div key={group} className="flex shrink-0" aria-hidden={group === 1}>
            {Array.from({ length: 6 }).map((__, i) => (
              <span
                key={i}
                className="px-6 text-sm font-semibold uppercase tracking-[0.22em] whitespace-nowrap sm:text-base"
              >
                {MESSAGE}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
