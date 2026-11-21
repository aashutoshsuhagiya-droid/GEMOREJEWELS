"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

// Swappable video sources: drop a real mp4/webm URL or local /public path into `src`
// for each entry (e.g. "/videos/ring.mp4"). While `src` is empty, the tile shows its
// poster with a muted play badge — no dead click. Posters are verified Unsplash URLs.
type GalleryVideo = {
  id: string;
  src?: string;
  poster: string;
  title?: string;
};

const galleryVideos: GalleryVideo[] = [
  { id: "vg-1", src: "", poster: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&crop=faces&h=960&w=540&q=80", title: "The engagement ring film" },
  { id: "vg-2", src: "", poster: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&crop=faces&h=960&w=540&q=80", title: "Fine jewellery in motion" },
  { id: "vg-3", src: "", poster: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&crop=faces&h=960&w=540&q=80", title: "Loose diamonds, up close" },
  { id: "vg-4", src: "", poster: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&crop=faces&h=960&w=540&q=80", title: "The atelier" },
  { id: "vg-5", src: "", poster: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&crop=faces&h=960&w=540&q=80", title: "In the showroom" }
];

export function VideoGallery() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const pitch = useCallback(() => {
    const tiles = Array.from(trackRef.current?.querySelectorAll<HTMLElement>(".video-tile") ?? []);
    if (tiles.length >= 2) return tiles[1].offsetLeft - tiles[0].offsetLeft;
    const tile = tiles[0];
    return tile ? tile.offsetWidth + 18 : 0;
  }, []);

  const syncArrows = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setCanPrev(track.scrollLeft > 2);
    setCanNext(track.scrollLeft < track.scrollWidth - track.clientWidth - 2);
  }, []);

  const stepBy = useCallback(
    (direction: 1 | -1) => {
      const track = trackRef.current;
      if (!track) return;
      const p = pitch();
      if (direction === 1) {
        if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 4) return;
        track.scrollBy({ left: p, behavior: "smooth" });
      } else {
        if (track.scrollLeft <= 2) return;
        track.scrollBy({ left: -p, behavior: "smooth" });
      }
      window.setTimeout(syncArrows, 480);
    },
    [pitch, syncArrows]
  );

  useEffect(() => {
    syncArrows();
    window.addEventListener("resize", syncArrows);
    const settle = () => requestAnimationFrame(syncArrows);
    document.fonts?.ready?.then(settle);
    window.addEventListener("load", settle);
    return () => {
      window.removeEventListener("resize", syncArrows);
      window.removeEventListener("load", settle);
    };
  }, [syncArrows]);

  const onScroll = () => syncArrows();
  const togglePlay = (id: string) => setPlayingId(current => (current === id ? null : id));

  return (
    <section className="section video-gallery">
      <div className="shell">
        <div className="video-scroll-hint" aria-hidden="true">Scroll to explore</div>
        <div className="video-viewport">
          <div className="video-carousel" ref={trackRef} onScroll={onScroll}>
            {galleryVideos.map(video => {
              const active = playingId === video.id;
              const playable = Boolean(video.src);
              return (
                <article className="video-tile" key={video.id}>
                  <div className="video-tile-media">
                    {active && video.src ? (
                      <video
                        src={video.src}
                        poster={video.poster}
                        controls
                        autoPlay
                        playsInline
                        preload="none"
                        aria-label={video.title ?? "Jewellery video"}
                      />
                    ) : (
                      <Image
                        src={video.poster}
                        alt={video.title ?? "Jewellery video"}
                        fill
                        sizes="(max-width: 900px) 80vw, 200px"
                        loading="lazy"
                      />
                    )}
                    {playable ? (
                      <button
                        type="button"
                        className="video-play-badge"
                        onClick={() => togglePlay(video.id)}
                        aria-label={active ? `Pause ${video.title ?? "video"}` : `Play ${video.title ?? "video"}`}
                      >
                        {active ? "❚❚" : "▷"}
                      </button>
                    ) : (
                      <span className="video-play-badge video-play-badge--inactive" aria-hidden="true">
                        <span className="video-play-glyph">▷</span>
                        <span className="video-play-caption">Coming soon</span>
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
          <button className="video-arrow video-arrow--prev" onClick={() => stepBy(-1)} disabled={!canPrev} aria-label="Previous video">
            <span aria-hidden="true">‹</span>
          </button>
          <button className="video-arrow video-arrow--next" onClick={() => stepBy(1)} disabled={!canNext} aria-label="Next video">
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>
    </section>
  );
}
