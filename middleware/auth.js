require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
	try {
		// On garde que la partie après le "BEARER"
		const token = req.headers.authorization.split(' ')[1];

		// On décode l'userId stocké dans le token et on le vérifie par rapport
		// à celui de la requête envoyée, si c'est le cas on renvoie le userId dans la propriété auth de la requête.

		const decodedToken = jwt.verify(token, process.env.TOKEN);
		const userId = decodedToken.userId;
		req.auth = {
			userId: userId,
		};
		next();
	} catch (error) {
		res.status(401).json({ error });
	}
};
