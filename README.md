# ES Doubs Shirt Order

Je te propose de le concevoir comme un petit outil interne ES Doubs, très simple pour les parents, mais suffisamment structuré pour que toi ou le club puissiez récupérer directement les commandes.

1. Structure générale

Le site aurait une adresse du type :

tshirt-esdoubs.vercel.app

Et surtout des liens directs par groupe :

tshirt-esdoubs.vercel.app/u6-u7

tshirt-esdoubs.vercel.app/u8

tshirt-esdoubs.vercel.app/u9

tshirt-esdoubs.vercel.app/loisir

Ainsi, dans chaque groupe WhatsApp, tu donnes uniquement le lien correspondant.

ÉCRAN 1 — Accueil

5

Une page très épurée :

ES DOUBS

👕 T-shirts licenciés 2026/2027

Le t-shirt est offert avec la licence.
Merci de renseigner les informations de votre enfant afin de préparer la commande.

Puis :

Sélectionnez votre groupe

U6 – U7
U8
U9
Foot Loisir

En bas :

⚠️ Merci de remplir un formulaire pour chaque enfant.

ÉCRAN 2 — Formulaire du groupe

Si le parent arrive par le lien /u8, on ne lui demande pas de choisir son groupe.

En haut :

👕 T-shirt — U8

Merci de renseigner les informations de votre enfant.

1. Prénom de l'enfant

[ Prénom ]

Champ obligatoire.

2. Initiales

[ XX ]

Exemple affiché sous le champ :

Exemple : ND

On limite à quelques caractères et on transforme automatiquement en majuscules.

3. Taille du t-shirt

Une liste déroulante avec exactement les tailles disponibles :

ENFANT

 Enfant - 4 ANS

 Enfant - 6 ANS

 Enfant - 8 ANS

 Enfant - 10 ANS

 Enfant - 12 ANS

 Enfant - 14 ANS

ADULTE

 Adulte - S

 Adulte - M

 Adulte - L

 Adulte - XL

 Adulte - XXL

 Adulte - 3XL

 Adulte - 4XL

Pour les groupes U6-U9, on peut mettre les tailles enfant en premier, mais laisser les tailles adultes disponibles au cas où.

ÉCRAN 3 — Vérification

Avant l'enregistrement :

Vérifiez votre demande

Groupe : U8
Prénom : Adam
Initiales : AD
Taille : Enfant - 8 ANS

← Modifier

✅ Confirmer

Cela évite les erreurs de taille.

ÉCRAN 4 — Confirmation

Une fois validé :

✅ Demande enregistrée

Merci ! Les informations pour le t-shirt d'Adam ont bien été enregistrées.

U8 — Enfant 8 ANS

Vous pouvez fermer cette page.

Et éventuellement :

➕ Ajouter un autre enfant

Très pratique pour un parent qui a deux ou trois enfants au club.

5. Le fonctionnement des réponses

C'est là que le mini-site devient intéressant.

Chaque validation crée une ligne dans la base de données :

IDGroupePrénomInitialesTailleDate001U6-U7AdamADEnfant - 8 ANS17/09002U6-U7YassineYSEnfant - 10 ANS17/09003U8LucasLBEnfant - 8 ANS17/09004U9EnzoEDAdulte - S17/09

Le parent n'a pas besoin de créer de compte.

6. Une page ADMIN pour toi

Tu aurais une adresse du genre :

tshirt-esdoubs.vercel.app/admin

Avec une connexion protégée.

Tableau principal

Commandes t-shirts — Saison 2026/2027

GroupePrénomInitialesTailleU6-U7AdamADEnfant - 8 ANSU6-U7YassineYSEnfant - 10 ANSU8LucasLBEnfant - 8 ANSU9EnzoEDAdulte - S

Filtres :

Groupe : Tous / U6-U7 / U8 / U9 / Loisir

Taille : Toutes / 4 ans / 6 ans / etc.

Et recherche :

🔎 Rechercher un enfant

