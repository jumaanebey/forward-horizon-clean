#!/bin/bash

# Forward Horizon - Start All Automation Systems
# This script starts all the workflow systems in the background

echo "🚀 Starting Forward Horizon Automation Systems..."

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Stop existing processes on our ports
echo "🧹 Cleaning up existing processes..."
pkill -f "node system-monitor.js" 2>/dev/null
pkill -f "node document-generator.js" 2>/dev/null  
pkill -f "node donor-automation.js" 2>/dev/null
pkill -f "node appointment-system.js" 2>/dev/null

sleep 2

# Start System Monitor (Dashboard)
echo "📊 Starting System Monitor on port 3000..."
if ! check_port 3000; then
    nohup node system-monitor.js > logs/monitor.log 2>&1 &
    echo "   ✅ System Monitor started"
else
    echo "   ⚠️  Port 3000 already in use"
fi

# Start Document Generator
echo "📋 Starting Document Generator on port 3001..."
if ! check_port 3001; then
    nohup node document-generator.js > logs/documents.log 2>&1 &
    echo "   ✅ Document Generator started"
else
    echo "   ⚠️  Port 3001 already in use"
fi

# Start Donor Automation
echo "💝 Starting Donor Automation on port 3002..."
if ! check_port 3002; then
    nohup node donor-automation.js > logs/donors.log 2>&1 &
    echo "   ✅ Donor Automation started"
else
    echo "   ⚠️  Port 3002 already in use"
fi

# Start Appointment System
echo "📅 Starting Appointment System on port 3003..."
if ! check_port 3003; then
    nohup node appointment-system.js > logs/appointments.log 2>&1 &
    echo "   ✅ Appointment System started"
else
    echo "   ⚠️  Port 3003 already in use"
fi

# Create logs directory if it doesn't exist
mkdir -p logs

echo ""
echo "🎉 Forward Horizon Automation Systems Started!"
echo ""
echo "📊 System Dashboard: http://localhost:3000"
echo "📋 Document Generator: http://localhost:3001/health"  
echo "💝 Donor Automation: http://localhost:3002/analytics"
echo "📅 Appointment System: http://localhost:3003"
echo ""
echo "📝 Logs are in the 'logs' directory"
echo "🔄 To stop all systems: pkill -f 'node.*-.*\.js'"
echo ""
echo "✨ All systems are now running in the background!"

# Show running processes
echo "🔍 Checking system status in 3 seconds..."
sleep 3

echo ""
echo "📊 System Status:"
curl -s http://localhost:3000/api/status | grep -q '"status":"healthy"' && echo "   ✅ Monitor: Running" || echo "   ❌ Monitor: Not responding"
curl -s http://localhost:3001/health | grep -q '"status":"healthy"' && echo "   ✅ Documents: Running" || echo "   ❌ Documents: Not responding"  
curl -s http://localhost:3002/health | grep -q '"status":"healthy"' && echo "   ✅ Donors: Running" || echo "   ❌ Donors: Not responding"
curl -s http://localhost:3003/health | grep -q '"status":"healthy"' && echo "   ✅ Appointments: Running" || echo "   ❌ Appointments: Not responding"

echo ""
echo "🎯 Ready to automate Forward Horizon operations!"