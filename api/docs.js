export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { section } = req.query;

  // Full documentation
  if (!section || section === 'overview') {
    return res.status(200).json({
      title: '🏠 Forward Horizon Automation API Documentation',
      version: '1.0.0',
      description: 'Complete automation suite for transitional housing operations',
      baseUrl: 'https://forward-horizon-clean-9wdikv97b-jumaane-beys-projects.vercel.app',
      
      quickStart: {
        description: 'Get started with the most common operations',
        examples: [
          {
            title: 'Generate Welcome Documents',
            method: 'POST',
            endpoint: '/api/documents',
            example: {
              request: {
                name: 'John Smith',
                email: 'john@email.com',
                phone: '(555) 123-4567',
                moveInDate: '2025-03-15'
              },
              response: {
                success: true,
                documents: {
                  welcomeLetter: 'Generated welcome letter',
                  housingAgreement: 'Housing agreement with terms',
                  intakeChecklist: 'Complete intake checklist'
                }
              }
            }
          },
          {
            title: 'Process Donation',
            method: 'POST',
            endpoint: '/api/donations',
            example: {
              request: {
                donorName: 'Sarah Johnson',
                email: 'sarah@email.com',
                amount: '100'
              },
              response: {
                success: true,
                receiptNumber: 'FH-1234567890',
                documents: {
                  thankYouLetter: 'Personalized thank you',
                  taxReceipt: 'Tax-deductible receipt'
                }
              }
            }
          },
          {
            title: 'Schedule Appointment',
            method: 'POST',
            endpoint: '/api/appointments?action=schedule',
            example: {
              request: {
                veteranName: 'Mike Rodriguez',
                email: 'mike@email.com',
                phone: '(555) 987-6543',
                scheduledTime: '2025-03-10T10:00:00'
              },
              response: {
                success: true,
                appointment: {
                  id: 'APT-1234567890',
                  status: 'scheduled'
                }
              }
            }
          }
        ]
      },

      coreAPIs: {
        'System Status': {
          endpoint: '/api/status',
          method: 'GET',
          description: 'Check system health and service availability',
          response: 'System status with all service states'
        },
        'Document Generation': {
          endpoint: '/api/documents',
          method: 'POST',
          description: 'Generate welcome letters, agreements, and checklists',
          required: ['name', 'email'],
          optional: ['phone', 'moveInDate']
        },
        'Donation Processing': {
          endpoint: '/api/donations',
          methods: ['POST', 'GET'],
          description: 'Process donations and generate receipts, view analytics',
          required: ['donorName', 'email', 'amount'],
          analytics: 'GET for donation statistics'
        },
        'Appointment System': {
          endpoint: '/api/appointments',
          methods: ['POST', 'GET'],
          description: 'Schedule appointments and view upcoming bookings',
          actions: ['schedule', 'upcoming', 'stats'],
          required: ['veteranName', 'email', 'scheduledTime']
        }
      },

      automationSuite: {
        endpoint: '/api/automation',
        description: 'Advanced automation systems via unified endpoint',
        systems: {
          volunteers: {
            actions: ['register', 'list'],
            description: 'Volunteer management and scheduling'
          },
          crisis: {
            actions: ['report', 'active'],
            description: 'Crisis incident reporting and response'
          },
          beds: {
            actions: ['availability', 'reserve'],
            description: 'Bed availability and reservation system'
          },
          social: {
            actions: ['schedule', 'analytics'],
            description: 'Social media automation and analytics'
          }
        },
        usage: '/api/automation?system={system}&action={action}'
      },

      authentication: {
        type: 'Open API',
        description: 'Currently no authentication required for testing',
        note: 'In production, implement API key authentication'
      },

      rateLimit: {
        limit: 'Vercel platform limits apply',
        recommendation: 'Implement client-side caching for repeated requests'
      },

      errorHandling: {
        standardErrors: {
          400: 'Bad Request - Missing required fields',
          405: 'Method Not Allowed - Wrong HTTP method',
          500: 'Internal Server Error - Server processing error'
        },
        errorFormat: {
          success: false,
          error: 'Human readable error message',
          details: 'Additional error context (when available)'
        }
      },

      integrationExamples: {
        javascript: {
          title: 'JavaScript/Node.js Integration',
          example: `
// Generate documents for new resident
async function generateWelcomePackage(veteranData) {
  try {
    const response = await fetch('https://forward-horizon-clean-9wdikv97b-jumaane-beys-projects.vercel.app/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(veteranData)
    });
    
    const result = await response.json();
    if (result.success) {
      console.log('Documents generated:', result.documents);
      return result;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Document generation failed:', error);
    throw error;
  }
}

// Usage
generateWelcomePackage({
  name: 'John Smith',
  email: 'john@email.com',
  moveInDate: '2025-03-15'
});`
        },
        curl: {
          title: 'cURL Examples',
          examples: [
            'curl -X POST https://forward-horizon-clean-9wdikv97b-jumaane-beys-projects.vercel.app/api/documents -H "Content-Type: application/json" -d \'{"name":"John Smith","email":"john@email.com"}\'',
            'curl -X GET https://forward-horizon-clean-9wdikv97b-jumaane-beys-projects.vercel.app/api/status',
            'curl -X GET "https://forward-horizon-clean-9wdikv97b-jumaane-beys-projects.vercel.app/api/automation?system=beds&action=availability"'
          ]
        }
      },

      supportedFormats: {
        request: 'JSON (application/json)',
        response: 'JSON with consistent structure',
        encoding: 'UTF-8'
      },

      moreInfo: {
        sections: ['overview', 'core-apis', 'automation', 'examples', 'errors'],
        usage: '/api/docs?section={section}',
        repository: 'https://github.com/jumaanebey/forward-horizon-clean',
        support: 'Check the AUTOMATION-COMPLETE.md file for full details'
      },

      timestamp: new Date().toISOString()
    });
  }

  // Specific sections
  if (section === 'core-apis') {
    return res.status(200).json({
      title: 'Core API Endpoints',
      apis: {
        documents: {
          endpoint: '/api/documents',
          method: 'POST',
          description: 'Generate welcome documents for new residents',
          required: ['name', 'email'],
          optional: ['phone', 'moveInDate', 'specialNeeds'],
          response: {
            success: true,
            documents: {
              welcomeLetter: 'HTML formatted welcome letter',
              housingAgreement: 'Housing terms and conditions',
              intakeChecklist: 'Required documentation list'
            },
            emailData: 'Auto-generated email content'
          }
        },
        donations: {
          endpoint: '/api/donations',
          methods: {
            POST: 'Process new donation',
            GET: 'View donation analytics'
          },
          postRequired: ['donorName', 'email', 'amount'],
          postOptional: ['donationType', 'message'],
          postResponse: {
            success: true,
            receiptNumber: 'FH-timestamp',
            documents: {
              thankYouLetter: 'Personalized thank you',
              taxReceipt: 'Tax-deductible receipt'
            }
          },
          getResponse: {
            totalDonors: 'Number',
            totalDonations: 'Dollar amount',
            averageDonation: 'Average amount',
            monthlyGrowth: 'Percentage growth'
          }
        },
        appointments: {
          endpoint: '/api/appointments',
          actions: {
            schedule: {
              method: 'POST',
              required: ['veteranName', 'email', 'scheduledTime'],
              optional: ['phone', 'appointmentType', 'notes']
            },
            upcoming: {
              method: 'GET',
              optional: ['days'],
              description: 'View upcoming appointments (default: 7 days)'
            },
            stats: {
              method: 'GET',
              description: 'View appointment statistics'
            }
          }
        },
        status: {
          endpoint: '/api/status',
          method: 'GET',
          description: 'System health check',
          response: {
            status: 'healthy|degraded|error',
            services: 'Object with service statuses',
            environment: 'production|development',
            version: 'API version'
          }
        }
      }
    });
  }

  if (section === 'automation') {
    return res.status(200).json({
      title: 'Automation Suite APIs',
      baseEndpoint: '/api/automation',
      usage: '?system={system}&action={action}',
      systems: {
        volunteers: {
          description: 'Volunteer registration and management',
          actions: {
            register: {
              method: 'POST',
              required: ['firstName', 'lastName', 'email'],
              optional: ['phone', 'skills', 'availability']
            },
            list: {
              method: 'GET',
              optional: ['status'],
              description: 'List volunteers by status'
            }
          }
        },
        crisis: {
          description: 'Crisis incident reporting and tracking',
          actions: {
            report: {
              method: 'POST',
              required: ['reporterName', 'residentName', 'incidentType', 'severity'],
              optional: ['description', 'location', 'witnessInfo']
            },
            active: {
              method: 'GET',
              description: 'View active crisis incidents'
            }
          }
        },
        beds: {
          description: 'Bed availability and reservation management',
          actions: {
            availability: {
              method: 'GET',
              description: 'Current bed availability by unit'
            },
            reserve: {
              method: 'POST',
              required: ['applicantName', 'applicantType', 'contactInfo'],
              optional: ['urgencyLevel', 'specialNeeds']
            }
          }
        },
        social: {
          description: 'Social media content automation',
          actions: {
            schedule: {
              method: 'POST',
              required: ['content', 'platforms', 'scheduledDate'],
              optional: ['postType', 'hashtags']
            },
            analytics: {
              method: 'GET',
              description: 'Social media performance metrics'
            }
          }
        }
      }
    });
  }

  return res.status(400).json({
    error: 'Invalid documentation section',
    availableSections: ['overview', 'core-apis', 'automation', 'examples', 'errors'],
    usage: '/api/docs?section={section}'
  });
}