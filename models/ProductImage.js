module.exports = (sequelize, DataTypes) => {
  const ProductImage = sequelize.define('ProductImage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    altText: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    tableName: 'product_images',
    timestamps: true,
    indexes: [
      { fields: ['productId'] },
      { fields: ['isPrimary'] },
    ],
  });

  return ProductImage;
};
