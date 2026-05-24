# MyTracks & Tracks Infox - Site Web

Site web pour héberger et vendre vos applications MyTracks et Tracks Infox.

## 📋 Structure du projet

```
mytracks-website/
├── index.html              # Page principale du site
├── server.js               # Backend API (Node.js + Express)
├── package.json            # Dépendances du backend
├── .env                    # Variables d'environnement
├── database.sqlite         # Base de données (créée automatiquement)
└── downloads/              # Fichiers d'installation
    ├── MyTracks-Portable.exe
    └── (autres fichiers à ajouter)
```

## 🚀 Installation

1. **Installer les dépendances:**
```bash
npm install
```

2. **Configurer les variables d'environnement:**
```bash
# Éditez le fichier .env et ajoutez vos clés Stripe
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete_ici
STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique_ici
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret_ici
ADMIN_PASSWORD=admin123
```

3. **Lancer le serveur:**
```bash
npm start
```

Le site sera accessible sur `http://localhost:3000`

## 💳 Configuration Stripe

1. Créez un compte sur [Stripe](https://stripe.com)
2. Obtenez vos clés API depuis le dashboard Stripe
3. Ajoutez-les dans le fichier `.env`
4. Configurez le webhook pour recevoir les notifications de paiement

## 🔐 Panel Admin

- Cliquez sur le bouton "Admin" dans la navigation
- Mot de passe par défaut: `admin123`
- Fonctionnalités disponibles:
  - Gestion des prix
  - Activation de promos globales
  - Création de codes promo
  - Gestion des mises à jour

## 📦 Fichiers d'installation

### MyTracks
- **Windows:** `MyTracks-Portable.exe` (déjà créé)
- **Mac:** À créer avec Electron Builder
- **Linux:** À créer avec Electron Builder
- **Android:** À créer avec Capacitor/Cordova

### Tracks Infox
- **Windows:** À fournir
- **Mac:** À créer
- **Linux:** À créer
- **Android:** À créer

## 🔧 Comment me fournir l'autre app (Tracks Infox)

Pour intégrer Tracks Infox dans le projet:

1. **Option 1 - Copier le projet:**
   - Mettez le projet Tracks Infox dans `c:\Users\Leo\Documents\tracks-infox`
   - Je pourrai alors créer les installateurs pour toutes les plateformes

2. **Option 2 - Fournir les fichiers:**
   - Si vous avez déjà les fichiers d'installation, mettez-les dans le dossier `downloads/`
   - Nommez-les comme suit:
     - `TracksInfox-Windows.exe`
     - `TracksInfox-Mac.dmg`
     - `TracksInfox-Linux.AppImage`
     - `TracksInfox-Android.apk`

## 🌐 Déploiement

### Option 1 - VPS (Recommandé)
1. Louez un VPS (DigitalOcean, Hetzner, etc.)
2. Installez Node.js
3. Uploadez les fichiers
4. Installez les dépendances: `npm install`
5. Lancez avec PM2: `pm2 start server.js`
6. Configurez Nginx comme reverse proxy

### Option 2 - Heroku/Vercel
1. Créez un fichier `Procfile`
2. Push le code sur GitHub
3. Connectez le repo à Heroku/Vercel
4. Configurez les variables d'environnement

## 📱 Système de mise à jour automatique

Les applications MyTracks et Tracks Infox utilisent `electron-updater` pour les mises à jour automatiques:

1. L'admin téléverse la nouvelle version dans le panel admin
2. Le fichier est stocké sur le serveur
3. Les applications vérifient automatiquement les mises à jour
4. Les utilisateurs avec une ancienne version reçoivent une notification

## 🎨 Personnalisation

### Modifier les couleurs
Éditez le fichier `index.html` et modifiez les classes Tailwind CSS.

### Modifier les prix
Utilisez le panel admin ou modifiez directement dans la base de données.

### Ajouter des vidéos de présentation
Remplacez les placeholders dans `index.html` par des vidéos YouTube ou hébergées.

## 📊 Base de données

La base de données SQLite contient les tables suivantes:
- `users` - Utilisateurs et admin
- `products` - Produits et prix
- `promos` - Codes promo
- `global_promo` - Promos globales
- `purchases` - Achats
- `updates` - Mises à jour

## 🔒 Sécurité

- Changez le mot de passe admin par défaut
- Utilisez des clés Stripe en production
- Configurez HTTPS avec Let's Encrypt
- Limitez l'accès au panel admin par IP

## 📞 Support

Pour toute question ou problème, contactez-moi.

## 📝 Notes importantes

- Le système de paiement Stripe est en mode test par défaut
- Pour passer en production, changez les clés API
- Les fichiers d'installation doivent être signés pour Windows
- Configurez correctement les webhooks Stripe
- Testez bien le système avant de mettre en production
