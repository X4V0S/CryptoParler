/*     CONEXION A LA BASE DE DATOS     */

const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/messagesDB", {
    useNewUrlParser: true,
})
.then(db => console.log("Base de datos conectada"))
.catch(err => console.error(err));


module.export = connectDB = async () => {
    try {
        await connect(MONGODB_URI);
        console.log("Conexion establecida a la base de datos.")
    } catch (error) {
        console.error(error);
    }
};
