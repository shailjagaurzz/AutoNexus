# Real-Time Data System Guide

Your AutoNexus app now has **complete real-time data streaming** using Socket.IO. Here's how it all works:

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Real-Time Flow                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Backend (Node.js + Express)                                 │
│  ├─ Socket.IO Server (Port 4000)                             │
│  ├─ Disruption Pipeline (Detection→Impact→Decision→Action)   │
│  ├─ Network Metrics Emitter (broadcasts every 10s)           │
│  └─ Realtime Updates Service (node/route/disruption changes) │
│                                                               │
│         ↕ Socket.IO Events (TCP WebSocket)                   │
│                                                               │
│  Frontend (React)                                             │
│  ├─ Socket.IO Client (connects on app load)                  │
│  ├─ useRealtimeUpdates Hook (listens to events)              │
│  ├─ LiveStreamControl Component (start/stop broadcasts)      │
│  └─ Live store updates (nodes, routes, disruptions, KPIs)    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Event Types & Data Flow

### A. Pipeline Events (Real-Time)
**Emitted during disruption simulation:**
- `agent_update` - Pipeline stage progression
  ```json
  {
    "stage": "DETECTION|IMPACT|DECISION|GUARDRAIL|ACTION",
    "data": { "eventType", "location", "severity", ... }
  }
  ```
- `event_complete` - Pipeline finished, dashboard refreshes

### B. Network Metrics (Interval-Based)
**Emitted every 10 seconds when live stream is active:**
- `network_metrics` - Aggregated supply chain health
  ```json
  {
    "timestamp": "2026-03-25T10:30:00.000Z",
    "activeDisruptions": 2,
    "totalDelayedShipments": 450,
    "totalFinancialImpact": 54000,
    "networkRiskAverage": 0.52,
    "healthyNodes": 5,
    "riskNodes": 2
  }
  ```

### C. Node Status Updates (On Change)
**Emitted when a node's status/risk changes:**
- `node_update` - Individual node change
  ```json
  {
    "nodeId": "62a1b2c3d4e5f6g7h8i9j",
    "status": "active|delayed|disrupted",
    "change": { "riskScore": 0.72, "utilizationRate": 0.85 }
  }
  ```

### D. Route Updates (On Change)
**Emitted when a route's status/metrics change:**
- `route_update` - Individual route change
  ```json
  {
    "routeId": "62a1b2c3d4e5f6g7h8i9j",
    "status": "active|delayed|disrupted",
    "delayDays": 2,
    "riskScore": 0.68
  }
  ```

### E. Disruption Updates (On Status Change)
**Emitted when disruption status changes:**
- `disruption_update` - Individual disruption update
  ```json
  {
    "disruption": {
      "id": "62a1b2c3d4e5f6g7h8i9j",
      "status": "open|resolved",
      "severity": 8,
      "delayedShipments": 150,
      "estimatedFinancialImpact": 18000
    }
  }
  ```

---

## 2. How to Use It

### Start the App
```bash
# Terminal 1 - Backend
cd backend
npm install
node server.js

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

### Trigger a Disruption
1. Go to **Control Tower** tab
2. Click "Trigger Disruption" (SimBar component)
3. Watch the pipeline execute in real-time
4. See agent_update events stream through

### Enable Live Stream
1. Look for the **"Live" button** in the top-right (next to status pills)
2. Click **"Start"** to begin 10-second metric broadcasts
3. Watch your KPI cards update in real-time
4. Click **"Stop"** to pause broadcasts

---

## 3. Code Examples

### Example: Listen to Live Metrics in Component
```jsx
import { useEffect } from 'react'
import { io } from 'socket.io-client'

export function MetricsMonitor() {
  useEffect(() => {
    const socket = io('http://localhost:4000');

    socket.on('network_metrics', (metrics) => {
      console.log('Network health:', metrics.networkRiskAverage);
      // Update UI with fresh metrics
    });

    return () => socket.disconnect();
  }, []);

  return <div>Monitoring live metrics...</div>;
}
```

### Example: Broadcast a Node Change from Backend
```javascript
const { broadcastNodeStatusChange } = require('./services/realtimeUpdatesService');

// When a node is disrupted:
await broadcastNodeStatusChange(io, userId, nodeId, 'disrupted', {
  riskScore: 0.85,
  utilizationRate: 0.95,
});
```

### Example: Broadcast a Disruption Update from Backend
```javascript
const { broadcastDisruptionUpdate } = require('./services/realtimeUpdatesService');

