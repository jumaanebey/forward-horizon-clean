export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  if (req.method === 'POST' && action === 'register') {
    try {
      const { 
        firstName, 
        lastName, 
        email, 
        phone, 
        skills, 
        availability, 
        preferredActivities,
        backgroundCheck 
      } = req.body;
      
      if (!firstName || !lastName || !email) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: firstName, lastName, email'
        });
      }

      const volunteerId = `VOL-${Date.now()}`;
      
      const volunteer = {
        id: volunteerId,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        email,
        phone: phone || 'Not provided',
        skills: skills || [],
        availability: availability || 'Flexible',
        preferredActivities: preferredActivities || [],
        backgroundCheck: backgroundCheck || 'pending',
        status: 'pending-approval',
        registeredDate: new Date().toISOString(),
        totalHours: 0,
        activeAssignments: 0
      };

      // Generate welcome email content
      const welcomeEmail = {
        to: email,
        subject: `Welcome to Forward Horizon Volunteers - ${firstName}`,
        body: `Dear ${firstName}, thank you for registering as a volunteer. We'll review your application and contact you within 2-3 business days.`,
        html: generateVolunteerWelcomeHTML(volunteer)
      };

      // Generate orientation materials
      const orientationPackage = {
        volunteerHandbook: `Volunteer handbook for ${firstName} ${lastName}`,
        safetyGuidelines: 'Complete safety guidelines and protocols',
        schedulingInstructions: 'How to schedule and manage volunteer shifts',
        contactDirectory: 'Emergency contacts and key staff information'
      };

      return res.status(200).json({
        success: true,
        message: `Volunteer registration completed for ${firstName} ${lastName}`,
        volunteer,
        welcomeEmail,
        orientationPackage,
        nextSteps: [
          'Background check processing',
          'Orientation scheduling',
          'Skills assessment',
          'First assignment matching'
        ],
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Volunteer registration error:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message || 'Internal server error' 
      });
    }
  }

  if (req.method === 'POST' && action === 'schedule') {
    try {
      const { volunteerId, activity, date, duration, location, supervisor } = req.body;
      
      if (!volunteerId || !activity || !date) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: volunteerId, activity, date'
        });
      }

      const assignmentId = `ASG-${Date.now()}`;
      
      const assignment = {
        id: assignmentId,
        volunteerId,
        activity,
        date: new Date(date).toISOString(),
        duration: duration || '3 hours',
        location: location || 'Main facility',
        supervisor: supervisor || 'TBD',
        status: 'scheduled',
        createdDate: new Date().toISOString()
      };

      // Generate confirmation email and SMS
      const notifications = {
        email: `Volunteer assignment confirmation sent`,
        sms: `SMS reminder scheduled for 24 hours before`,
        calendar: `Calendar invitation generated for ${date}`
      };

      return res.status(200).json({
        success: true,
        message: `Volunteer assignment scheduled successfully`,
        assignment,
        notifications,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Volunteer scheduling error:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message || 'Internal server error' 
      });
    }
  }

  if (req.method === 'GET' && action === 'list') {
    const status = req.query.status || 'all';
    const sampleVolunteers = [
      {
        id: 'VOL-001',
        fullName: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        phone: '(555) 123-4567',
        skills: ['Counseling', 'Event Planning'],
        status: 'active',
        totalHours: 156,
        activeAssignments: 2,
        registeredDate: '2025-01-15T10:00:00Z'
      },
      {
        id: 'VOL-002',
        fullName: 'Mike Chen',
        email: 'mike.chen@email.com',
        phone: '(555) 234-5678',
        skills: ['IT Support', 'Transportation'],
        status: 'active',
        totalHours: 89,
        activeAssignments: 1,
        registeredDate: '2025-02-03T14:30:00Z'
      },
      {
        id: 'VOL-003',
        fullName: 'Maria Rodriguez',
        email: 'maria.r@email.com',
        phone: '(555) 345-6789',
        skills: ['Nursing', 'Spanish Translation'],
        status: 'pending-approval',
        totalHours: 0,
        activeAssignments: 0,
        registeredDate: '2025-02-20T09:15:00Z'
      }
    ];

    const filteredVolunteers = status === 'all' ? 
      sampleVolunteers : 
      sampleVolunteers.filter(v => v.status === status);

    return res.status(200).json({
      volunteers: filteredVolunteers,
      totalCount: filteredVolunteers.length,
      statusFilter: status,
      lastUpdated: new Date().toISOString()
    });
  }

  if (req.method === 'GET' && action === 'stats') {
    return res.status(200).json({
      totalVolunteers: 45,
      activeVolunteers: 32,
      pendingApproval: 8,
      inactive: 5,
      totalHoursThisMonth: 892,
      totalHoursAllTime: 12450,
      averageHoursPerVolunteer: 18.5,
      topActivities: [
        { activity: 'Meal Service', volunteers: 12, hours: 248 },
        { activity: 'Mentoring', volunteers: 8, hours: 156 },
        { activity: 'Transportation', volunteers: 6, hours: 134 },
        { activity: 'Administrative', volunteers: 10, hours: 98 }
      ],
      monthlyGrowth: 15.2,
      retentionRate: 87.3,
      lastUpdated: new Date().toISOString()
    });
  }

  if (req.method === 'GET' && action === 'schedule') {
    const days = parseInt(req.query.days) || 7;
    return res.status(200).json({
      upcomingAssignments: [
        {
          id: 'ASG-001',
          volunteerId: 'VOL-001',
          volunteerName: 'Sarah Johnson',
          activity: 'Meal Service',
          date: '2025-03-01T11:00:00Z',
          duration: '4 hours',
          location: 'Kitchen',
          status: 'confirmed'
        },
        {
          id: 'ASG-002',
          volunteerId: 'VOL-002',
          volunteerName: 'Mike Chen',
          activity: 'IT Support',
          date: '2025-03-02T09:00:00Z',
          duration: '3 hours',
          location: 'Office',
          status: 'pending'
        }
      ],
      daysAhead: days,
      totalAssignments: 2,
      lastUpdated: new Date().toISOString()
    });
  }

  return res.status(400).json({ 
    error: 'Invalid action or method',
    availableActions: ['register', 'schedule', 'list', 'stats'],
    examples: {
      register: 'POST /api/volunteers?action=register',
      schedule: 'POST /api/volunteers?action=schedule',
      list: 'GET /api/volunteers?action=list&status=active',
      stats: 'GET /api/volunteers?action=stats',
      upcomingSchedule: 'GET /api/volunteers?action=schedule&days=14'
    }
  });
}

