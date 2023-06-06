const mongoose = require("mongoose")


const clienteSchema = new mongoose.Schema({
    id: String,
    name: String,
    password: String,
    idpost: String,
    email: String,
  });

module.exports = mongoose.model('User',  clienteSchema)
