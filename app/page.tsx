import { redirect } from "next/navigation";

/** Page d'accueil LSMS — l'intro cinematique joue en premier. */
export default function Home() {
  redirect("/intro");
}
