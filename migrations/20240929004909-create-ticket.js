'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Tickets', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      ticketNumber: {
        type: Sequelize.INTEGER,
      },
      dispatchTime: {
        type: Sequelize.DATE,
        index: true,
      },
      material: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'soil',
      },
      truckId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Trucks',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      siteId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Sites',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('Tickets');
  },
};
