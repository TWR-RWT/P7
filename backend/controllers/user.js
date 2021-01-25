// On importe bcrypt qui va nous permettre de crypter les mot de passe
const bcrypt = require('bcrypt'); 
//On va chercher les variables d'environnement
require('dotenv').config();

// On se connecte à la bdd
const mysql = require('mysql');

const connection = mysql.createConnection({ //Parametres de connexion bdd
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});
///////////////

//Fonction de modification
exports.updateUser = (req, res, next) => {
    const GetUserid = `SELECT * FROM users WHERE id='${req.params.id}'` //Ona besoin de l'id pour requêter la bdd
    connection.query(GetUserid, (err, rows) => {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return res.status(400).json({ err });
        }
        console.log(rows);
        const usernameCurrent = rows[0].username;
        const emailCurrent = rows[0].email;
        const passwordCurrent = rows[0].password;
        bcrypt.compare(req.body.password, passwordCurrent, function(err, result) {
            if (result == true) { //si le password est bon
                if (req.body.usernameNew) { //Changement de nom d'utilisateur
                    const GetUserusername = `SELECT * FROM users WHERE username='${req.body.usernameNew}'`//Pour vérifier que le nom ne soit pas déjà pris
                    connection.query(GetUserusername, (err, rows) => {
                        if (err) {
                            console.error('error connecting: ' + err.stack);
                            return res.status(500);
                        }
                        if (usernameCurrent == req.body.usernameNew) { 
                            console.log("Même nom d'utilisateur") //Si les deux username sont les même on ne fait rien
                        };
                        if (rows.length >= 1) { //Le nom d'utilisateur est déjà pris
                            console.log("Nom d\'utilisateur déjà pris")
                        }
                        //On doit changer le nom d'utilisateur, on a déjà vérifié que le nouveau nom n'était pas dans la bdd
                        else if (usernameCurrent !== req.body.usernameNew) {
                            const UpdateUsername = `UPDATE users SET username="${req.body.usernameNew}" WHERE id="${req.params.id}"`;
                            connection.query(UpdateUsername, function(err, result) {
                                if (err) {
                                    console.error('error connecting: ' + err.stack);
                                    return res.status(400).json({ err });
                                }
                                console.log("Nouveau nom d'utilisateur enregistré")
                            })
                        }
                    })
                }
                //Modif email
                if (req.body.emailNew) {
                    const GetEmail = `SELECT * FROM users WHERE email='${req.body.emailNew}'`//Pour vérifier si l'email existe déjà dans la base
                    connection.query(GetEmail, (err, rows) => {
                        if (err) {
                            console.error('error connecting: ' + err.stack);
                            return res.status(500);
                        }
                        if (emailCurrent == req.body.emailNew) { //Nouveau et ancien email identiques
                            console.log("Même email")
                        };
                        if (rows.length >= 1) { //Email déjà existant dans la bdd
                            console.log("email déjà utilisé")
                        }
                        else if (emailCurrent !== req.body.emailNew) { //On peut maintenant changer l'email
                            const UpdateEmail = `UPDATE users SET email="${req.body.emailNew}" WHERE id="${req.params.id}"`;
                            connection.query(UpdateEmail, function(err, result) {
                                if (err) {
                                    console.error('error connecting: ' + err.stack);
                                    return res.status(400).json({ err });
                                }
                                console.log("Nouvel email enregistré")
                            })
                        }
                    })
                }
                //Modif password
                if (req.body.passwordNew && req.body.password) {
                    if (req.body.passwordNew !== req.body.password) { //si les deux password sont différents
                        bcrypt.compare(req.body.password, passwordCurrent, function(err, result) { //Si le password est le bon
                            if (result == true) {
                                bcrypt.hash(req.body.passwordNew, 10, function(err, hash) { //Alors on hash le nouveau password
                                    if (err) {
                                        console.error('error connecting: ' + err.stack);
                                        return res.status(400).json({ error });
                                    }
                                    const UpdatePassword = `UPDATE users SET password="${hash}" WHERE id="${req.params.id}"`; //On sauvegarde le hash comme nouveau password dans la bdd
                                    connection.query(UpdatePassword, function(err, result) {
                                        if (err) {
                                            console.error('error connecting: ' + err.stack);
                                            return res.status(400).json({ error });
                                        }
                                        console.log('connected as id ' + connection.threadId);
                                        console.log('Nouveau password enregistré');
                                    })
                                })
                            } else {
                                console.log("Mot de passe faux");
                            }
                        })
                    }
                } else {
                    console.log("Il faut rentrer l'ancien et le nouveau password")
                }
                return res.status(201).json({ message: "Utilisateur mis à jour" });
            } else {
                console.log("Mot de passe faux")
                return res.status(202).json({ message: "Mot de passe faux" });
            }
        })


    })
};

/////
//Fonction pour obtenir un profil
exports.getUser = (req, res, next) => {
    const GetUser = `SELECT * FROM users WHERE id='${req.params.id}'`
    console.log("obtention d'un profil");
    console.log(req.params.id);
    connection.query(GetUser, (err, rows) => {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return res.status(400).json({ error });
        }
        if (rows.length >= 1) { //il y a aumoins un utilisateur avec cet id
            console.log(rows);
            const user = {//On stocke les infos dans user
                id: rows[0].id,
                username: rows[0].username,
                email: rows[0].email,
            }
            console.log(user);
            return res.status(201).json({ user }); //et on retourne user
        } else {
            console.log("Pas d'utilisateur trouvé");
            return res.status(400).json({ error });
        }
    })
};

//Fonction pour supprimer un utilisateur
exports.deleteUser = (req, res, next) => {
    const GetUser = `SELECT * FROM users WHERE id='${req.params.id}'`;
    connection.query(GetUser, (err, rows) => {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return res.status(400).json({ err });
        }
        if (rows.length >= 1) { //On vérifie qu'il y a bien au moins un id correspondant dans la bdd
            bcrypt.compare(req.body.password, rows[0].password, function(err, result) { //On vérifie que le mot de passe est le bon pour avoir le droit de supprimer le compte
                if (result == true) {
                    console.log('mdp ok');
                    DeleteUser = `DELETE FROM users WHERE id="${req.params.id}"`;
                    connection.query(DeleteUser, (err, result) => {
                        if (err) {
                            console.error('error connecting: ' + err.stack);
                            return res.status(400).json({ err });
                        }
                        console.log(result);
                        return res.status(201).json({ message: "Utilisateur supprimé" });
                    });
                } else {
                    console.log("mot de passe faux")
                    return res.status(400).json({ message: "Mot de passe faux" });
                }
            })
        } else {
            console.log("Utilisateur introuvable");
            return res.status(400).json({ err });
        }

    })
};