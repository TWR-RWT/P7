//On va chercher les variables d'environnement
require('dotenv').config();
//Class pour publications
const PublicationsClass = require('../models/publication');
//Class pour commentaires
const CommentairesBDD = require('../models/commentaires');

// On se connecte à la bdd
const mysql = require('mysql');

// pour supprimer les images
const fs = require('fs');

const connection = mysql.createConnection({ //Parametres de connexion bdd
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});
//////////////////////////////////////////////////////////

//Publications
exports.publish = (req, res, next) => {
    const thingObject = JSON.parse(req.body.thing);
    let imageUrl = "";
    if(req.file){
        console.log(req.file)//protocol => http , host => localhost:3000 , req.file.filename => nom du fichier
        imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } else {
        console.log("pas d'image")
        imageUrl = "";
    }
    const PublishPublication = `INSERT INTO publications (publication_date, publication_time, idusers, username, title, content, image) VALUES ("${thingObject.date}","${thingObject.time}","${thingObject.iduser}","${thingObject.username}","${thingObject.title}","${thingObject.content}","${imageUrl}")`;
    connection.query(PublishPublication, (err, result) => {
        if (err) {
            console.log("message2");
            console.error('error connecting: ' + err.stack);
            return res.status(400).json({ err });
        }
        console.log("Publication dans la base réussie !");
        return res.status(201).json({ message: 'Publication enregistrée' });
    })
};

exports.getAllPublications = (req, res, next) => {
    const GetPublications = `SELECT * FROM publications 
    LEFT JOIN users 
    ON publications.idusers = users.id
    ORDER By publication_date DESC, publication_time DESC
    LIMIT 50;`
    let Publications;
    //Fonction pour avoir toutes les publications
    let FonctionGetPublications = function() {
        return new Promise(resolve => {
            connection.query(GetPublications, (err, rows) => {
                if (err) {
                    console.error('error connecting: ' + err.stack);
                    return res.status(400).json({ err });
                }
                if (rows.length >= 1) { //si il y a  au moins une publication dans la base
                    Publications = rows;
                    resolve(Publications);
                } else { //Status 204 si il n'y a pas de publications dans la bdd
                    console.log("aucune publication dans la bdd");
                    return res.status(204).json({ err });
                }
            })
        })
    };
    //function pour avoir les commentaires de la publication
    let FonctionGetComments = function(item) { //grâce à item.idpublication on va pouvoir itérer sur chaque publication de la base
        return new Promise(resolve => {
            const getComments =`SELECT * FROM commentaires
            LEFT JOIN users 
            ON commentaires.idusers = users.id
            WHERE commentaires.idpublications= ${item.idpublication}
            ORDER By comment_date DESC, comment_time`
            connection.query(getComments, (err, rows) => {
                if (err) {
                    console.error('error connecting: ' + err.stack);
                    return res.status(400).json({ err });
                }
                if (rows.length >= 1) { // Si il y a au moins 1 Commentaire
                    resolve(rows)
                } else {
                    resolve([]);
                }
            })
        })
    }
    //Function pour avoir tous les commentaires confondus
    let FonctionGetAllComments = async(Publications) => {
        let TableauPublications = [];
        for (let item of Publications) { //on itère les publications
            let TableauCommentaires = await FonctionGetComments(item) //pour chaque publication itérée on récupère les commentaires
            let publication = new PublicationsClass( //On stock les informations à la publication itérée + ses commentaires là
                this.idpublication = item.idpublication,
                this.date = item.publication_date,
                this.time = item.publication_time,
                this.iduser = item.idusers,
                this.username = item.username,
                this.title = item.title,
                this.content = item.content,
                this.image = item.image,
                this.commentaires = TableauCommentaires, //On rajoute aux informations de la publications, les commentaires que l'on a récupéré ci-dessus
            );
            TableauPublications.push(publication); //On place ce que l'on a stocké dans "publication" à l'intérieur de notre TableauPublications
        }
        return TableauPublications;
    }
    let FonctionGetCommentaires = async function() { //ici on va dans un premier temps récupérer les publications
        const PublicationsGET = await FonctionGetPublications();//Puis leur ajouter leurs commentaires en itérant les publications (voir ci-dessus)
        const AllCommentsGET = await FonctionGetAllComments(PublicationsGET)
        console.log( AllCommentsGET.length + " publications")
        return res.status(201).json({ AllCommentsGET });
    };
    FonctionGetCommentaires();
};

