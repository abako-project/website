const json = require("./json");

const {
    models: {MilestoneLog}
} = require('../../models');

const sequelize = require("../../models");

//-----------------------------------------------------------

/*
 * Devuelve los logs de un milestone
 */
exports.milestoneLogs = async milestoneId => {

    try {
        const milestoneLogs = await MilestoneLog.findAll({
            where: {milestoneId}
        });

        return milestoneLogs.map(milestoneLog => json.milestoneLogJson(milestoneLog));

    } catch (error) {
        throw error;
    }
};
