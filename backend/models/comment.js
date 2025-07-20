'use strict';

const {Model, DataTypes} = require('sequelize');

module.exports = (sequelize) => {
  class Comment extends Model {
  }

  Comment.init({
    consultantComment: {
      type: DataTypes.STRING
    },
    clientResponse: {
      type: DataTypes.STRING
    }
  }, {
    sequelize,
  });

  return Comment;
};
