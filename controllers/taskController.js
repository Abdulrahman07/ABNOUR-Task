const asyncHandler = require('express-async-handler')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const AppError = require('../utilities/appError');

exports.createTask = asyncHandler(async (req, res, next) => {
  const task = await prisma.task.create({
    data: req.body
  })

  res.status(200).json({
    status: 'success',
    data: task
  });
})

exports.getTasks = asyncHandler(async (req, res, next) => {
  const tasks = await prisma.task.findMany({
    where: {
      employeeId: req.employee.id
    }
  })

  res.status(200).json({
    status: 'success',
    data: tasks
  });
})

exports.updateStatus = asyncHandler( async (req, res, next) => {
  const task = await prisma.task.findFirst({
    where: {
      employeeId: req.employee.id
    }
  }
  )

  if (!task) return next(new AppError('No task found with that employee', 404));

  const updateTask = await prisma.task.update({
    where: {
      id: parseInt(req.params.taskId)
    },
    data: {
      status: req.body.status
    }
  })


  res.status(200).json({
    status: 'success',
    data: updateTask
  });
})