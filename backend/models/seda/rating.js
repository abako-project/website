

const {adapterAPI} = require('../adapter');


//-----------------------------------------------------------


exports.getClientRatings = async (clientId) => {

    const response = await adapterAPI.getClientRatings(clientId);

    require("../../helpers/logs").log(response,"adapterAPI.getClientRatings");

    return response;
};


exports.getDeveloperRatings = async (developerId) => {

    const response = await adapterAPI.getDeveloperRatings(developerId);

    require("../../helpers/logs").log(response,"adapterAPI.getDeveloperRatings");

    return response;
};


exports.getProjectRatings = async (projectId) => {

    const response = await adapterAPI.getProjectRatings(projectId);

    require("../../helpers/logs").log(response,"adapterAPI.getProjectRatings");

    return response;
};

//-----------------------------------------------------------

