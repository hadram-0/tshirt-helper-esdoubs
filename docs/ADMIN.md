# Espace admin ES Doubs — configuration et test

## 1. Base de données (Supabase)

Table `public.tshirt_orders` (migrations dans `supabase/migrations/`) :

| Colonne      | Type          | Détail                                      |
| ------------ | ------------- | ------------------------------------------- |
| `id`         | `uuid`        | clé primaire, générée automatiquement       |
| `group_slug` | `text`        | `u6-u7` / `u8` / `u9` / `loisir`            |
| `first_name` | `text`        | prénom de l'enfant (obligatoire)            |
| `last_name`  | `text`        | nom de famille (facultatif, défaut `''`)    |
| `initials`   | `text`        | 1 à 4 caractères, stockés en majuscules     |
| `size`       | `text`        | ex. `Enfant - 8 ANS`, `Adulte - XL`         |
| `created_at` | `timestamptz` | affiché au format `JJ/MM/AAAA` dans l'admin |

RLS activée : les parents (clé publique `anon`) peuvent uniquement **insérer**. Aucune lecture
n'est possible avec la clé publique — l'admin lit les données côté serveur avec la clé
`service_role`, jamais exposée au navigateur.

## 2. Variables d'environnement

Côté serveur (Lovable Cloud / Vercel → Settings → Environment Variables) :

| Variable                    | Rôle                                                               |
| --------------------------- | ------------------------------------------------------------------ |
| `SUPABASE_URL`              | URL du projet Supabase                                             |
| `SUPABASE_SERVICE_ROLE_KEY` | clé `service_role` (lecture/modification/suppression côté serveur) |
| `ADMIN_PASSWORD`            | mot de passe de la page `/admin`                                   |
| `SESSION_SECRET`            | secret de signature du cookie de session (32 caractères minimum)   |

Côté navigateur (formulaire parents) : `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY`.

Générer un secret de session :

```sh
openssl rand -hex 32
```

Si l'une de ces variables manque, `/admin` affiche désormais un message explicite
(« Configuration incomplète » ou « Impossible de charger les commandes : … ») au lieu d'une page
vide.

## 3. Test en local

```sh
bun install            # ou npm install
cp .env .env.local     # puis compléter les variables serveur ci-dessous
```

Ajouter dans `.env` (fichier non poussé avec les secrets serveur) :

```sh
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
ADMIN_PASSWORD=choisir-un-mot-de-passe
SESSION_SECRET=<sortie de openssl rand -hex 32>
```

Puis :

```sh
bun run dev
```

- Formulaire parent : http://localhost:3000/u8
- Admin : http://localhost:3000/admin

## 4. Données d'exemple

Exécuter `supabase/seed.sql` dans le SQL Editor Supabase (il contient 10 demandes, dont un doublon
volontaire pour vérifier la section « ⚠️ Doublons potentiels »).

Nettoyage :

```sql
DELETE FROM public.tshirt_orders WHERE initials LIKE 'Z%';
```

## 5. Déploiement

Aucun serveur supplémentaire : les lectures/écritures admin passent par les _server functions_
TanStack Start (`src/lib/orders.functions.ts`), déployées avec le site. Il suffit de définir les
quatre variables serveur sur l'hébergeur, puis de redéployer.

## 6. Fonctionnalités de `/admin`

- Connexion par mot de passe (cookie signé, 12 h).
- Récapitulatif global : total et quantité par taille.
- Récapitulatif par groupe.
- Tableau : Groupe | Prénom | Nom | Initiales | Taille | Date | Actions.
- Filtres groupe / taille et recherche par prénom, nom ou initiales.
- Modification et suppression d'une demande.
- Doublons potentiels : même groupe + prénom + initiales avec des tailles différentes, avec
  suppression directe.
- Exports `Commande_Tshirts_ES_Doubs_2026-2027.xlsx` (feuilles COMMANDES, RÉCAPITULATIF, une par
  groupe) et PDF, tous deux dédoublonnés (demandes strictement identiques comptées une seule fois).
