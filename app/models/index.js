const Group = require('./Group');
const Member = require('./Member');
const Widget = require('./Widget');

Group.hasMany(Member, {
  foreignKey: 'id_group',
  as: 'members',
});

Member.belongsTo(Group, {
  foreignKey: 'id_group',
  as: 'group',
});

Group.hasMany(Widget, {
  foreignKey: 'id_group',
  as: 'widgets',
});

Widget.belongsTo(Group, {
  foreignKey: 'id_group',
  as: 'group',
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

module.exports = { Group, Member, Widget };
