"use client";

import { useEffect, useRef } from "react";

/**
 * Reveal au scroll : stagger par batch intersecte (cap 3 x 70 ms).
 * GPU-only (transform/opacity).
 */
export function Reveal({
  children,
  className = "",
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        let batchIdx = 0;
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const target = e.target as HTMLElement;
          io.unobserve(target);
          const delay = Math.min(batchIdx++, 3) * 70;
          target.style.setProperty("--reveal-delay", `${delay}ms`);
          target.classList.add("is-visible");
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`lsms-reveal ${className}`} {...rest}>
      <div className={className.includes("h-full") ? "flex h-full w-full flex-col" : "w-full"}>{children}</div>
    </div>
  );
}