7. Le plus important : le récapitulatif des quantités

En haut de l'administration, je mettrais automatiquement :

📦 Récapitulatif commande

Total : 47 t-shirts

TailleQuantitéEnfant - 4 ANS2Enfant - 6 ANS5Enfant - 8 ANS12Enfant - 10 ANS15Enfant - 12 ANS7Enfant - 14 ANS3Adulte - S1Adulte - M2Adulte - L0Adulte - XL0Adulte - XXL0Adulte - 3XL0Adulte - 4XL0

Ça te donne directement la commande à transmettre au club.

8. Récapitulatif par groupe

Autre vue très utile :

U6-U7 — 15 enfants

TailleNombre4 ANS16 ANS38 ANS610 ANS412 ANS1

U8 — 12 enfants

etc.

U9 — 10 enfants

etc.

Foot Loisir — 10 enfants

etc.

9. Export pour le club

Je mettrais deux boutons.

📊 Export Excel

Téléchargement d'un fichier :

Commande_Tshirts_ES_Doubs_2026-2027.xlsx

Avec une feuille :

COMMANDES

GroupePrénomInitialesTaille

Et une deuxième feuille :

RÉCAPITULATIF

TailleTotal

Et éventuellement une feuille par groupe :

 U6-U7

 U8

 U9

 Loisir

🖨️ Export PDF

Un PDF propre pour transmettre au responsable de la commande :

ES DOUBS — COMMANDE T-SHIRTS 2026/2027

Puis le récapitulatif des tailles.

10. Gestion des modifications

Je prévoirais aussi un bouton :

✏️ Modifier

Parce qu'il y aura forcément un parent qui dira :

« Je me suis trompé, j'ai mis 8 ans au lieu de 10 ans. »

Toi, dans l'admin, tu peux modifier directement la ligne.

Et :

🗑️ Supprimer

si un enfant quitte le dispositif ou si une réponse a été enregistrée deux fois.

11. Une petite sécurité contre les doublons

Je ne demanderais pas aux parents de créer un compte : trop contraignant.

À la place, on peut afficher après validation :

Votre demande a bien été enregistrée.

Et dans l'administration, tu peux détecter facilement :

⚠️ Doublons potentiels

Par exemple :

Adam — U8 — AD — 8 ans
Adam — U8 — AD — 10 ans

Tu peux alors vérifier et supprimer la mauvaise réponse.

12. Design

Je resterais dans l'identité ES Doubs :

 rouge : #E31E24

 bleu : #1E3A8A

 touches dorées : #D4AF37

 fond blanc

 gros boutons

 très lisible sur téléphone

 aucun élément inutile

L'objectif est que le parent puisse remplir le formulaire en moins d'une minute depuis WhatsApp.

13. Ce que je choisirais techniquement

Pour le faire correctement, je partirais sur :

Frontend : Next.js
Hébergement : Vercel
Base de données : une base externe compatible avec Vercel
Administration : espace sécurisé
Export : Excel + PDF

Point important : Vercel seul ne doit pas servir de stockage des réponses. Il faut une vraie base de données derrière pour que les réponses des parents restent disponibles et que l'export fonctionne correctement.

Et je ferais surtout une chose :

Pas de formulaire différent codé quatre fois.

On crée un seul système, mais avec quatre URLs :

/u6-u7
/u8
/u9
/loisir

Le groupe est automatiquement déterminé par l'URL. Ça rend le site beaucoup plus facile à maintenir.

📱 Exemple concret côté parent

Dans WhatsApp U8 :

👕 T-shirts offerts avec la licence

Merci de renseigner les informations de votre enfant via ce lien :

👉 [Je renseigne mon enfant]

Merci de le faire avant [date].

Le parent clique → U8 déjà sélectionné → prénom → initiales → taille → confirmer → terminé.

C'est exactement ce que je ferais pour ton club : très simple côté parents, mais beaucoup plus puissant côté gestion.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/adf74f5f-93d2-4cac-a2cf-5e1e6f794425).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
