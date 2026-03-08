'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Payments', {
      id:                 { type: Sequelize.INTEGER,        primaryKey: true, autoIncrement: true },
      orderId:            { type: Sequelize.INTEGER,        allowNull: false, references: { model: 'Orders', key: 'id' }, onDelete: 'CASCADE' },
      userId:             { type: Sequelize.INTEGER,        allowNull: false, references: { model: 'Users',  key: 'id' } },
      paymentIntentId:    { type: Sequelize.STRING,         allowNull: false, unique: true },
      paymentMethodId:    { type: Sequelize.STRING,         allowNull: true  },
      amount:             { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      currency:           { type: Sequelize.STRING(10),     allowNull: false, defaultValue: 'zar' },
      status:             { type: Sequelize.ENUM('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded'), defaultValue: 'pending' },
      captureMethod:      { type: Sequelize.STRING,         allowNull: true  },
      confirmationMethod: { type: Sequelize.STRING,         allowNull: true  },
      livemode:           { type: Sequelize.BOOLEAN,        defaultValue: false },
      receiptEmail:       { type: Sequelize.STRING,         allowNull: true  },
      description:        { type: Sequelize.STRING,         allowNull: true  },
      metadata:           { type: Sequelize.TEXT,           allowNull: true  },
      paidAt:             { type: Sequelize.DATE,           allowNull: true  },
      createdAt:          { type: Sequelize.DATE,           allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt:          { type: Sequelize.DATE,           allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Payments');
  },
};