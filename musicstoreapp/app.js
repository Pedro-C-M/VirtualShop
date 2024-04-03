//<----Imports externos de la aplicación---->
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//<----Enrutadores de la aplicación---->
var indexRouter = require('./routes/index');

var app = express();

//<----Uso de sesión---->
let expressSession = require('express-session');
app.use(expressSession({
  secret: 'abcdefg',
  resave: true,
  saveUninitialized: true
}));

//<----Router de sesión---->
const userSessionRouter = require('./routes/userSessionRouter');
app.use("/songs/add",userSessionRouter);
app.use("/publications",userSessionRouter);
app.use("/shop/",userSessionRouter)
app.use("/songs/favorites",userSessionRouter)
app.use("/songs/buy",userSessionRouter);
app.use("/purchases",userSessionRouter);

//<----Router de autoría de canción---->
const userAuthorRouter = require('./routes/userAuthorRouter');
app.use("/songs/edit",userAuthorRouter);
app.use("/songs/delete",userAuthorRouter);


//<----Router de audio---->
const userAudiosRouter = require('./routes/userAudiosRouter');
app.use("/audios/",userAudiosRouter);

//<----Encriptación con Crypto---->
var crypto = require('crypto');
app.set('clave','abcdefg');
app.set('crypto',crypto);

//<----Subida de ficheros---->
let fileUpload = require('express-fileupload');
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
  createParentPath: true
}));
app.set('uploadPath', __dirname)

let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

//<----MongoDB---->
const { MongoClient } = require("mongodb");
const connectionStrings = "mongodb+srv://admin:sdi@cluster0.ca1pnp7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbClient = new MongoClient(connectionStrings);//Este es el objeto de la base

//<----Repositorios---->
const songsRepository = require("./repositories/songsRepository.js");
songsRepository.init(app, dbClient);
const favoriteSongsRepository = require("./repositories/favoriteSongsRepository.js");
favoriteSongsRepository.init(app, dbClient);
const usersRepository = require("./repositories/userRepository.js");
usersRepository.init(app, dbClient);


//<----Imports de la aplicación---->
require("./routes/users.js")(app, usersRepository);
require("./routes/favoriteSongs.js")(app,favoriteSongsRepository,songsRepository);
require("./routes/songs.js")(app,songsRepository);
require("./routes/authors.js")(app);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  console.log("Se ha producido un error "+err);
  //et locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page twig
  res.status(err.status || 500);
  res.render('error',{errorInfo:err});
});

module.exports = app;
