# Proofline

Tests automatisés, vérification de sécurité et correctifs en langage clair pour les applications créées avec Lovable, Bolt, Cursor, Replit et v0.

Ce dépôt contient le frontend **TypeScript + Vite** (React 19, Tailwind CSS v4), avec interface bilingue **FR / EN** (français par défaut), thème **Sombre / Clair**, et simulation côté client (liste d’attente persistée dans `localStorage`, audit de capture et conseiller QA). Aucune variable d’environnement ni serveur backend n’est requis pour démarrer.

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
3. **Lancer le serveur de développement Vite** :
   ```bash
   npm run dev
   ```
4. **Ouvrir le site dans votre navigateur** à l’adresse affichée dans le terminal (par défaut) :
   ```text
   http://localhost:5173/
   ```

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Démarre le serveur de développement Vite avec rechargement à chaud (HMR) |
| `npm run lint` | Vérifie les types TypeScript (`tsc --noEmit`) |
| `npm run build` | Exécute `tsc --noEmit` puis génère le build de production dans `dist/` |
| `npm run preview` | Prévisualise localement le build de production généré dans `dist/` |

## Structure principale

- `index.html` — Point d’entrée HTML (initialisation thème/langue avant rendu)
- `src/App.tsx` — Mise en page principale, gestion du thème et de la langue (`fr` / `en`)
- `src/i18n/translations.ts` — Dictionnaire bilingue FR / EN
- `src/services/qaClient.ts` — Simulation TypeScript côté client (liste d’attente, audit de capture, conseiller QA)
- `src/components/` — Barre de navigation, Hero, Bento capacités, Studio QA en direct, Résultats & FAQ, Liste d’attente et Pied de page
