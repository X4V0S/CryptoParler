const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");

// Inicializadores
const app = express();
require("./database");
require("./config/passport");

// Configuraciones
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.engine(".hbs", exphbs.engine({
    defaultLayout: "main",
    layoutsDir: path.join(app.get("views"), "layouts"),
    partialsDir: path.join(app.get("views"), "partials"),
    extname: ".hbs"
}));
app.set("view engine", ".hbs");

// Programas intermedios
app.use(express.urlencoded({extended: false}));
app.use(methodOverride(" method"));
app.use(session({
    secret: "topsecretapp",
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Variables globales
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.user = req.user || null;
    next();
});

// Rutas
app.use(require("./routes/index"));
app.use(require("./routes/users"));
app.use(require("./routes/messages"));

// Archivos estaticos
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname,"config/userKeys")));

// Servidor escuchando
app.listen(app.get("port"), () => {
    console.log("Servidor en el puerto", app.get("port"));
})

module.export = app;