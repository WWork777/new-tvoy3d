export function GridBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute inset-0 radial-red" />
      {/* scanning line */}
      <div
        className="absolute left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(219,17,37,0.6), transparent)",
          top: "30%",
          animation: "scan-down 8s linear infinite",
        }}
      />
    </div>
  );
}