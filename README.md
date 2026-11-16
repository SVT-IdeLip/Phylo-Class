# Phylo-Class : quel lien de parenté ?

Jeu de classification pour la classe : associer des animaux à leurs fiches, remplir un tableau
d’attributs, emboîter des boîtes et construire un arbre de parenté.

## Arborescence

```
phylo-class/
├── index.html            page d’accueil du jeu
├── favicon.svg           icône de l’onglet
├── .nojekyll             utile pour GitHub Pages
└── assets/
    ├── css/style.css     mise en page et charte graphique
    ├── js/data.js        liste des animaux et chemins des images
    ├── js/app.js         logique du jeu
    └── img/              20 images : an-*.jpg (animaux) et at-*.jpg (fiches)
```

## Mettre le site en ligne

Il suffit de déposer **tout le dossier** `phylo-class` sur un hébergement de pages web :

- **GitHub Pages** : créer un dépôt, y envoyer le contenu du dossier, puis activer Pages (branche principale, dossier racine).
- **Hébergement classique (FTP) ou espace web de l’établissement (ENT)** : copier le dossier tel quel ; le jeu s’ouvre via `index.html`.
- **Test en local** : ouvrir `index.html` dans le navigateur, ou lancer `python3 -m http.server` dans le dossier.

Le site est statique : aucun serveur, base de données ni compilation n’est nécessaire.

## Réglages et limites de la version hébergée

- Les **codes** du mode paramétrage sont déjà intégrés (sous forme chiffrée) dans `assets/js/app.js`
  (constante `DEFAULT_CFG`). Si un enseignant les modifie dans le jeu, le changement ne vaut que pour
  **le navigateur utilisé** : les réglages ne sont pas partagés entre appareils.
- Les **scores des élèves ne sont pas enregistrés** sur un serveur.
- Les polices (Lilita One, Nunito) sont chargées depuis Google Fonts ; sans connexion, des polices du système
  les remplacent. Pour un site entièrement autonome, on peut télécharger ces polices et les déclarer dans `style.css`.
- Pour changer d’animal ou de fiche, remplacer les images dans `assets/img/` en gardant les mêmes noms.
