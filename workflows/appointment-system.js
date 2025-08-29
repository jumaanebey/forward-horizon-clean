#!/usr/bin/env node

/**
 * Forward Horizon Appointment System
 * Simple, reliable appointment scheduling without N8N complexity
 */

import express from 'express';
import fs from 'fs';

const app = express();
app.use(express.json());

const CONFIG = {
  organization: "Forward Horizon",
  phone: "(310) 488-5280",
  email: "info@theforwardhorizon.com"
};

class AppointmentSystem {
  constructor() {
    this.appointments = this.loadAppointments();
  }

  loadAppointments() {
    try {
      if (fs.existsSync('appointments.json')) {
        return JSON.parse(fs.readFileSync('appointments.json', 'utf8'));
      }
    } catch (error) {
      console.log('Starting with empty appointments');
    }
    return {};
  }

  saveAppointments() {
    fs.writeFileSync('appointments.json', JSON.stringify(this.appointments, null, 2));
  }

  // Schedule appointment
  scheduleAppointment(appointmentData) {
    const appointmentId = `apt_${Date.now()}`;
    const appointment = {
      id: appointmentId,
      veteranName: appointmentData.veteranName,
      email: appointmentData.email,
      phone: appointmentData.phone,
      appointmentType: appointmentData.appointmentType || 'Initial Assessment',
      scheduledTime: appointmentData.scheduledTime,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      remindersSent: 0
    };

    this.appointments[appointmentId] = appointment;
    this.saveAppointments();

    // Generate confirmation email/SMS content
    const confirmationContent = this.generateConfirmation(appointment);
    
    console.log(`📅 Appointment scheduled for ${appointmentData.veteranName}`);
    
    return {
      appointment,
      confirmationEmail: confirmationContent.email,
      confirmationSMS: confirmationContent.sms
    };
  }

  // Generate confirmation messages
  generateConfirmation(appointment) {
    const appointmentDate = new Date(appointment.scheduledTime);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const email = {
      to: appointment.email,
      subject: `Appointment Confirmed - ${appointment.appointmentType}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c5530;">Appointment Confirmed</h2>
          
          <p>Dear ${appointment.veteranName},</p>
          
          <p>Your appointment with Forward Horizon has been confirmed:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2c5530;">Appointment Details</h3>
            <p><strong>Type:</strong> ${appointment.appointmentType}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${formattedTime}</p>
            <p><strong>Location:</strong> Forward Horizon Office<br>
            1234 Veterans Way, Los Angeles, CA 90001</p>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0;">What to Bring:</h4>
            <ul>
              <li>Photo ID (driver's license or state ID)</li>
              <li>DD-214 (military discharge papers) if available</li>
              <li>Any relevant medical or financial documents</li>
              <li>List of questions or concerns</li>
            </ul>
          </div>
          
          <p><strong>Need to reschedule?</strong> Call us at ${CONFIG.phone} at least 24 hours in advance.</p>
          
          <p>We look forward to meeting with you!</p>
          
          <p>Best regards,<br>
          The Forward Horizon Team<br>
          ${CONFIG.phone}<br>
          ${CONFIG.email}</p>
        </div>
      `
    };

    const sms = {
      to: appointment.phone,
      message: `Hi ${appointment.veteranName}, your ${appointment.appointmentType} appointment is confirmed for ${formattedDate} at ${formattedTime}. Location: Forward Horizon Office. Need to reschedule? Call ${CONFIG.phone}`
    };

    return { email, sms };
  }

  // Generate reminder
  generateReminder(appointment, hoursUntil = 24) {
    const appointmentDate = new Date(appointment.scheduledTime);
    const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    let timeFrame = '';
    if (hoursUntil === 24) {
      timeFrame = 'tomorrow';
    } else if (hoursUntil === 2) {
      timeFrame = 'in 2 hours';
    } else {
      timeFrame = `in ${hoursUntil} hours`;
    }

    return {
      email: {
        to: appointment.email,
        subject: `Reminder: Your appointment ${timeFrame}`,
        html: `
          <p>Dear ${appointment.veteranName},</p>
          <p>This is a friendly reminder that your ${appointment.appointmentType} appointment is ${timeFrame} at ${formattedTime}.</p>
          <p><strong>Location:</strong> Forward Horizon Office<br>
          1234 Veterans Way, Los Angeles, CA 90001</p>
          <p>Call ${CONFIG.phone} if you need to reschedule.</p>
          <p>See you soon!</p>
        `
      },
      sms: {
        to: appointment.phone,
        message: `Reminder: Your ${appointment.appointmentType} appointment is ${timeFrame} at ${formattedTime}. Forward Horizon Office. Call ${CONFIG.phone} if needed.`
      }
    };
  }

