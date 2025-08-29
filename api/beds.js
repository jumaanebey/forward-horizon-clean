export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  if (req.method === 'GET' && action === 'availability') {
    return res.status(200).json({
      facility: {
        name: 'Forward Horizon Transitional Housing',
        totalBeds: 48,
        occupiedBeds: 41,
        availableBeds: 7,
        maintenanceBeds: 0,
        occupancyRate: 85.4
      },
      byUnit: [
        {
          unitName: 'Veterans Wing A',
          totalBeds: 16,
          occupied: 14,
          available: 2,
          maintenance: 0,
          notes: '2 beds available - male only'
        },
        {
          unitName: 'Veterans Wing B',
          totalBeds: 16,
          occupied: 15,
          available: 1,
          maintenance: 0,
          notes: '1 bed available - female only'
        },
        {
          unitName: 'Recovery Unit',
          totalBeds: 12,
          occupied: 10,
          available: 2,
          maintenance: 0,
          notes: '2 beds available - mixed gender'
        },
        {
          unitName: 'Re-entry Unit',
          totalBeds: 4,
          occupied: 2,
          available: 2,
          maintenance: 0,
          notes: '2 beds available - returning citizens'
        }
      ],
      waitlist: {
        totalWaiting: 23,
        veterans: 15,
        recovery: 6,
        reentry: 2,
        averageWaitTime: '14 days',
        priority: 3 // High priority cases
      },
      lastUpdated: new Date().toISOString()
    });
  }

  if (req.method === 'POST' && action === 'reserve') {
    try {
      const { 
        applicantName, 
        applicantType, 
        contactInfo,
        urgencyLevel,
        specialNeeds,
        preferredUnit,
        referralSource 
      } = req.body;
      
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
        applicantType, // 'veteran', 'recovery', 'reentry'
        contactInfo,
        urgencyLevel: urgencyLevel || 'standard', // 'emergency', 'high', 'standard'
        specialNeeds: specialNeeds || 'none',
        preferredUnit: preferredUnit || 'any',
        referralSource: referralSource || 'self-referral',
        status: 'pending',
        reservedDate: new Date().toISOString(),
        expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        waitlistPosition: calculateWaitlistPosition(applicantType, urgencyLevel),
        estimatedAvailability: calculateEstimatedAvailability(applicantType, urgencyLevel)
      };

      // Generate confirmation and alerts
      const notifications = generateBedReservationNotifications(reservation);
      
      // Check for immediate availability
      const immediateAvailability = checkImmediateAvailability(reservation);

      return res.status(200).json({
        success: true,
        message: `Bed reservation processed for ${applicantName}`,
        reservation,
        immediateAvailability,
        notifications,
        nextSteps: [
          'Complete intake assessment',
          'Submit required documentation',
          'Await bed assignment confirmation',
          'Prepare for move-in process'
        ],
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Bed reservation error:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message || 'Internal server error' 
      });
    }
  }

  if (req.method === 'POST' && action === 'checkin') {
    try {
      const { 
        residentName, 
        bedNumber,
        unit,
        checkInDate,
        caseWorker,
        emergencyContact,
        medicalInfo
      } = req.body;
      
      if (!residentName || !bedNumber || !unit) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: residentName, bedNumber, unit'
        });
      }

      const checkInId = `CHECKIN-${Date.now()}`;
      
      const checkIn = {
        id: checkInId,
        residentName,
        bedNumber,
        unit,
        checkInDate: checkInDate || new Date().toISOString(),
        caseWorker: caseWorker || 'TBD',
        emergencyContact: emergencyContact || {},
        medicalInfo: medicalInfo || 'None provided',
        status: 'active',
        expectedStayDuration: '6-24 months',
        keyIssued: true,
        orientationScheduled: true,
        documentsGenerated: true
      };

      // Update bed availability
      const availabilityUpdate = {
        bedNumber,
        unit,
        status: 'occupied',
        residentName,
        checkInDate: checkIn.checkInDate
      };

      // Generate welcome package
      const welcomePackage = generateWelcomePackage(checkIn);

      return res.status(200).json({
        success: true,
        message: `Check-in completed for ${residentName}`,
        checkIn,
        availabilityUpdate,
        welcomePackage,
        facilityInfo: {
          wifiPassword: 'ForwardHorizon2025',
          mealtimes: {
            breakfast: '7:00 AM - 9:00 AM',
            lunch: '12:00 PM - 1:30 PM',
            dinner: '6:00 PM - 7:30 PM'
          },
          quietHours: '10:00 PM - 7:00 AM',
          laundryHours: '6:00 AM - 10:00 PM'
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Check-in error:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message || 'Internal server error' 
      });
    }
  }

  if (req.method === 'POST' && action === 'checkout') {
    try {
      const { 
        residentName, 
        bedNumber,
        unit,
        checkOutDate,
        reason,
        forwardingAddress,
        successfulCompletion
      } = req.body;
      
      if (!residentName || !bedNumber || !unit || !reason) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: residentName, bedNumber, unit, reason'
        });
      }

      const checkOutId = `CHECKOUT-${Date.now()}`;
      
      const checkOut = {
        id: checkOutId,
        residentName,
        bedNumber,
        unit,
        checkOutDate: checkOutDate || new Date().toISOString(),
        reason, // 'completion', 'voluntary', 'violation', 'other'
        forwardingAddress: forwardingAddress || 'Not provided',
        successfulCompletion: successfulCompletion || false,
        exitInterview: 'Scheduled',
        belongingsCleared: true,
        keyReturned: true,
        finalDocuments: 'Generated'
      };

      // Update bed availability
      const availabilityUpdate = {
        bedNumber,
        unit,
        status: 'available',
        lastOccupant: residentName,
        checkOutDate: checkOut.checkOutDate,
        cleaningStatus: 'scheduled',
        nextAvailable: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days for cleaning
      };

      // Generate exit documentation
      const exitPackage = generateExitPackage(checkOut);

      // Send availability alerts
      const availabilityAlerts = generateAvailabilityAlerts(availabilityUpdate);

      return res.status(200).json({
        success: true,
        message: `Check-out completed for ${residentName}`,
        checkOut,
        availabilityUpdate,
        exitPackage,
        availabilityAlerts,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Check-out error:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message || 'Internal server error' 
      });
    }
  }

  if (req.method === 'GET' && action === 'waitlist') {
    return res.status(200).json({
      waitlist: [
        {
          id: 'WL-001',
          name: 'Michael R.',
          type: 'veteran',
          urgency: 'high',
          waitingSince: '2025-02-15T10:00:00Z',
          estimatedWait: '7-10 days',
          position: 1,
          specialNeeds: 'wheelchair accessible'
        },
        {
          id: 'WL-002',
          name: 'Sarah K.',
          type: 'recovery',
          urgency: 'standard',
          waitingSince: '2025-02-20T14:30:00Z',
          estimatedWait: '14-21 days',
          position: 2,
          specialNeeds: 'none'
        },
        {
          id: 'WL-003',
          name: 'David L.',
          type: 'reentry',
          urgency: 'emergency',
          waitingSince: '2025-02-28T09:00:00Z',
          estimatedWait: '2-3 days',
          position: 1, // Emergency priority
          specialNeeds: 'medical accommodations'
        }
      ],
      summary: {
        totalWaiting: 23,
        emergencyPriority: 1,
        highPriority: 8,
        standardPriority: 14,
        averageWaitTime: '14 days',
        longestWait: '45 days'
      },
      lastUpdated: new Date().toISOString()
    });
  }

  if (req.method === 'GET' && action === 'alerts') {
    return res.status(200).json({
      currentAlerts: [
        {
          type: 'low-availability',
          message: 'Only 7 beds available facility-wide',
          severity: 'medium',
          triggeredAt: '2025-02-28T08:00:00Z',
          recommendedAction: 'Prepare overflow protocols'
        },
        {
          type: 'emergency-placement',
          message: '1 emergency case on waitlist',
          severity: 'high',
          triggeredAt: '2025-02-28T09:00:00Z',
          recommendedAction: 'Expedite bed assignment'
        }
      ],
      thresholds: {
        lowAvailability: 10, // Alert when ≤ 10 beds available
        criticalAvailability: 5, // Critical alert when ≤ 5 beds
        highOccupancy: 90, // Alert when ≥ 90% occupied
        emergencyResponse: 'immediate' // Emergency cases get immediate attention
      },
      lastUpdated: new Date().toISOString()
    });
  }

  return res.status(400).json({ 
    error: 'Invalid action or method',
    availableActions: ['availability', 'reserve', 'checkin', 'checkout', 'waitlist', 'alerts'],
    examples: {
      availability: 'GET /api/beds?action=availability',
      reserve: 'POST /api/beds?action=reserve',
      checkin: 'POST /api/beds?action=checkin',
      checkout: 'POST /api/beds?action=checkout',
      waitlist: 'GET /api/beds?action=waitlist',
      alerts: 'GET /api/beds?action=alerts'
    }
  });
}

