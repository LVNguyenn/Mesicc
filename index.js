// Start web server
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override')
const handlebars = require('express-handlebars');
const app = express();
const port = 3000;

const route = require('./src/routes');
const db = require('./src/config/db')

// Connect to DB
db.connect()
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});
// Ảnh
app.use(express.static(path.join(__dirname, './src/public')));

// Middleware   body-parser
app.use(
    express.urlencoded({
        extended: true,
    }),

);
app.use(express.json());

app.use(methodOverride('_method'))

// HTTP logger
app.use(morgan('combined'));

// Template engine
app.engine(
    'hbs',
    handlebars.engine({
        extname: '.hbs',
        helpers: {
            sum: (a, b) => a + b,
        }
    }),
);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, './src/resources', 'views'));
// Route init
route(app);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

// 127.0.0.1 - localhost
