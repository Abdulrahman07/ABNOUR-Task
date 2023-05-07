const express = require('express');
const employeeController = require('../controllers/employeeController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/login', authController.login);

router.use(authController.protect)

router.post('/create-employee', 
authController.restrictTo('admin', 'hr'),authController.createEmployee);

router.delete('/delete-employee/:employeeId', 
authController.restrictTo('admin', 'hr'),employeeController.deleteEmployee);

router.get('/getEmployee', employeeController.getEmployee)

module.exports = router;
