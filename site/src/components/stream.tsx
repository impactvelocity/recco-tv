const STREAM = "https://customer-ldn5w1nobxs4gksb.cloudflarestream.com/512e4bfd2efb1888fe40569773c51159";
const SRC = `${STREAM}/iframe?autoplay=true&muted=true&loop=true&controls=false&preload=auto&poster=${encodeURIComponent(`${STREAM}/thumbnails/thumbnail.jpg?height=600`)}`;

/**
 * The winter-night room loop from Cloudflare Stream, filling its parent like
 * object-fit: cover (sized in cqw/cqh of this box), over a still that shows while it loads.
 */
export function StreamBackground({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 -z-10 overflow-hidden [container-type:size] ${className}`}>
      <div className="absolute inset-0 bg-[url(/bg/winterNight.jpg)] bg-cover bg-center" />
      <iframe
        src={SRC}
        title="Snow falling outside a cozy living room at night"
        aria-hidden
        tabIndex={-1}
        allow="autoplay; encrypted-media"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[max(100cqh,56.25cqw)] w-[max(100cqw,177.78cqh)] -translate-x-1/2 -translate-y-1/2 border-0"
      />
    </div>
  );
}
