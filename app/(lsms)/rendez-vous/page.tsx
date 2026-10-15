import { LsmsFooter } from "../chrome";
import RendezVousClient from "./RendezVousClient";
import "../lsms.css";

export const metadata = {
  title: "Prendre rendez-vous — LSMS",
  description: "Demandez une consultation auprès des médecins du Los Santos Medical Services.",
};

export default function RendezVousPage() {
  return (
    <>
      <RendezVousClient />
      <LsmsFooter />
    </>
  );
}
