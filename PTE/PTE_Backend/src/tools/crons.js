const cron = require('node-cron');
const GasCard = require('../models/material_resources/GasCard');

const resetBalances = () => {
  cron.schedule('0 0 1 * *', async () => {
    try {
      const gasCards = await GasCard.find({}).populate('vehicle');
      let updatedCount = 0;
      for (const card of gasCards) {
        let newBalance;
        if (card.vehicle && card.vehicle.type === 'civil') {
          newBalance = '200'; 
        } else if (card.vehicle && card.vehicle.type === 'commercial') {
          newBalance = '350'; 
        } else {
          console.log(`Skipping card ${card._id}: No valid vehicle type found.`);
          continue; 
        }
        await GasCard.updateOne({ _id: card._id }, { balance: newBalance });
        updatedCount++;
      }
      console.log(`Cron job executed: ${gasCards.length} cards processed.`);
      console.log(`Cron job executed: ${updatedCount} cards updated.`);
    } catch (error) {
      console.error('Error in cron job:', error);
    }
  }, {
    timezone: 'UTC'
  });

  console.log('Cron job scheduled to reset balances on the first of every month.');
};

module.exports = resetBalances;