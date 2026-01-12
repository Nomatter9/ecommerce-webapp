module.exports = (sequelize, DataTypes) => {
  const Wishlist = sequelize.define('Wishlist', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
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
  }, {
    tableName: 'wishlists',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['productId'] },
      { unique: true, fields: ['userId', 'productId'] },
    ],
  });

  return Wishlist;
};
