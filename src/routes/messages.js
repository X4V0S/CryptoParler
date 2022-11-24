/*     RUTAS DE LA APLICACION DE MENSAJES     */
const express = require("express");
const router = express.Router();

const User = require("../models/User");
const {isAuthenticated} = require("../helpers/auth");

// Variables globales para las apps
const {decodeBase64, encodeBase64, decodeUTF8, encodeUTF8} = require("tweetnacl-util");
const {box, sign} = require("tweetnacl");

// Importacion de las funciones de cada app
const {symEncrypt, symDecrypt} = require("../helpers/sym");
const {asyEncrypt, asyDecrypt} = require("../helpers/asy");


// Uso de la app: Symmetric
// Encriptar
router.get("/symmetric", isAuthenticated, (req, res) => {
    res.render("messages/symmetric");
});

router.post("/symmetric", isAuthenticated, async (req, res) => {
    const {secretKey, msg} = req.body;
    const errors = [];
    if (!secretKey) {
        errors.push({text: "Ingrese su llave privada"});
    }
    if (!msg) {
        errors.push({text: "Ingrese un mensaje"});
    }
    if (errors.length > 0) {
        res.render("messages/symmetric", {errors, secretKey, msg});
    } else {// Comparativa de las variables en la base de datos
        const kprivateUser = await User.findOne({secretKey: secretKey});
        if (!kprivateUser) {
            req.flash("error_msg", "Esta llave privada no pertenece al usuario actual");
            res.redirect("symmetric");
        } else {
            const msg = req.body.msg
            const secretKey = req.body.secretKey
            const symEncrypted = symEncrypt(msg, secretKey);
            // console.log("🚀 ~ file: messages.js ~ line 38 ~ router.post ~ symEncrypted", symEncrypted)
            req.flash("success_msg", "Mensaje encriptado:", symEncrypted);
            res.redirect("symmetric");
        }
    }
});

// Desencriptar
router.get("/symmetricDecrypt", isAuthenticated, (req, res) => {
    res.render("messages/symmetricDecrypt");
});

router.post("/symmetricDecrypt", isAuthenticated, async (req, res) => {
    const {secretKey, encrypted} = req.body;
    const errors = [];
    if (!secretKey) {
        errors.push({text: "Ingrese su llave privada"});
    }
    if (!encrypted) {
        errors.push({text: "Ingrese un mensaje para desencriptar"});
    }
    if (errors.length > 0) {
        res.render("messages/symmetricDecrypt", {errors, secretKey, encrypted});
    } else { // Comparativa de las variables en la base de datos
        const kprivateUser = await User.findOne({secretKey: secretKey});
        if (!kprivateUser) {
            req.flash("error_msg", "Esta llave privada no pertenece al usuario actual");
            res.redirect("symmetricDecrypt");
        } else {
            const messageWNonce = req.body.encrypted
            const key = req.body.secretKey
            const symDecrypted = symDecrypt(messageWNonce, key);
            // console.log(symDecrypted);
            req.flash("success_msg", "Mensaje Desencriptado:", symDecrypted);
            res.redirect("symmetricDecrypt");
        }
    }
});


// Uso de la app: Asymmetric
// Encriptar
router.get("/asymmetric", isAuthenticated, (req, res) => {
    res.render("messages/asymmetric");
});

router.post("/asymmetric", isAuthenticated, async (req, res) => {
    const {theirName, mySecretKey, myPublicKey, msg} = req.body;
    const errors = [];
    if (!mySecretKey) {
        errors.push({text: "Ingrese su llave privada"});
    }
    if (!myPublicKey) {
        errors.push({text: "Ingrese su llave publica"});
    }
    if (!theirName) {
        errors.push({text: "Ingrese el nombre de usuario de su amigo"});
    } else {// Comparativa de las variables en la base de datos
        const OtherUser = await User.findOne({nombre:theirName});
        if (!OtherUser) {
            errors.push({text: "Este usuario no existe"});
        }
    }
    if (!msg) {
        errors.push({text: "Ingrese un mensaje"});
    }
    if (errors.length > 0) {
        res.render("messages/asymmetric",  {errors, theirName, mySecretKey, myPublicKey, msg});
    } else {// Comparativa de las variables en la base de datos
        const query = User.findOne({nombre:theirName});
        query.select("publicKey");
        query.exec(function(err, user) {
            if (err) {
                return handleError(err);
            } else {
                const sharedPublicB64 = user.publicKey;
                const sharedKey = box.before(decodeBase64(mySecretKey), decodeBase64(sharedPublicB64));
                const mensaje = req.body.msg
                const asyEncrypted = asyEncrypt(sharedKey, mensaje);
                req.flash("success_msg", "Mensaje encriptado:", asyEncrypted);
                req.flash("success_msg", "Llave compartida:\n", encodeBase64(sharedKey));
                res.redirect("asymmetric");
            }
        });
    }
});

