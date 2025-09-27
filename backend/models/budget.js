'use strict';

const {Model, DataTypes} = require('sequelize');

module.exports = (sequelize) => {
  class Budget extends Model {
  }

  Budget.init({

    description: {
      type: DataTypes.STRING,
      validate: {notEmpty: {msg: "Budget must not be empty."}},
    }
  }, {
    sequelize,
  });

  return Budget;
};
