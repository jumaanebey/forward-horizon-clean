export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  if (req.method === 'POST' && action === 'report') {
    try {
      const { 
        reporterName, 
        reporterContact,
        residentName,
        incidentType,
        severity,
        location,
        description,
        immediateActions,
        witnessInfo 
      } = req.body;
      
      if (!reporterName || !residentName || !incidentType || !severity) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: reporterName, residentName, incidentType, severity'
        });
      }

      const incidentId = `CRISIS-${Date.now()}`;
      
      const incident = {
        id: incidentId,
        reporterName,
        reporterContact: reporterContact || 'Not provided',
        residentName,
        incidentType, // 'medical', 'mental-health', 'behavioral', 'safety', 'other'
        severity, // 'low', 'medium', 'high', 'critical'
        location: location || 'Not specified',
        description,
        immediateActions: immediateActions || 'None taken',
        witnessInfo: witnessInfo || 'None',
        status: severity === 'critical' ? 'emergency-response' : 'under-review',
        reportedDate: new Date().toISOString(),
        responseTeam: [],
        resolutionNotes: '',
        followUpRequired: severity !== 'low'
      };

      // Generate immediate response based on severity
      const response = generateCrisisResponse(incident);

      // Create notification queue
      const notifications = {
        emergency: severity === 'critical' ? [
          'Crisis manager alerted immediately',
          'Emergency services contacted if needed',
          'On-call supervisor notified'
        ] : [],
        staff: [
          'House manager notified',
          'Case worker assigned to follow up',
          'Incident logged in resident file'
        ],
        documentation: [
          'Incident report generated',
          'Timeline tracking initiated',
          'Compliance documentation started'
        ]
      };

      return res.status(200).json({
        success: true,
        message: `Crisis incident ${incidentId} reported and response initiated`,
        incident,
        immediateResponse: response,
        notifications,
        nextSteps: response.nextSteps,
        estimatedResponseTime: response.responseTime,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Crisis reporting error:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message || 'Internal server error' 
      });
    }
  }

  if (req.method === 'POST' && action === 'update') {
    try {
      const { incidentId, status, responseNotes, assignedStaff, resolution } = req.body;
      
      if (!incidentId || !status) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: incidentId, status'
        });
      }

      const update = {
        incidentId,
        status,
        responseNotes: responseNotes || '',
        assignedStaff: assignedStaff || [],
        resolution: resolution || '',
        updatedDate: new Date().toISOString(),
        updatedBy: 'System' // In real implementation, would be logged-in user
      };

      // Generate follow-up actions based on status
      const followUpActions = generateFollowUpActions(status, update);

      return res.status(200).json({
        success: true,
        message: `Crisis incident ${incidentId} updated successfully`,
        update,
        followUpActions,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Crisis update error:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message || 'Internal server error' 
      });
    }
  }

  if (req.method === 'GET' && action === 'active') {
    return res.status(200).json({
      activeIncidents: [
        {
          id: 'CRISIS-001',
          residentName: 'John D.',
          incidentType: 'mental-health',
          severity: 'high',
          status: 'under-review',
          assignedStaff: ['Crisis Counselor', 'House Manager'],
          reportedDate: '2025-02-28T14:30:00Z',
          lastUpdate: '2025-02-28T16:45:00Z'
        },
        {
          id: 'CRISIS-002',
          residentName: 'Anonymous',
          incidentType: 'behavioral',
          severity: 'medium',
          status: 'monitoring',
          assignedStaff: ['Case Worker'],
          reportedDate: '2025-02-28T09:15:00Z',
          lastUpdate: '2025-02-28T12:30:00Z'
        }
      ],
      totalActive: 2,
      criticalCount: 0,
      highPriorityCount: 1,
      lastUpdated: new Date().toISOString()
    });
  }

  if (req.method === 'GET' && action === 'stats') {
    return res.status(200).json({
      thisMonth: {
        totalIncidents: 12,
        criticalIncidents: 2,
        highPriority: 4,
        mediumPriority: 5,
        lowPriority: 1,
        resolved: 8,
        pending: 4,
        averageResponseTime: '15 minutes'
      },
      byType: {
        'mental-health': 5,
        'medical': 3,
        'behavioral': 2,
        'safety': 1,
        'other': 1
      },
      trends: {
        monthlyChange: -8.3, // Negative is good - fewer incidents
        resolutionRate: 83.3,
        preventionPrograms: 3,
        staffTrainingHours: 24
      },
      emergencyContacts: [
        { type: 'Crisis Hotline', number: '988', available: '24/7' },
        { type: 'Emergency Services', number: '911', available: '24/7' },
        { type: 'Crisis Manager', number: '(310) 555-0123', available: '24/7' },
        { type: 'Medical Emergency', number: '(310) 555-0456', available: '24/7' }
      ],
      lastUpdated: new Date().toISOString()
    });
  }

  if (req.method === 'GET' && action === 'protocols') {
    return res.status(200).json({
      protocols: [
        {
          type: 'medical',
          severity: 'critical',
          steps: [
            'Call 911 immediately',
            'Notify crisis manager',
            'Provide first aid if trained',
            'Document incident',
            'Follow up with medical team'
          ],
          responseTime: 'Immediate'
        },
        {
          type: 'mental-health',
          severity: 'high',
          steps: [
            'Ensure person safety',
            'Contact crisis counselor',
            'Notify house manager',
            'Provide emotional support',
            'Schedule follow-up assessment'
          ],
          responseTime: '15 minutes'
        },
        {
          type: 'behavioral',
          severity: 'medium',
          steps: [
            'Assess immediate risk',
            'De-escalate situation',
            'Contact case worker',
            'Document behavior patterns',
            'Review intervention strategies'
          ],
          responseTime: '30 minutes'
        }
      ],
      emergencyProcedures: {
        evacuation: 'Follow posted evacuation routes, gather at designated meeting point',
        lockdown: 'Secure all entry points, account for all residents, contact authorities',
        medicalEmergency: 'Call 911, provide CPR if trained, notify medical staff'
      },
      lastUpdated: new Date().toISOString()
    });
  }

  return res.status(400).json({ 
    error: 'Invalid action or method',
    availableActions: ['report', 'update', 'active', 'stats', 'protocols'],
    examples: {
      report: 'POST /api/crisis?action=report',
      update: 'POST /api/crisis?action=update',
      active: 'GET /api/crisis?action=active',
      stats: 'GET /api/crisis?action=stats',
      protocols: 'GET /api/crisis?action=protocols'
    }
  });
}

