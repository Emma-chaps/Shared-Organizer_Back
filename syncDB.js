require('dotenv').config();
const { Field, Group, Label, Widget, Member } = require('./app/models');
const sequelize = require('./app/database');

sequelize.sync({ force: true }).then(() => {
  // Now the `users` table in the database corresponds to the model definition
  return (
    Group.create({
      name: 'Doe',
    }),
    Member.create({
      firstname: 'John',
      email: 'johndoe@gmail.com',
      password: 'jojo',
      role: 3,
      icon: 'icon',
      id_group: 1,
    })
  );
});
