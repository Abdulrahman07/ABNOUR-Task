const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const asyncHandler = require('express-async-handler')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const AppError = require('../utilities/appError');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (employee, statusCode, res) => {
  const token = signToken(employee.id);
  const CookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 86400000),
    httpOnly: true
  };

  res.cookie('jwt', token, CookieOptions);

  //Remove password from output
  employee.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      employee
    }
  });
};

exports.createEmployee = asyncHandler(async (req, res, next) => {

  if(req.body.password !== req.body.confirmPassword) {
    return next(new AppError("Password don't match", 400));
  }
  const hashedPassword = await bcrypt.hash(req.body.password, 10)

  const newEmployee = await prisma.employee.create({
    data:{
    name: req.body.name,
    password: hashedPassword,
    role: req.body.role,
    birthDate:req.body.birthDate,
    joinDate:new Date(),
    profilePic:req.body.profilePic,
    }
  });

  createSendToken(newEmployee, 200, res);
});

exports.login = asyncHandler(async (req, res, next) => {
  const { name, password } = req.body;

  // 1) Check if name and password exist
  if (!name || !password) {
    return next(new AppError('Please provide your name and password', 400));
  }
  
  // 2) Check if employee exists && password is correct
  const employee = await prisma.employee.findUnique({
    where: {
      name: req.body.name,
    },
  });
  if (!employee || !(await bcrypt.compare(password, employee.password))) {
    return next(new AppError('Incorrect name or password', 401));
  }

  // 3) If everything ok, send token
  createSendToken(employee, 200, res);
});

exports.protect = asyncHandler(async (req, res, next) => {
  // 1) Getting the token and cheak if it's there
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.replace('Bearer ', '');
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }
  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentEmployee = await prisma.employee.findUnique({
    where: {
      id: decoded.id,
    },
  });

  if (!currentEmployee) {
    return next(
      new AppError('The employee belonging this token does no longer exist.', 401)
    );
  }
  
  // GRANT ACCESS TO PROTECTED ROUTE
  req.employee = currentEmployee;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.employee.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};
