import { redirect } from "next/navigation";

/** La racine redirige vers l'intro vidéo. */
export default function Home() {
  redirect("/intro");
}
