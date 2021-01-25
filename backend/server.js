// commande "node server" pour lancer le server => nodemon server, pour la mise à jour du server en temps réel
const http = require('http'); //objet http permettant de créer un server
const app = require('./app'); // On importe l'application express appelée app

const normalizePort = val => { // vérification du format du port
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};
const port = normalizePort(process.env.PORT || '3000'); //définition du port d'écoute à utiliser pour le paramètrage du server
app.set('port', port); //On dit à l'application express sur quel port elle va tourner en lui transmettant le port définit ci-dessus

const errorHandler = error => { //gestion des erreurs
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const server = http.createServer(app); //la methode createServer du package http permet de créer un server
//On lui passe comme argument notre application express "app" qui n'est nulle autre qu'une fonction qui va recevoir la requête et la réponse et va les modifier/traiter

server.on('error', errorHandler); //gestion des erreurs du server définit ci-dessus
server.on('listening', () => { //Définition de là où va écouter le server
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

server.listen(port);//On définit le port d'écoute du server où il attendra les requêtes

