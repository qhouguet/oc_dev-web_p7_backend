const express = require("express");
const router = express.Router();

const booksCtrl = require("../controllers/books");

router.post("/", booksCtrl.createBook);
router.put("/:id", booksCtrl.modifyBook);
router.delete("/:id", booksCtrl.deleteBook);
router.get("/:id", booksCtrl.getBook);
router.get("/", booksCtrl.getBooks);

module.exports = router;
