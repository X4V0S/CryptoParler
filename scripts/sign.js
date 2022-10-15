const nacl = require("tweetnacl")
const util = require("tweetnacl-util")
const generateKeyPair = nacl.sign.keyPair()

/* Mensaje (str) => Uint8A */
const msg = util.decodeUTF8("Hola")

/* Firma el mensaje y regresa una firma */
const signature = nacl.sign.detached(msg, generateKeyPair.secretKey)

/* Verifica la firma y regresa TRUE si la verificación fue exitosa
regresa FALSE si esta falló */
const verify = nacl.sign.detached.verify(msg, signature, generateKeyPair.publicKey)
console.log("signature: " + signature)
console.log("verify: " + verify)