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
    },
    displayOrder: {
      type:        DataTypes.INTEGER,
      allowNull:   false,
      defaultValue: 0
    }
  }, {
    sequelize,
  });

  // Hook para asignar displayOrder automáticamente al crear
  Task.beforeCreate(async task => {
    const max = await Task.max('displayOrder');
    task.displayOrder = (max || 0) + 1;
  });

  return Task;
};
