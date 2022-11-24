const { box, randomBytes } = require("tweetnacl");
const {
    encodeUTF8,
    decodeUTF8,
    encodeBase64,
    decodeBase64
} = require("tweetnacl-util");

const newNonce = () => randomBytes(box.nonceLength);


function shared(sharedPublicKey, mySecretKey) {
    box.before(sharedPublicKey, mySecretKey);
}

function asyEncrypt(sharedKey, mensaje) {
    const nonce = newNonce();
    const messageUint8 = decodeUTF8(mensaje);
    const encrypted = box.after(messageUint8, nonce, sharedKey);

    // Crear un array unsigned de 8 bits del tamaño de: (tamaño nonce + el tamaño de encrypted).
    const fullMessage = new Uint8Array(nonce.length + encrypted.length);

    fullMessage.set(nonce); // Agregar el array nonce al array fullMessage desde el index 0
    fullMessage.set(encrypted, nonce.length); // Agregar el array "encrypted" a partir del index 24

    const base64FullMessage = encodeBase64(fullMessage); // Convertir el Uint8A a un string de base 64
    return base64FullMessage
};

function asyDecrypt(sharedKey, nonceMsg) {
    // Convertir el mensaje (Base64) con nonce a un Uint8Array
    const messageWNonceUint8Array = decodeBase64(nonceMsg);

    // Cortar el nonce del messageWNonceUint8Array
    const nonce = messageWNonceUint8Array.slice(0, box.nonceLength);
    // Cortar el mensaje del array combinado
    const message = messageWNonceUint8Array.slice(
        box.nonceLength, // Cortar desde el index 24
        messageWNonceUint8Array.length 
        );

    const decrypted = box.open.after(message, nonce, sharedKey);
    if (!decrypted) {
        throw new Error("No se pudo desencriptar el mensaje.");
    };

    const base64DecryptedMessage = encodeUTF8(decrypted);
    return base64DecryptedMessage
};


module.exports = {shared, asyEncrypt, asyDecrypt};