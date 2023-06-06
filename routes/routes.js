const {Router} = require("express")
const router = Router()
const info = require("../models/models")
const User = require("../models/user")

router.get('/products', async (req, res) => {
    try {
      const products = await info.find({});
      res.status(200).json(products);
    } catch (error) {
      res.status(500).send('Error al obtener los productos');
    }
  });
  

  router.get('/clientes', async (req, res) => {
    try {
      const clientes = await User.find({});
      res.status(200).json(clientes);
    } catch (error) {
      res.status(500).send('Error al obtener los clientes');
    }
  });

  router.post('/clientes/add', async (req, res) => {
    try {
      const { name, password, email } = req.body;
      const cliente = new User({ name, password, email });
      await cliente.save();
      res.status(201).json(cliente);
    } catch (error) {
      res.status(500).send('Error al agregar el cliente');
    }
  });

  module.exports = router;
