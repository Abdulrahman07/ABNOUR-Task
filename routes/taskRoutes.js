const express = require('express');
const taskController = require('../controllers/taskController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect)

router.get('/getTasks', taskController.getTasks)

router.post('/createTask',
authController.restrictTo('admin', 'hr'),taskController.createTask)

router.patch('/updateStatus/:taskId', taskController.updateStatus)

module.exports = router;
