// Get the configuration values
require('dotenv').config();
const express = require('express');
const app = express();
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const passport = require('passport');
app.use(express.static(path.join(__dirname, 'services')));

const { createServer } = require('./services/server');
require('./services/passport');

// const {port, https, certs} = require('./services/https');
require('./services/server');
/*  VIEW ENGINE */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const dbString = process.env.DB_STRING;

app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: dbString,
    collectionName: 'sessions',
    autoRemove: 'native' // Automatically remove expired sessions
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 1, // 1 hour
    // sameSite: 'none',
  }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use('/', require('./routes/authRoutes'));
app.use('/', require('./routes/itemRoutes'));
app.use('/', require('./routes/signupRoutes'));

// Create the server according to environment
createServer(app);

