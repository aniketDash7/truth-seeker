import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
    type Node,
    type Edge,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    ConnectionMode,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface GraphViewProps {
    nodes: Node[];
    edges: Edge[];
}

const GraphView: React.FC<GraphViewProps> = ({ nodes: initialNodes, edges: initialEdges }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    return (
        <div style={{ width: '100%', height: '500px' }}className="w-full h-full min-h-[500px] bg-surface rounded-xl border border-white/10 overflow-hidden shadow-2xl">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                attributionPosition="bottom-right"
                connectionMode={ConnectionMode.Loose}
                proOptions={{ hideAttribution: true }}
            >
                <Background color="#94a3b8" gap={20} size={1} style={{ opacity: 0.1 }} />
                <Controls className="bg-surface border-white/10 fill-white text-white" />
            </ReactFlow>
        </div>
    );
};

export default GraphView;
