console.log('[app.js] Iniciando carga de dependencias...');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const partials = require('express-partials');
const methodOverride = require('method-override');
const flash = require('express-flash');

console.log('[app.js] Cargando routes...');
const router = require('./routes');
console.log('[app.js] Routes cargadas correctamente');

console.log('[app.js] Cargando modelos Sequelize...');
const sequelize = require("./models");
console.log('[app.js] Modelos Sequelize cargados correctamente');

// import 'remixicon/fonts/remixicon.css';

const app = express();

// Only for development: livereload
// to automatically refresh the browser when files change
if (process.env.NODE_ENV === 'development') {
    console.log('[app.js] Configurando livereload...');
    const livereload = require('livereload');
    const connectLivereload = require('connect-livereload');
    const chokidar = require('chokidar');

    // Crear servidor de livereload con configuración no bloqueante
    const liveReloadServer = livereload.createServer({ delay: 500 });
    console.log('[app.js] Livereload server creado');

    // Configurar watcher de forma no bloqueante
    const watcher = chokidar.watch(['views', 'public'], {
        ignoreInitial: true,
        awaitWriteFinish: {
            stabilityThreshold: 500,
            pollInterval: 100
        }
    });

    watcher.on('ready', () => {
        console.log('[app.js] Chokidar watcher listo');
    });

    watcher.on('change', (path) => {
      console.log("🔧 Archivo cambiado:", path);
      liveReloadServer.refresh('/');
    }); 

    // Forzar recarga del navegador cuando se reinicia el servidor
    liveReloadServer.server.once("connection", () => {
        console.log("Livereload server connected");
        setTimeout(() => {
        liveReloadServer.refresh("/");
        }, 100);
    });

    liveReloadServer.server.on("error", (err) => {
        console.error("Livereload error:", err);
    });

    app.use(connectLivereload());
    console.log('[app.js] Livereload configurado correctamente');
}

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('view options', {defaultLayout: 'layouts/layout'});

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method', {methods: ["POST", "GET"]}));

app.use(express.static(path.join(__dirname, 'public')));

// Configuracion de la session para almacenarla en BBDD usando Sequelize.
var sessionStore = new SequelizeStore({
    db: sequelize,
    table: "Session",
    checkExpirationInterval: 15 * 60 * 1000, // The interval at which to cleanup expired sessions in milliseconds. (15 minutes)
    expiration: 4 * 60 * 60 * 1000  // The maximum age (in milliseconds) of a valid session. (4 hours)
});
app.use(session({
    secret: "W3S 2025",
    store: sessionStore,
    resave: false,
    saveUninitialized: true
}));


app.use(partials());
app.use(flash());

// Dynamic Helper:
app.use(function (req, res, next) {

  // To use req.user in the views
  res.locals.loginUser = req.session.loginUser && {
    email: req.session.loginUser.email,
    name: req.session.loginUser.name,
    isAdmin: !!req.session.loginUser.isAdmin,
    developerId: req.session.loginUser.developerId,
    clientId: req.session.loginUser.clientId,
  };

  // Scope creado por un consultor cuando acepta una propuesta y esta creando un scope:
    res.locals.scope = req.session.scope;

    // Estado del flujo de un proyecto:
    const coreState = require("./core/state");
    res.locals.flowProjectState = coreState.flowProjectState;
    res.locals.ProjectState = coreState.ProjectState;
    res.locals.MilestoneState = coreState.MilestoneState;

    // Navigator and Server timezones offsets
  res.locals.browserTimezoneOffset = req.session.browserTimezoneOffset ?? 0;
  res.locals.serverTimezoneOffset = req.session.serverTimezoneOffset ?? 0;

  next();
});

app.use(router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
