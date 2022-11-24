const nacl = require("tweetnacl");
const util = require("tweetnacl-util");
const fs = require("fs");


// Generacion de par de llaves haciendo uso de Curvas elipticas (o eso dice la documentacion... O_o)
const generateKeyPair = () => nacl.box.keyPair();

const pair = generateKeyPair();

// Estas mismas nos sirven para el intercambio de Diffie-Hellman (cifrado Asimetrico)
// Obviamente se necesitan 2 pares de llaves para poder cifrar/descifrar
//
const publicKey = (util.encodeBase64(pair.publicKey));
const secretKey =(util.encodeBase64(pair.secretKey));
//

// Las llaves para firmar son diferentes a las generadas con Diffie-Hellman
// Estas llaves son del doble de longitud
const generateKeyForSign = nacl.sign.keyPair()
const userKeySign = util.encodeBase64(generateKeyForSign.secretKey)
//

function publicB64() {
    fs.writeFileSync("src/config/userKeys/publicKey.txt", publicKey);
}

function privateB64() {
    fs.writeFileSync("src/config/userKeys/privateKey.txt", secretKey);
}

function signKeyB64() {
    fs.writeFileSync("src/config/userKeys/keyForSign.txt", userKeySign);
}



module.exports = {publicKey, secretKey, userKeySign, publicB64, privateB64, signKeyB64}