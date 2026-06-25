import { useEffect, useState, type ComponentType } from "react";

export function HeroSceneLazy() {
  const [mounted, setMounted] = useState(false);
  const [Comp, setComp] = useState<ComponentType | null>(null);
  useEffect(() => {
    setMounted(true);
    import("./HeroScene").then((m) => {
      setComp(() => m.HeroScene);
    });
  }, []);
  if (!mounted || !Comp) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-40 w-40 rounded-full bg-[oklch(0.58_0.22_25)]/30 blur-3xl animate-pulse-glow" />
      </div>
    );
  }
  return <Comp />;
}