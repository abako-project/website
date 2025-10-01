'use strict';

const {Model, DataTypes} = require('sequelize');
const crypt = require('../helpers/crypt');

// Definition of the Client model:
module.exports = (sequelize) => {

    class Developer extends Model {
        verifyPassword(password) {
            return crypt.encryptPassword(password, this.salt) === this.password;
        }
    }

    Developer.init({
            name: {
                type: DataTypes.STRING,
            },
            address: {
                type: DataTypes.TEXT
            },
            bio: {
                type: DataTypes.TEXT
            },
            background: {
                type: DataTypes.TEXT
            },
            experienceLevel: {
                type: DataTypes.ENUM,
                values: ['Beginner', 'Intermediate', 'Advanced']
            },
            githubUsername: {
                type: DataTypes.STRING
            },
            portfolioUrl: {
                type: DataTypes.STRING
            },
            location: {
                type: DataTypes.STRING
            },
            availability: {
                type: DataTypes.STRING
            }
        }, {
            sequelize
        }
    );

    return Developer;
};
