import { useState } from 'react';
import axios from 'axios';
import { Search, Loader2, Zap } from 'lucide-react';
import GraphView from './components/GraphView';
import type { Node, Edge } from 'reactflow';
import { MarkerType } from 'reactflow';
import dagre from 'dagre';

// API Response Types
interface ApiNode {
  id: string;
  label: string;
  type: string;
  details?: string;
}

interface ApiEdge {
  source: string;
  target: string;
  label: string;
  details?: string;
}

interface GraphData {
  nodes: ApiNode[];
  edges: ApiEdge[];
}

// Helper for Dagre layout
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 200;
  const nodeHeight = 80;

  dagreGraph.setGraph({ rankdir: 'LR' }); // Left to Right layout

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

function App() {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [expanding, setExpanding] = useState(false);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post<GraphData>('http://localhost:8000/analyze', {
        text: inputText
      });

      const data = response.data;
      console.log(data);

      // Helper to get node style based on type
      const getNodeStyle = (type: string) => {
        const baseStyle = {
          padding: '16px',
          width: 180,
          fontSize: '14px',
          fontWeight: '600',
          textAlign: 'center' as const,
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.4)',
          color: '#ffffff',
        };

        switch (type.toLowerCase()) {
          case 'person':
            return {
              ...baseStyle,
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', // Blue gradient
              border: '2px solid #60a5fa',
              borderRadius: '50px', // Pill shape
            };
          case 'location':
            return {
              ...baseStyle,
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', // Emerald gradient
              border: '2px solid #34d399',
              borderRadius: '8px', // Rounded rect
            };
          case 'event':
            return {
              ...baseStyle,
              background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)', // Rose gradient
              border: '2px solid #fb7185',
              borderRadius: '24px', // Soft rounded
              width: 200,
            };
          default:
            return {
              ...baseStyle,
              background: '#1e293b',
              border: '2px solid #94a3b8',
              borderRadius: '12px',
            };
        }
      };

      // Transform API data to React Flow format
      let initialNodes: Node[] = data.nodes.map((node) => ({
        id: node.id,
        position: { x: 0, y: 0 }, // Position will be set by dagre
        data: { label: node.label },
        style: getNodeStyle(node.type),
        type: 'default'
      }));

      let initialEdges: Edge[] = data.edges.map((edge, index) => ({
        id: `e${index}`,
        source: edge.source,
        target: edge.target,
        type: 'custom',
        data: { label: edge.label, details: edge.details },
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
      }));

      // Apply Dagre layout
      const layouted = getLayoutedElements(initialNodes, initialEdges);

      setNodes(layouted.nodes);
      setEdges(layouted.edges);

    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Failed to analyze text. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };

  const handleExpand = async () => {
    if (!selectedNode) return;

    setExpanding(true);
    try {
      const response = await axios.post<GraphData>('http://localhost:8000/expand', {
        node_label: selectedNode.data.label,
        context: inputText.slice(0, 500) // Pass some context from the original text
      });

      const newData = response.data;
      if (newData.nodes.length === 0) {
        alert("No new information found for this node.");
        return;
      }

      // Helper to get node style based on type
      const getNodeStyle = (type: string) => {
        const baseStyle = {
          padding: '16px',
          width: 180,
          fontSize: '14px',
          fontWeight: '600',
          textAlign: 'center' as const,
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.4)',
          color: '#ffffff',
        };

        switch (type.toLowerCase()) {
          case 'person':
            return {
              ...baseStyle,
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', // Blue gradient
              border: '2px solid #60a5fa',
              borderRadius: '50px', // Pill shape
            };
          case 'location':
            return {
              ...baseStyle,
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', // Emerald gradient
              border: '2px solid #34d399',
              borderRadius: '8px', // Rounded rect
            };
          case 'event':
            return {
              ...baseStyle,
              background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)', // Rose gradient
              border: '2px solid #fb7185',
              borderRadius: '24px', // Soft rounded
              width: 200,
            };
          default:
            return {
              ...baseStyle,
              background: '#1e293b',
              border: '2px solid #94a3b8',
              borderRadius: '12px',
            };
        }
      };

      // Merge new data with existing data

      const existingNodeIds = new Set(nodes.map(n => n.id));
      const existingEdgeIds = new Set(edges.map(e => e.id));

      const newFlowNodes: Node[] = newData.nodes
        .filter(n => !existingNodeIds.has(n.id))
        .map(node => ({
          id: node.id,
          position: { x: 0, y: 0 },
          data: { label: node.label },
          style: getNodeStyle(node.type),
          type: 'default'
        }));

      const newFlowEdges: Edge[] = newData.edges
        .filter(e => !existingEdgeIds.has(`${e.source}-${e.target}`)) // Simple check
        .map((edge, index) => ({
          id: `e-${Date.now()}-${index}`,
          source: edge.source,
          target: edge.target,
          type: 'custom',
          data: { label: edge.label, details: edge.details },
          animated: true,
          style: { stroke: '#94a3b8', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
        }));

      // Combine and re-layout
      const allNodes = [...nodes, ...newFlowNodes];
      const allEdges = [...edges, ...newFlowEdges];

      const layouted = getLayoutedElements(allNodes, allEdges);

      setNodes(layouted.nodes);
      setEdges(layouted.edges);
      setSelectedNode(null); // Deselect after expansion

    } catch (error) {
      console.error("Expansion failed:", error);
      alert("Failed to expand node.");
    } finally {
      setExpanding(false);
    }
  };

  return (
    <div className="h-screen w-full bg-background text-text overflow-hidden flex flex-col relative selection:bg-primary/30">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] opacity-50 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] opacity-50 animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center gap-4 px-8 py-4 border-b border-white/5 bg-white/5 backdrop-blur-xl">
        <div className="p-2.5 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl border border-white/10 shadow-lg shadow-primary/5">
          <Zap className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent tracking-tight">
            Truth Seeker
          </h1>
          <p className="text-xs font-medium text-muted tracking-wide uppercase">AI-Powered Case Analysis</p>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex overflow-hidden">
        {/* Left Panel: Input & Controls */}
        <div className="w-[400px] flex flex-col border-r border-white/5 bg-surface/30 backdrop-blur-md h-full">
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">

            {/* Input Section */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-white/90 flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" />
                Case Evidence
              </label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-accent/50 rounded-xl opacity-0 group-hover:opacity-100 transition duration-500 blur"></div>
                <textarea
                  className="relative w-full h-64 bg-black/40 border border-white/10 rounded-xl p-4 text-sm leading-relaxed text-white/90 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 resize-none placeholder:text-muted/40 transition-all"
                  placeholder="Paste witness statements, police reports, or case details here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="mt-2 w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white py-3 rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing Evidence...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-current" />
                    Analyze Case
                  </>
                )}
              </button>
            </div>

            {/* Selected Node Actions */}
            {selectedNode && (
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 animate-in fade-in slide-in-from-left-4">
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Selected: {selectedNode.data.label}
                </h3>
                <p className="text-xs text-muted mb-3">
                  Expand this node to find more connections from the web.
                </p>
                <button
                  onClick={handleExpand}
                  disabled={expanding}
                  className="w-full bg-white/10 hover:bg-white/20 text-white text-xs py-2 rounded-lg font-medium transition-colors border border-white/10 flex items-center justify-center gap-2"
                >
                  {expanding ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Searching Web...
                    </>
                  ) : (
                    <>
                      <Search className="w-3 h-3" />
                      Expand Node
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-white/5 rounded-xl p-5 border border-white/5">
              <h3 className="text-sm font-semibold text-white/90 mb-3">How it works</h3>
              <ul className="space-y-2.5">
                {[
                  "Paste case details in the text area",
                  "AI extracts entities & relationships",
                  "Click a node to expand with web search",
                  "Explore the interactive graph"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs text-muted/80 leading-relaxed">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/50 border border-white/5">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer/Status */}
          <div className="p-4 border-t border-white/5 bg-black/20 text-xs text-center text-muted/60">
            Powered by Ollama & Llama 3.2
          </div>
        </div>

        {/* Right Panel: Graph Visualization */}
        <div className="flex-1 relative bg-black/20 h-full">
          {nodes.length > 0 ? (
            <>
              <GraphView nodes={nodes} edges={edges} onNodeClick={handleNodeClick} />

              {/* Legend Overlay */}
              <div className="absolute bottom-6 right-6 bg-surface/80 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl flex flex-col gap-3 min-w-[160px]">
                <span className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1">Entity Types</span>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm shadow-blue-500/50" />
                  <span className="text-xs font-medium text-white/90">Person</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-sm shadow-emerald-500/50" />
                  <span className="text-xs font-medium text-white/90">Location</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-md bg-gradient-to-br from-rose-500 to-rose-600 shadow-sm shadow-rose-500/50" />
                  <span className="text-xs font-medium text-white/90">Event</span>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                <div className="relative w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-sm">
                  <Zap className="w-10 h-10 text-white/20" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-medium text-white/80">Ready to Analyze</h3>
                <p className="text-sm text-white/40 max-w-xs mx-auto">
                  Submit your case details to generate the knowledge graph.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
