module.exports = class CommentairesBDD {
    constructor(id, date, time, idpublication, iduser, username, text) {
        this.id = id,
        this.date = date,
        this.time = time,
        this.idpublication = idpublication,
        this.iduser = iduser,
        this.username = username,
        this.text = text
    }
};