const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    id: Number,
    titulo: String,
    descripcion: String,
    precio: Number,
    numerodecontacto: String,
    idcliente: String,
  });
  
module.exports = mongoose.model('Product',  productSchema)


  
