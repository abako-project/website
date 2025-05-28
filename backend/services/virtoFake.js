
const {models:{User, Developer}} = require('../models');

console.log("!! Inicializando el modulo virto FAKE !!");


exports.checkRegistered = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findOne({
      where: {email: userId},
      include: [{model: Developer, as: "developer"},]
    });

    res.json({
      userId,
      isRegistered: !!(user?.developer)
    });
  } catch (error) {
    console.error('Error checking registration:', error);
    res.status(500).json({
      error: 'Error checking if the user is registered',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

exports.customRegister = async preparedData => {
  return { ext: '0x666666666', address: 'xxxxxx' };
};

exports.customConnect = async preparedData => {

  return {
    userId: preparedData,
    address: "zzz",
    createdAt: new Date(),
    token: "xx"
  };
};

exports.sign = async (req, res) => {
    res.status(500).json({
      success: false,
      error: 'Sin implementar',
      details: 'Sin implementar'
    });
};
