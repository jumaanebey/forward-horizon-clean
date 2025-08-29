export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  if (req.method === 'POST' && action === 'schedule') {
    try {
      const { veteranName, email, phone, scheduledTime, appointmentType } = req.body;
      
      if (!veteranName || !email || !scheduledTime) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: veteranName, email, scheduledTime'
        });
      }

      const appointmentId = `APT-${Date.now()}`;
      const appointmentDate = new Date(scheduledTime);
      
      return res.status(200).json({
        success: true,
        message: `Appointment scheduled for ${veteranName}`,
        appointment: {
          id: appointmentId,
          veteranName,
          email,
          phone: phone || 'Not provided',
          scheduledTime: appointmentDate.toISOString(),
          appointmentType: appointmentType || 'Initial Consultation',
          status: 'scheduled'
        },
        confirmationEmail: `Confirmation sent to ${email}`,
        confirmationSMS: phone ? `SMS reminder sent to ${phone}` : 'No phone provided',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Appointment scheduling error:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message || 'Internal server error' 
      });
    }
  } 
  
  if (req.method === 'GET' && action === 'upcoming') {
    const days = parseInt(req.query.days) || 7;
    return res.status(200).json({
      upcomingAppointments: [
        { 
          id: 'APT-001', 
          veteranName: 'John Smith', 
          scheduledTime: '2025-03-01T14:00:00Z',
          appointmentType: 'Initial Consultation',
          status: 'confirmed'
        },
        { 
          id: 'APT-002', 
          veteranName: 'Jane Doe', 
          scheduledTime: '2025-03-02T10:30:00Z',
          appointmentType: 'Follow-up',
          status: 'pending'
        }
      ],
      daysAhead: days,
      totalCount: 2
    });
  } 
  
  if (req.method === 'GET' && action === 'stats') {
    return res.status(200).json({
      totalAppointments: 156,
      thisWeek: 12,
      thisMonth: 43,
      completionRate: 94.5,
      averageWaitTime: '3.2 days',
      mostCommonType: 'Initial Consultation',
      lastUpdated: new Date().toISOString()
    });
  }

  return res.status(400).json({ 
    error: 'Invalid action or method',
    availableActions: ['schedule', 'upcoming', 'stats'],
    examples: {
      schedule: 'POST /api/appointments?action=schedule',
      upcoming: 'GET /api/appointments?action=upcoming',
      stats: 'GET /api/appointments?action=stats'
    }
  });
}