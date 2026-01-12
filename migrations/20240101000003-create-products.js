'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(280),
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      shortDescription: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      sku: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      compareAtPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      costPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      categoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      brand: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      stockQuantity: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      lowStockThreshold: {
        type: Sequelize.INTEGER,
        defaultValue: 10,
      },
      weight: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
      },
      dimensions: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      isFeatured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      averageRating: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0,
      },
      reviewCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      metaTitle: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      metaDescription: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('products', ['slug']);
    await queryInterface.addIndex('products', ['sku']);
    await queryInterface.addIndex('products', ['categoryId']);
    await queryInterface.addIndex('products', ['brand']);
    await queryInterface.addIndex('products', ['isActive']);
    await queryInterface.addIndex('products', ['isFeatured']);
    await queryInterface.addIndex('products', ['price']);
    await queryInterface.addIndex('products', ['averageRating']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('products');
  },
};
