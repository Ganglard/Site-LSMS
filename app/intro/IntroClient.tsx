"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { emblemFlight } from "../emblem-flight";

/**
 * Intro cinematique LSMS.
 * Au clic : flash teal -> l'embleme se materialise -> vol continu vers /accueil
 * (navigation client, le calque ne se demonte jamais).
 * Pas de video pour l'instant : un poster d'ambiance + halo pulse.
 * Pour brancher une video plus tard : /lsms/uploads/intro-emblem-zoom.mp4.
 */
export default function IntroClient() {
  const [phase, setPhase] = useState<"entry" | "ready" | "flying">("entry");
  const [hover, setHover] = useState(false);
  const flashRef = useRef<HTMLDivElement>(null);
  const gateRef = useRef<HTMLDivElement>(null);
  const navigatingRef = useRef(false);
  const router = useRouter();

  // Pret apres un court temps de pose (poster + halo visibles)
  useEffect(() => {
    const t = setTimeout(() => setPhase("ready"), 900);
    return () => clearTimeout(t);
  }, []);

  // Lock scroll hors vol
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

    // Flash teal
    if (flashRef.current) {
      flashRef.current.style.transition = "opacity 0.12s ease-out";
      flashRef.current.style.opacity = "0.5";
      setTimeout(() => {
        if (flashRef.current) {
          flashRef.current.style.transition = "opacity 0.3s ease-out";
          flashRef.current.style.opacity = "0";
        }
      }, 130);
    }

    const hotspot = document.getElementById("introHotspot");
    const hr = hotspot?.getBoundingClientRect();
    const size = 240;
    const startX = hr ? hr.left + hr.width / 2 : window.innerWidth / 2;
    const startY = hr ? hr.top + hr.height / 2 : window.innerHeight * 0.43;

    // 1) L'embleme se materialise
    emblemFlight.materialize({ x: startX, y: startY, size });

    // 2) Le fond zoome et s'efface sous l'embleme
    const bg = document.getElementById("introBg");
    const zoomTarget = "transform 0.7s cubic-bezier(0.5, 0, 0.75, 0.4), opacity 0.6s ease";
    if (bg) {
      bg.style.transformOrigin = "50% 43%";
      bg.style.transition = zoomTarget;
      bg.style.transform = "scale(1.6)";
    }
    setTimeout(() => {
      if (gateRef.current) {
        gateRef.current.style.transition = "opacity 0.55s ease";
        gateRef.current.style.opacity = "0";
      }
    }, 150);

    // 3) Navigation client SANS reload : l'embleme reste monte sur son calque.
    setTimeout(() => {
      router.push("/accueil?fromIntro=1");
    }, 260);
  };

  const ready = phase === "ready";

  return (
    <div ref={gateRef} style={{ position: "fixed", inset: 0, zIndex: 200, background: "#030709", overflow: "hidden", transition: "opacity 0.9s ease" }}>
      {/* Fond d'ambiance : halos medical + grille discrete */}
      <div id="introBg" style={{ position: "absolute", inset: 0 }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(900px 640px at 50% 40%, rgba(20,184,166,0.14), transparent 70%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(700px 500px at 85% 90%, rgba(226,59,78,0.10), transparent 65%)" }} />
        <div
          style={{
            position: "absolute", inset: 0, opacity: 0.5,
            backgroundImage: "linear-gradient(rgba(94,234,212,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(94,234,212,0.05) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 46%, transparent 30%, rgba(3,7,9,0.35) 75%)", pointerEvents: "none" }} />

      <button
        id="introHotspot"
        type="button"
        onClick={enter}
        onMouseEnter={() => ready && setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-label="Cliquer pour entrer"
        style={{
          position: "absolute",
          left: "50%",
          top: "43%",
          width: "42vmin",
          height: "42vmin",
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
        <span style={{ position: "absolute", inset: "-42%", borderRadius: "50%", background: `radial-gradient(circle, rgba(20,184,166,${hover ? 0.5 : 0.22}) 0%, rgba(20,184,166,0.08) 42%, transparent 68%)`, filter: "blur(14px)", transition: "opacity 0.5s ease", pointerEvents: "none" }} />
        <span style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `1px solid rgba(94,234,212,${hover ? 0.85 : 0.34})`, boxShadow: "inset 0 0 34px rgba(20,184,166,0.14)", transition: "border-color 0.4s ease", animation: "lsms-intro-haloPulse 3.4s ease-in-out infinite", pointerEvents: "none" }} />
        <span style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(94,234,212,0.5)", animation: "lsms-intro-ringOut 2.8s cubic-bezier(0.23, 1, 0.32, 1) infinite", pointerEvents: "none" }} />
        <span style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px dashed rgba(94,234,212,0.22)", animation: "lsms-intro-slowSpin 34s linear infinite", pointerEvents: "none" }} />
        {/* Embleme central : navigateur charge /lsms/emblem-hd.png via <img> simple pour rester net sous le vol */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/lsms/emblem-hd.png"
          alt=""
          style={{ position: "absolute", left: "50%", top: "50%", width: "42%", transform: "translate(-50%,-50%)", filter: "drop-shadow(0 18px 40px rgba(0,0,0,0.7))" }}
        />
      </button>

      {ready && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: "9vh", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, animation: "lsms-intro-hintUp 1s cubic-bezier(0.23, 1, 0.32, 1) both", pointerEvents: "none" }}>
          <span style={{ fontFamily: "var(--font-saira), sans-serif", fontSize: 27, fontWeight: 600, letterSpacing: "0.01em", color: "#F2F7F6", textShadow: "0 4px 30px rgba(0,0,0,0.8)" }}>
            Touchez l&apos;embleme pour entrer
          </span>
          <span style={{ fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase", color: "#7C948E" }}>
            Cliquez sur le cercle teal
          </span>
        </div>
      )}

      <button type="button" onClick={skip} style={{ position: "absolute", top: 26, right: 30, padding: "12px 26px", borderRadius: 999, background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.16)", color: "#DDEBE8", fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 500, cursor: "pointer", fontFamily: "inherit", zIndex: 6 }}>
        Passer
      </button>

      <div style={{ position: "absolute", left: 30, bottom: 26, display: "flex", alignItems: "center", gap: 12, zIndex: 6 }}>
        <span style={{ fontFamily: "var(--font-saira), sans-serif", fontSize: 12, letterSpacing: "0.32em", textTransform: "uppercase", color: "#7C948E" }}>
          LSMS · Central Medical · Pillbox Hill
        </span>
      </div>

      <div ref={flashRef} style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 46%, #E8FFF9, #14B8A6 40%, transparent 72%)", opacity: 0, pointerEvents: "none", zIndex: 9, mixBlendMode: "screen" }} />
    </div>
  );
}
