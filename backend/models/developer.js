'use strict';

const {Model, DataTypes} = require('sequelize');

// Definition of the Client model:
module.exports = (sequelize) => {

  class Developer extends Model {}

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
      githubUsername: {
        type: DataTypes.STRING
      },
      portfolioUrl: {
        type: DataTypes.STRING
      },
      location: {
        type: DataTypes.STRING
      },
      isAvailableForHire: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      isAvailableFullTime: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      isAvailablePartTime: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      isAvailableHourly: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      availableHoursPerWeek: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    }, {
      sequelize
    }
  );

  return Developer;
};
