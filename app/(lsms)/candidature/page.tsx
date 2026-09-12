import { LsmsFooter } from "../chrome";
import CandidatureClient from "./CandidatureClient";
import "../lsms.css";

export const metadata = {
  title: "LSMS · Dossier de candidature",
};

export default function CandidaturePage() {
  return (
    <>
      <CandidatureClient />
      <LsmsFooter />
    </>
  );
}
