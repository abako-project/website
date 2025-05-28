const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {

    class Language extends Model {}

    Language.init({
        code: {
            type: DataTypes.STRING, //Sequelize.UUID,
            unique: true
        },
        name: {
            type: DataTypes.STRING
        }
      },
      {
        sequelize
    })

    return Language;
};