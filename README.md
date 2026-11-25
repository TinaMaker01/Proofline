# Proofline

Tests automatisés, vérification de sécurité et correctifs en langage clair pour les applications créées avec Lovable, Bolt, Cursor, Replit et v0.

Ce dépôt contient le frontend **TypeScript + Vite** (React 19, Tailwind CSS v4) avec interface bilingue **FR / EN** (français par défaut), thème **Sombre / Clair**, et connexion sécurisée côté serveur à **Google AI Studio (`@google/genai`)** via le middleware dev Vite et des fonctions serverless `/api/*` (avec repli automatique local si aucune clé n’est définie).

## Prérequis

- **Node.js** 18 ou supérieur (recommandé : v20+ LTS)
- **npm** (fourni avec Node.js)

## Démarrer le projet en local

1. **Ouvrir le dossier du projet** dans votre terminal :
   ```bash
   cd Projet
   ```
2. **Installer les dépendances** :
   ```bash
   npm install
   ```
3. **Configurer la clé API Google AI Studio (optionnel)** :
   Copiez `.env.example` vers `.env.local` et renseignez votre clé (elle reste uniquement côté serveur, ne préfixez jamais par `VITE_`) :
   ```env
   GEMINI_API_KEY="votre_cle_google_ai_studio"
   ```
   *(Sans `.env.local`, le studio bascule automatiquement sur une simulation locale.)*
4. **Lancer le serveur de développement Vite** :
   ```bash
   npm run dev
   ```
5. **Ouvrir le site dans votre navigateur** :
   ```text
   http://localhost:5173/
   ```

## Déploiement (ex. Vercel)

1. Déployez le dépôt sur Vercel (détection automatique Vite + fonctions `/api/analyze-screenshot` et `/api/chat`).
2. Ajoutez `GEMINI_API_KEY` dans **Project Settings → Environment Variables** sur Vercel.

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Démarre Vite (`http://localhost:5173/`) avec relais API `/api/*` côté Node |
| `npm run lint` | Vérifie les types TypeScript (`tsc --noEmit`) |
| `npm run build` | Exécute `tsc --noEmit` puis génère le build de production dans `dist/` |
| `npm run preview` | Prévisualise localement le build de production généré dans `dist/` |

## Structure principale

- `index.html` — Point d’entrée HTML (initialisation thème/langue avant rendu)
- `vite.config.ts` — Configuration Vite + middleware API dev sécurisé (`/api/*`)
- `server/geminiService.ts` — Appels `@google/genai` côté serveur (audit multimodal & chat)
- `api/` — Fonctions serverless TypeScript (`/api/analyze-screenshot`, `/api/chat`) pour le déploiement
- `src/App.tsx` — Mise en page principale, gestion du thème et de la langue (`fr` / `en`)
- `src/i18n/translations.ts` — Dictionnaire bilingue FR / EN
- `src/services/qaClient.ts` — Client API avec repli local automatique et waitlist `localStorage`
- `src/components/` — Barre de navigation, Hero, Bento capacités, Studio QA en direct, Résultats & FAQ, Liste d’attente et Pied de page
