import { LsmsFooter } from "../chrome";
import CandidatureClient from "./CandidatureClient";
import "../lsms.css";

export const metadata = {
  title: "Dossier de candidature LSMS",
};

export default function CandidaturePage() {
  return (
    <>
      <CandidatureClient />
      <LsmsFooter />
    </>
  );
}
