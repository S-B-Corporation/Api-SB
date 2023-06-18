const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    id: Number,
    titulo: {
      type: String,
      required: [true, "El campo 'titulo' es requerido."],
    },
    descripcion: {
      type: String,
      required: [true, "El campo 'descripcion' es requerido."],
    },
    precio: {
      type: Number,
      required: [true, "El campo 'precio' es requerido."],
    },
    numerodecontacto: {
      type: String,
      required: [true, "El campo 'numerodecontacto' es requerido."],
    },
    categoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Categoria',
      required: [true, "El campo 'categoria' es requerido."],
    },
    idcliente: String,
  });
  
module.exports = mongoose.model('Product',  productSchema)


  
