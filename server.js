require('dotenv').config({ path: './.env' });
const express = require('express');
const cookieParser = require('cookie-parser');

const AppError = require('./utilities/appError');
const employeeRouter = require('./routes/employeeRoutes');
const taskRouter = require('./routes/taskRoutes');

const app = express()
const port = 3000

// Body parses, reading the data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Routes
app.use('/api/v1/employees', employeeRouter);
app.use('/api/v1/tasks', taskRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server!`, 404));
});

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});