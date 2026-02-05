'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'profilePicture', {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: 'URL or path to user profile picture',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'profilePicture');
  }
};
