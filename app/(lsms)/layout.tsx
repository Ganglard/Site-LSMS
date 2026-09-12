import type { Metadata } from "next";
import { Barlow_Condensed, Caveat, Inter, Saira_Condensed, Special_Elite } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const saira = Saira_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-saira",
});
const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow",
});
const specialElite = Special_Elite({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-typer",
});
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-signature",
});

export const metadata: Metadata = {
  title: "LSMS · Recrutement",
  description:
    "Los Santos Medical Services — rejoignez une equipe medicale structuree, reactive et disponible 24/7 sur Los Santos.",
};

/**
 * Groupe de routes LSMS : isole le site du theme global et fournit les polices
 * du theme LSMS. Chaque page embarque son propre header Liquid Glass.
 */
export default function LsmsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`${inter.variable} ${saira.variable} ${barlow.variable} ${specialElite.variable} ${caveat.variable}`}
      style={{
        fontFamily: "var(--font-inter), system-ui, sans-serif",
        background: "#04080a",
        minHeight: "100vh",
      }}
    >
      {children}
    </div>
  );
}
