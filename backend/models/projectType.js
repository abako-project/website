'use strict';

const {Model, DataTypes} = require('sequelize');

module.exports = (sequelize) => {
  class ProjectType extends Model {
  }

  ProjectType.init({
    description: {
      type: DataTypes.STRING
    }
  }, {
    sequelize,
  });

  return ProjectType;
};