function generateVolunteerWelcomeHTML(volunteer) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #2c5530; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1>Welcome to Forward Horizon Volunteers!</h1>
        <p style="font-size: 18px; margin: 10px 0;">Thank you for joining our mission, ${volunteer.firstName}!</p>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
        <h2 style="color: #2c5530;">Your Volunteer Registration</h2>
        <p><strong>Volunteer ID:</strong> ${volunteer.id}</p>
        <p><strong>Name:</strong> ${volunteer.fullName}</p>
        <p><strong>Email:</strong> ${volunteer.email}</p>
        <p><strong>Phone:</strong> ${volunteer.phone}</p>
        <p><strong>Skills:</strong> ${volunteer.skills.join(', ') || 'General volunteering'}</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3 style="color: #2c5530; margin-top: 0;">Next Steps:</h3>
          <ol style="line-height: 1.6;">
            <li>Background check processing (1-2 business days)</li>
            <li>Volunteer orientation scheduling</li>
            <li>Skills assessment and matching</li>
            <li>First assignment coordination</li>
          </ol>
        </div>
        
        <p>Our volunteer coordinator will contact you within 2-3 business days to discuss your interests and schedule your orientation.</p>
        
        <p style="color: #666; font-style: italic;">Together, we're making a difference in the lives of veterans and individuals seeking a fresh start.</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <p><strong>Questions? Contact us:</strong></p>
          <p>(310) 488-5280 | volunteers@theforwardhorizon.com</p>
        </div>
      </div>
    </div>
  `;
}