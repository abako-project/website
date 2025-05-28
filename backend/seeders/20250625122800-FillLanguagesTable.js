'use strict';

const languages = require('../utils/languages.json');
let parsedLanguage = [];
for (let l in languages) {
  parsedLanguage.push({ 
    code: l, 
    name: languages[l],
    createdAt: new Date(),
    updatedAt: new Date()
  })
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.bulkInsert('Languages', parsedLanguage);
    } catch (error) {
      if (error instanceof Sequelize.ValidationError) {
        console.log('There are errors:');
        error.errors.forEach(({message}) => console.log(message));
      } else {
        console.log('Error creating langiages: ' + error.message);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Languages', null, {});
  }
};
