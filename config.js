require('dotenv').config(); //this loads the defined variables from .env

const config = {
    mongoDB: process.env.mongoDB
};

module.exports = config;