const express = require('express');
const { body, check } = require('express-validator');
const { emailExist } = require("../helpers/db_validators");
const router = express.Router();
const authController = require('../controllers/authController');
const productController = require('../controllers/productController');
const categoriaController = require('../controllers/categoryController');
const clienteController = require('../controllers/clienteController');



//working
router.post('/auth/login', authController.login);

router.post('/auth/register', [
  check('email').custom(emailExist)
], authController.register);


router.post('/forgot-password', authController.forgotPassword);

router.post('/restore-password', authController.restorePassword);

router.get('/allProducts', productController.getAllProducts);

//working  Buscar un producto por su ID
router.get('/searchProducts/:id', productController.searchProductById);

router.post('/products/add', productController.addProduct);

router.post('/categoria/add', categoriaController.addCategoria);
//working
router.get('/allCategorias', categoriaController.getAllCategorias);

router.get('/searchCategorias/:nombreCategoria', categoriaController.searchCategorias);

router.get('/cliente/productos', clienteController.getClienteProductos);

router.get('/cliente/productos/:id', clienteController.getProductsByClientId);


router.get('/allClientes', clienteController.getAllClientes);

router.post('/logout', authController.logout);

router.delete('/delete/productos/cliente/:id', productController.deleteProduct);

router.delete('/delete/usuarios/:id', clienteController.deleteUser);

module.exports = router;





