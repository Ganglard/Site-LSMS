# Prompts vidéo LSMS — réplique des vidéos LSPD

Les 2 vidéos du site LSPD (analysées frame par frame) :

| Vidéo LSPD | Rôle sur le site | Specs |
|---|---|---|
| `intro-badge-zoom.mp4` | Intro cinématique `/intro` (fond du clic « Touchez l'insigne ») | 4 s, 1920×1040, 30 fps, h264 |
| `bureau-zoom.mp4` | Intro du formulaire `/candidature` (se lance avant la feuille) | 4 s, 1920×1080, 30 fps, h264 |

Règle d'or : **la vidéo n'est qu'un fond**. Sur `/intro`, un hotspot circulaire
(42 % de l'écran, centré à 50 % / 43 %) s'affiche par-dessus à la fin — le
sujet principal doit donc finir **centré légèrement au-dessus du milieu**.
Sur `/candidature`, la vidéo se coupe automatiquement à 3,1 s puis la feuille
apparaît — le zoom doit finir **sur le formulaire**.

Générer avec : Veo 3, Kling 2.x, Runway Gen-4 ou Pika (prompts en anglais,
ils répondent mieux). Durée cible 4–5 s, puis exporter en h264 sans audio.

---

## VIDÉO 1 — `intro-emblem-zoom.mp4` (équivalent casier → insigne)

### L'originale (LSPD), pour comprendre
Plan subjectif : un avant-bras avec **gant tactique noir** ouvre un **casier
métallique vert sombre de vestiaire de commissariat**, plonge la main dans
l'obscurité du casier pendant que la caméra **avance lentement** ; à la fin la
main saisit **l'insigne du LSPD** dans la pénombre. Étalonnage désaturé,
tons verts/froids, ambiance cinématique sombre.

### Prompt principal (à coller tel quel)

```
Cinematic POV shot, 4 seconds, 1920x1040. A muscular forearm wearing a
white medical nitrile glove (teal-tinted) opens a stainless steel medical
supply locker in a hospital staff room. The metal door swings open
revealing a dark interior. The gloved hand reaches into the dark locker
while the camera slowly and steadily pushes in (dolly-in). In the final
second, the hand grabs a glossy teal Star of Life medical emblem (six-branched
silver-blue star) sitting on the locker shelf. The emblem ends up centered
in frame, slightly above center, catching a soft rim of cold hospital
lighting. Color grade: desaturated, dark teal and steel-blue tones, heavy
atmosphere, volumetric haze, shallow depth of field. Realistic, photoreal,
24fps film look, no text, no logos other than the star emblem, no people
faces, slow smooth camera movement only.
```

### Variante « blouse médicale » (si tu préfères sans gant nitrile)

```
Cinematic POV shot, 4 seconds, 1920x1040. The arm of a paramedic wearing a
rolled-up white scrub sleeve opens a brushed-steel locker in a hospital
changing room, revealing a dark interior. The hand reaches in as the camera
dollies in slowly. Final beat: the fingers lift a glossy teal Star of Life
emblem from the locker shelf, holding it centered in frame, slightly above
center, lit by a soft cold edge light. Grade: desaturated teal and
steel-blue, filmic contrast, volumetric haze, shallow depth of field,
photoreal, slow smooth motion, no text, no faces.
```

### Poster statique (obligatoire) — `intro-emblem-poster.jpg`

C'est l'image affichée pendant que la vidéo charge (et son fallback) :

```
Photorealistic still frame, 1920x1040. Close-up of an open brushed-steel
medical locker in a dark hospital staff room, a gloved hand holding a
glossy teal Star of Life emblem centered slightly above the middle of the
frame, soft cold rim lighting, desaturated teal and steel-blue color grade,
volumetric haze, shallow depth of field, cinematic, no text.
```

### Points de contrôle
- [ ] Dernière frame : **l'étoile de vie est centrée à ~50 % / 43 %** de l'image (le hotspot du site s'y superpose)
- [ ] Étoile bien visible mais dans la pénombre (elle « ressort » au flash teal du clic)
- [ ] Pas de visage, pas de texte incrusté
- [ ] Export : h264, **sans piste audio**, ~4 s, `< 2 Mo` si possible

---

## VIDÉO 2 — `bureau-lsms-zoom.mp4` (équivalent bureau → formulaire)

### L'originale (LSPD), pour comprendre
Vue **plongée totale (top-down, God's eye)** : un homme en uniforme sombre
assis à un **grande bureau en bois**, un **formulaire LSPD-101** au centre,
**un mug de café** à droite, **un stylo dans la main droite** posé sur la
table. La caméra **zoome lentement** du plan large vers **un gros plan du
formulaire**, la main **tenant le stylo au-dessus du papier** comme prête à
signer. Bois chaud, lumière tamisée, sol carrelé gris visible autour du
bureau.

### Prompt principal (à coller tel quel)

```
Top-down God's eye view, cinematic, 4 seconds, 1920x1080. A man in a teal
medical uniform sits at a large warm wooden desk, seen directly from above,
his head and shoulders at the bottom of frame. Centered on the desk lies a
white medical recruitment form titled "LOS SANTOS MEDICAL SERVICES" with a
small red cross logo in the header. To the right of the form: a ceramic mug
of black coffee. His right hand holds a black pen resting on the desk next
to the paper. The camera performs one slow continuous zoom-in from the wide
top-down shot to a close-up of the form, ending framed on the paper with
the pen hovering above it, ready to sign. Warm wood tones, moody soft
lighting, grey tiled floor visible around the desk, photorealistic, filmic
grade, smooth slow camera movement, no faces visible, no text other than
the form header.
```

### Détail important : le formulaire dans la vidéo
Les générateurs vidéo **écrivent du faux texte illisible**. Deux options :
1. **Accepter le faux texte** (c'est ce que fait la vidéo LSPD : son
   formulaire affiche du charabia « LOS ANGELES POLICE DEPARTMENT ») —
   le formulaire réel du site apparaît juste après, personne ne lit la vidéo.
2. **Image-to-video** : générer d'abord une **image** du formulaire parfait
   (prompt ci-dessous), puis la donner en **last frame** à Kling/Runway pour
   que le zoom arrive exactement dessus.

### Prompt image du formulaire (pour last-frame / poster)

```
Top-down photorealistic shot, 1920x1080. A clean white paper form on a
warm wooden desk, header reading "LOS SANTOS MEDICAL SERVICES" in bold
letters with a small red cross symbol, subtitle "Direction des ressources
humaines, Central Medical, Pillbox Hill", fields organized in sections
with thin lines, a paper clip on the top left corner, a black pen held by
a hand entering the frame from the bottom right, ceramic coffee mug
partially visible at the right edge, soft moody lighting, warm wood
texture, filmic grade.
```

### Poster statique (obligatoire) — `bureau-lsms-poster.jpg`

```
Top-down God's eye view, photorealistic, 1920x1080. A man in a teal medical
uniform seated at a large wooden desk seen from directly above, a white
medical form centered on the desk, a coffee mug to its right, pen in his
hand, grey tiled floor around the desk, warm moody lighting, cinematic
grade, no visible face.
```

### Points de contrôle
- [ ] Le **formulaire finit plein cadre** à ~3 s (la vidéo est coupée à 3,1 s sur le site)
- [ ] Mug de café + stylo = signature visuelle de l'originale, à garder
- [ ] Pas de visage (homme vu de dessus, tête en bas du cadre)
- [ ] Export : h264, **sans audio**, ~4 s

---

## Fichiers à déposer ensuite

Une fois les 4 fichiers générés, dépose-les ici et je les intègre au site :

```
Desktop\site babou\site-lsms\public\lsms\uploads\
├── intro-emblem-zoom.mp4      (1920×1040)   → remplacera le fond actuel de /intro
├── intro-emblem-poster.jpg    (1920×1040)
├── bureau-lsms-zoom.mp4       (1920×1080)   → intro du formulaire /candidature
└── bureau-lsms-poster.jpg     (1920×1080)
```

L'intégration côté code est prête à recevoir la vidéo 1 (l'IntroClient LSMS
attend `/lsms/uploads/intro-emblem-zoom.mp4`, il bascule automatiquement en
mode vidéo dès que le fichier existe). La vidéo 2 demandera le même bloc
d'intro que le formulaire LSPD (je le porte au moment de l'intégration).

## Conseils générateur
- **Veo 3 / Flow** : meilleur rendu « filmique », gère bien le top-down.
- **Kling 2.x** : utilise le mode *start frame + end frame* avec les posters
  comme extrémités — le zoom sera exact.
- **Runway Gen-4** : mets `camera: slow dolly-in` dans les réglages plutôt
  que dans le prompt si l'option existe.
- **Negative prompt commun** : `faces, text overlays, watermarks, fast
  motion, camera shake, jump cuts, audio`
