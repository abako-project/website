'use strict';

const {Model, DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    class Constraint extends Model {
    }

    Constraint.init({

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
    Constraint.beforeCreate(async constraint => {
        const max = await Constraint.max('displayOrder');
        constraint.displayOrder = (max || 0) + 1;
    });
    return Constraint;
};
