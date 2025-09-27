'use strict';

const {Model, DataTypes} = require('sequelize');

module.exports = (sequelize) => {
  class ProjectType extends Model {
  }

  ProjectType.init({
    description: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
  });

  return ProjectType;
};
