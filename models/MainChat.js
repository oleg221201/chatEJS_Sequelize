const Sequelize = require('sequelize')
const sequelize = require('../db')

const MainChat = sequelize.define('main_chat', {
    messageid: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true
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

module.exports = MainChat