
//-----------------------------------------------------------

/*
 * Devuelve los logs de un milestone
 */
exports.milestoneLogs = async milestoneId => {

    throw new Error('Internal Error. To be adapted.');

    /*
    try {
        const milestoneLogs = await MilestoneLog.findAll({
            where: {milestoneId}
        });

        return milestoneLogs.map(milestoneLog => json.milestoneLogJson(milestoneLog));

    } catch (error) {
        throw error;
    }
    */
};
