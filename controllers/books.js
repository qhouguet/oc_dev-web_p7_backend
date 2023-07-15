const Book = require('../models/Book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
	const bookObject = JSON.parse(req.body.book);

	delete bookObject._id;
	delete bookObject._userId;

	// On créé notre book avec les informations du formulaire.
	const book = new Book({
		...bookObject,
		userId: req.auth.userId,
		imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
		averageRating: bookObject.ratings[0].grade,
	});

	let filename = book.imageUrl.split('/images/')[1];

	book.save()
		.then(() => res.status(201).json({ message: 'Objet enregistré' }))
		.catch(error => {
			// Si il y a une erreur dans la requête, on vient bien supprimer l'image
			// enregistrée par notre middleware multer
			fs.unlink(`images/${filename}`, err => {
				if (err) console.log(err);
			});
			res.status(400).json({ error });
		});
};

exports.modifyBook = (req, res, next) => {
	// On vient vérifier si il y a une image dans la requête
	// si oui on la parse pour rendre la requête manipulable
	// si non, on clone directement notre body de requête dans notre bookObject
	const bookObject = req.file
		? {
				...JSON.parse(req.body.book),
				imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
		  }
		: { ...req.body };

	// On supprime le userId envoyé par le front pour sécuriser l'app, et on utilisera
	// le userId retourné par notre middleware d'authentification qui se base sur le token
	delete bookObject._userId;
	Book.findOne({ _id: req.params.id })
		.then(book => {
			if (book.userId != req.auth.userId) {
				res.status(403).json({ message: 'Not authorized' });
			} else {
				// Si on a bien une nouvelle image dans notre requête, on vient
				// récupérer son url car elle sera créé dans tous les cas grâce au multer
				// et on veut la supprimer en cas d'erreur.
				let filename = '';
				if (req.file) {
					filename = book.imageUrl.split('/images/')[1];
				}
				Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
					.then(() => {
						fs.unlink(`images/${filename}`, err => {
							if (err) console.log(err);
						});
						res.status(200).json({ message: 'Objet modifié !' });
					})
					.catch(error => {
						// Si on a une erreur sur l'update, on supprime la nouvelle image.
						fs.unlink(`images/${req.file.filename}`, err => {
							if (err) console.log(err);
						});
						res.status(401).json({ error });
					});
			}
		})
		.catch(error => res.status(400).json({ error }));
};

exports.deleteBook = (req, res, next) => {
	Book.findOne({ _id: req.params.id })
		.then(book => {
			if (book.userId != req.auth.userId) {
				res.status(403).json({ message: 'Not authorized' });
			} else {
				const filename = book.imageUrl.split('/images/')[1];
				fs.unlink(`images/${filename}`, () => {
					Book.deleteOne({ _id: req.params.id })
						.then(() => {
							res.status(200).json({ message: 'Objet supprimé !' });
						})
						.catch(error => res.status(401).json({ error }));
				});
			}
		})
		.catch(error => {
			res.status(500).json({ error });
		});
};

exports.getBook = (req, res, next) => {
	Book.findOne({ _id: req.params.id })
		.then(book => res.status(200).json(book))
		.catch(error => res.status(404).json({ error }));
};

exports.getBooks = (req, res, next) => {
	Book.find()
		.then(books => res.status(200).json(books))
		.catch(error => res.status(400).json({ error }));
};

exports.getBestrating = (req, res, next) => {
	// On vient utiliser la méthode sort avec la clé que l'on veut sort
	// + "-1" pour spécifier que c'est par ordre décroissant
	// On utilise la méthode limit avec "3" pour ne garder que 3 résultats
	Book.find()
		.sort({ averageRating: -1 })
		.limit(3)
		.then(books => res.status(200).json(books))
		.catch(error => res.status(400).json({ error }));
};

exports.createRating = (req, res, next) => {
	Book.findOne({ _id: req.params.id })
		.then(book => {
			// On vient vérifier si un rating existe pour le user connecté, si c'est le cas, on le stocke dans
			// une variable
			const hasAlreadyVoted = book.ratings.find(rating => rating.userId === req.auth.userId);

			// Notre condition nous dit que si on a null, undefined, 0 ou false, on passe
			// ce qui veut dire que si on a trouvé aucun rating pour un user, il ou elle peut voter.
			if (!hasAlreadyVoted) {
				book.ratings.push({ userId: req.auth.userId, grade: req.body.rating });

				const ratings = book.ratings.map(rating => rating.grade);

				// On vient calculer notre moyenne avec la méthode reduce pour faire la somme
				// de toutes les notes et on la divise par la taille de notre tableau.
				// On utilise la méthode toFixed() pour arrondir à une décimale après la virgule.
				let averageRating =
					ratings.reduce((previous, current) => {
						return previous + current;
					}, 0) / ratings.length;
				averageRating = averageRating.toFixed(1);

				Book.findByIdAndUpdate(
					{ _id: req.params.id },
					{ ratings: book.ratings, averageRating: averageRating },
					{ new: true }
				)
					.then(book => res.status(200).json(book))
					.catch(error => res.status(401).json({ error }));
			} else {
				return res.status(400).json({ message: 'Vous avez déjà noté ce livre.' });
			}
		})
		.catch(error => {
			return res.status(500).json({ error });
		});
};
