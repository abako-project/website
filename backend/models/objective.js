'use strict';

const {Model, DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    class Objective extends Model {
    }

    Objective.init({

        description: {
            type: DataTypes.STRING,
            validate: {notEmpty: {msg: "Description must not be empty."}},
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
    Objective.beforeCreate(async objective => {
        const max = await Objective.max('displayOrder');
        objective.displayOrder = (max || 0) + 1;
    });

    return Objective;
};
