'use strict';

const {readFile} = require('fs/promises');
const path = require('path');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;

    const User = require("../models/user")(sequelize);
    const Client = require("../models/client")(sequelize);
    const Developer = require("../models/developer")(sequelize);
    const Attachment = require('../models/attachment')(sequelize);
    const Role = require('../models/role')(sequelize);
    const Skill = require('../models/skill')(sequelize);

    User.hasOne(Client, {as: 'client', foreignKey: 'userId'});
    Client.belongsTo(User, {as: 'user', foreignKey: 'userId'});

    User.hasOne(Developer, {as: 'developer', foreignKey: 'userId'});
    Developer.belongsTo(User, {as: 'user', foreignKey: 'userId'});

    Client.hasOne(Attachment, {as: 'attachment', foreignKey: 'clientId'});
    Attachment.belongsTo(Client, {as: 'client', foreignKey: 'clientId'});

    Developer.hasOne(Attachment, {as: 'attachment', foreignKey: 'developerId'});
    Attachment.belongsTo(Developer, {as: 'developer', foreignKey: 'developerId'});

    Role.hasMany(Developer, {as: 'developers', foreignKey: 'roleId'});
    Developer.belongsTo(Role, {as: 'role', foreignKey: 'roleId'});

    // Relation 1-to-N between developer and skill
    Developer.belongsToMany(Skill, {as: 'skills', through: "DeveloperSkills",
      foreignKey: 'developerId', otherKey: 'skillId'});
    Skill.belongsToMany(Developer, {as: 'developers', through: "DeveloperSkills",
      foreignKey: 'skillId', otherKey: 'developerId'});

    const clients = [
      {email: 'carlos@sitio.es',   name: "Carlos",    website: "https://sitio.es", attachment: "c1.jpeg"},
      {email: 'cipriano@aqui.es',  name: "Cipriano",  website: "https://aqui.es",  attachment: "c2.jpeg"},
      {email: 'camilo@alli.es',    name: "Camilo",    website: "https://alli.es",  attachment: "c3.jpeg"},
      {email: 'cesar@sitio.es',    name: "Cesar",     website: "https://sitio.es", attachment: "c4.jpeg"},
      {email: 'clemente@sitio.es', name: "Clemente",  website: "https://sitio.es", attachment: "c5.jpeg"}
    ];

    const developers = [
      {email: 'daniela@sitio.es', name: "Daniela", address: "xxxxx1", bio: "Madrileña",
        skillIds: [1,2,3], roleId: 1, attachment: "d1.jpeg"},
      {email: 'denisse@aqui.es', name: "Denisse", address: "xxxxx2", bio: "Autodidacta",
        skillIds: [1,3], roleId: 2, attachment: "d2.jpeg"},
      {email: 'dolores@alli.es', name: "Dolores", address: "xxxxx3", bio: "Grandes éxito",
        skillIds: [3],roleId: 3, attachment: "d3.jpeg"},
      {email: 'deborah@sitio.es', name: "Deborah", address: "xxxxx4", bio: "Becaria eterna",
        skillIds: [1,4], roleId: 2, attachment: "d4.jpeg"},
      {email: 'diana@sitio.es', name: "Diana", address: "xxxxx5", bio: "Siempre lo mismo",
        skillIds: [], roleId: 1, attachment: "d5.jpeg"}
    ];

    for (const {email, name, website, attachment} of clients) {
      try {
        const user = await User.create({email});
        const client = await Client.create({
          name,
          website,
            password: '1'
        });
        await client.setUser(user);

        const buf = await readFile(path.join(__dirname, 'faces', 'clients', attachment));
        const foto = await Attachment.create({mime: "image/jpeg", image: buf});
        await client.setAttachment(foto);

      } catch (error) {
        if (error instanceof Sequelize.ValidationError) {
          console.log('There are errors:');
          error.errors.forEach(({message}) => console.log(message));
        } else {
          console.log('Error creating client: ' + error.message);
        }
      }
    }

    for (const {email, name, address, bio, roleId, skillIds, attachment} of developers) {
      try {
        const user = await User.create({email});
        const developer = await Developer.create({
          name,
          address,
          bio,
          roleId
        });
        await developer.setUser(user);

        await developer.setSkills(skillIds);

        const buf = await readFile(path.join(__dirname, 'faces', 'developers', attachment));
        const foto = await Attachment.create({mime: "image/jpeg", image: buf});
        await developer.setAttachment(foto);
      } catch (error) {
        if (error instanceof Sequelize.ValidationError) {
          console.log('There are errors:');
          error.errors.forEach(({message}) => console.log(message));
        } else {
          console.log('Error creating developer: ' + error.message);
        }
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Clients', null, {});
  }
};

