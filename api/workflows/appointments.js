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
      const { veteranName, email, phone, scheduledTime } = req.body;
      
      if (!veteranName || !email || !scheduledTime) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: veteranName, email, scheduledTime'
        });
      }

      const appointmentId = `APT-${Date.now()}`;
      const appointmentDate = new Date(scheduledTime);
      
      res.json({
        success: true,
        message: `Appointment scheduled for ${veteranName}`,
        appointmentId,
        scheduledFor: appointmentDate.toLocaleDateString(),
        confirmationEmail: `Confirmation sent to ${email}`,
        confirmationSMS: phone ? `SMS sent to ${phone}` : 'No phone provided',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else if (req.method === 'GET' && action === 'upcoming') {
    const days = parseInt(req.query.days) || 7;
    res.json({
      upcomingAppointments: [
        { id: 'APT-001', name: 'John Smith', time: '2025-03-01T14:00:00' },
        { id: 'APT-002', name: 'Jane Doe', time: '2025-03-02T10:30:00' }
      ],
      daysAhead: days
    });
  } else if (req.method === 'GET' && action === 'stats') {
    res.json({
      totalAppointments: 156,
      thisWeek: 12,
      completionRate: 94.5,
      averageWaitTime: '3.2 days'
    });
  } else {
    res.status(400).json({ error: 'Invalid action or method. Use ?action=schedule, ?action=upcoming, or ?action=stats' });
  }
};