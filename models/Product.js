module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(280),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    shortDescription: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    sku: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    compareAtPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Original price for showing discounts',
    },
    costPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Cost price for profit calculations',
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      comment: 'Seller who created this product. NULL means admin-created product.',
    },
    brand: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    stockQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lowStockThreshold: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
    },
    weight: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      comment: 'Weight in kg',
    },
    dimensions: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'JSON object with length, width, height',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    averageRating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    metaTitle: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    metaDescription: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  }, {
    tableName: 'products',
    timestamps: true,
    indexes: [
      { fields: ['slug'] },
      { fields: ['sku'] },
      { fields: ['categoryId'] },
      { fields: ['userId'] },
      { fields: ['brand'] },
      { fields: ['isActive'] },
      { fields: ['isFeatured'] },
      { fields: ['price'] },
      { fields: ['averageRating'] },
    ],
  });

  return Product;
};
