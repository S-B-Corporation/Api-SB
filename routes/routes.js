const {Router} = require("express")
const bcrypt = require('bcrypt');
const router = Router()
const info = require("../models/models")
const User = require("../models/user")
const jwt = require("jsonwebtoken");
const { generateJWT } = require("../helpers/generate-jwt");
const nodemailer = require('nodemailer');




router.get('/products', async (req, res) => {
    try {
      const products = await info.find({});
      res.status(200).json(products);
    } catch (error) {
      res.status(500).send('Error al obtener los productos');
    }
  });

  router.get('/products/:id', async (req, res) => {
    try {
      const productId = req.params.id;
  
      const product = await info.findById(productId);
  
      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
  
      res.status(200).json(product);
    } catch (error) {
      res.status(500).send('Error al obtener el producto');
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


      const salt = bcrypt.genSaltSync();
        cliente.password = bcrypt.hashSync(password, salt);
      await cliente.save();


      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'sybmarketplace@gmail.com',
          pass: 'ipphardrbiaxnhtp',
        },
      });
      //pjtixaqiaptobhqc

      const mailOptions = {
        from: 'sybmarketplace@gmail.com',
        to: email,
        subject: 'Registro exitoso',
        text: `¡Bienvenido, ${cliente.name}! Gracias por registrarte en nuestro sitio.`,
      };
      

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.status(500).send('Error al enviar el correo electrónico');
      } else {
        console.log('Correo electrónico enviado: ' + info.response);
        res.status(201).json({ message: 'Usuario creado', cliente });
      }
    });    } catch (error) {
      res.status(500).send('Error al agregar el cliente');
    }
  });


  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Buscar el cliente por su correo electrónico en la base de datos
      const cliente = await User.findOne({ email });
  
      // Si no se encuentra el cliente, enviar una respuesta de error
      if (!cliente) {
        return res.status(404).json({ message: 'Cliente no encontrado' });
      }
  
      // Comparar la contraseña ingresada con la contraseña almacenada
      const isPasswordValid = bcrypt.compareSync(password, cliente.password);
  
      // Si las contraseñas no coinciden, enviar una respuesta de error
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Usuario o contraseña incorrecta' });
      }
  
      // La contraseña es válida, iniciar sesión exitosamente
      // Aquí puedes generar y enviar un token JWT si deseas implementar autenticación basada en tokens
      // generate JWT
      console.log(process.env.JWT_SECRET);

      const token = await generateJWT(cliente._id);
  
      res.status(200).json({ message: 'Inicio de sesión exitoso' , token});
    } catch (error) {
      res.status(500).send('Error en el servidor');
    }
  });
  
  module.exports = router;
