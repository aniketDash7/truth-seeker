import React, { useEffect } from 'react';
import ReactFlow, {
    type Node,
    type Edge,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    BaseEdge,
    EdgeLabelRenderer,
    getBezierPath,
    type EdgeProps,
    ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom Edge Component
const CustomEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
}: EdgeProps) => {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        fontSize: 12,
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan"
                >
                    <div className="group relative flex items-center justify-center cursor-help">
                        <div className="px-2 py-1 bg-surface/80 backdrop-blur-sm border border-white/10 rounded text-white font-medium shadow-sm hover:bg-surface transition-colors">
                            {data?.label}
                        </div>
                        {data?.details && (
                            <div className="absolute bottom-full mb-2 w-64 p-3 bg-black/90 text-white text-xs rounded-lg shadow-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[1000] text-left leading-relaxed">
                                {data.details}
                            </div>
                        )}
                    </div>
                </div>
            </EdgeLabelRenderer>
        </>
    );
};

const edgeTypes = {
    custom: CustomEdge,
};

interface GraphViewProps {
    nodes: Node[];
    edges: Edge[];
    onNodeClick?: (event: React.MouseEvent, node: Node) => void;
}

const GraphView: React.FC<GraphViewProps> = ({ nodes: initialNodes, edges: initialEdges, onNodeClick }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    return (
        <div className="w-full h-full min-h-[500px] bg-surface rounded-xl border border-white/10 overflow-hidden shadow-2xl">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                edgeTypes={edgeTypes}
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