//Pareil que précédemment mais pour une seule publication
exports.getPublication = (req, res, next) => {
    const GetPublication = `SELECT * FROM publications WHERE idpublication='${req.params.id}'`
    let Publication;
    let FonctionGetPublication = function() {
        return new Promise(resolve => {
            connection.query(GetPublication, (err, row) => {
                if (err) {
                    console.error('error connecting: ' + err.stack);
                    return res.status(400).json({ err });
                }//
                if (row.length >= 1) { // On vérifie qu'il y a bien au moins une ligne pour cette id
                    Publication = row;
                    resolve(Publication);
                } else { // Sinon celà veut dire qu'il n'y a pas de publication avec cette id dans la bdd
                    console.log("la publication n'existe pas dans la bdd");
                    return res.status(204).json({ err });
                }
            })
        })
    };
    let FonctionGetComments = function(item) {
        return new Promise(resolve => {
            const getComments =`SELECT * FROM commentaires
            LEFT JOIN users 
            ON commentaires.idusers = users.id
            WHERE commentaires.idpublications= ${item.id}
            ORDER By comment_date DESC, comment_time`
            connection.query(getComments, (err, rows) => {
                if (err) {
                    console.error('error connecting: ' + err.stack);
                    return res.status(400).json({ err });
                }
                if (rows.length >= 1) {
                    resolve(rows)
                } else {
                    resolve([]);
                }
            })
        })
    };
    let FonctionGetAllComments = async(Publication) => { //même logique que précédemment
        let TableauPublication = [];
        for (let item of Publication) {
            let TableauCommentaires = await FonctionGetComments(item)
            let publication = new PublicationsClass(
                this.date = item.date,
                this.time = item.time,
                this.iduser = item.iduser,
                this.username = item.username,
                this.title = item.title,
                this.content = item.content,
                this.commentaires = TableauCommentaires,
            );
            TableauPublication.push(publication);
        }
        return TableauPublication;
    }
    let FonctionGetCommentaires = async function() {//pareil que précedemment
        const PublicationGET = await FonctionGetPublication();
        const PublicationWithComGET = await FonctionGetAllComments(PublicationGET)
        console.log( PublicationWithComGET);
        return res.status(201).json({ PublicationWithComGET });
    };
    FonctionGetCommentaires();
};

