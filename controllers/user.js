const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// On fait appel à notre modèle
const User = require('../models/User');

exports.signup = (req, res, next) => {
	try {
		// L'adresse mail doit être au format string@string.string
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		// Le mot de passe doit faire entre 8 et 20 caractères, il doit contenir
		// au minimum un chiffre, une majuscule et une minuscule
		const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/;

		// On vient faire nos vérifications avec nos regex
		if (!emailRegex.test(req.body.email)) {
			res.status(400).json({ message: 'Adresse email non valide' });
		} else if (!passwordRegex.test(req.body.password)) {
			res.status(400).json({ message: 'Mot de passe invalide' });
		} else {
			// On vient chiffrer le password en le hashant avec bcrypt
			// puis on l'enregistre dans la BDD si pas de soucis
			bcrypt
				.hash(req.body.password, 10)
				.then(hash => {
					const user = new User({
						email: req.body.email,
						password: hash,
					});
					user.save()
						.then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
						.catch(error => res.status(400).json({ error }));
				})
				.catch(error => res.status(500).json({ error }));
		}
	} catch (error) {
		res.status(500).json({ error });
	}
};

exports.login = (req, res, next) => {
	// On vient pointer sur notre user dans la BDD qui correspond à l'email que l'on a fourni
	User.findOne({ email: req.body.email })
		.then(user => {
			if (user === null) {
				res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte' });
			} else {
				// On vient vérifier le password en comparant les hash
				bcrypt
					.compare(req.body.password, user.password)
					.then(valid => {
						if (!valid) {
							res.status(401).json({
								message: 'Paire identifiant/mot de passe incorrecte',
							});
						} else {
							res.status(200).json({
								userId: user._id,
								token: jwt.sign({ userId: user._id }, process.env.TOKEN, {
									expiresIn: '24h',
								}),
							});
						}
					})
					.catch(error => res.status(500).json({ error }));
			}
		})
		.catch(error => res.status(500).json({ error }));
};
