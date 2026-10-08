/**
 * Capture JPEG de la feuille de candidature, jointe à l'embed Discord du bot.
 *
 * On ne photographie pas la page telle quelle : on clone la feuille hors écran
 * à une largeur fixe (rendu « bureau » même depuis un téléphone), on remplace
 * les champs de saisie par du texte (textareas entières, sans barre de défilement,
 * selects lisibles, cases cochées dessinées), puis html2canvas -> JPEG.
 *
 * Taille : le relais Vercel accepte ~4,5 Mo de corps, base64 compris, donc on
 * vise < 3 Mo de JPEG (qualité puis échelle réduites si nécessaire).
 */

type H2C = (el: HTMLElement, opts?: Record<string, unknown>) => Promise<HTMLCanvasElement>;

const CAPTURE_WIDTH = 860; // px CSS, au-dessus du breakpoint sm (640)
const MAX_DATAURL_CHARS = 3_900_000; // ~2,9 Mo de JPEG

export function loadHtml2Canvas(src: string): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as { html2canvas?: H2C };
  if (w.html2canvas || document.querySelector(`script[data-h2c]`)) return;
  const s = document.createElement("script");
  s.src = src;
  s.async = true;
  s.dataset.h2c = "1";
  document.head.appendChild(s);
}

async function waitForHtml2Canvas(timeoutMs = 4000): Promise<H2C | null> {
  const w = window as unknown as { html2canvas?: H2C };
  const t0 = Date.now();
  while (!w.html2canvas && Date.now() - t0 < timeoutMs) await new Promise((r) => setTimeout(r, 100));
  return w.html2canvas ?? null;
}

/** Remplace inputs/textarea/select du clone par des blocs texte statiques. */
function flattenFields(original: HTMLElement, clone: HTMLElement, accent: string) {
  const src = original.querySelectorAll<HTMLElement>("input, textarea, select");
  const dst = clone.querySelectorAll<HTMLElement>("input, textarea, select");
  src.forEach((el, i) => {
    const target = dst[i];
    if (!target) return;
    const cs = window.getComputedStyle(el);

    if (el instanceof HTMLInputElement && el.type === "checkbox") {
      const box = document.createElement("span");
      box.className = target.className;
      box.style.cssText = `display:block;width:20px;height:20px;flex:none;box-sizing:border-box;` +
        `border:2px solid ${accent};border-radius:3px;background:${el.checked ? accent : "transparent"};margin-top:2px;`;
      if (el.checked) {
        // Coche dessinée en SVG (un caractère ✓ est mal centré par html2canvas)
        box.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" style="display:block"><path d="M3.2 8.4l3 3 6.6-6.8" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      }
      target.replaceWith(box);
      return;
    }

    let text = "";
    if (el instanceof HTMLSelectElement) text = el.value ? el.options[el.selectedIndex]?.text ?? el.value : "";
    else text = (el as HTMLInputElement | HTMLTextAreaElement).value;

    const div = document.createElement("div");
    div.className = target.className;
    div.style.cssText =
      `font-family:${cs.fontFamily};font-size:${cs.fontSize};line-height:${cs.lineHeight};color:${cs.color};` +
      `padding:${cs.paddingTop} ${cs.paddingRight} ${el instanceof HTMLTextAreaElement ? "10px" : cs.paddingBottom} ${cs.paddingLeft};border-bottom:${cs.borderBottomWidth} ${cs.borderBottomStyle} ${cs.borderBottomColor};` +
      `background:${cs.backgroundColor};min-height:${el instanceof HTMLTextAreaElement ? "0" : cs.height};` +
      `height:auto;max-height:none;overflow:visible;white-space:pre-wrap;word-break:break-word;box-sizing:border-box;`;
    if (!text.trim()) {
      div.textContent = "\u2014";
      div.style.color = "rgba(90,81,66,0.45)";
    } else {
      div.textContent = text;
    }
    if (el instanceof HTMLTextAreaElement) div.style.border = `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`;
    target.replaceWith(div);
  });
}

export type PreviewOptions = {
  backgroundColor: string;
  accent: string;
  /** Sélecteurs à masquer dans la capture (bouton, erreurs, bandeaux…). */
  hide?: string[];
};

/** Retourne un data URL JPEG (ou null si la capture échoue — elle reste optionnelle). */
export async function captureSheetJpeg(sheet: HTMLElement, opts: PreviewOptions): Promise<string | null> {
  const h2c = await waitForHtml2Canvas();
  if (!h2c) return null;

  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = `position:absolute;left:-20000px;top:0;width:${CAPTURE_WIDTH}px;pointer-events:none;`;
  const clone = sheet.cloneNode(true) as HTMLElement;
  clone.style.width = `${CAPTURE_WIDTH}px`;
  clone.style.boxShadow = "none";
  clone.style.transform = "none";
  clone.style.opacity = "1";
  flattenFields(sheet, clone, opts.accent);
  for (const sel of opts.hide ?? []) clone.querySelectorAll<HTMLElement>(sel).forEach((n) => n.remove());
  host.appendChild(clone);
  // Monté à côté de la feuille d'origine : il hérite des variables CSS des polices
  // next/font (--font-typer, --font-signature…) posées sur les conteneurs parents.
  (sheet.parentElement ?? document.body).appendChild(host);

  try {
    try { await document.fonts?.ready; } catch {}
    let canvas = await h2c(clone, {
      backgroundColor: opts.backgroundColor,
      scale: 2,
      logging: false,
      useCORS: true,
      windowWidth: 1280,
    });

    for (const scale of [1, 0.8, 0.65, 0.5]) {
      if (scale < 1) {
        const c2 = document.createElement("canvas");
        c2.width = Math.round(canvas.width * scale);
        c2.height = Math.round(canvas.height * scale);
        const ctx = c2.getContext("2d");
        if (!ctx) break;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(canvas, 0, 0, c2.width, c2.height);
        canvas = c2;
      }
      for (const q of [0.92, 0.85, 0.75]) {
        const url = canvas.toDataURL("image/jpeg", q);
        if (url.length <= MAX_DATAURL_CHARS) return url;
      }
    }
    return null;
  } catch {
    return null;
  } finally {
    host.remove();
  }
}
