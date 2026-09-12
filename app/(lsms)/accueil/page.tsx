import { LsmsHeader, LsmsFooter } from "../chrome";
import AccueilClient from "./AccueilClient";
import "../lsms.css";

export default function AccueilPage() {
  return (
    <>
      <LsmsHeader />
      <AccueilClient />
      <LsmsFooter />
    </>
  );
}
