const Group = require('./group');
const Member = require('./member');
const Widget = require('./widget');
const Fields = require('./fields');
const Label = require('./label');

Group.hasMany(Member, {
  foreignKey: 'id_group',
  as: 'members',
});

Member.belongsTo(Group, {
  foreignKey: 'id_group',
  as: 'group',
});

Widget.hasMany(Field, {
  foreignKey: 'id_widget',
  as: 'fields',
});

Field.belongsTo(Widget, {
  foreignKey: 'id_widget',
  as: 'widget',
});

Label.hasMany(Widget, {
  foreignKey: 'id_label',
  as: 'labels',
});

Widget.belongsTo(Label, {
  foreignKey: 'id_label',
  as: 'widgets',
});

Widget.belongsToMany(Member, {
  as: 'members',
  through: 'member_widget',
  foreignKey: 'id_widget',
  otherKey: 'id_member',
});

Member.belongsToMany(Widget, {
  as: 'widgets',
  through: 'member_widget',
  foreignKey: 'id_member',
  otherKey: 'id_widget',
});

module.exports = { Group, Member, Widget, Fields, Label };