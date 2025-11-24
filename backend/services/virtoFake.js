
console.log('[virtoFake] 1. Iniciando carga de virtoFake.js...');
const { virtoAPI, adapterAPI } = require('./api-client');
console.log('[virtoFake] 2. api-client cargado correctamente');
const { models: { User, Developer } } = require('../models');
console.log('[virtoFake] 3. Modelos Sequelize cargados correctamente');
console.log("!! Inicializando el modulo virto API - Conectando con backend desplegado !!");
console.log('[virtoFake] 4. virtoFake.js cargado completamente ✓');

exports.index = async (req, res) => {
  res.render("virto/index");
};


exports.checkRegistered = async (req, res) => {
  try {
    const userId = req.params.userId;
    const result = await virtoAPI.checkRegistered(userId);
    res.json(result);
  } catch (error) {
    console.error('[Virto API] Error checking registration:', error);
    res.status(500).json({
      error: 'Error checking if the user is registered',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

exports.customRegister = async (req, res) => {
  try {
    console.log('[VirtoFake] customRegister called with:', req.body);
    const result = await adapterAPI.customRegister(req.body);
    res.json(result);
  } catch (error) {
    console.error('[Virto API] Error in customRegister:', error);
    res.status(500).json({
      success: false,
      error: 'Error in registration',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

exports.customConnect = async (req, res) => {
  try {
    console.log('[VirtoFake] customConnect called with:', req.body);
    const result = await virtoAPI.customConnect(req.body);
    res.json(result);
  } catch (error) {
    console.error('[Virto API] Error in customConnect:', error);
    res.status(500).json({
      success: false,
      error: 'Error in connection',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

exports.sign = async (req, res) => {
  try {
    const result = await virtoAPI.sign(req.body);
    res.json(result);
  } catch (error) {
    console.error('[Virto API] Error in sign:', error);
    res.status(500).json({
      success: false,
      error: 'Error signing',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
