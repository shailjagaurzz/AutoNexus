import { useEffect, useState } from "react";
import { io } from "socket.io-client";

import TopBar from "./components/layout/TopBar";
import ControlTowerView from "./components/views/ControlTowerView";
import RoutesView from "./components/views/RoutesView";
import SuppliersView from "./components/views/SuppliersView";
import AnalyticsView from "./components/views/AnalyticsView";
import GraphView from "./components/views/GraphView";

import { useStore } from "./store/useStore";
import { useAuth } from "./auth/AuthContext";
import { getDashboard } from "./services/api";

export default function App() {
  const { user } = useAuth();
  const activeTab = useStore((s) => s.activeTab);

  const fetchSuppliers = useStore((s) => s.fetchSuppliers);
  const fetchDisruptions = useStore((s) => s.fetchDisruptions);

  const {
    hydrateDashboard,
    addReasoningStep,
    setAgentStatus,
    addAction,
    addLog,
    addOrUpdateDisruption,
    setAuditTrail,
  } = useStore();

  useEffect(() => {
    if (!user?.id) return;

    let mounted = true;

    // =====================
    // LOAD INITIAL DATA
    // =====================
    async function loadDashboard() {
      try {
        const payload = await getDashboard(user);
        if (mounted) {
          hydrateDashboard(payload);
          addLog("Dashboard data loaded", "ok");
        }
      } catch (error) {
        if (mounted) {
          addLog(`Failed to load dashboard: ${error.message}`, "warn");
        }
      }
    }

    loadDashboard();

    // =====================
    // FETCH SUPPLIERS + DISRUPTIONS
    // =====================
    fetchSuppliers();
    fetchDisruptions();

    // =====================
    // SOCKET SETUP
    // =====================
    const socket = io("http://localhost:4000", {
      auth: { userId: user.id },
      query: { userId: user.id },
    });

    socket.on("connect", () => {
      addLog("Connected to realtime stream", "ok");
    });

    socket.on("agent_update", (data) => {
      const stageToAgent = {
        DETECTION: { agent: "Detection", icon: "D" },
        IMPACT: { agent: "Impact", icon: "I" },
        DECISION: { agent: "Decision", icon: "Dc" },
        GUARDRAIL: { agent: "Action", icon: "A" },
        ACTION: { agent: "Action", icon: "A" },
      };

      const view = stageToAgent[data.stage] || {
        agent: "Detection",
        icon: "D",
      };

      const message =
        data.stage === "DETECTION"
          ? `Detected ${data.data?.eventType} at ${data.data?.location}`
          : data.stage === "IMPACT"
          ? `${data.data?.summary || "Impact modeled"}`
          : data.stage === "DECISION"
          ? `Decision: ${data.data?.action}`
          : `Guardrail: ${data.data?.status || "UNKNOWN"}`;

      addReasoningStep({
        agent: view.agent,
        icon: view.icon,
        text: message,
        done: data.stage === "ACTION",
      });

      setAgentStatus(data.stage === "ACTION" ? "done" : "analyzing");
    });

    socket.on("event_complete", async (payload) => {
      if (payload?.disruption) addOrUpdateDisruption(payload.disruption);
      if (payload?.action) addAction(payload.action);
      if (payload?.auditLog) setAuditTrail(payload.auditLog);

      try {
        const refreshed = await getDashboard(user);
        if (mounted) hydrateDashboard(refreshed);
      } catch (error) {
        addLog(`Refresh failed: ${error.message}`, "warn");
      }

      setAgentStatus("done");

      addLog(
        `Pipeline completed: ${payload?.disruption?.type || "event"}`,
        "ok"
      );
    });

    return () => {
      mounted = false;
      socket.disconnect();
    };
  }, [
    user,
    hydrateDashboard,
    addReasoningStep,
    setAgentStatus,
    addAction,
    addLog,
    addOrUpdateDisruption,
    setAuditTrail,
    fetchSuppliers,
    fetchDisruptions,
  ]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TopBar />

      <div style={{ flex: 1, display: "flex" }}>
        <div style={{ flex: 1 }}>
          {activeTab === "Control Tower" && <ControlTowerView />}
          {activeTab === "Routes" && <RoutesView />}
          {activeTab === "Suppliers" && <SuppliersView />}
          {activeTab === "Analytics" && <AnalyticsView />}
          {activeTab === "Graph" && <GraphView />}
        </div>
      </div>
    </div>
  );
}