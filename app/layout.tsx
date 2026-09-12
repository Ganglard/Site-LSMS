import type { Metadata } from "next";
import { Inter, Saira_Condensed } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "sonner";
import { EmblemFlightProvider } from "./emblem-flight";

const inter = Inter({ subsets: ["latin"] });
const saira = Saira_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-saira",
});

export const metadata: Metadata = {
  title: "LSMS · Recrutement",
  description:
    "Los Santos Medical Services — rejoignez une equipe medicale structuree, reactive et disponible 24/7 sur Los Santos.",
  openGraph: {
    type: "website",
    title: "LSMS · Recrutement",
    description:
      "Los Santos Medical Services — rejoignez une equipe medicale structuree, reactive et disponible 24/7 sur Los Santos.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background", inter.className, saira.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <EmblemFlightProvider>{children}</EmblemFlightProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
