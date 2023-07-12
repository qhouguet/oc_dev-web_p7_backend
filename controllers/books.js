const Book = require('../models/Book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
	const bookObject = JSON.parse(req.body.book);

	delete bookObject._id;
	delete bookObject._userId;

	const book = new Book({
		...bookObject,
		userId: req.auth.userId,
		imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
		averageRating: bookObject.ratings[0].grade,
	});

	book.save()
		.then(() => res.status(201).json({ message: 'Objet enregistré' }))
		.catch(error => res.status(400).json({ error }));
};

exports.modifyBook = (req, res, next) => {
	const bookObject = req.file
		? {
				...JSON.parse(req.body.book),
				imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
		  }
		: { ...req.body };

	delete bookObject._userId;
	Book.findOne({ _id: req.params.id })
		.then(book => {
			if (book.userId != req.auth.userId) {
				res.status(403).json({ message: 'Not authorized' });
			} else {
				Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
					.then(() => res.status(200).json({ message: 'Objet modifié !' }))
					.catch(error => res.status(401).json({ error }));
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
			const hasAlreadyVoted = book.ratings.find(rating => rating.userId === req.auth.userId);

			if (!hasAlreadyVoted) {
				book.ratings.push({ userId: req.auth.userId, grade: req.body.rating });

				const ratings = book.ratings.map(rating => rating.grade);
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
