import { create } from 'zustand'

export const useStore = create((set, get) => ({
  // User
  user: null,
  setUser: (user) => set({ user }),

  // Disruptions
  disruptions: [],
  activeDisruptionId: null,
  setActiveDisruption: (id) => set({ activeDisruptionId: id }),
  setDisruptions: (disruptions) =>
    set((s) => ({
      disruptions,
      activeDisruptionId: disruptions.length ? s.activeDisruptionId || disruptions[0].id : null,
    })),

  addOrUpdateDisruption: (disruption) =>
    set((s) => {
      const exists = s.disruptions.some((d) => d.id === disruption.id)
      const disruptions = exists
        ? s.disruptions.map((d) => (d.id === disruption.id ? { ...d, ...disruption } : d))
        : [disruption, ...s.disruptions]

      return {
        disruptions,
        activeDisruptionId: s.activeDisruptionId || disruption.id,
      }
    }),

  // Agent reasoning steps
  reasoningSteps: [],
  auditTrail: [],
  agentStatus: 'monitoring', // monitoring | analyzing | done
  clearReasoning: () => set({ reasoningSteps: [], agentStatus: 'analyzing' }),
  addReasoningStep: (step) =>
    set((s) => ({
      reasoningSteps: [...s.reasoningSteps, step],
    })),
  setAuditTrail: (auditTrail) => set({ auditTrail }),
  setAgentStatus: (status) => set({ agentStatus: status }),

  // Actions taken
  actions: [],
  setActions: (actions) => set({ actions }),
  addAction: (action) =>
    set((s) => {
      const exists = s.actions.some((a) => a.id === action.id)
      return {
        actions: exists
          ? s.actions.map((a) => (a.id === action.id ? { ...a, ...action } : a))
          : [action, ...s.actions],
      }
    }),

  // Activity log
  logs: [],
  setLogs: (logs) => set({ logs }),
  addLog: (msg, type = 'info') =>
    set((s) => ({
      logs: [{ t: new Date().toTimeString().slice(0, 8), msg, type }, ...s.logs].slice(0, 60),
    })),

  // KPIs
  kpis: {
    activeDisruptionsCount: 0,
    delayedShipments: 0,
    estimatedFinancialImpact: 0,
    averageDelayTime: 0,
    riskHeatmap: { high: 0, medium: 0, low: 0 },
  },
  setKpis: (kpis) => set({ kpis }),

  // Supply map data
  supplyNodes: [],
  supplyRoutes: [],
  setSupplyNodes: (supplyNodes) => set({ supplyNodes }),
  setSupplyRoutes: (supplyRoutes) => set({ supplyRoutes }),

  hydrateDashboard: (payload) => {
    const disruptions = payload.disruptions || []
    const actions = payload.actions || []
    const auditTrail = payload.auditTrail || []

    set({
      user: payload.user || null,
      disruptions,
      activeDisruptionId: disruptions.length ? disruptions[0].id : null,
      actions,
      auditTrail,
      reasoningSteps: auditTrail
        .slice()
        .reverse()
        .slice(0, 20)
        .map((entry) => ({
          agent:
            entry.stage === 'DETECTION'
              ? 'Detection'
              : entry.stage === 'IMPACT'
              ? 'Impact'
              : entry.stage === 'DECISION'
              ? 'Decision'
              : 'Action',
          icon:
            entry.stage === 'DETECTION'
              ? 'D'
              : entry.stage === 'IMPACT'
              ? 'I'
              : entry.stage === 'DECISION'
              ? 'Dc'
              : 'A',
          text: entry.message,
          done: entry.stage === 'ACTION',
        })),
      logs: auditTrail
        .slice(0, 40)
        .map((entry) => ({
          t: new Date(entry.timestamp).toTimeString().slice(0, 8),
          msg: `${entry.stage}: ${entry.message}`,
          type: entry.stage === 'ACTION' ? 'ok' : 'info',
        })),
      supplyNodes: payload.supplyNodes || [],
      supplyRoutes: payload.supplyRoutes || [],
      kpis: {
        activeDisruptionsCount: payload.kpis?.activeDisruptionsCount || 0,
        delayedShipments: payload.kpis?.delayedShipments || 0,
        estimatedFinancialImpact: payload.kpis?.estimatedFinancialImpact || 0,
        averageDelayTime: payload.kpis?.averageDelayTime || 0,
        riskHeatmap: payload.kpis?.riskHeatmap || { high: 0, medium: 0, low: 0 },
      },
      agentStatus: disruptions.length ? 'done' : 'monitoring',
    })
  },

  // Alert flash
  alertFlash: false,
  triggerFlash: () => {
    set({ alertFlash: true })
    setTimeout(() => set({ alertFlash: false }), 800)
  },

  // Active tab navigation
  activeTab: 'Control Tower',
  setActiveTab: (tab) => set({ activeTab: tab }),
}))
