'use strict';

const {Model, DataTypes} = require('sequelize');

module.exports = (sequelize) => {
  class Task extends Model {
  }

  Task.init({
    title: {
      type: DataTypes.STRING,
      validate: {notEmpty: {msg: "Title must not be empty."}}
    },
    description: {
      type: DataTypes.TEXT
    },
    budget: {
      type: DataTypes.FLOAT
    },
    currency: {
      type: DataTypes.STRING
    },
    deliveryDate: {
      type: DataTypes.DATE
    }
  }, {
    sequelize,
  });

  return Task;
};
