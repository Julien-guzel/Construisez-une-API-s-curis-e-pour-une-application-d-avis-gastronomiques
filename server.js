const http = require('http'); /* programme qui attend les requetes http et qui y répond */
const app = require('./app'); /* import du fichier app.js */ 


const normalizePort = val => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

// renvoie un port le 3000 ou un port valide
const port = normalizePort(process.env.PORT || '3000');
/* configuration pour dire à l'application express sur quel port elle doit tourner */
app.set('port', port);

// recherche des différentes erreurs et les gère de manière appropriée
const errorHandler = error => {
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

// creation de server
const server = http.createServer(app);

// recherche des différentes erreurs et les gèrer de manière appropriée
// ecoute le port
server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

/* le serveur écoute le port */
server.listen(port);
