"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Calque persistant de l'embleme volant (logo LSMS).
 *
 * Monte dans le layout RACINE : il survit a la navigation /intro -> /accueil
 * (navigation client, pas de reload), ce qui permet une transition vraiment
 * continue — le meme element <img> vole du logo affiche par la video jusqu'au
 * hero de l'accueil.
 *
 * Le vol interpole aussi l'ECHELLE (scale) pour finir exactement a la taille
 * du logo du hero : la reprise est invisible.
 *
 * API imperative (singleton) :
 *   emblemFlight.materialize({x, y, size})      — apparait (blur -> net)
 *   emblemFlight.flyTo({x, y, size, duration})  — vole vers la cible (Promise)
 *   emblemFlight.settle()                       — fondu de sortie, libere
 *   emblemFlight.isActive()
 */

type Point = { x: number; y: number; size?: number };

type FlightApi = {
  materialize: (p: Point) => void;
  flyTo: (p: Point & { duration?: number }) => Promise<void>;
  settle: () => void;
  isActive: () => boolean;
};

let controller: FlightApi | null = null;

export const emblemFlight = {
  materialize(p: Point) {
    controller?.materialize(p);
  },
  flyTo(p: Point & { duration?: number }): Promise<void> {
    return controller ? controller.flyTo(p) : Promise.resolve();
  },
  settle() {
    controller?.settle();
  },
  isActive() {
    return controller ? controller.isActive() : false;
  },
};

const EASE_FLIGHT = "cubic-bezier(0.45, 0, 0.18, 1)";
const SHADOW = "drop-shadow(0 30px 50px rgba(0,0,0,0.75))";

export function EmblemFlightProvider({ children }: { children: React.ReactNode }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const activeRef = useRef(false);
  const currentSizeRef = useRef(0);
  const [, force] = useState(0);
  const reducedRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      controller = null;
      activeRef.current = false;
    };
  }, []);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    const later = (fn: () => void, ms: number) => {
      const t = setTimeout(fn, ms);
      timersRef.current.push(t);
      return t;
    };

    const place = (x: number, y: number, scale = 1) => {
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`;
    };

    controller = {
      materialize({ x, y, size = 240 }) {
        activeRef.current = true;
        currentSizeRef.current = size;
        force((n) => n + 1);
        el.style.transition = "none";
        el.style.width = `${size}px`;
        el.style.height = "auto";
        if (reducedRef.current) {
          el.style.filter = SHADOW;
          el.style.opacity = "1";
          place(x, y, 1);
          return;
        }
        el.style.filter = `${SHADOW} blur(6px) brightness(1.35)`;
        el.style.opacity = "0";
        place(x, y, 1);
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            el.style.transition = `opacity 260ms ease-out, filter 380ms ${EASE_FLIGHT}`;
            el.style.opacity = "1";
            el.style.filter = SHADOW;
          })
        );
      },

      flyTo({ x, y, size, duration = 620 }) {
        return new Promise<void>((resolve) => {
          if (!activeRef.current) return resolve();
          const target = size && currentSizeRef.current ? size / currentSizeRef.current : 1;
          const done = () => {
            el.removeEventListener("transitionend", onEnd);
            resolve();
          };
          const onEnd = (e: TransitionEvent) => {
            if (e.propertyName === "transform") done();
          };
          if (reducedRef.current) {
            place(x, y, target);
            resolve();
            return;
          }
          el.style.transition = `transform ${duration}ms ${EASE_FLIGHT}`;
          place(x, y, target);
          el.addEventListener("transitionend", onEnd);
          later(done, duration + 150);
        });
      },

      settle() {
        el.style.transition = "opacity 280ms ease";
        el.style.opacity = "0";
        later(
          () => {
            activeRef.current = false;
            force((n) => n + 1);
          },
          300
        );
      },

      isActive: () => activeRef.current,
    };
  }, []);

  return (
    <>
      {children}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src="/lsms/emblem-hd.png"
        alt=""
        aria-hidden
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          height: "auto",
          zIndex: 9999,
          pointerEvents: "none",
          opacity: 0,
          filter: SHADOW,
          willChange: "transform, opacity",
        }}
      />
    </>
  );
}
