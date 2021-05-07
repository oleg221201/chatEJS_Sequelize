const Sequelize = require('sequelize');

// const sequelize = new Sequelize('chatejs', 'oleg', '123456', {
//     host: 'localhost',
//     dialect: 'postgres'
// });

//const sequelize = new Sequelize(process.env.DATABASE_URL)

const sequelize = new Sequelize('postgres://ewgtzeeg:SQ3vAQJLLMJ3ZMu8Oj6j7NzRxI8I78s-@queenie.db.elephantsql.com:5432/ewgtzeeg')

module.exports = sequelize;