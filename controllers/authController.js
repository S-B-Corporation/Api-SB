const User = require('../models/user');
const jwt = require('jsonwebtoken');
const Token = require('../models/tokens');
const bcrypt = require('bcrypt');
const { generateJWT } = require('../helpers/generate-jwt');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const { generateVerificationCode, sendPasswordResetEmail } = require('../utils/passwordReset');
const { emailExist } = require('../helpers/db_validators');
const emailVerificationCodes = {};



const login = async (req, res) => {
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
    // Generar y enviar un token JWT
    const token = await generateJWT(cliente._id);

    // Crear una instancia del modelo Token
    const tokenInstance = new Token({
      token: token,
      userId: cliente._id,
    });

    // Guardar la instancia en la base de datos
    await tokenInstance.save();

    // Actualizar el campo isWhitelisted a true
    await Token.updateOne({ token: token }, { isWhitelisted: true });

    res.status(200).json({ message: 'Inicio de sesión exitoso', token });
  } catch (error) {
    res.status(500).send('Error en el servidor');
  }
};

const register = async (req, res) => {
  try {
    const { name, password, email } = req.body;
    await emailExist(email);
    // Crear el nuevo usuario
    const cliente = new User({ name, password, email });

    const salt = bcrypt.genSaltSync();
    cliente.password = bcrypt.hashSync(password, salt);

    await cliente.save();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      return res.status(400).json({ msg: errorMessages });
    }

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'sybmarketplace@gmail.com',
        pass: 'ipphardrbiaxnhtp',
      },
    });

    const mailOptions = {
      from: 'sybmarketplace@gmail.com',
      to: email,
      subject: 'Registro exitoso',
      text: `¡Bienvenido, ${cliente.name}! Gracias por registrarte en nuestro sitio.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.status(500).json({message: 'Error al enviar el correo electrónico'});
      } else {
        console.log('Correo electrónico enviado: ' + info.response);
        res.status(201).json({ message: 'Usuario creado', cliente });
      }
    });
  } catch (error) {
    res.status(500).json({message: 'Error al agregar el cliente'});
  }
};


  const forgotPassword = async (req, res) => {
    const { email } = req.body;
  
    try {
      // Verificar si el correo electrónico existe en la base de datos
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'Correo electrónico no encontrado' });
      }
  
      // Generar un código de verificación único
      const verificationCode = generateVerificationCode();
  
      // Guardar el código de verificación en la base de datos para el usuario
      emailVerificationCodes[email] = verificationCode;
  
      // Enviar el correo electrónico de recuperación de contraseña
      await sendPasswordResetEmail(email, verificationCode);
  
      res.status(200).json({ message: 'Se ha enviado un correo electrónico de recuperación de contraseña' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al enviar el correo electrónico de recuperación de contraseña' });
    }
  };

  async function restorePassword(req, res) {
    try {
      const { email, code, newPassword } = req.body;
  
      // Obtener el código de verificación almacenado para el correo electrónico
      const storedCode = emailVerificationCodes[email];
  
      if (!storedCode) {
        return res.status(404).json({ message: 'Código de verificación no encontrado' });
      }
  
      // Verificar si el código ingresado por el usuario coincide con el código almacenado
      if (code !== storedCode) {
        return res.status(400).json({ message: 'Código de verificación incorrecto' });
      }
      // Eliminar el código de verificación del objeto emailVerificationCodes
      delete emailVerificationCodes[email];
  
      // Actualizar la contraseña del usuario con la nueva contraseña
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
  
      const salt = bcrypt.genSaltSync();
      user.password = bcrypt.hashSync(newPassword, salt);
      await user.save();
  
      // Enviar una respuesta de éxito si la contraseña se actualiza correctamente
      res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
      res.status(500).send('Error al verificar el código de verificación');
    }
  };

  const logout = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
  
    try {
      // Verificar y decodificar el token
      console.log('Token recibido:', token);
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Verificar si el token ha expirado
      const now = Date.now() / 1000; // Obtener la fecha y hora actual en segundos
      if (decoded.exp < now) {
        // El token ha expirado
        res.status(401).json({ message: 'El token ha expirado' });
        return;
      }
  
      // Actualizar el token en el esquema Token
      await Token.updateOne(
        { token: token },
        { isWhitelisted: false, isBlacklisted: true }
      );
  
      // Verificar si el token está en la lista negra
      const tokenInstance = await Token.findOne({ token: token });
      if (tokenInstance.isBlacklisted) {
        // El token está en la lista negra, la sesión ya ha expirado
        res.status(401).json({ message: 'Logout exitoso, sesión ya ha expirado' });
        return;
      }
  
      res.status(200).json({ message: 'Logout exitoso' });
    } catch (error) {
      // Imprimir el error para depurar
      console.error('Error al verificar el token:', error);
  
      // En caso de que ocurra un error al verificar el token, enviar una respuesta de error
      res.status(401).json({ message: 'Error al realizar el logout' });
    }
  };
  


module.exports = {
  login,
  register,
  forgotPassword,
  restorePassword,
  logout
};
