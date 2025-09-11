const createError = require('http-errors');
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const partials = require('express-partials');
const methodOverride = require('method-override');
const flash = require('express-flash');

const authRouter = require('./routes/auth');
const indexRouter = require('./routes/index');
const clientsRouter = require('./routes/clients');
const developersRouter = require('./routes/developers');
const projectsRouter = require('./routes/projects');
const virtoRouter = require('./routes/virto');
const rolesRouter = require('./routes/roles');
const backdoorRouter = require('./routes/backdoor');

const sequelize = require("./models");

// import 'remixicon/fonts/remixicon.css';

const app = express();

// Only for development: livereloa
// to automatically refresh the browser when files change
if (process.env.NODE_ENV === 'development') {
    const livereload = require('livereload');
    const connectLivereload = require('connect-livereload');
    const chokidar = require('chokidar');

    // Crear servidor de livereload
    const liveReloadServer = livereload.createServer();
    chokidar.watch(['views', 'public']).on('change', (path) => {
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
app.use(function(req, res, next) {

    // To use req.user in the views
    res.locals.loginUser = req.session.loginUser && {
        id: req.session.loginUser.id,
        email: req.session.loginUser.email,
        name: req.session.loginUser.name,
        isAdmin: !!req.session.loginUser.isAdmin,
        developerId: req.session.loginUser.developerId,
        clientId: req.session.loginUser.clientId,
    };

    next();
});

app.use('/auth', authRouter);
app.use('/', indexRouter);
app.use('/clients', clientsRouter);
app.use('/developers', developersRouter);
app.use('/projects', projectsRouter);
app.use('/roles', rolesRouter);
app.use('/virto', virtoRouter);
app.use('/backdoor', backdoorRouter);

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
