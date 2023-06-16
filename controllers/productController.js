const Product = require('../models/product');
const jwt = require('jsonwebtoken');
const Categoria = require('../models/category');


// Obtener todos los productos
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    res.status(500).send('Error al obtener los productos');
  }
};

// Buscar un producto por su ID
exports.searchProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).send('Error al obtener el producto');
  }

  
};


exports.addProduct = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const { titulo, descripcion, precio, numerodecontacto, categoriaNombre } = req.body;
  
    try {
      // Verificar y decodificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Obtener el ID del usuario del token decodificado
      const userId = decoded._id;
  
      // Imprimir el ID y el token recibidos en la consola
      console.log('ID del usuario:', userId);
      console.log('Token recibido:', token);
  
      // Verificar si la categoría existe
      const categoria = await Categoria.findOne({ nombre: categoriaNombre });
      if (!categoria) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
  
      // Crear una instancia del modelo Product
      const product = new Product({
        titulo,
        descripcion,
        precio,
        numerodecontacto,
        categoria: categoria._id,
        idcliente: userId,
      });
  
      // Guardar el producto en la base de datos
      await product.save();
  
      res.status(201).json({ message: 'Producto creado exitosamente', product });
    } catch (error) {
      console.error('Error al agregar el producto:', error);
      res.status(500).json({ message: 'Error al agregar el producto' });
    }
  };

  exports.deleteProduct = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const productId = req.params.id;
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Obtener el ID del usuario del token decodificado
      const idcliente = decoded._id;
      // Buscar el producto por su ID
      const product = await Product.findById(productId);
  
      // Verificar si el producto existe
      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
  
      // Realizar la eliminación del producto
      await product.deleteOne();
  
      res.status(200).json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al eliminar el producto' });
    }
  };
