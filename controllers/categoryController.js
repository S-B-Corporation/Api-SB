const jwt = require('jsonwebtoken');
const Categoria = require('../models/category');
const Product = require('../models/product');

// Agregar una nueva categoría
exports.addCategoria = async (req, res) => {
  try {
    const { nombre } = req.body;

    // Crear una nueva categoría
    const nuevaCategoria = new Categoria({
      nombre,
    });

    // Guardar la nueva categoría en la base de datos
    await nuevaCategoria.save();

    res.status(201).json({ message: 'Categoría agregada exitosamente', categoria: nuevaCategoria });
  } catch (error) {
    res.status(500).send('Error al agregar la categoría');
  }
};

// Obtener todas las categorías
exports.getAllCategorias = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Obtener el ID del usuario del token decodificado
    const userId = decoded._id;

    const categorias = await Categoria.find();
    res.status(200).json(categorias);
  } catch (error) {
    res.status(500).send('Error al obtener las categorías');
  }
};

// Buscar categoría y productos por nombre de categoría
exports.searchCategorias = async (req, res) => {
  console.log(process.env.JWT_SECRET)
  const token = req.headers.authorization.split(' ')[1];
  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Obtener el ID del usuario del token decodificado
    const userId = decoded._id;

    const nombreCategoria = req.params.nombreCategoria;

    // Buscar la categoría por su nombre
    const categoria = await Categoria.findOne({ nombre: nombreCategoria });
    if (!categoria) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    // Buscar los productos que pertenecen a la categoría
    const productos = await Product.find({ categoria: categoria._id });

    res.status(200).json({ categoria, productos });
  } catch (error) {
    res.status(500).send('Error al obtener la categoría y los productos');
  }
};
