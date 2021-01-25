const jwt = require('jsonwebtoken'); //Pour verifier le token d'identification
require('dotenv').config();

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization;//On va chercher le token dans les headers de la requête
        const decodedToken = jwt.verify(token, `${process.env.TOKEN}`); //On le vérifie à l'aide de la variable environnement enregistrée
        const userId = decodedToken.userId; //On vérifie que l'id du token correspond bien à l'id transmis dans la requête
        if (req.body.userId && req.body.userId !== userId) {
            throw 'User ID non valable !';
        } else {
            next()
        }
    } catch (error) {
        res.status(401).json({error: error | 'Requête non authentifiée !'});
    }
};