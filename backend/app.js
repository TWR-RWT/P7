const express = require('express'); // on importe express pour créer notre application sous express
const bodyParser = require('body-parser'); // On importe le package body-parser pour transformer du code en JSON => Object Javascript utilisable
const path = require('path'); //path nous donne acces au chemin

//On importe nos routeurs
const userRoutes = require('./routes/user');
const publicationsRoutes = require('./routes/publications');
const connectionRoutes = require('./routes/connection');

//const path = require('path');

//Pour les variables d'environement
require('dotenv').config();
 
//Connexion à Mysql
const mysql = require('mysql');

const connection = mysql.createConnection({ //parametres de connexion à mysql
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

connection.connect(function(err) { //gestion des erreurs de connexion à la base
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('connected as id ' + connection.threadId);
});


//Creation de l'application express sous le nom de app
const app = express();


//app.use pour définir une fonction dans l'application
// "next" dans les arguments pour continuer après cette fonction à la fonction suivante (lecture impérative du code)

//Gestion des erreurs CROS (sécurité empêchant des requêtes malvaillantes, mais ici on veut que tout le monde puisse accéder à l'API)
//Middleware générale, il sera appliqué à toutes les requêtes envoyées au server
app.use((req, res, next) => { //On rajoute des headers sur l'objet réponse avec res.setHeader
    res.setHeader('Access-Control-Allow-Origin', '*'); //Toutes origines peuvent accéder à l'API
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); //On donne l'autorisation d'utiliser certains headers dans les requêtes
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); // On donne l'autorisation d'utiliser certaines méthodes dans les requêtes faites au server
    next(); // il ne faut pas oublier d'appeler next pour renvoyer vers le prochain middleware (== fonction)
  }); //next renvoie une réponse et termine ainsi le middleware

//transforme le corps de la requête en objet javascript utilisable grâce à bodyParser.json() venant du package body-parser
app.use(bodyParser.json()); 


//Définition des routes/chemins de l'applications == URL visé par l'application, en premier argument

//pour servir un dossier static avec express on utilise express.static
app.use('/images', express.static(path.join(__dirname, 'images'))); // grâce à path on récupère le chemin du dossier 'images'

//Pour les requêtes d'inscription et de connexion
app.use('/api/connection', connectionRoutes); 
app.use('/api/users', userRoutes); 
app.use('/api/publications', publicationsRoutes);

// On exporte notre application pour pouvoir l'utiliser pour pouvoir y acceder depuis les autres fichiers du projet
module.exports = app;