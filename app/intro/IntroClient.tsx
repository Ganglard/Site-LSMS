"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { emblemFlight } from "../emblem-flight";

/**
 * Intro vidéo. Elle joue une fois et s'arrête sur le logo. Un anneau cliquable
 * placé sur le logo lance l'emblème volant (emblem-flight) vers /accueil.
 */

// Position du logo dans la dernière image de la vidéo (mesurée). L'anneau
// cliquable est plus large que le logo pour absorber l'imprécision.
const VIDEO_W = 1920;
const VIDEO_H = 1040;
const BADGE_CX = 0.505; // centre du logo, part de la largeur
const BADGE_CY = 0.5; // centre du logo, part de la hauteur
const BADGE_DIA = 0.285; // diamètre du logo, part de la largeur
const RING_DIA = 0.34; // diamètre de l'anneau cliquable

/** Position et tailles du logo de la vidéo dans la fenêtre (object-fit: cover). */
function badgeInViewport() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scale = Math.max(vw / VIDEO_W, vh / VIDEO_H);
  const dw = VIDEO_W * scale;
  const dh = VIDEO_H * scale;
  const ox = (vw - dw) / 2;
  const oy = (vh - dh) / 2;
  const x = ox + BADGE_CX * dw;
  const y = oy + BADGE_CY * dh;
  return {
    x,
    y,
    size: BADGE_DIA * dw, // logo seul
    ring: RING_DIA * dw, // anneau cliquable (plus large)
  };
}

export default function IntroClient() {
  const [phase, setPhase] = useState<"entry" | "ready" | "flying">("entry");
  const [hover, setHover] = useState(false);
  const gateRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hotspotRef = useRef<HTMLButtonElement>(null);
  const navigatingRef = useRef(false);
  const router = useRouter();

  // La vidéo joue une fois ; l'anneau apparaît à la fin.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    void v.play().catch(() => {});
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setPhase("ready");
    };
    v.addEventListener("ended", finish);
    const failsafe = setTimeout(finish, 12000);
    return () => {
      v.removeEventListener("ended", finish);
      clearTimeout(failsafe);
    };
  }, []);

  // L'anneau suit le logo de la vidéo au redimensionnement
  useEffect(() => {
    const place = () => {
      const el = hotspotRef.current;
      if (!el) return;
      const { x, y, ring } = badgeInViewport();
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.width = `${ring}px`;
      el.style.height = `${ring}px`;
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("orientationchange", place);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("orientationchange", place);
    };
  }, []);

  // Pas de défilement hors du vol
  useEffect(() => {
    if (phase === "flying") return;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [phase]);

  const skip = () => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    sessionStorage.setItem("lsmsIntroPlayed", "1");
    if (gateRef.current) {
      gateRef.current.style.transition = "opacity 0.5s ease";
      gateRef.current.style.opacity = "0";
    }
    setTimeout(() => router.push("/accueil"), 550);
  };

  const enter = () => {
    if (phase !== "ready" || navigatingRef.current) return;
    navigatingRef.current = true;
    setPhase("flying");
    sessionStorage.setItem("lsmsIntroPlayed", "1");

    // Position et taille du logo dans la vidéo
    const { x, y, size } = badgeInViewport(); // size = logo seul

    // L'anneau disparaît
    if (hotspotRef.current) {
      hotspotRef.current.style.transition = "opacity 0.25s ease";
      hotspotRef.current.style.opacity = "0";
    }

    // 1) L'emblème volant apparaît à la position et à la taille du logo de la vidéo.
    emblemFlight.materialize({ x, y, size });

    // 2) La vidéo zoome et s'efface sous l'emblème
    const v = videoRef.current;
    const zoomTarget = "transform 0.75s cubic-bezier(0.5, 0, 0.75, 0.4), opacity 0.6s ease";
    if (v) {
      v.style.transformOrigin = `${BADGE_CX * 100}% ${BADGE_CY * 100}%`;
      v.style.transition = zoomTarget;
      v.style.transform = "scale(1.5)";
      v.style.opacity = "0";
    }
    setTimeout(() => {
      if (gateRef.current) {
        gateRef.current.style.transition = "opacity 0.55s ease";
        gateRef.current.style.opacity = "0";
      }
    }, 150);

    // 3) Navigation côté client : le calque volant reste monté jusqu'à /accueil.
    setTimeout(() => {
      router.push("/accueil?fromIntro=1");
    }, 300);
  };

  const ready = phase === "ready";

  return (
    <div ref={gateRef} style={{ position: "fixed", inset: 0, zIndex: 200, background: "#050912", overflow: "hidden", transition: "opacity 0.9s ease" }}>
      <video
        ref={videoRef}
        src="/lsms/uploads/intro-emblem-zoom.mp4"
        poster="/lsms/uploads/intro-emblem-poster.jpg"
        muted
        playsInline
        autoPlay
        preload="auto"
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", background: "#050912",
          transition: "opacity 0.6s ease",
        }}
      />

      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%, transparent 32%, rgba(5,9,18,0.35) 80%)", pointerEvents: "none" }} />

      <button
        ref={hotspotRef}
        id="introHotspot"
        type="button"
        onClick={enter}
        onMouseEnter={() => ready && setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-label="Cliquer pour entrer"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: "26vw",
          height: "26vw",
          transform: "translate(-50%,-50%)",
          borderRadius: "50%",
          border: "none",
          padding: 0,
          background: "transparent",
          zIndex: 5,
          cursor: ready ? "pointer" : "default",
          opacity: ready ? 1 : 0,
          transition: "opacity 0.9s ease",
          pointerEvents: ready ? "auto" : "none",
        }}
      >
        <span style={{ position: "absolute", inset: "0", borderRadius: "50%", border: `1px solid rgba(147,197,253,${hover ? 0.7 : 0.3})`, transition: "border-color 0.4s ease", pointerEvents: "none" }} />
      </button>

      {ready && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: "7vh", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, animation: "lsms-intro-hintUp 1s cubic-bezier(0.23, 1, 0.32, 1) both", pointerEvents: "none" }}>
          <span style={{ fontFamily: "var(--font-saira), sans-serif", fontSize: 27, fontWeight: 600, letterSpacing: "0.01em", color: "#F2F7F6", textShadow: "0 4px 30px rgba(0,0,0,0.9)" }}>
            Touchez l&apos;emblème pour entrer
          </span>
          <span style={{ fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase", color: "#93B4D9" }}>
            Cliquez sur l&apos;anneau autour du logo
          </span>
        </div>
      )}

      <button type="button" onClick={skip} style={{ position: "absolute", top: 26, right: 30, padding: "12px 26px", borderRadius: 999, background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.16)", color: "#DDEBE8", fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 500, cursor: "pointer", fontFamily: "inherit", zIndex: 6 }}>
        Passer
      </button>

      <div style={{ position: "absolute", left: 30, bottom: 26, display: "flex", alignItems: "center", gap: 12, zIndex: 6 }}>
        <span style={{ fontFamily: "var(--font-saira), sans-serif", fontSize: 12, letterSpacing: "0.32em", textTransform: "uppercase", color: "#93B4D9" }}>
          LSMS, Central Medical, Pillbox Hill
        </span>
      </div>
    </div>
  );
}
