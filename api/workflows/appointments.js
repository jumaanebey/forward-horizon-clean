
const AppointmentSystem = require('../../workflows/appointment-system.cjs');

const appointmentSystem = new AppointmentSystem();

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  if (req.method === 'POST' && action === 'schedule') {
    try {
      const result = appointmentSystem.scheduleAppointment(req.body);
      res.json({
        success: true,
        message: `Appointment scheduled for ${req.body.veteranName}`,
        appointmentId: result.appointment.id,
        confirmationEmail: result.confirmationEmail,
        confirmationSMS: result.confirmationSMS
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else if (req.method === 'GET' && action === 'upcoming') {
    const days = parseInt(req.query.days) || 7;
    res.json(appointmentSystem.getUpcomingAppointments(days));
  } else if (req.method === 'GET' && action === 'stats') {
    res.json(appointmentSystem.getStats());
  } else {
    res.status(400).json({ error: 'Invalid action or method' });
  }
};