// When disruption is resolved:
await broadcastDisruptionUpdate(io, userId, {
  id: disruption._id,
  status: 'resolved',
  severity: disruption.severity,
  delayedShipments: disruption.delayedShipments,
  estimatedFinancialImpact: disruption.estimatedFinancialImpact,
});
```

---

## 4. Key Hooks & Components

### useRealtimeUpdates Hook
Automatically listens to all real-time events and updates the Zustand store:
```jsx
import { useRealtimeUpdates } from './hooks/useRealtimeUpdates';

export default function MyApp() {
  const { user } = useAuth();
  useRealtimeUpdates(user); // Attach listeners
  
  return <Dashboard />;
}
```

### LiveStreamControl Component
Button to start/stop live metric emissions:
```jsx
import LiveStreamControl from './components/common/LiveStreamControl';

// In TopBar
<LiveStreamControl />
```

---

## 5. API Endpoints

### Start Live Stream
```http
POST /api/live-stream/start
Body: { "userId": "user123" }
Response: { "message": "Live stream started", "userId": "user123", "interval": "10 seconds" }
```

### Stop Live Stream
```http
POST /api/live-stream/stop
Body: { "userId": "user123" }
Response: { "message": "Live stream stopped", "userId": "user123" }
```

### Get Stream Status
```http
GET /api/live-stream/status/:userId
Response: { "userId": "user123", "streaming": true, "emitterCount": 3 }
```

---

## 6. Data Flow Example: Full Disruption Cycle

```
1. User clicks "Trigger Disruption"
   → POST /api/disruptions/simulate
   
2. Backend runs 5-stage pipeline
   → Backend emits "agent_update" with DETECTION
   → Frontend receives, adds to ReasoningSteps
   
   → Backend emits "agent_update" with IMPACT
   → Frontend receives, updates agent progress
   
   → Backend emits "agent_update" with DECISION
   → Frontend receives, shows chosen action
   
   → Backend emits "agent_update" with GUARDRAIL
   → Frontend receives, validates constraints
   
   → Backend emits "agent_update" with ACTION
   → Frontend receives, marks pipeline as done
   
3. Pipeline completes
   → Backend emits "event_complete" with full payload
   → Frontend calls getDashboard() to refresh
   
4. User enables "Live" stream
   → Frontend calls POST /api/live-stream/start
   → Backend starts 10-second timer
   
5. Every 10 seconds thereafter
   → Backend computes network health snapshot
   → Backend emits "network_metrics" event
   → Frontend receives, updates KPI store
   → UI renders new values (activeDisruptions, delayedShipments, etc.)
```

---

## 7. Extend It: Add Custom Real-Time Updates

### Step 1: Create broadcast function in realtimeUpdatesService.js
```javascript
async function broadcastCustomMetric(io, userId, metric) {
  io.to(String(userId)).emit('custom_metric', { metric, timestamp: new Date() });
}
```

### Step 2: Call it from your service
```javascript
// In your business logic:
await broadcastCustomMetric(io, userId, { supplyChainScore: 0.92 });
```

### Step 3: Listen in frontend useRealtimeUpdates hook
```javascript
socket.on('custom_metric', (data) => {
  console.log('Custom metric:', data.metric);
  // Update your state
});
```

---

## 8. Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot connect to socket" | Verify backend running on :4000, no CORS issues |
| Real-time events not received | Check DevTools Console for socket errors, verify userId passed |
| Metrics not updating | Click "Start" live stream button; check backend logs for emitter status |
| Stale data in UI | Call `getDashboard()` manually to refresh, or enable live stream |

---

## 9. Performance Notes

- **10-second metric broadcasts**: Suitable for monitoring; reduces bandwidth vs. 1-2s intervals
- **Event-based node/route updates**: Only emitted on actual changes; no wasted bandwidth
- **Per-user socket rooms**: Each user only receives their own data; supports multi-tenant
- **Connection pooling**: Socket.IO handles reconnection automatically

---

## Summary

You now have:
✅ Real-time pipeline events (detection → action)
✅ Interval-based network health broadcasts (every 10s)
✅ Live node/route/disruption status updates
✅ Frontend hooks that consume all events
✅ UI controls to start/stop live stream
✅ Extensible design for custom metrics
