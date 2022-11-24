const mongoose = require("mongoose");
const {Schema} = mongoose;
const bcrypt = require("bcryptjs");

const UserSchema = new Schema({
    nombre: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    publicKey: {type: String},
    secretKey: {type: String},
    keyForSign: {type: String}
});

// Hasheo de contraseñas
UserSchema.methods.encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hash = bcrypt.hash(password, salt);
    return hash;
};

// Comparacion entre la contraseña introducida por el usuario
// y la contraseña almacenada en la base de datos
UserSchema.methods.matchPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
}

module.exports = mongoose.model("User", UserSchema);