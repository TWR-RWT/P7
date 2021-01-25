const express = require('express');
const router = express.Router(); //pour créer la logique de routage 
const connectionCtrl = require('../controllers/connection'); //Pour connecter les routes à leur middleware

router.post('/signup', connectionCtrl.signup);
router.post('/login', connectionCtrl.login); 

module.exports = router;