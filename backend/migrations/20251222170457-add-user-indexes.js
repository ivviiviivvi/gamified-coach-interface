'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add index for status filtering
    await queryInterface.addIndex('users', ['status'], {
      name: 'users_status_idx'
    });

    // Add composite index for leaderboard sorting
    await queryInterface.addIndex('users', ['total_xp', 'level'], {
      name: 'users_total_xp_level_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes
    await queryInterface.removeIndex('users', 'users_status_idx');
    await queryInterface.removeIndex('users', 'users_total_xp_level_idx');
  }
};