function calculateWaitlistPosition(applicantType, urgencyLevel) {
  const basePositions = {
    'emergency': 1,
    'high': 3,
    'standard': 8
  };
  return basePositions[urgencyLevel] || 8;
}

function calculateEstimatedAvailability(applicantType, urgencyLevel) {
  const estimates = {
    'emergency': '1-3 days',
    'high': '7-10 days',
    'standard': '14-21 days'
  };
  return estimates[urgencyLevel] || '14-21 days';
}

function generateBedReservationNotifications(reservation) {
  return {
    applicant: {
      email: `Reservation confirmation sent to applicant`,
      sms: `SMS confirmation with reservation ID ${reservation.id}`
    },
    staff: {
      intake: 'Intake coordinator notified',
      caseManagement: 'Case manager assigned for assessment',
      facilities: 'Facilities team alerted for bed preparation'
    },
    alerts: reservation.urgencyLevel === 'emergency' ? [
      'Emergency placement alert sent to management',
      'On-call coordinator contacted'
    ] : []
  };
}

function checkImmediateAvailability(reservation) {
  // Simulated availability check
  const availableNow = Math.random() > 0.7; // 30% chance of immediate availability
  
  return {
    available: availableNow,
    message: availableNow ? 
      'Bed available for immediate assignment' : 
      `Added to waitlist - position ${reservation.waitlistPosition}`,
    unit: availableNow ? 'Veterans Wing A - Bed 12' : null,
    expectedMoveIn: availableNow ? 
      'Within 24 hours' : 
      reservation.estimatedAvailability
  };
}

