'use strict';

const { Model, DataTypes } = require('sequelize');

// Definition of the Vote model:
module.exports = (sequelize) => {
  class Vote extends Model {}
  Vote.init({
    score: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 1, max: 5 }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
  });

  return Vote;
};




  