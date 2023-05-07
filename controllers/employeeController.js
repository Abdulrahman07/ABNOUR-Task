const asyncHandler = require('express-async-handler')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const AppError = require('../utilities/appError');

exports.getEmployee = asyncHandler(async (req, res, next) =>{
  
  const employee = await prisma.employee.findUnique({
    where: {
      id: req.employee.id
    }
  })

  employee.password = undefined
  
  if (!employee) return next(new AppError('No employee found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data: employee
  });
  
})

exports.deleteEmployee = asyncHandler(async (req, res, next) =>{
  
  await prisma.employee.delete({
    where: {
      id: parseInt(req.params.employeeId)
    }
  })
  
  res.status(204).json({
    status: 'success',
    data: null
  });
  
})


