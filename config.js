require('dotenv').config(); //this loads the defined variables from .env

const config = {
    mongoDB: process.env.mongoDB + process.env.mongoEnd
};

module.exports = config;