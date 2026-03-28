import { create } from 'zustand'

export const useStore = create((set, get) => ({

  // =====================
  // USER
  // =====================
  user: null,
  setUser: (user) => set({ user }),

  // =====================
  // DISRUPTIONS
  // =====================
  disruptions: [],
  activeDisruptionId: null,

  setActiveDisruption: (id) => set({ activeDisruptionId: id }),

  setDisruptions: (disruptions) =>
    set((s) => ({
      disruptions,
      activeDisruptionId: disruptions.length
        ? s.activeDisruptionId || disruptions[0]._id
        : null,
    })),

  addOrUpdateDisruption: (disruption) =>
    set((s) => {
      const newId = disruption.id || disruption._id

      const exists = s.disruptions.some(
        (d) => (d.id || d._id) === newId
      )

      const disruptions = exists
        ? s.disruptions.map((d) =>
            (d.id || d._id) === newId ? { ...d, ...disruption } : d
          )
        : [disruption, ...s.disruptions]

      return {
        disruptions,
        activeDisruptionId: s.activeDisruptionId || newId,
      }
    }),

  // =====================
  // API FETCHERS
  // =====================
  fetchSuppliers: async () => {
    const res = await fetch("/api/suppliers")
    const data = await res.json()
    set({ suppliers: data })
  },

  fetchDisruptions: async () => {
    const res = await fetch("/api/disruptions")
    const data = await res.json()

    set((s) => ({
      disruptions: data,
      activeDisruptionId:
        data.length ? s.activeDisruptionId || data[0]._id : null,
    }))
  },

  // =====================
  // SUPPLIERS
  // =====================
  suppliers: [],
  setSuppliers: (suppliers) => set({ suppliers }),

  selectedSupplier: null,
  setSelectedSupplier: (supplier) =>
    set({ selectedSupplier: supplier }),

  // =====================
  // AGENT REASONING
  // =====================
  reasoningSteps: [],
  auditTrail: [],
  agentStatus: 'monitoring',

  clearReasoning: () =>
    set({ reasoningSteps: [], agentStatus: 'analyzing' }),

  addReasoningStep: (step) =>
    set((s) => ({
      reasoningSteps: [...s.reasoningSteps, step],
    })),

  setAuditTrail: (auditTrail) => set({ auditTrail }),
  setAgentStatus: (status) => set({ agentStatus: status }),

  // =====================
  // ACTIONS
  // =====================
  actions: [],
  setActions: (actions) => set({ actions }),

  addAction: (action) =>
    set((s) => {
      const id = action.id || action._id

      const exists = s.actions.some(
        (a) => (a.id || a._id) === id
      )

      return {
        actions: exists
          ? s.actions.map((a) =>
              (a.id || a._id) === id ? { ...a, ...action } : a
            )
          : [action, ...s.actions],
      }
    }),

  // =====================
  // LOGS
  // =====================
  logs: [],

  setLogs: (logs) => set({ logs }),

  addLog: (msg, type = 'info') =>
    set((s) => ({
      logs: [
        {
          t: new Date().toTimeString().slice(0, 8),
          msg,
          type,
        },
        ...s.logs,
      ].slice(0, 60),
    })),

  // =====================
  // KPIs
  // =====================
  kpis: {
    activeDisruptionsCount: 0,
    delayedShipments: 0,
    estimatedFinancialImpact: 0,
    averageDelayTime: 0,
    riskHeatmap: { high: 0, medium: 0, low: 0 },
  },

  setKpis: (kpis) => set({ kpis }),

  // =====================
  // SUPPLY CHAIN MAP
  // =====================
  supplyNodes: [],
  supplyRoutes: [],

  setSupplyNodes: (supplyNodes) => set({ supplyNodes }),
  setSupplyRoutes: (supplyRoutes) => set({ supplyRoutes }),

  // =====================
  // GRAPH (REALTIME OPTION)
  // =====================
  graph: {
    nodes: [],
    routes: [],
    disruptions: [],
  },

  setGraph: (data) =>
    set(() => ({
      graph: {
        nodes: data.nodes || [],
        routes: data.routes || [],
        disruptions: data.disruptions || [],
      },
    })),

  // =====================
  // DASHBOARD HYDRATION
  // =====================
  hydrateDashboard: (payload) => {
    const disruptions = payload.disruptions || []
    const actions = payload.actions || []
    const auditTrail = payload.auditTrail || []

    set({
      user: payload.user || null,
      disruptions,
      activeDisruptionId: disruptions.length ? disruptions[0]._id : null,
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
        estimatedFinancialImpact:
          payload.kpis?.estimatedFinancialImpact || 0,
        averageDelayTime: payload.kpis?.averageDelayTime || 0,
        riskHeatmap: payload.kpis?.riskHeatmap || {
          high: 0,
          medium: 0,
          low: 0,
        },
      },

      agentStatus: disruptions.length ? 'done' : 'monitoring',
    })
  },

  // =====================
  // ALERT FLASH
  // =====================
  alertFlash: false,

  triggerFlash: () => {
    set({ alertFlash: true })
    setTimeout(() => set({ alertFlash: false }), 800)
  },

  // =====================
  // NAVIGATION
  // =====================
  activeTab: 'Control Tower',
  setActiveTab: (tab) => set({ activeTab: tab }),
}))