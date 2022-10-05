const nacl = require("tweetnacl")
// TODO:
// 1. Crear llave pública y llave privada.
// 2. Guardar las dos llaves y ponerle una passphrashe a la llave privada.

/*  3. Generación de llaves por curvas elípticas. Diffie-Hellman Key Exchange. 
    A secret and public key pair are generated twice (pairA, pairB)
    and data is encrypted with
    (pairA.secretKey) + (pairB.publicKey)

    and decrypted with 
    (pairB.secretKey) + (pairA.publicKey).
*/

// El nonce se intercambia igualmente
const newNonce = () => nacl.randomBytes(nacl.box.nonceLength); 
const newKeyPair = () => nacl.box.keyPair();

createOwnKeys = () => {
    keys = newKeyPair()
    var [pbk, pvk] = [keys.publicKey, keys.secretKey];

    var u8p = new Uint8Array(pbk);
    var u8s = new Uint8Array(pvk);
    var publicKey = Buffer.from(u8p).toString('base64');
    var secretKey = Buffer.from(u8s).toString('base64');

    // TODO: Passphrashe para la llave privada.

    // TODO: Guardar las llaves.
    console.log("Public key: " + publicKey + "\nSecret key: " + secretKey);
    console.log(keys);
};

// 3. Generación de llaves por curvas elípticas.
// Precomputed Shared Keys
psk = (theirPublicKey, myKey,) => {
    var pskU8 = nacl.box.before(theirPublicKey, myKey);
};

// Encriptación de mensajes
encrypt = (message, theirPublicKey, mySecretKey) => {

    /* 1. Crea un nonce
       2. Toma el mensaje que escribiste y devuelve un Uint8Array
       3. Revisa qué box usar

       4. Crea 
    */

    const nonce = newNonce();
};

