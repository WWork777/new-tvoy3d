import { useEffect, useRef, useState, type ComponentType } from "react";
import type { MotionValue } from "framer-motion";

type Props = { progress: MotionValue<number> };

export function ProcessSceneLazy(props: Props) {
  const [Comp, setComp] = useState<ComponentType<Props> | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Only load the heavy WebGL scene when the section is near the viewport
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          import("./ProcessScene").then((m) => setComp(() => m.ProcessScene));
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  if (!Comp) {
    return (
      <div ref={ref} className="absolute inset-0 flex items-center justify-center">
        <div className="h-32 w-32 rounded-full bg-[oklch(0.58_0.22_25)]/30 blur-3xl animate-pulse-glow" />
      </div>
    );
  }
  return <Comp {...props} />;
}
