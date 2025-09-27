'use strict';

const {Model, DataTypes} = require('sequelize');

module.exports = (sequelize) => {
  class DeliveryTime extends Model {
  }

  DeliveryTime.init({
    description: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
  });

  return DeliveryTime;
};
