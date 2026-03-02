'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'orders',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      stripePaymentIntentId: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      paymentMethodType: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'zar',
      },
      status: {
        type: Sequelize.ENUM('pending', 'succeeded', 'failed', 'refunded', 'cancelled'),
        defaultValue: 'pending',
      },
      stripeMetadata: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      cardLast4: {
        type: Sequelize.STRING(4),
        allowNull: true,
      },
      cardBrand: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      cardExpMonth: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      cardExpYear: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      failureReason: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex('payments', ['stripePaymentIntentId'], { unique: true });
    await queryInterface.addIndex('payments', ['orderId']);
    await queryInterface.addIndex('payments', ['userId']);
    await queryInterface.addIndex('payments', ['status']);
    await queryInterface.addIndex('payments', ['createdAt']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('payments');
  },
};
