const cron = require("node-cron");
const Ticket = require("../models/ticketModel");
const { sendEmailWithTemplate } = require("../controllers/emailController");

// Cron job toutes les 2 heures
cron.schedule("0 */2 * * *", async () => {

    try {
        const now = new Date();
        const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24h avant

        const overdueTickets = await Ticket.find({
            status: { $nin: ["Resolved", "Closed"] },
            takenDate: { $lte: cutoff },
            reminderSent: { $ne: true }
        }).populate("technicienId");


        for (const ticket of overdueTickets) {
            if (ticket.technicienId?.length) {
                for (const tech of ticket.technicienId) {
                    if (tech?.email) {
                        await sendEmailWithTemplate(
                            tech.email,
                            `Ticket N°${ticket.number} pending resolution`,
                            "ticketReminder",
                            {
                                ticketTitle: ticket.title,
                                ticketNumber: ticket.number,
                                technicienName: tech.firstName + " " + tech.lastName
                            }
                        );
                    }
                }

                ticket.reminderSent = true;
                ticket.status = "On Hold";
                await ticket.save();
            }
        }
    } catch (err) {
        console.error("❌ Error in cron job:", err);
    }
});