function generateCrisisResponse(incident) {
  const responses = {
    'critical': {
      responseTime: 'Immediate (0-5 minutes)',
      actions: [
        'Emergency services contacted',
        'Crisis manager alerted',
        'On-site response team dispatched',
        'Facility supervisor notified'
      ],
      nextSteps: [
        'Emergency assessment',
        'Medical evaluation if needed',
        'Safety plan implementation',
        'Family notification (if authorized)',
        'Follow-up counseling scheduled'
      ]
    },
    'high': {
      responseTime: '15 minutes',
      actions: [
        'Crisis counselor contacted',
        'House manager notified',
        'Resident safety assessment',
        'Immediate support provided'
      ],
      nextSteps: [
        'Professional evaluation',
        'Safety plan review',
        'Case plan modification',
        'Support team meeting'
      ]
    },
    'medium': {
      responseTime: '30 minutes',
      actions: [
        'Case worker assigned',
        'Incident documentation',
        'Resident check-in scheduled',
        'House manager informed'
      ],
      nextSteps: [
        'Situation monitoring',
        'Behavioral intervention',
        'Progress review meeting',
        'Prevention planning'
      ]
    },
    'low': {
      responseTime: '2 hours',
      actions: [
        'Incident logged',
        'Staff awareness notification',
        'Routine check-in scheduled'
      ],
      nextSteps: [
        'Pattern monitoring',
        'Preventive measures review',
        'Regular follow-up'
      ]
    }
  };

  return responses[incident.severity] || responses['medium'];
}

function generateFollowUpActions(status, update) {
  const actions = {
    'resolved': [
      'Close incident report',
      'Schedule follow-up check',
      'Update resident case notes',
      'Review prevention strategies'
    ],
    'under-review': [
      'Continue monitoring',
      'Update response team',
      'Document progress',
      'Schedule next review'
    ],
    'escalated': [
      'Notify senior management',
      'Contact external resources',
      'Implement enhanced safety measures',
      'Schedule emergency meeting'
    ],
    'monitoring': [
      'Continue observation',
      'Document behavioral changes',
      'Maintain support services',
      'Regular team updates'
    ]
  };

  return actions[status] || actions['under-review'];
}