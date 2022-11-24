const {secretbox, randomBytes} = require("tweetnacl");
const {
    encodeUTF8,
    decodeUTF8,
    encodeBase64,
    decodeBase64
} = require("tweetnacl-util");

const newNonce = () => randomBytes(secretbox.nonceLength)

const symEncrypt = (msg, secretKey) => {
    const keyUint8A = decodeBase64(secretKey);
    const nonce = newNonce();

    const messageUint8 = decodeUTF8(msg);
    const box = secretbox(messageUint8, nonce, keyUint8A); // Encriptar

    const fullMessage = new Uint8Array(nonce.length + box.length);
    fullMessage.set(nonce);
    fullMessage.set(box, nonce.length);

    const base64FullMessage = encodeBase64(fullMessage);
    return base64FullMessage
}

const symDecrypt = (messageWNonce, key) => {
    const keyUint8A = decodeBase64(key);
    const messageWNonceUint8A = decodeBase64(messageWNonce);

    const nonce = messageWNonceUint8A.slice(0, secretbox.nonceLength);
    const message = messageWNonceUint8A.slice(
        secretbox.nonceLength,
        messageWNonce.length
        );

    const decrypted = secretbox.open(message, nonce, keyUint8A);
    if (!decrypted) {
        throw new Error("No se pudo descifrar el mensaje.");
    }

    const base64DecryptedM = encodeUTF8(decrypted);
    return base64DecryptedM
};


module.exports = {symEncrypt, symDecrypt};

// const encrypted = encrypt(msg, key);
// const decrypted = decrypt(encrypted, key);
// console.log("encrypted: " + encrypted + "\nMessage: " + msg);
// console.log("//////////");
// console.log("decrypted: " + decrypted + "\nMessage: " + msg);