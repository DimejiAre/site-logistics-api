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
        allowNull: false,
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

    await queryInterface.addIndex('Tickets', ['truckId', 'dispatchTime'], {
      name: 'tickets_truck_dispatch_unique',
      unique: true,
    });

    await queryInterface.addIndex('Tickets', ['siteId', 'dispatchTime'], {
      name: 'tickets_site_dispatch_index',
    });

    await queryInterface.addIndex('Tickets', ['siteId'], {
      name: 'tickets_site_id_index',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex(
      'Tickets',
      'tickets_truck_dispatch_unique',
    );

    await queryInterface.removeIndex('Tickets', 'tickets_site_dispatch_index');

    await queryInterface.removeIndex('Tickets', 'tickets_site_id_index');

    await queryInterface.dropTable('Tickets');
  },
};
