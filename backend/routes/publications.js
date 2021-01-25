const express = require('express');
const router = express.Router(); //Pour créer la logique dde routage
const userCtrl = require('../controllers/publications'); //Pour connecter les routes à leur logique métier
const auth = require('../middleware/auth'); //on a besoin du middleware d'authentification
const multer = require('../middleware/multer-config'); //On a besoin du middleware de gestion de fichier

///////Publications///////

//On met toujours l'authentification en premier
router.post('/', auth, multer, userCtrl.publish);
router.get('/', auth, userCtrl.getAllPublications);

// ":id" rend cette partie de la route "dynamique", cette partie sera accessible via req.params.id
router.get('/:id', auth, userCtrl.getPublication);
router.put('/:id', auth, multer, userCtrl.modifyPublication);
router.delete('/:id', auth, userCtrl.deletePublication);


///////comments///////

router.post('/:idPublication/comments', auth, userCtrl.commentPublication);
router.get('/:idPublication/comments', auth, userCtrl.getComments);

router.get('/:idPublication/comments/:idCommentaire', auth, userCtrl.getComment);
router.put('/:idPublication/comments/:idCommentaire', auth, userCtrl.modifyComment);
router.delete('/:idPublication/comments/:idCommentaire', auth, userCtrl.deleteComment);



module.exports = router;