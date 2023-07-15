# Développez le back-end d'un site de notation de livres

## Scénario : 

Développeur back-end freelance, je suis contacté par mon ami Kévin qui me propose un projet de création de site de notation de livres pour une petite chaîne de librairies. 
Kévin se charge de faire développer le front-end du site et de créer la maquette, je suis chargé de développer le back-end.

Pour cela, j'ai eu à ma disposition :

* La maquette figma : https://www.figma.com/file/Snidyc45xi6qchoOPabMA9/Maquette-Mon-Vieux-Grimoir?node-id=0%3A1
* Les spécifications fonctionnelles du site : https://course.oc-static.com/projects/D%C3%A9veloppeur+Web/DW_P7+Back-end/DW+P7+Back-end+-+Specifications+fonctionnelles.pdf
* Les spécifications techniques de l'API : https://course.oc-static.com/projects/D%C3%A9veloppeur+Web/DW_P7+Back-end/DW+P7+Back-end+-+Specifications+API.pdf
* Le repository du code du front-end : https://github.com/OpenClassrooms-Student-Center/P7-Dev-Web-livres

## Utilisation en local

Créez un fichier .env à la racine et copiez / collez y ceci :

```.env
DB_NAME=test
DB_PASS=test
TOKEN=RANDOM_TOKEN_SECRET
```

Pensez à installer **nodemon**

Pour déployer ce projet en local, clonez le repository, installez les dépendances et utilisez la commande 

```bash
  git clone https://github.com/qhouguet/oc_dev-web_p7_backend.git
```
```bash
  cd my-project
```
```bash
  npm install
```
```bash
  nodemon server
```

## Structure du code 

Le fichier **server.js** contient la création du server.
Le fichier **app.js** contient la logique de l'application avec l'appel des routes notamment.

Les routes sont dans le dosier **routes**
Les middlewares d'authentification et le multer sont dans le dossier **middleware**
Les controllers qui contiennent la logique CRUD du projet sont dans le dossier **controllers*

Le dossier images contient les images envoyées depuis le front.
