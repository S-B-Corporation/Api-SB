const nodemailer = require('nodemailer');

// Generar un código de verificación único
const generateVerificationCode = () => {
    const code = Math.floor(1000 + Math.random() * 9000);
    return code.toString();
  };
  
// Enviar el correo electrónico de recuperación de contraseña


// Configura el transporte de Nodemailer
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'sybmarketplace@gmail.com',
      pass: 'ipphardrbiaxnhtp',
    },
  });
  
  // Función para enviar el correo electrónico de recuperación de contraseña
  const sendPasswordResetEmail = (email, code) => {
    const mailOptions = {
      from: 'sybmarketplace@gmail.com',
      to: email,
      subject: 'Recuperación de contraseña',
      text: `Tu código de verificación es: ${code}`,
    };
  
    return transporter.sendMail(mailOptions);
  };
  

module.exports = {
  generateVerificationCode,
  sendPasswordResetEmail,
};
