var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var request = require('request')
var morgan = require('morgan')
var mongoose = require('mongoose')
var morgan = require('morgan')


require('dotenv').config();

var db = require('./config/dbConfig')
db()

var db = require('./config/dbConfig');
db();

var app = express()

var port = process.env.PORT

app.use(cors());
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use(morgan('combined'))

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'))
app.get("/", (req, res) => {
  res.status(200).send("working fine...")
})

require('./route/role')(app)
require('./route/user')(app)
require('./route/category')(app)
require('./route/recipe')(app)
require('./route/blog')(app)
 require('./route/recipe_meta')(app)
require('./route/siteOption')(app)
require('./route/subscribeEmail')(app)
require('./route/contact')(app)

app.listen(port, () => {
  console.log(`server is ready to port ${port}`)
})

module.exports = app