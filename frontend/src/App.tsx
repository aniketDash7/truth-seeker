import { useState } from 'react';
import axios from 'axios';
import { Search, Loader2, Zap } from 'lucide-react';
import GraphView from './components/GraphView';
import type { Node, Edge } from 'reactflow';

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
}

interface GraphData {
  nodes: ApiNode[];
  edges: ApiEdge[];
}

function App() {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post<GraphData>('http://localhost:8000/analyze', {
        text: inputText
      });

      const data = response.data;
      console.log(data);

      // Transform API data to React Flow format
      // Simple layout strategy: Random positions for now, or we could use dagre/elk later
      const newNodes: Node[] = data.nodes.map((node, index) => ({
        id: node.id,
        position: { x: Math.random() * 500, y: Math.random() * 500 },
        data: { label: node.label },
        style: {
          background: '#1e293b',
          color: '#f8fafc',
          border: '1px solid #3b82f6',
          borderRadius: '8px',
          padding: '10px',
          width: 150,
          fontSize: '12px',
          textAlign: 'center',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
        },
        type: 'default'
      }));
      console.log(newNodes);
      const newEdges: Edge[] = data.edges.map((edge, index) => ({
        id: `e${index}`,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        animated: true,
        style: { stroke: '#94a3b8' },
        labelStyle: { fill: '#f8fafc', fontSize: 10 },
      }));

      setNodes(newNodes);
      setEdges(newEdges);

    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Failed to analyze text. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col gap-6">
      {/* Header */}
      <header className="flex items-center gap-3 pb-6 border-b border-white/10">
        <div className="p-2 bg-primary/20 rounded-lg">
          <Zap className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-muted bg-clip-text text-transparent">
            Truth Seeker
          </h1>
          <p className="text-sm text-muted">AI-Powered Case Analysis & Visualization</p>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-surface p-4 rounded-xl border border-white/10 shadow-lg">
            <label className="block text-sm font-medium text-muted mb-2">
              Case Brief / Evidence
            </label>
            <textarea
              className="w-full h-64 bg-background/50 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none placeholder:text-muted/30"
              placeholder="Paste the case details, witness statements, or event description here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !inputText}
              className="mt-4 w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Analyze Case
                </>
              )}
            </button>
          </div>

          <div className="bg-surface/50 p-4 rounded-xl border border-white/5">
            <h3 className="text-sm font-medium text-white mb-2">How it works</h3>
            <ul className="text-xs text-muted space-y-2 list-disc pl-4">
              <li>Paste any text description of an event or case.</li>
              <li>Local AI (Ollama) extracts key entities and relationships.</li>
              <li>Interactive graph visualizes the connections.</li>
            </ul>
          </div>
        </div>

        {/* Graph Panel */}
        <div className="lg:col-span-2 h-[600px] lg:h-auto">
          {nodes.length > 0 ? (
            <GraphView nodes={nodes} edges={edges} />
          ) : (
            <div className="w-full h-full min-h-[400px] bg-surface/30 rounded-xl border border-white/10 flex flex-col items-center justify-center text-muted gap-4 border-dashed">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <Zap className="w-8 h-8 opacity-20" />
              </div>
              <p>No analysis data yet. Submit a case to visualize.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
