const { DataTypes, Model } = require('sequelize');
const sequelize = require('../database');

class Group extends Model {}

Group.init(
  {
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'group',
    timestamps: true,
  },
);

module.exports = Group;
