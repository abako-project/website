'use strict';

const {Model, DataTypes} = require('sequelize');

module.exports = (sequelize) => {
  class Proficiency extends Model {
  }

  Proficiency.init({
    description: {
      type: DataTypes.STRING
    }
  }, {
    sequelize,
  });

  return Proficiency;
};
