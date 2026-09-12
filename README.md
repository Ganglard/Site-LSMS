# Site LSMS — Recrutement

Portage du site LSPD vers le **Los Santos Medical Services** (meme processus,
theme medical teal/rouge). Next.js 14 App Router + Tailwind.

## Pages

- `/` -> redirige vers `/intro` (intro cinematique, clic sur l'embleme)
- `/accueil` — hero Liquid Glass, unites, avantages, FAQ
- `/candidature` — dossier FORM LSMS-101, OAuth Discord OBLIGATOIRE

## Ou vont les candidatures ?

Pas encore de bot : `/api/candidature` ecrit un JSON horodate dans
`candidatures/` (local / serveur). Pour brancher un bot ModMail plus tard,
remplacer le bloc "STOCKAGE LOCAL" de `app/api/candidature/route.ts` par le
POST `X-Relay-Key` (pattern identique au site LSPD).

## Dev

```bash
npm install
npm run build
npm start        # ou npx next start -p 3000 -H 0.0.0.0 pour test LAN
```

Avant `next start`, tuer tout process sur :3000 (un `next dev` oublie sert
l'ancien build).

## Variables d'environnement

Voir `.env.example`. Sur Vercel : Settings -> Environment Variables
(les `.env*` du depot sont ignores), puis Redeploy.

- OAuth Discord : creer une application dediee LSMS sur le Developer Portal,
  redirect URI exacte = `https://<domaine>/api/auth/discord/callback` (sans
  slash final). Scopes : `identify guilds.join`.
- L'ID Discord du candidat est lu depuis le cookie `discord_user_id` pose par
  le callback — jamais depuis le formulaire.

## Assets manquants (a fournis par toi)

- `public/lsms/emblem.png` (petit, header/footer) et `public/lsms/emblem-hd.png`
  (hero + intro) : etoile de vie LSMS. En attendant, des placeholder SVG sont
  generes automatiquement.
