'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reviews', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      isVerifiedPurchase: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      helpfulCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      isApproved: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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

    await queryInterface.addIndex('reviews', ['userId']);
    await queryInterface.addIndex('reviews', ['productId']);
    await queryInterface.addIndex('reviews', ['rating']);
    await queryInterface.addIndex('reviews', ['isApproved']);
    await queryInterface.addIndex('reviews', ['userId', 'productId'], { unique: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('reviews');
  },
};
