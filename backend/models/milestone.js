'use strict';

const {Model, DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    class Milestone extends Model {
    }

    Milestone.init({
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
    Milestone.beforeCreate(async milestone => {
        const max = await Milestone.max('displayOrder');
        milestone.displayOrder = (max || 0) + 1;
    });

    return Milestone;
};
