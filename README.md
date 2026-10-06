# Site LSMS : recrutement

Site de recrutement du Los Santos Medical Services (faction RP FiveM).
Next.js 14 (App Router) et Tailwind, déployé sur Vercel.

## Pages

- `/` redirige vers `/intro` (vidéo d'intro, clic sur l'emblème)
- `/accueil` : présentation, divisions, avantages, FAQ
- `/divisions/[slug]` : missions et profil recherché de chaque division
- `/candidature` : dossier FORM LSMS-101, connexion Discord obligatoire

## Candidatures

`/api/candidature` envoie le dossier au bot Modmail LSMS
(`MODMAIL_API_THREAD_URL`) avec l'en-tête `X-Relay-Key`. L'ID Discord du
candidat est lu dans le cookie `discord_user_id` posé par le callback OAuth,
jamais dans le formulaire.

## Développement

```bash
npm install
npm run build
npm start
```

Avant `next start`, arrêter tout process sur le port 3000 (un `next dev` oublié
sert l'ancien build).

## Variables d'environnement

Voir `.env.example`. Sur Vercel : Settings, Environment Variables (les fichiers
`.env*` du dépôt sont ignorés), puis redéployer.

OAuth Discord : l'URI de redirection doit être exactement
`https://<domaine>/api/auth/discord/callback`, sans slash final. Scopes :
`identify guilds.join`.

## Images

Les emblèmes, logos de divisions et vidéos d'intro sont dans `public/lsms/`.
Les illustrations de division sont facultatives : `public/lsms/divisions/illustrations/<slug>.jpg`
(ou `.png`, `.webp`, `.svg`).
