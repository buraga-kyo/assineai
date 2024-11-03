'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('AssinaturaSignatarios', 'SignatarioAssinou', {
      type: Sequelize.BOOlEAN,
      allowNull: true,
      defaultValue: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('AssinaturaSignatarios', 'SignatarioAssinou');
  }
};
