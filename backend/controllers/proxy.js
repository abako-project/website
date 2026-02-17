
const {adapterAPI} = require("../models/adapter");


exports.test = async (req, res, next) => {

    res.json({
        date: Date.now()
    });
};

exports.customRegister = async (req, res, next) => {

    const preparedData = req.body;

    try {
        const response = await adapterAPI.customRegister(preparedData);

        res.json(response);

    } catch (error) {
        next(error);
    }
};

exports.customConnect = async (req, res, next) => {

    try {
        const data = req.body;

        const response = await adapterAPI.customConnect(data);

        res.json(response);
    } catch (error) {
        next(error);
    }
};
