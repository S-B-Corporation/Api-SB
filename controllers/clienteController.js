const jwt = require('jsonwebtoken');
const Product = require('../models/product');
const User = require('../models/user');

// Obtener los productos del cliente
exports.getClienteProductos = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Obtener el ID del usuario del token decodificado
    const idcliente = decoded._id;

    // Buscar los productos del cliente por su ID
    const productos = await Product.find({ idcliente });

    res.status(200).json(productos);
  } catch (error) {
    res.status(500).send('Error al obtener los productos');
  }

};

exports.getProductsByClientId = async (req, res) => {
    const clientId = req.params.id;
  
    try {
      // Buscar el cliente por su ID
      const cliente = await User.findById(clientId);
  
      // Verificar si el cliente existe
      if (!cliente) {
        return res.status(404).json({ message: 'Cliente no encontrado' });
      }
  
      // Obtener los productos del cliente
      const products = await Product.find({ idcliente: clientId });
  
      res.status(200).json({ cliente, products });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener los productos del cliente' });
    }
  };


exports.getAllClientes = async (req, res) => {
    try {
      const clientes = await User.find({});
      res.status(200).json(clientes);
    } catch (error) {
      res.status(500).send('Error al obtener los clientes');
    }
  };


  exports.deleteUser = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const userId = req.params.id;
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Obtener el ID del usuario del token decodificado
      const idcliente = decoded._id;
  
      // Buscar el usuario por su ID
      const user = await User.findById(userId);
  
      // Verificar si el usuario existe
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
  
      // Realizar la eliminación del usuario
      await user.deleteOne();
  
      res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al eliminar el usuario' });
    }
  };