function generateWelcomePackage(checkIn) {
  return {
    welcomeLetter: `Welcome letter for ${checkIn.residentName}`,
    facilityRules: 'House rules and regulations document',
    serviceAgreement: 'Resident service agreement',
    emergencyContacts: 'Emergency contact information sheet',
    programOverview: 'Overview of available programs and services',
    resourceDirectory: 'Community resources and support services',
    keyAndAccess: `Room key issued for ${checkIn.unit} - Bed ${checkIn.bedNumber}`,
    orientation: 'Orientation scheduled for tomorrow at 10:00 AM'
  };
}

function generateExitPackage(checkOut) {
  return {
    exitSummary: `Stay summary for ${checkOut.residentName}`,
    referrals: checkOut.successfulCompletion ? 
      'Community housing and support referrals' : 
      'Alternative housing options',
    documentation: 'Certificate of completion (if applicable)',
    forwarding: 'Mail forwarding instructions',
    emergencyContacts: 'Crisis support contact information',
    followUp: checkOut.successfulCompletion ? 
      'Alumni support program invitation' : 
      'Re-entry support resources'
  };
}

function generateAvailabilityAlerts(update) {
  return {
    waitlist: `Waitlist notifications sent for ${update.unit}`,
    intake: 'Intake team notified of new availability',
    referrals: 'Referral partners alerted to bed opening',
    social: 'Social media availability post scheduled'
  };
}