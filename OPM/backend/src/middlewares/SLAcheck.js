const { sendEmailWithTemplate } = require('../controllers/emailController');
const Ticket = require('../models/ticketModel');

const checkSLA = async (id) => {
  try {
    const ticket = await Ticket.findById(id).populate('technicienId');
    if (ticket.status === "Assigned") {
      ticket.isExpired = true;
      await ticket.save();

      if (ticket.technicienId && Array.isArray(ticket.technicienId)) {
        for (const technician of ticket.technicienId) {
          if (technician.email) {
            const emailSubject = `SLA Warning: Assigned Ticket :${ticket.number} Passed SLA`;
            const emailTemplate = 'slaWarningTemplate'; // Ensure the correct template exists
            const capitalizeFirstLetter = (str) => {
              return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
            };

            const emailVariables = {
              name: `${capitalizeFirstLetter(technician.firstName)} ${capitalizeFirstLetter(technician.lastName)}`,
              ticketNumber: ticket.number,
              year: new Date().getFullYear(),
            };
            await sendEmailWithTemplate(
              technician.email,
              emailSubject,
              emailTemplate,
              emailVariables
            );
          }
        }
      }
    }
  } catch (error) {
    console.error('Error occurred while checking SLA:', error);
  }
};

module.exports = checkSLA;
