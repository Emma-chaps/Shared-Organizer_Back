const { DataTypes, Model } = require('sequelize');
const sequelize = require('../database');

class Label extends Model {}

Label.init(
  {
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    icon: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'label',
    timestamps: true,
  },
);

module.exports = Label;
