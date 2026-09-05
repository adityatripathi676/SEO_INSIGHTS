"use client";

// Renders 5 animated aurora orbs in dark mode.
// Light-mode: invisible. Dark-mode: slowly drifting colour blobs behind all content.
// Must be inside <body> as a sibling of page content (z-index: -1 + position: fixed).
export function AuroraBg() {
  return (
    <div className="aurora-bg dark-grain" aria-hidden>
      <div className="aurora-orb aurora-orb-1" />
      <div className="aurora-orb aurora-orb-2" />
      <div className="aurora-orb aurora-orb-3" />
      <div className="aurora-orb aurora-orb-4" />
      <div className="aurora-orb aurora-orb-5" />
    </div>
  );
}