  // Get upcoming appointments
  getUpcomingAppointments(days = 7) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    return Object.values(this.appointments).filter(apt => {
      const aptDate = new Date(apt.scheduledTime);
      return aptDate >= now && aptDate <= futureDate && apt.status === 'scheduled';
    }).sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));
  }

  // Get appointments needing reminders
  getAppointmentsNeedingReminders() {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    const twoHoursFromNow = new Date();
    twoHoursFromNow.setHours(now.getHours() + 2);

    const needReminders = [];

    Object.values(this.appointments).forEach(apt => {
      if (apt.status !== 'scheduled') return;
      
      const aptDate = new Date(apt.scheduledTime);
      
      // 24-hour reminder
      if (aptDate >= tomorrow && aptDate <= tomorrow && apt.remindersSent === 0) {
        needReminders.push({ appointment: apt, reminderType: '24hour' });
      }
      
      // 2-hour reminder  
      if (aptDate >= twoHoursFromNow && aptDate <= twoHoursFromNow && apt.remindersSent === 1) {
        needReminders.push({ appointment: apt, reminderType: '2hour' });
      }
    });

    return needReminders;
  }

  // Mark reminder sent
  markReminderSent(appointmentId) {
    if (this.appointments[appointmentId]) {
      this.appointments[appointmentId].remindersSent++;
      this.saveAppointments();
    }
  }

  // Get appointment stats
  getStats() {
    const appointments = Object.values(this.appointments);
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);

    return {
      total: appointments.length,
      scheduled: appointments.filter(a => a.status === 'scheduled').length,
      completed: appointments.filter(a => a.status === 'completed').length,
      thisWeek: appointments.filter(a => new Date(a.createdAt) >= weekAgo).length,
      upcoming: this.getUpcomingAppointments().length
    };
  }
}

const appointmentSystem = new AppointmentSystem();

// Routes
app.post('/schedule-appointment', (req, res) => {
  try {
    const result = appointmentSystem.scheduleAppointment(req.body);
    res.json({
      success: true,
      message: `Appointment scheduled for ${req.body.veteranName}`,
      appointmentId: result.appointment.id,
      confirmationReady: true
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/appointments/upcoming', (req, res) => {
  const days = parseInt(req.query.days) || 7;
  res.json(appointmentSystem.getUpcomingAppointments(days));
});

app.get('/appointments/reminders', (req, res) => {
  res.json(appointmentSystem.getAppointmentsNeedingReminders());
});

app.get('/stats', (req, res) => {
  res.json(appointmentSystem.getStats());
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'Forward Horizon Appointment System' });
});

// Simple dashboard
app.get('/', (req, res) => {
  const upcoming = appointmentSystem.getUpcomingAppointments();
  const stats = appointmentSystem.getStats();
  
  res.send(`
    <html>
    <head><title>Forward Horizon Appointments</title></head>
    <body style="font-family: Arial; padding: 20px;">
      <h1>📅 Forward Horizon Appointment System</h1>
      
      <h2>Stats</h2>
      <p>Total Appointments: ${stats.total}</p>
      <p>Scheduled: ${stats.scheduled}</p>
      <p>This Week: ${stats.thisWeek}</p>
      
      <h2>Upcoming Appointments</h2>
      ${upcoming.map(apt => `
        <div style="border: 1px solid #ddd; padding: 10px; margin: 10px 0;">
          <strong>${apt.veteranName}</strong> - ${apt.appointmentType}<br>
          ${new Date(apt.scheduledTime).toLocaleString()}<br>
          Phone: ${apt.phone}
        </div>
      `).join('')}
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`📅 Forward Horizon Appointment System running on port ${PORT}`);
  console.log(`🎛️  Dashboard: http://localhost:${PORT}`);
});

export default appointmentSystem;