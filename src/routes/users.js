/*     RUTAS RELACIONADAS AL USUARIO     */
const express = require("express");
const router = express.Router();

const User = require("../models/User");
const passport = require("passport");

const userKeyGen = require("../helpers/ukeygen");


// Crear una cuenta
router.get("/signup", (req, res) => {
    res.render("users/signup");
});

router.post("/signup", async (req, res) => {
    const {nombre, email, password, confirmPassword, publicKey, secretKey, keyForSign} = req.body;
    const errors =[];
    if (nombre.length <= 0) {
        errors.push({text: "Ingrese un nombre de usuario"});
    }
    if (email.length <= 0) {
        errors.push({text: "Ingrese un correo electronico"});
    }
    if (password != confirmPassword) {
        errors.push({text: "Los campos de contraseña no coinciden"});
    }
    if (password.length < 8) {
        errors.push({text: "La contraseña debe ser de al menos 8 caracteres"});
    }
    if (errors.length > 0) {
        res.render("users/signup", {errors, nombre, email, password, confirmPassword});
    } else { // Comparativa de las variables en la base de datos
        const nameUser = await User.findOne({nombre:nombre});
        if (nameUser) {
            req.flash("error_msg", "Este nombre de usuario ya está registrado");
            res.redirect("signup");
        } else {
            const emailUser = await User.findOne({email:email});
            if (emailUser) {
                req.flash("error_msg", "Este correo electronico ya está registrado");
                res.redirect("signup");
            } else {
                const newUser = new User({nombre, email, password, publicKey, secretKey, keyForSign});
                newUser.password = await newUser.encryptPassword(password);
                /////// Creacion y almacenamiento del par de llaves del usuario
                newUser.publicKey = userKeyGen.publicKey
                newUser.secretKey = userKeyGen.secretKey
                newUser.keyForSign = userKeyGen.userKeySign
                newUser.save();
                // console.log(req.body);
                req.flash("success_msg", "Usuario registrado");
                res.redirect("signin");
            }
        }
    }
});


// Iniciar sesion en una cuenta
router.get("/signin", (req, res) => {
    res.render("users/signin");
});

router.post("/signin", passport.authenticate("local", {
    successRedirect: "genkeys",
    failureRedirect: "signin",
    failureFlash: true
}));


// Seccion para que el usuario descargue su par de llaves (Publica y Privada)
router.get("/genkeys", (req, res) => {
    res.render("users/genkeys");
    // Generacion de archivos de las llaves
    userKeyGen.publicB64();
    userKeyGen.privateB64();
    userKeyGen.signKeyB64();
});


// Cerrar sesion
router.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
});


module.exports = router;
