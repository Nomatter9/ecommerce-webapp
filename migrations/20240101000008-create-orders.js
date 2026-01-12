'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      orderNumber: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      status: {
        type: Sequelize.ENUM(
          'pending',
          'confirmed',
          'processing',
          'shipped',
          'out_for_delivery',
          'delivered',
          'cancelled',
          'refunded'
        ),
        defaultValue: 'pending',
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      shippingCost: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      discount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      tax: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      shippingAddressId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'addresses',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      shippingAddressSnapshot: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      paymentMethod: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      paymentStatus: {
        type: Sequelize.ENUM('pending', 'paid', 'failed', 'refunded'),
        defaultValue: 'pending',
      },
      paymentReference: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      trackingNumber: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      shippingCarrier: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      estimatedDelivery: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      deliveredAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      couponCode: {
        type: Sequelize.STRING(50),
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

    await queryInterface.addIndex('orders', ['orderNumber']);
    await queryInterface.addIndex('orders', ['userId']);
    await queryInterface.addIndex('orders', ['status']);
    await queryInterface.addIndex('orders', ['paymentStatus']);
    await queryInterface.addIndex('orders', ['createdAt']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('orders');
  },
};
