import { useCallback, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { createDisruption } from '../services/api'
import { useAuth } from '../auth/AuthContext'
import { io } from "socket.io-client";

export function useAgentRunner() {
  const { user } = useAuth()

  const {
    clearReasoning,
    setAgentStatus,
    addAction,
    addLog,
    addOrUpdateDisruption,
    setAuditTrail,
  } = useStore()

  // ✅ SOCKET SHOULD BE HERE
  useEffect(() => {
    const socket = io("http://localhost:4000");

    socket.on("agent_update", (data) => {
      const { stage, data: content } = data;

      if (stage === "DETECTION") {
        addLog(`Detection: ${content.eventType}`, "info");
      }

      if (stage === "IMPACT") {
        addLog(`Impact: ${content.summary}`, "info");
      }

      if (stage === "DECISION") {
        addLog(`Decision: ${content.action}`, "ok");
      }

      if (stage === "GUARDRAIL") {
        addLog(`Guardrail: ${content.status}`, "warn");
      }
    });

    socket.on("event_complete", (payload) => {
      addOrUpdateDisruption(payload.disruption);
      addAction(payload.action);
      setAuditTrail(payload.auditLog || []);
      setAgentStatus("done");
    });

    return () => socket.disconnect();
  }, [addLog, addOrUpdateDisruption, addAction, setAuditTrail, setAgentStatus]);

  // 🚀 YOUR EXISTING CODE (UNCHANGED)

  const runDisruptionPipeline = useCallback(async (disruptionInput) => {
    if (!user?.id) {
      addLog('Cannot trigger disruption: missing user context', 'warn')
      return
    }

    clearReasoning()
    setAgentStatus('analyzing')

    try {
      const result = await createDisruption(user, disruptionInput)
      addOrUpdateDisruption(result.disruption)

      if (result.action) {
        addAction(result.action)
      }

      setAuditTrail(result.auditLog || [])
      setAgentStatus('done')

      addLog(`Disruption handled: ${result.disruption.type} at ${result.disruption.location}`, 'ok')
    } catch (error) {
      setAgentStatus('monitoring')
      addLog(`Pipeline failed: ${error.message}`, 'warn')
    }
  }, [user, clearReasoning, setAgentStatus, addAction, addLog, addOrUpdateDisruption, setAuditTrail])

  const runForDisruption = useCallback((disruption) => {
    addLog(`Analyzing disruption: ${disruption.type} at ${disruption.location}`)
    runDisruptionPipeline({
      type: disruption.type,
      location: disruption.location,
      severity: disruption.severity,
      source: disruption.source || 'manual',
      affectedNodes: disruption.affectedNodes || [],
      probability: disruption.probability,
      confidence: disruption.confidence,
    })
  }, [runDisruptionPipeline, addLog])

  const runForScenario = useCallback((scenarioKey, label = scenarioKey) => {
    addLog(`SIMULATION: ${label} triggered`, 'warn')
    runDisruptionPipeline({
      scenarioKey,
      source: 'simulation',
    })
  }, [runDisruptionPipeline, addLog])

  return { runForDisruption, runForScenario }
}