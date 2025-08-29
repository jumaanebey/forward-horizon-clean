#!/usr/bin/env node

/**
 * Forward Horizon System Monitor & Dashboard
 * Shows status of all workflows and generates activity reports
 */

import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());
app.use(express.static('public'));

class SystemMonitor {
  constructor() {
    this.stats = {
      documentsGenerated: 0,
      emailsSent: 0,
      appointmentsScheduled: 0,
      donationsProcessed: 0,
      volunteersRegistered: 0,
      systemUptime: Date.now()
    };
    
    this.loadStats();
    this.logActivity = [];
  }

  // Load stats from file
  loadStats() {
    try {
      if (fs.existsSync('system-stats.json')) {
        const data = fs.readFileSync('system-stats.json', 'utf8');
        this.stats = { ...this.stats, ...JSON.parse(data) };
      }
    } catch (error) {
      console.log('Starting with fresh stats');
    }
  }

  // Save stats to file
  saveStats() {
    fs.writeFileSync('system-stats.json', JSON.stringify(this.stats, null, 2));
  }

  // Log activity
  log(activity, details = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      activity,
      details,
      id: Date.now()
    };
    
    this.logActivity.unshift(entry);
    
    // Keep only last 100 activities
    if (this.logActivity.length > 100) {
      this.logActivity = this.logActivity.slice(0, 100);
    }
    
    console.log(`📊 ${activity}: ${JSON.stringify(details)}`);
  }

  // Increment counter
  increment(counter) {
    this.stats[counter]++;
    this.saveStats();
  }

  // Get system status
  getStatus() {
    const uptime = Date.now() - this.stats.systemUptime;
    const uptimeHours = Math.floor(uptime / (1000 * 60 * 60));
    
    return {
      status: 'healthy',
      uptime: `${uptimeHours} hours`,
      stats: this.stats,
      recentActivity: this.logActivity.slice(0, 10),
      services: {
        documentGenerator: this.checkService(3001),
        donorSystem: this.checkService(3002),
        appointmentSystem: this.checkService(3003),
        volunteerSystem: this.checkService(3004)
      }
    };
  }

  // Check if service is running
  async checkService(port) {
    try {
      const response = await fetch(`http://localhost:${port}/health`);
      return response.ok ? 'running' : 'error';
    } catch {
      return 'offline';
    }
  }

  // Generate daily report
  generateDailyReport() {
    const today = new Date().toDateString();
    const todayActivity = this.logActivity.filter(entry => 
      new Date(entry.timestamp).toDateString() === today
    );

    return {
      date: today,
      totalActivities: todayActivity.length,
      documentsGenerated: todayActivity.filter(a => a.activity.includes('Document')).length,
      emailsSent: todayActivity.filter(a => a.activity.includes('Email')).length,
      appointments: todayActivity.filter(a => a.activity.includes('Appointment')).length,
      donations: todayActivity.filter(a => a.activity.includes('Donation')).length,
      activities: todayActivity
    };
  }
}

const monitor = new SystemMonitor();

// Dashboard HTML
const dashboardHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forward Horizon System Dashboard</title>
    <style>
        body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 20px;
            background: #f8fafc;
            color: #334155;
        }
        .header {
            background: linear-gradient(135deg, #2c5530 0%, #4a7c59 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            text-align: center;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
        }
        .stat-number {
            font-size: 2.5em;
            font-weight: bold;
            color: #2c5530;
            margin-bottom: 5px;
        }
        .stat-label {
            color: #64748b;
            font-size: 0.9em;
        }
        .services-status {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        .service-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .service-item:last-child {
            border-bottom: none;
        }
        .status-running {
            background: #10b981;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8em;
        }
        .status-offline {
            background: #ef4444;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8em;
        }
        .activity-log {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .activity-item {
            padding: 10px 0;
            border-bottom: 1px solid #f1f5f9;
            display: flex;
            justify-content: space-between;
        }
        .activity-item:last-child {
            border-bottom: none;
        }
        .activity-time {
            color: #64748b;
            font-size: 0.8em;
        }
        .refresh-btn {
            background: #2c5530;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            margin: 10px 0;
        }
        .refresh-btn:hover {
            background: #1e3a22;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏠 Forward Horizon System Dashboard</h1>
        <p>Real-time monitoring of all automation workflows</p>
        <button class="refresh-btn" onclick="location.reload()">🔄 Refresh Data</button>
    </div>

    <div id="dashboard-content">
        <!-- Content will be loaded here -->
    </div>

    <script>
        async function loadDashboard() {
            try {
                const response = await fetch('/api/status');
                const data = await response.json();
                
                document.getElementById('dashboard-content').innerHTML = \`
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">\${data.stats.documentsGenerated}</div>
                            <div class="stat-label">Documents Generated</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">\${data.stats.emailsSent}</div>
                            <div class="stat-label">Emails Sent</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">\${data.stats.appointmentsScheduled}</div>
                            <div class="stat-label">Appointments Scheduled</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">\${data.stats.donationsProcessed}</div>
                            <div class="stat-label">Donations Processed</div>
                        </div>
                    </div>
                    
                    <div class="services-status">
                        <h2>🔧 System Services</h2>
                        <div class="service-item">
                            <span>📋 Document Generator</span>
                            <span class="status-running">Running</span>
                        </div>
                        <div class="service-item">
                            <span>💝 Donor Automation</span>
                            <span class="status-offline">Offline</span>
                        </div>
                        <div class="service-item">
                            <span>📅 Appointment System</span>
                            <span class="status-offline">Offline</span>
                        </div>
                        <div class="service-item">
                            <span>🤝 Volunteer Management</span>
                            <span class="status-offline">Offline</span>
                        </div>
                    </div>
                    
                    <div class="activity-log">
                        <h2>📊 Recent Activity</h2>
                        \${data.recentActivity.map(activity => \`
                            <div class="activity-item">
                                <span>\${activity.activity}</span>
                                <span class="activity-time">\${new Date(activity.timestamp).toLocaleTimeString()}</span>
                            </div>
                        \`).join('')}
                    </div>
                \`;
                
            } catch (error) {
                document.getElementById('dashboard-content').innerHTML = \`
                    <div style="text-align: center; padding: 50px;">
                        <h2>❌ Dashboard Loading Error</h2>
                        <p>Could not load system status. Check if monitor is running.</p>
                    </div>
                \`;
            }
        }
        
        // Load dashboard on page load
        loadDashboard();
        
        // Auto-refresh every 30 seconds
        setInterval(loadDashboard, 30000);
    </script>
</body>
</html>
`;

// Routes
app.get('/', (req, res) => {
  res.send(dashboardHTML);
});

app.get('/api/status', (req, res) => {
  res.json(monitor.getStatus());
});

app.get('/api/report/daily', (req, res) => {
  res.json(monitor.generateDailyReport());
});

app.post('/api/log', (req, res) => {
  const { activity, details } = req.body;
  monitor.log(activity, details);
  res.json({ success: true });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'Forward Horizon System Monitor',
    uptime: Date.now() - monitor.stats.systemUptime
  });
});

// Start monitor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`📊 Forward Horizon System Monitor running on port ${PORT}`);
  console.log(`🎛️  Dashboard: http://localhost:${PORT}`);
  console.log(`📈 API Status: http://localhost:${PORT}/api/status`);
  
  monitor.log('System Monitor Started', { port: PORT });
});

export default monitor;