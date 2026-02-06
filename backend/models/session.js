'use strict';

const {Sequelize, Model, DataTypes} = require('sequelize');

const config = require(__dirname + '/../config/bbdd.config.json').development;

const sequelize = new Sequelize(config);

// Definition of the Session model:
class Session extends Model {}
Session.init({
        sid: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        expires: {
            type: DataTypes.DATE
        },
        data: {
            type: DataTypes.STRING(50000)
        }
    }, {
        sequelize
    }
);


Session.sync();

module.exports = sequelize;
