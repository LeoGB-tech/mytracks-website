# Déploiement Gratuit sur Railway + Domaine .ts

## 🚀 Option 1: Railway (100% Gratuit)

Railway offre un hébergement gratuit pour les applications Node.js.

### Étape 1: Créer un compte Railway
1. Va sur https://railway.app
2. Crée un compte avec GitHub
3. Tu auras 5$ de crédit gratuit chaque mois (suffisant pour ce projet)

### Étape 2: Connecter ton projet
1. Crée un nouveau projet sur Railway
2. Clique sur "Deploy from GitHub repo"
3. Connecte ton dépôt GitHub
4. Railway détectera automatiquement Node.js

### Étape 3: Variables d'environnement
Dans Railway, ajoute ces variables:
```
STRIPE_SECRET_KEY=sk_test_votre_cle
STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook
ADMIN_PASSWORD=24092017
```

### Étape 4: Base de données
Railway utilisera SQLite automatiquement (fichier local).

### Étape 5: Obtenir l'URL Railway
Une fois déployé, Railway te donnera une URL comme:
`https://mytracks-production.up.railway.app`

## 🌐 Option 2: Obtenir un vrai domaine .ts

### Pour un domaine .ts (Tchad):
1. **Registrar:** Namecheap, GoDaddy, ou Gandi
2. **Prix:** ~10-15€/an
3. **Extension:** .ts (Tchad)

### Étapes pour obtenir un domaine .ts:
1. Va sur un registrar (Namecheap, GoDaddy, etc.)
2. Recherche "mytracks.ts" ou autre nom
3. Achète le domaine (~10-15€/an)
4. Configure les DNS pour pointer vers Railway

### Configuration DNS:
Dans ton registrar, ajoute:
- **Type:** CNAME
- **Name:** @
- **Value:** ton-url-railway.up.railway.app

## 🎯 Option 3: Domaine gratuit .railway.app

Railway offre gratuitement un sous-domaine:
- Format: `ton-projet.railway.app`
- Gratuit
- Pas besoin d'acheter de domaine
- SSL automatique

## 📋 Résumé des options

| Option | Prix | URL | Avantages |
|--------|------|-----|-----------|
| Railway | Gratuit | `xxx.up.railway.app` | Simple, gratuit, SSL |
| Railway + Domaine .ts | ~10€/an | `mon-site.ts` | Professionnel, personnalisé |
| Railway + .railway.app | Gratuit | `xxx.railway.app` | Gratuit, SSL, personnalisé |

## 🔧 Configuration recommandée

**Pour commencer (gratuit):**
1. Déploie sur Railway
2. Utilise l'URL Railway fournie
3. Plus tard, achète un domaine .ts si tu veux

**Pour professionnel:**
1. Déploie sur Railway
2. Achète un domaine .ts (~10€/an)
3. Configure les DNS
4. Active SSL (gratuit sur Railway)

## 🚀 Déploiement rapide sur Railway

```bash
# 1. Initialise Git dans ton projet
git init
git add .
git commit -m "Initial commit"

# 2. Crée un dépôt sur GitHub
# 3. Push le code
git remote add origin https://github.com/ton-username/mytracks-website.git
git push -u origin main

# 4. Va sur Railway et connecte le dépôt
# Railway déploiera automatiquement
```

## ⚠️ Limites de Railway (Gratuit)
- 5$ de crédit/mois (suffisant pour ce projet)
- 512MB RAM
- 1GB stockage
- Sleep après 30min d'inactivité (se réveille en ~30sec)

Pour ce projet, ces limites sont suffisantes.
