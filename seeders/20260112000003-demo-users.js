'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    const salt = await bcrypt.genSalt(10);

    // All demo passwords are "Password123!"
    const hashedPassword = await bcrypt.hash('Password123!', salt);

    await queryInterface.bulkInsert('users', [
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@takealot.com',
        password: hashedPassword,
        phone: '+27123456789',
        role: 'admin',
        isVerified: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        firstName: 'Seller',
        lastName: 'Demo',
        email: 'seller@example.com',
        password: hashedPassword,
        phone: '+27123456790',
        role: 'seller',
        isVerified: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: hashedPassword,
        phone: '+27123456791',
        role: 'customer',
        isVerified: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        password: hashedPassword,
        phone: '+27123456792',
        role: 'customer',
        isVerified: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@example.com',
        password: hashedPassword,
        phone: '+27123456793',
        role: 'customer',
        isVerified: false,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};
