import { useStore } from "../../store/useStore";

export default function GraphView() {
  const graph = useStore((s) => s.graph);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Live Network Graph</h2>

      <div style={styles.graphArea}>
        {/* ROUTES */}
        {graph.routes.map((route, i) => (
          <div key={i} style={styles.route}>
            {route.from} → {route.to}
          </div>
        ))}

        {/* NODES */}
        <div style={styles.nodes}>
          {graph.nodes.map((node) => {
            const isDisrupted = graph.disruptions?.some(
              (d) => d.nodeId === node.id
            );

            return (
              <div
                key={node.id}
                style={{
                  ...styles.node,
                  background: isDisrupted ? "#ff4d4f" : "#22c55e",
                }}
              >
                <div style={styles.nodeTitle}>{node.name}</div>
                <div style={styles.nodeSub}>{node.type}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: 20,
    color: "white",
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  graphArea: {
    border: "1px solid #333",
    borderRadius: 10,
    padding: 20,
    minHeight: 400,
    background: "#0f172a",
  },
  route: {
    fontSize: 12,
    color: "#60a5fa",
    marginBottom: 5,
  },
  nodes: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 20,
  },
  node: {
    padding: 10,
    borderRadius: 8,
    width: 140,
    color: "white",
    transition: "0.3s",
  },
  nodeTitle: {
    fontWeight: "bold",
  },
  nodeSub: {
    fontSize: 12,
    opacity: 0.8,
  },
};