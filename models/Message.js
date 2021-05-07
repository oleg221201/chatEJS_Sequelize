const Sequelize = require('sequelize')
const sequelize = require('../db')

const Message = sequelize.define('message', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true
    },
    chatid: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    text: {
        type: Sequelize.STRING,
        allowNull: false
    },
    senderid: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
})

module.exports = Message