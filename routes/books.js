const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

const booksCtrl = require("../controllers/books");

router.get("/bestrating", booksCtrl.getBestrating);
router.get("/:id", booksCtrl.getBook);
router.get("/", booksCtrl.getBooks);
router.post("/", auth, multer, booksCtrl.createBook);
router.post("/:id/rating", auth, booksCtrl.createRating);
router.put("/:id", auth, multer, booksCtrl.modifyBook);
router.delete("/:id", auth, booksCtrl.deleteBook);

module.exports = router;
