module.exports = (sequelize, DataTypes) => {
  const CartItem = sequelize.define('CartItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cartId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'carts',
        key: 'id',
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
    priceAtAdd: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Price when item was added to cart',
    },
  }, {
    tableName: 'cart_items',
    timestamps: true,
    indexes: [
      { fields: ['cartId'] },
      { fields: ['productId'] },
      { unique: true, fields: ['cartId', 'productId'] },
    ],
  });

  return CartItem;
};
