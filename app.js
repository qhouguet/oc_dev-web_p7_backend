require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const Book = require("./models/Book");

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@clusterp7.pr6icdd.mongodb.net/?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.post("/api/books", (req, res, next) => {
  const book = new Book({
    ...req.body,
  });
  book
    .save()
    .then(() => res.status(201).json({ message: "Objet enregistré" }))
    .catch((error) => res.status(400).json({ error }));
});

app.get("/api/books/:id", (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
});

app.get("/api/books", (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
});

module.exports = app;
