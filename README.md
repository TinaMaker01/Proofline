# Proofline

Tests passifs de sécurité et détection de régressions pour les applications générées avec Lovable, Bolt, Cursor, Replit et v0.

Ce dépôt contient le frontend **TypeScript + Vite** (React 19, Tailwind CSS v4) aligné sur le cahier des charges de validation :
- Interface bilingue **FR / EN** (français par défaut) et thème **Sombre / Clair**
- Tunnel d’inscription en **2 étapes** (étape 1 : e-mail + RGPD ; étape 2 facultative : outil, base, utilisateurs, crainte, budget, URL avec certification de propriété, entretien 15 min)
- Capture automatique des paramètres **UTM** et test de prix (*« Ça m’intéresse »*)
- **Studio démo IA** (`LiveQAStudio`) connecté à Google AI Studio (`@google/genai`) côté serveur
- Route `/api/leads` prête pour **Supabase** + **Resend** (e-mail automatique de bienvenue), avec repli automatique dans `localStorage` si non configuré
- Pages/modales **Mentions légales**, **Politique de confidentialité (RGPD)**, **Contact**, `robots.txt` et `sitemap.xml`

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
3. **Configurer `.env.local` (optionnel en local)** :
   Copiez `.env.example` vers `.env.local` et renseignez les clés souhaitées (jamais préfixées par `VITE_`) :
   ```env
   GEMINI_API_KEY="votre_cle_google_ai_studio"

   # Optionnel : persistance des inscrits et clics tarifs dans Supabase
   SUPABASE_URL="https://votre-projet.supabase.co"
   SUPABASE_SERVICE_ROLE_KEY="votre_cle_service_role"

   # Optionnel : e-mail de bienvenue automatique via Resend
   RESEND_API_KEY="re_..."
   RESEND_FROM_EMAIL="Andy <bonjour@votredomaine.com>"
   ```
   *(Sans Supabase/Resend, les inscriptions et clics tarifs sont conservés localement dans `localStorage`. Sans `GEMINI_API_KEY`, le studio bascule sur une simulation locale.)*
4. **Créer les tables Supabase (si utilisé)** :
   Exécutez le script SQL [supabase/schema.sql](supabase/schema.sql) dans l’éditeur SQL de Supabase.
5. **Lancer le serveur de développement Vite** :
   ```bash
   npm run dev
   ```
6. **Ouvrir le site** sur `http://localhost:5173/`.

## Déploiement (Vercel recommandé)

1. Déployez le dépôt sur Vercel (Vite + dossier `/api` détectés automatiquement).
2. Ajoutez vos variables d’environnement (`GEMINI_API_KEY`, et optionnellement `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`) dans **Project Settings → Environment Variables**.

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Démarre Vite (`http://localhost:5173/`) avec relais API `/api/*` côté Node |
| `npm run lint` | Vérifie les types TypeScript (`tsc --noEmit`) |
| `npm run build` | Exécute `tsc --noEmit` puis génère le build de production dans `dist/` |
| `npm run preview` | Prévisualise localement le build de production généré dans `dist/` |
