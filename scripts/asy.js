const nacl = require("tweetnacl")
const util = require("tweetnacl-util")

// Aquí creamos algunas formas para llamar nuestras a funciones
const newNonce = () => nacl.randomBytes(nacl.box.nonceLength)
const generateKeyPair = () => nacl.box.keyPair()

const encrypt = (
    sharedKey,
    mensaje
) => {
    const nonce = newNonce() 
    const messageUint8 = util.decodeUTF8(mensaje) 
    const encrypted = nacl.box.after(messageUint8, nonce, sharedKey) 

    // Crear un array unsigned de 8 bits del tamaño de: (tamaño nonce + el tamaño de encrypted).
    const fullMessage = new Uint8Array(nonce.length + encrypted.length)

    fullMessage.set(nonce) // Agregar el array nonce al array fullMessage desde el index 0
    fullMessage.set(encrypted, nonce.length) // Agregar el array "encrypted" a partir del index 24

    const base64FullMessage = util.encodeBase64(fullMessage) // Convertir el Uint8A a un string de base 64
    return base64FullMessage
};

const decrypt = (
    sharedKey,
    nonceMsg
) => {
    // Convertir el mensaje (Base64) con nonce a un Uint8Array
    const messageWNonceUint8Array = util.decodeBase64(nonceMsg)

    // Cortar el nonce del messageWNonceUint8Array
    const nonce = messageWNonceUint8Array.slice(0, nacl.box.nonceLength)
    // Cortar el mensaje del array combinado
    const message = messageWNonceUint8Array.slice(
        nacl.box.nonceLength, // Cortar desde el index 24
        messageWNonceUint8Array.length 
    )

    const decrypted = nacl.box.open.after(message, nonce, sharedKey)
    if (!decrypted) {
        throw new Error("No se pudo desencriptar el mensaje.")
    }

    const base64DecryptedMessage = util.encodeUTF8(decrypted)
    return base64DecryptedMessage
};

const msg = "Hola, mundo"
// Creación de llaves
const pairA = generateKeyPair()
const pairB = generateKeyPair()

// Creación de PSK
const sharedA = nacl.box.before(pairB.publicKey, pairA.secretKey)
const sharedB = nacl.box.before(pairA.publicKey, pairB.secretKey)

const encrypted = encrypt(sharedA, msg)
const decrypted = decrypt(sharedB, encrypted)

console.log("msg: " + msg)
console.log("encrypted: " + encrypted)
console.log("decrypted: " + decrypted)