'use strict';

const {Model, DataTypes} = require('sequelize');

module.exports = (sequelize) => {
  class Assignation extends Model {
  }

  Assignation.init({
    comment: {
      type: DataTypes.TEXT
    },
    state: {
      type: DataTypes.ENUM,
      values: ['None', 'Pending', 'Accepted', 'Rejected'],
      defaultValue: 'None'
    }
  }, {
    sequelize,
  });

  return Assignation;
};