// Desencriptar
router.get("/asymmetricDecrypt", isAuthenticated, (req, res) => {
    res.render("messages/asymmetricDecrypt");
});

router.post("/asymmetricDecrypt", isAuthenticated, async (req, res) => {
    const {sharedKeyUser, EncryptedMessage} = req.body;
    const errors = [];
    if (!sharedKeyUser) {
        errors.push({text: "Ingrese la llave compartida"});
    }
    if (!EncryptedMessage) {
        errors.push({text: "Ingrese un mensaje para desencriptar"});
    }
    if (errors.length > 0) {
        res.render("messages/asymmetricDecrypt", {errors, sharedKeyUser, EncryptedMessage});
    } else {
        const sharedKey = decodeBase64(sharedKeyUser);
        const nonceMsg = req.body.EncryptedMessage
        const asyDecrypted = asyDecrypt(sharedKey, nonceMsg);
        req.flash("success_msg", "Mensaje Desencriptado:", asyDecrypted);
        res.redirect("asymmetricDecrypt");
    }
});


// Uso de la app: Sign
// Firmar un mensaje
router.get("/signMessage", isAuthenticated, (req, res) => {
    res.render("messages/signMessage");
});

router.post("/signMessage", isAuthenticated, async (req, res) => {
    const {myKeyForSign, message} = req.body;
    const errors = [];
    if (!myKeyForSign) {
        errors.push({text: "Ingrese su llave secreta"});
    }
    if (!message) {
        errors.push({text: "Ingrese un mensaje para firmar"});
    }
    if (errors.length > 0) {
        res.render("messages/signMessage", {errors, myKeyForSign, message});
    } else {// Comparativa de las variables en la base de datos
        const ksignUser = await User.findOne({keyForSign:myKeyForSign})
        if (!ksignUser) {
            req.flash("error_msg", "Esta llave para firmar no pertenece al usuario actual");
            res.redirect("signMessage");
        } else {
            const msg = decodeUTF8(message);
            const secretKey = decodeBase64(myKeyForSign);
            const signedArray = sign.detached(msg, secretKey);
            const signed = encodeBase64(signedArray);
            req.flash("success_msg", "Mensaje firmado:", signed);
            res.redirect("signMessage");
        }
    }
});

// Verificar firma
router.get("/signVerify", isAuthenticated, (req, res) => {
    res.render("messages/signVerify");
});

router.post("/signVerify", isAuthenticated, async (req, res) => {
    const {userEmit, signedEmit, messageEmit} = req.body;
    const errors = [];
    if (!userEmit) {
        errors.push({text: "Ingrese el nombre del usuario el cual le envió un mensaje"});
    }
    if (!signedEmit) {
        errors.push({text: "Ingrese una firmar para verificar"});
    }
    if (!messageEmit) {
        errors.push({text: "Ingrese un mensaje para verificar"});
    }
    if (errors.length > 0) {
        res.render("messages/signVerify", {errors, userEmit, signedEmit, messageEmit});
    } else {// Comparativa de las variables en la base de datos
        const query = User.findOne({nombre: userEmit});
        query.select("publicKey");
        query.exec(function(err, user) {
            if (err) {
                return handleError(err);
            } else {
                const messageU8 = decodeUTF8(messageEmit);
                const signU8 = decodeBase64(signedEmit);
                const userEmitPublicKey = user.publicKey
                const publicKeyU8 = decodeBase64(userEmitPublicKey);
                ////////////////////////////////////////////////////////
                const verified = sign.detached.verify(messageU8, signU8, publicKeyU8);
                req.flash("success_msg", "Verificado");
                res.redirect("signVerify");
            }
        });
    }
});

module.exports = router;