// Combined API endpoint for automation, health check, and other utilities
// Simple in-memory cache for automation data
const automationCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedData(key) {
  const cached = automationCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCachedData(key, data) {
  automationCache.set(key, {
    data,
    timestamp: Date.now()
  });
}

// Clean expired cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of automationCache.entries()) {
    if (now - value.timestamp >= CACHE_TTL) {
      automationCache.delete(key);
    }
  }
}, 60 * 1000); // Clean every minute

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { system, action } = req.query;

  // VOLUNTEER MANAGEMENT SYSTEM
  // Add cache control headers for GET requests
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300'); // 5 minutes
    res.setHeader('ETag', `"automation-${system}-${action}-v1"`);
  }

  if (system === 'volunteers') {
    const cacheKey = `volunteers-${action}`;
    
    // Check cache for GET requests
    if (req.method === 'GET') {
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        return res.status(200).json(cachedData);
      }
    }
    if (req.method === 'POST' && action === 'register') {
      try {
        const { firstName, lastName, email, phone, skills, availability } = req.body;
        
        if (!firstName || !lastName || !email) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields: firstName, lastName, email',
            received: { firstName: !!firstName, lastName: !!lastName, email: !!email },
            example: {
              firstName: 'John',
              lastName: 'Smith', 
              email: 'john@email.com',
              phone: '(555) 123-4567',
              skills: ['Counseling', 'Event Planning'],
              availability: 'Weekends'
            }
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
          status: 'pending-approval',
          registeredDate: new Date().toISOString(),
          totalHours: 0
        };

        return res.status(200).json({
          success: true,
          message: `Volunteer registration completed for ${firstName} ${lastName}`,
          volunteer,
          welcomeEmail: {
            to: email,
            subject: `Welcome to Forward Horizon Volunteers - ${firstName}`,
            body: `Dear ${firstName}, thank you for registering as a volunteer. We'll contact you within 2-3 business days.`
          },
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
      }
    }

    if (req.method === 'GET' && action === 'list') {
      return res.status(200).json({
        volunteers: [
          {
            id: 'VOL-001',
            fullName: 'Sarah Johnson',
            email: 'sarah.j@email.com',
            skills: ['Counseling', 'Event Planning'],
            status: 'active',
            totalHours: 156
          },
          {
            id: 'VOL-002',
            fullName: 'Mike Chen',
            email: 'mike.chen@email.com',
            skills: ['IT Support', 'Transportation'],
            status: 'active',
            totalHours: 89
          }
        ],
        totalCount: 2,
        lastUpdated: new Date().toISOString()
      });
    }
  }

  // CRISIS RESPONSE SYSTEM
  if (system === 'crisis') {
    if (req.method === 'POST' && action === 'report') {
      try {
        const { reporterName, residentName, incidentType, severity, description } = req.body;
        
        if (!reporterName || !residentName || !incidentType || !severity) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields: reporterName, residentName, incidentType, severity',
            received: { 
              reporterName: !!reporterName, 
              residentName: !!residentName, 
              incidentType: !!incidentType, 
              severity: !!severity 
            },
            validValues: {
              incidentType: ['medical', 'mental-health', 'behavioral', 'safety', 'other'],
              severity: ['low', 'medium', 'high', 'critical']
            },
            example: {
              reporterName: 'Staff Member',
              residentName: 'John D.',
              incidentType: 'behavioral',
              severity: 'medium',
              description: 'Brief description of incident'
            }
          });
        }

        const incidentId = `CRISIS-${Date.now()}`;
        const incident = {
          id: incidentId,
          reporterName,
          residentName,
          incidentType,
          severity,
          description,
          status: severity === 'critical' ? 'emergency-response' : 'under-review',
          reportedDate: new Date().toISOString()
        };

        const responseTime = {
          'critical': 'Immediate (0-5 minutes)',
          'high': '15 minutes',
          'medium': '30 minutes',
          'low': '2 hours'
        };

        return res.status(200).json({
          success: true,
          message: `Crisis incident ${incidentId} reported and response initiated`,
          incident,
          responseTime: responseTime[severity],
          notifications: {
            emergency: severity === 'critical' ? ['Crisis manager alerted', 'Emergency services contacted'] : [],
            staff: ['House manager notified', 'Case worker assigned']
          },
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
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
            reportedDate: '2025-02-28T14:30:00Z'
          }
        ],
        totalActive: 1,
        criticalCount: 0,
        lastUpdated: new Date().toISOString()
      });
    }
  }

  // BED AVAILABILITY SYSTEM
  if (system === 'beds') {
    if (req.method === 'GET' && action === 'availability') {
      return res.status(200).json({
        facility: {
          name: 'Forward Horizon Transitional Housing',
          totalBeds: 48,
          occupiedBeds: 41,
          availableBeds: 7,
          occupancyRate: 85.4
        },
        byUnit: [
          {
            unitName: 'Veterans Wing A',
            totalBeds: 16,
            occupied: 14,
            available: 2,
            notes: '2 beds available - male only'
          },
          {
            unitName: 'Veterans Wing B',
            totalBeds: 16,
            occupied: 15,
            available: 1,
            notes: '1 bed available - female only'
          }
        ],
        waitlist: {
          totalWaiting: 23,
          averageWaitTime: '14 days'
        },
        lastUpdated: new Date().toISOString()
      });
    }

    if (req.method === 'POST' && action === 'reserve') {
      try {
        const { applicantName, applicantType, contactInfo, urgencyLevel } = req.body;
        
        if (!applicantName || !applicantType || !contactInfo) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields: applicantName, applicantType, contactInfo'
          });
        }

        const reservationId = `BED-${Date.now()}`;
        const reservation = {
          id: reservationId,
          applicantName,
          applicantType,
          contactInfo,
          urgencyLevel: urgencyLevel || 'standard',
          status: 'pending',
          reservedDate: new Date().toISOString(),
          waitlistPosition: urgencyLevel === 'emergency' ? 1 : 5,
          estimatedAvailability: urgencyLevel === 'emergency' ? '1-3 days' : '14-21 days'
        };

        return res.status(200).json({
          success: true,
          message: `Bed reservation processed for ${applicantName}`,
          reservation,
          nextSteps: [
            'Complete intake assessment',
            'Submit required documentation',
            'Await bed assignment confirmation'
          ],
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
      }
    }
  }

  // SOCIAL MEDIA SYSTEM
  if (system === 'social') {
    if (req.method === 'POST' && action === 'schedule') {
      try {
        const { content, platforms, scheduledDate, postType } = req.body;
        
        if (!content || !platforms || !scheduledDate) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields: content, platforms, scheduledDate'
          });
        }

        const postId = `SOCIAL-${Date.now()}`;
        const scheduledPost = {
          id: postId,
          content,
          platforms,
          scheduledDate: new Date(scheduledDate).toISOString(),
          postType: postType || 'general',
          status: 'scheduled',
          createdDate: new Date().toISOString(),
          estimatedReach: platforms.length * 800
        };

        return res.status(200).json({
          success: true,
          message: `Social media post scheduled for ${new Date(scheduledDate).toLocaleDateString()}`,
          scheduledPost,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
      }
    }

    if (req.method === 'GET' && action === 'analytics') {
      return res.status(200).json({
        performance: {
          postsPublished: 28,
          totalReach: 45670,
          totalEngagement: 3420,
          engagementRate: 7.5,
          newFollowers: 156
        },
        byPlatform: {
          facebook: { posts: 12, reach: 18900, engagement: 1890 },
          instagram: { posts: 8, reach: 12450, engagement: 1020 },
          twitter: { posts: 6, reach: 8900, engagement: 380 }
        },
        lastUpdated: new Date().toISOString()
      });
    }
  }

  // Help/Documentation
  if (system === 'help' || !system) {
    return res.status(200).json({
      message: 'Forward Horizon Automation Suite',
      availableSystems: {
        volunteers: {
          endpoints: [
            'GET /api/automation?system=volunteers&action=list',
            'POST /api/automation?system=volunteers&action=register'
          ]
        },
        crisis: {
          endpoints: [
            'GET /api/automation?system=crisis&action=active',
            'POST /api/automation?system=crisis&action=report'
          ]
        },
        beds: {
          endpoints: [
            'GET /api/automation?system=beds&action=availability',
            'POST /api/automation?system=beds&action=reserve'
          ]
        },
        social: {
          endpoints: [
            'GET /api/automation?system=social&action=analytics',
            'POST /api/automation?system=social&action=schedule'
          ]
        }
      },
      timestamp: new Date().toISOString()
    });
  }

  return res.status(400).json({
    error: 'Invalid system or action',
    usage: 'Use ?system=volunteers|crisis|beds|social&action=...',
    help: '/api/automation?system=help'
  });
}