exports.modifyPublication = (req, res, next) => {
    const thingObject = JSON.parse(req.body.modif); //On rend lisible l'info
    let imageUrl = "";
    const GetPublication = `SELECT * FROM publications WHERE idpublication='${req.params.id}'`
    connection.query(GetPublication, (err, rows) => {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return res.status(400).json({ err });
        } else if(req.body.image == "delete"){
            //suppression de l'image
            if (thingObject.iduser == rows[0].idusers) {  //On vérifie que l'identité de l'utilisateur par rapport à l'id de celui qui a publié la publication
                //Il faut supprimer l'ancienne photo du dossier image !
                const filename = rows[0].image.split('/images')[1]; //On split autour '/images' pour récupérer juste le nom du fichier qui se trouve juste après ce split
                fs.unlink(`images/${filename}`, () =>  { //grâce à unlink on va pouvoir supprimer l'ancienne image du dossier images
                    imageUrl = "" //On ne rajoute pas d'image parce qu'il fallait juste supprimer la précédente
                    UpdatePublication = `UPDATE publications SET content="${thingObject.Nouveautext}", title="${thingObject.Nouveautitle}", image="${imageUrl}" WHERE idpublication="${req.params.id}"`
                    connection.query(UpdatePublication, (err, result) => {
                        if (err) {
                            console.error('error connecting: ' + err.stack);
                            return res.status(400).json({ err });
                        }
                        return res.status(201).json({ message: 'Modifications enregistrées' });
                    })
                });
            } else {
                return res.status(401).json({ message: "Seul le propriétaire de la publication peut la modifier" });
            }
        } else if (req.file){
            //changement de l'image
            if (thingObject.iduser == rows[0].idusers) { //Vérification de l'id => autorisation ou non
                //Il faut supprimer l'ancienne photo du dossier image !
                console.log(rows[0].image);
                const filename = rows[0].image.split('/images')[1];
                fs.unlink(`images/${filename}`, () =>  { //suppression de l'image comme précédemment
                    imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}` //On enregistre le nouveau chemin de l'image modifiée
                    UpdatePublication = `UPDATE publications SET content="${thingObject.Nouveautext}", title="${thingObject.Nouveautitle}", image="${imageUrl}" WHERE idpublication="${req.params.id}"`
                    connection.query(UpdatePublication, (err, result) => {
                        if (err) {
                            console.error('error connecting: ' + err.stack);
                            return res.status(400).json({ err });
                        }
                        return res.status(201).json({ message: 'Modifications enregistrées' });
                    })
                });
            } else {
                return res.status(401).json({ message: "Seul le propriétaire de la publication peut la modifier" });
            }
        } else {
            //pas de modification de l'image
            console.log("pas de modification d'image")
            console.log(thingObject.iduser)
            console.log(rows[0].idusers)
            if (thingObject.Nouveautext == rows[0].content && thingObject.Nouveautitle == rows[0].title) { //On vérifie donc qu'il y a bien autre chose à modifier !
                console.log("Aucune modification n'a été saisie");
                return res.status(401).json({ error: "Aucune modification n'a été saisie" });
            } else if (thingObject.iduser == rows[0].idusers) { //On vérifie l'id => l'autorisation
                UpdatePublication = `UPDATE publications SET content="${thingObject.Nouveautext}", title="${thingObject.Nouveautitle}" WHERE idpublication="${req.params.id}"`
                connection.query(UpdatePublication, function(err, result) {
                    if (err) {
                        console.error('error connecting: ' + err.stack);
                        return res.status(400).json({ err });
                    }
                    console.log("Publication modifiée")
                    return res.status(201).json({ message: 'Publication modifiée' });
                })
            } else {
                return res.status(401).json({ message: "Seul le propriétaire de la publication peut la modifier" });
            }
        }
    })
};

exports.deletePublication = (req, res, next) => {
    const GetPublication = `SELECT * FROM publications WHERE idpublication='${req.params.id}';`
    connection.query(GetPublication, (err, rows) => {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return res.status(400).json({ err });
        }
        const filename = rows[0].image.split('/images')[1]; //récupération du nom de l'image
        fs.unlink(`images/${filename}`, () =>  {
            if (req.body.iduser == rows[0].idusers) { //Vérification de l'id de l'user => autorisation
                const deletePublication = `DELETE FROM publications WHERE idpublication="${req.params.id}"`;
                connection.query(deletePublication, (err, result) => {
                    if (err) {
                        console.error('error connecting: ' + err.stack);
                        return res.status(400).json({ err });
                    } else {
                        return res.status(201).json({ message: "Publication supprimée" });
                    }
                })
            } else {
                return res.status(400).json({ message: "Seul le propriétaire de la publication peut la supprimer" });
            }
        });
    })
};




///////////////////

//Comments
exports.commentPublication = (req, res, next) => {
    const commentPublication = `INSERT INTO commentaires (comment_date, comment_time, idpublications, idusers, username, text) VALUES ("${req.body.date}","${req.body.time}","${req.params.idPublication}","${req.body.idUsername}","${req.body.username}","${req.body.idComment}")`;
    connection.query(commentPublication, (err, result) => {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return res.status(400).json({ err });
        }
        return res.status(201).json({ message: 'Commentaire enregistré' });
    })
};

exports.getComments = (req, res, next) => { //Au final on a pas utilisé cette fonction dans le front ...
    const GetComments =
    `SELECT * FROM commentaires 
    LEFT JOIN users 
    ON commentaires.idusers = users.id 
    WHERE commentaires.idpublications= ${req.params.idPublication}
    ORDER By comment_date DESC, comment_time 
    LIMIT 100;`
    connection.query(GetComments, (err, rows) => {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return res.status(400).json({ err });
        }
        if (rows.length >= 1) {
            console.log(rows);
            let TableauCommentaires = [];
            for (let item of rows) {
                let commentaire = new CommentairesBDD(
                    item.id,
                    item.date,
                    item.time,
                    item.idpublication,
                    item.iduser,
                    item.username,
                    item.text);
                TableauCommentaires.push(commentaire);
            }
            return res.status(201).json({ TableauCommentaires });
        } else {
            console.log("Aucun commentaire");
            return res.status(200).json({ message: "Aucun commentaire" });
        }
    })
};


exports.getComment = (req, res, next) => { //Au final on a pas utilisé cette fonction dans le front
    const GetComment =
    `SELECT * FROM commentaires 
    WHERE commentaires.idcommentaire= ${req.params.idCommentaire}`
    connection.query(GetComment, (err, row) => {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return res.status(400).json({ err });
        }
        console.log("new !!!!!!!!!!!!!!");
        if (row.length >= 1) {
            console.log(row);
            let commentaire = [];
            for (let item of row) {
                commentaire = new CommentairesBDD(
                    item.id,
                    item.date,
                    item.time,
                    item.idpublication,
                    item.iduser,
                    item.username,
                    item.text);
            }
            console.log(commentaire);
            return res.status(201).json({ commentaire });
        } else {
            console.log("Le commentaire n'existe pas");
            return res.status(200).json({ message: "Le commentaire n'existe pas" });
        }
    })
};

exports.modifyComment = (req, res, next) => {
    const GetComment = `SELECT * FROM commentaires WHERE idcommentaire='${req.params.idCommentaire}'`
    connection.query(GetComment, (err, rows) => {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return res.status(400).json({ err });
        }
        if (req.body.Nouveautext == rows[0].text) { // On vérifie qu'il y a bien quelque chose à modifier
            console.log("Commentaire identique");
            return res.status(401).json({ error: 'Commentaire identique' });
        }
        if (req.body.iduser == rows[0].idusers) { // On vérifie l'id => autorisation 
            UpdateComment = `UPDATE commentaires SET text="${req.body.Nouveautext}" WHERE idcommentaire="${req.params.idCommentaire}"`
            connection.query(UpdateComment, function(err, result) {
                if (err) {
                    console.error('error connecting: ' + err.stack);
                    return res.status(400).json({ err });
                }
                console.log("Commentaire modifié")
                return res.status(201).json({ message: 'Commentaire modifié' });
            })
        } else {
            return res.status(401).json({ message: "Seul le propriétaire du commentaire peut le modifier" });
        }
    })
};

exports.deleteComment = (req, res, next) => {
    const GetComment = `SELECT * FROM commentaires WHERE idcommentaire='${req.params.idCommentaire}';`
    connection.query(GetComment, (err, rows) => {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return res.status(400).json({ err });
        }
        if (req.body.iduser == rows[0].idusers) { //On vérifie l'id => autorisation
            const DeleteComment = `DELETE FROM commentaires WHERE idcommentaire="${req.params.idCommentaire}"`;
            connection.query(DeleteComment, (err, result) => {
                if (err) {
                    console.error('error connecting: ' + err.stack);
                    return res.status(400).json({ err });
                } else {
                    return res.status(201).json({ message: "Commentaire supprimé" });
                }
            })
        } else {
            return res.status(400).json({ message: "Seul le propriétaire du commentaire peut la supprimer" });
        }
    })
};