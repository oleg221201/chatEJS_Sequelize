const Sequelize = require('sequelize')
const sequelize = require('../db')

const Chat = sequelize.define('chat', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true
    },
    member1id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    member2id: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
})

module.exports = Chat