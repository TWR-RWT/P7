const multer = require('multer');

const MIME_TYPES = {//types d'images que l'on va enregistrer
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif'
};

const storage = multer.diskStorage({ //multer.diskstorage pour dire à multer qu'on va enregistrer l'image sur le disque 
    destination: (req, file, callback) => { //multer.diskstorage à besoin de deux élèments,
        callback(null, 'images') //tout d'abord la destination pour savoir où enregistrer le fichier
    },//null pour dire qu'il n'y a pas eu d'erreur, puis le dossier de destination
    filename: (req, file, callback) => {//Le deuxième élèment de configuration est le filename
        const name = file.originalname.split(' ').join('_');//On traite les éspaces dans le nom de fichier d'origine en les changeant par des underscore pour évter toute erreur
        const extension = MIME_TYPES[file.mimetype]; //On va enregistrer l'extenstion du fichier
        callback(null, name + Date.now() + '.' + extension); //On applique l'extenstion du fichier dans le nouveau nom + la date pour être sûr de différencier les différents fichiers enregistrés
    }
});

module.exports = multer({storage}).single('image');//on passe notre object storage à multer en appelant la méthode single pour préciser qu'il s'agit d'un fichier unique et on précise qu'il s'agit d'une image