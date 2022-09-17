var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars')
var fileUpload = require('express-fileupload');
var session = require('express-session');
const Handlebars = require('handlebars');
const H = require('just-handlebars-helpers');
H.registerHelpers(Handlebars);




var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');

var app = express();

var db = require('./config/connection');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({
  helpers:{
    inc: function (value, options) {
        return parseInt(value) + 1;
    }
},
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layout/',
  partialsDir: __dirname + '/views/partials/'
}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: "key", cookie: { maxAge: 86400000 } })); //24 hours=86400000 milliseconds.


app.use(express.static(path.join(__dirname, 'public')));

app.use(fileUpload());
db.connect((err) => {
  if (err)
    console.log("database connection failed" + err);
  else
    console.log("database connected successfully");
})
app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
