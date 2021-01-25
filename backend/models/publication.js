module.exports = class PublicationsClass {
    constructor(id, date, time, iduser, username, title, content, image, commentaires) {
        this.idpublication = id,
        this.date = date,
        this.time = time,
        this.iduser = iduser,
        this.username = username,
        this.title = title,
        this.content = content,
        this.image = image,
        this.commentaires = commentaires
    }
};

//let publication =  new Publications('TEST', 'TITRE', '/...IMAGE', 'lorem ipsum');