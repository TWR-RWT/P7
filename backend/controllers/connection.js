
// On importe bcrypt qui va nous permettre de crypter les mot de passe
const bcrypt = require('bcrypt'); 
// On importe jsonwebtoken pour pouvoir créer des token
const jwt = require('jsonwebtoken'); 
//On va chercher les variables d'environnement
require('dotenv').config();
//Class pour user 
const Users = require('../models/user');

// On se connecte à la bdd
const mysql = require('mysql');

const connection = mysql.createConnection({ //Parametres de connexion bdd
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});
///////////////

//Fonction d'inscription
exports.signup = (req, res, next) => {
    //on hash le mot de passe que l'on reçoit, ici on fait 10 tours, plus on fait de tour plus le cryptage sera puissant mais également gourmant
    bcrypt.hash(req.body.password, 10) 
        .then(hash => {
            const user = new Users(
                req.body.username,
                req.body.email,
                hash //on met le hash du mot de passe donc le mot de passe sera crypté dans la base
            );
            console.log(user)
            //Instructions SQL dans une constante
            const sql = `INSERT INTO users (username, email, password) VALUES ("${user.username}", "${user.email}", "${user.password}")`;    
            //On demande à se connecter avec la constante
            connection.query(sql, function(err, result) {
                if (err) {
                    console.error('error connecting: ' + err.stack);
                    return;
                }
                return res.status(201).json({ message: 'Utilisateur créé' });
            });
        })
        .catch(error => res.status(500).json({ error }));
};

//Fonction de connexion
exports.login = (req, res, next) => {
    //Connexion à la base de donnée sql
    connection.query(`SELECT * FROM users WHERE username='${req.body.username}'`, (err, rows) => {
        console.log(rows[0]);
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }
        //Si tableau vide (donc pas d'utilisateur)
        if (rows == undefined || rows.length === 0) {
            return res.status(401).json({ error: 'Identifiant ou mot de passe incorrect' });
        };
        //on vérifie lle mot de passe en pensant à passer par bcrypt
        bcrypt.compare(req.body.password, rows[0].password) //bcrypt vérifie que le mot de passe correspond au hash enregistré dans la bdd
            .then(valid => {
                if (!valid) { //si invalide alors id ou mot de passe incorrect
                    console.log('Identifiant ou mot de passe incorrect');
                    return res.status(401).json({ error: 'Identifiant ou mot de passe incorrect' });
                }
                //Si valide on créée un token d'une durée de 24h
                console.log('succès');
                return res.status(201).json({
                    id: rows[0].id,
                    username: rows[0].username,
                    email: rows[0].email,
                    role: rows[0].role,
                    token: jwt.sign({ id: rows[0].id }, //Création du token via jsonwebtoken
                        `${process.env.TOKEN}`, { expiresIn: '24h' }
                    )
                });
            })
            .catch(error => res.status(500).json({ error }));
    });
};
