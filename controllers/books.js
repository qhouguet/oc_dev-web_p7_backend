const Book = require("../models/Book");

// exports.createBook = (req, res, next) => {
//   const book = new Book({
//     ...req.body,
//   });
//   book
//     .save()
//     .then(() => res.status(201).json({ message: "Objet enregistré" }))
//     .catch((error) => res.status(400).json({ error }));
// };

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);

  delete bookObject._id;
  delete bookObject._userId;

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    averageRating: bookObject.ratings[0].grade,
  });

  book
    .save()
    .then(() => res.status(201).json({ message: "Objet enregistré" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.modifyBook = (req, res, next) => {
  Book.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    .then(() => res.status(200).json({ message: "Objet modifié" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteBook = (req, res, next) => {
  Book.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: "Objet supprimé !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.getBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

exports.getBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};