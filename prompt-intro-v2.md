# Prompt — nouvelle intro LSMS : le médecin ouvre son tiroir et sort le dossier

Objectif : remplacer la vidéo de `/intro` (casier → badge) par une scène de
bureau, en gardant la **dernière frame sur le logo bien centré** — c'est ce qui
permet au site de poser son anneau cliquable pile dessus et d'enchaîner le vol
du logo vers l'accueil.

## Règles à respecter (sinon le site casse)

| Contrainte | Pourquoi |
|---|---|
| Dernière frame : logo **centré à ~50 % / 50 %** | l'anneau cliquable est calculé sur cette position |
| Logo occupant **~28 % de la largeur** de l'image | taille du logo au moment du départ du vol |
| Logo **face caméra**, sans reflet ni flou | sinon la reprise par le PNG du site se voit |
| Fin **immobile** (pas de mouvement à la dernière seconde) | la vidéo s'arrête sur cette image |
| 4 à 5 secondes, 16:9, **sans audio** | la vidéo joue une fois puis la feuille/le site prend le relais |
| Aucun texte lisible autre que l'emblème | les générateurs écrivent du faux texte illisible |

---

## Prompt principal (à copier-coller)

```
Cinematic 4-second shot, 16:9, photorealistic. A doctor in a white coat with a
stethoscope sits at a large dark wooden desk in a dimly lit hospital office,
seen from a three-quarter over-the-shoulder angle. His hand pulls open the top
desk drawer — the drawer slides out smoothly revealing documents inside — then
reaches in and lifts out a dark navy blue document folder. On the front cover
of the folder, printed dead center, is a clean circular hospital emblem: a
six-branched red star of life inside a light blue circle with a thin white
border. He lays the folder flat on the desk, cover facing straight up toward
the camera, and lets it settle. The camera then performs one slow, smooth
continuous push-in that ends framed on the folder cover, with the circular
emblem perfectly centered in the middle of the image and occupying about
thirty percent of the frame width. The image becomes completely still on the
last half second. Cool blue medical color grade, soft practical desk-lamp
lighting from the left, shallow depth of field, subtle volumetric haze on the
lens, cinematic filmic look, slow steady camera movement only, realistic
hands, no readable text anywhere except the emblem, no face visible.
```

## Negative prompt

```
faces, text, captions, subtitles, watermark, logo text, fast motion, camera
shake, jump cut, glitch, morphing hands, extra fingers, warped emblem, audio
```

## Variante « vue plongée » (comme la vidéo du formulaire)

```
Cinematic 4-second shot, 16:9, photorealistic. Top-down God's eye view of a
dark wooden desk in a dim hospital office. A doctor in a white coat, seen
directly from above with his head and shoulders at the bottom of the frame,
pulls open the desk drawer with his left hand and takes out a dark navy blue
document folder. He places it flat on the desk, cover facing straight up. In
the center of the cover is a clean circular hospital emblem: a six-branched red
star of life inside a light blue circle, centered on the folder. The camera
performs one slow continuous zoom-in that ends framed on the folder cover with
the emblem perfectly centered in the middle of the image, about thirty percent
of the frame width, and the image becomes perfectly still on the last half
second. Cool blue medical grade, soft lamp lighting, wood texture, shallow
depth of field, photorealistic, no face visible, no readable text except the
emblem.
```

## Prompt du poster (image fixe, dernière frame)

Sert d'image de chargement ET de repère visuel ; il doit correspondre à la fin de la vidéo :

```
Photorealistic still frame, 16:9. Close-up of a dark navy blue document folder
lying flat on a wooden desk in a dim hospital office, cover facing the camera.
Perfectly centered on the cover is a clean circular hospital emblem: a
six-branched red star of life inside a light blue circle with a thin white
border, occupying about thirty percent of the frame width. Soft warm lamp light
from the left, cool blue shadows, shallow depth of field, cinematic, no text,
no hands, no face.
```

---

## Réglages d'export

- Durée **4 à 5 s**, 30 fps, **MP4 h264 sans audio**
- Ratio 16:9 (n'importe quelle résolution : je recadre en 1920×1040)
- Envoie-moi le fichier, je m'occupe de l'encodage, du poster, du renommage
  anti-cache et du déploiement Vercel

## Si tu utilises Kling / Runway (start + end frame)

Donne le **poster ci-dessus comme image de fin** : le modèle forcera le zoom à
se terminer exactement sur le logo centré, et la reprise par le site sera
parfaite. C'est la méthode la plus fiable.

## Ce que je ferai de ton fichier

1. Encodage 1920×1040, sans audio, compressé (~1-2 Mo)
2. Extraction du poster depuis la dernière frame
3. Remesure de la position/taille du logo pour l'anneau cliquable
4. Remplacement de `intro-emblem-zoom.mp4` (version `-v2` pour casser le cache)
5. Push GitHub → déploiement Vercel automatique
