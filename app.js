require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// Import des packages qui vont nous servir à sécuriser l'app et la BDD
// Helmet sécurise les headers et mongoSanitize vient supprimer
// les requêtes malveillantes
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

// Import de nos routes
const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');

// Connexion à la BDD avec nos identifiants
mongoose
	.connect(
		`mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@clusterp7.pr6icdd.mongodb.net/?retryWrites=true&w=majority`,
		{ useNewUrlParser: true, useUnifiedTopology: true }
	)
	.then(() => console.log('Connexion à MongoDB réussie !'))
	.catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

// On vient utiliser helmet pour rajouter une sécurité sur les headers
// mais on supprime sa propriété crossOriginRessourcePolicy car on gère déjà
// les CORS de notre côté
app.use(
	helmet({
		crossOriginResourcePolicy: false,
	})
);

// Gestion des CORS
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
	);
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
	next();
});

// ou bien const bodyParser = require('body-parser);
// app.use(bodyParser.json());

// Nous permet de lire de lire les données que l'on va récupérer en les
// "transformant" en objets javascript
app.use(express.json());

// On vient utiliser mongoSanitize après avoir parsé notre requête
// afin de venir y éliminer les potentielles injections malveillantes
app.use(mongoSanitize());

// Appel de nos routes
app.use('/api/auth', userRoutes);
app.use('/api/books', booksRoutes);
// Nous permet de servir les images dans l'app
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;
