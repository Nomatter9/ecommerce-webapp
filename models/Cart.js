module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define('Cart', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    totalItems: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
  }, {
    tableName: 'carts',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
    ],
  });

  return Cart;
};
