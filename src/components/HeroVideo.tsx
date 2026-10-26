import { useEffect, useRef } from "react";

export function HeroVideo({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // iOS/Safari only honours autoplay when muted is set as a property.
    el.muted = true;
    el.defaultMuted = true;
    el.setAttribute("muted", "");
    el.playsInline = true;
    el.setAttribute("playsinline", "true");
    el.setAttribute("webkit-playsinline", "true");
    el.crossOrigin = "anonymous";
    el.autoplay = true;
    el.loop = true;
    el.controls = false;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let observer: IntersectionObserver | null = null;

    const attemptPlay = () => {
      if (!el) return;
      // Ensure muted state is preserved before every play attempt.
      el.muted = true;
      el.defaultMuted = true;

      const p = el.play();
      if (p && typeof p.catch === "function") {
        p.catch((err) => {
          // Retry a few times on autoplay policy errors.
          if (timeoutId) clearTimeout(timeoutId);
          timeoutId = setTimeout(() => attemptPlay(), 750);
        });
      }
    };

    const tryPlay = () => {
      if (!el) return;
      // Only play when the video is actually in the viewport / visible.
      if (el.readyState >= 2 && el.offsetWidth > 0 && el.offsetHeight > 0) {
        attemptPlay();
      }
    };

    const onReady = () => {
      tryPlay();
    };

    // Play as soon as enough data has loaded and the element is visible.
    el.addEventListener("loadeddata", onReady);
    el.addEventListener("loadedmetadata", onReady);
    el.addEventListener("canplay", onReady);
    el.addEventListener("canplaythrough", onReady);
    el.load();
    attemptPlay();

    // When tab becomes active again, resume playback.
    const onVisibility = () => {
      if (!document.hidden && el && el.paused) {
        attemptPlay();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Some mobile browsers block until the first user gesture — try again then.
    const onFirstGesture = () => {
      attemptPlay();
      document.removeEventListener("touchstart", onFirstGesture);
      document.removeEventListener("click", onFirstGesture);
    };
    document.addEventListener("touchstart", onFirstGesture, { once: true });
    document.addEventListener("click", onFirstGesture, { once: true });

    // Play when the video scrolls into view.
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              tryPlay();
            }
          });
        },
        { threshold: 0.1 },
      );
      observer.observe(el);
    } else {
      tryPlay();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (observer && el) observer.unobserve(el);
      el.removeEventListener("loadeddata", onReady);
      el.removeEventListener("loadedmetadata", onReady);
      el.removeEventListener("canplay", onReady);
      el.removeEventListener("canplaythrough", onReady);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("touchstart", onFirstGesture);
      document.removeEventListener("click", onFirstGesture);
    };
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      {...({ "webkit-playsinline": "true" } as Record<string, string>)}
      preload="auto"
      disablePictureInPicture
      disableRemotePlayback
      controls={false}
      aria-hidden="true"
      className={className}
    />
  );
}
