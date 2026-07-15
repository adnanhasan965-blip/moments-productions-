"use client";

import { useState } from "react";
import { youtubeThumb } from "@/lib/public-site";

/**
 * Thumbnail that swaps to a YouTube iframe on click — keeps the page
 * fast (no embeds load until the visitor actually plays).
 */
export function YouTubeLite({
  id,
  label,
  className = "",
}: {
  id: string;
  label?: string;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className={`relative aspect-video w-full bg-black ${className}`}>
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`}
          title={label ?? "Video"}
          allow="acceleromiter; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={label ? `Play ${label}` : "Play video"}
      className={`group relative block aspect-video w-full overflow-hidden bg-black ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={youtubeThumb(id)}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-90 transition group-hover:scale-105 group-hover:opacity-100"
      />
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-[var(--brand-signal)] text-[var(--brand-cream)] transition group-hover:scale-110">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
    </button>
  );
}
