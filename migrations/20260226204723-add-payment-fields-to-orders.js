'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'paymentIntentId', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Stripe Payment Intent ID',
    });

    await queryInterface.addColumn('orders', 'paidAt', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when payment was completed',
    });

    // Add index for paymentIntentId for faster lookups
    await queryInterface.addIndex('orders', ['paymentIntentId'], {
      name: 'orders_payment_intent_id',
    });

    // Update paymentStatus ENUM to include 'cancelled' if not already present
    await queryInterface.sequelize.query(`
      ALTER TABLE orders
      MODIFY COLUMN paymentStatus ENUM('pending', 'paid', 'failed', 'refunded', 'cancelled')
      DEFAULT 'pending';
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('orders', 'orders_payment_intent_id');
    await queryInterface.removeColumn('orders', 'paidAt');
    await queryInterface.removeColumn('orders', 'paymentIntentId');

    // Revert paymentStatus ENUM back to original values
    await queryInterface.sequelize.query(`
      ALTER TABLE orders
      MODIFY COLUMN paymentStatus ENUM('pending', 'paid', 'failed', 'refunded')
      DEFAULT 'pending';
    `);
  }
};
