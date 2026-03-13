import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    MarkerType,
    NodeMouseHandler
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Plus, Save, Trash2 } from 'lucide-react';

interface FunnelVisualizerProps {
    initialData?: { nodes: Node[]; edges: Edge[] } | null;
    onSave: (data: { nodes: Node[]; edges: Edge[] }) => void;
}

const defaultNodes: Node[] = [];
const defaultEdges: Edge[] = [];

export const FunnelVisualizer = ({ initialData, onSave }: FunnelVisualizerProps) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialData?.nodes || defaultNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialData?.edges || defaultEdges);

    useEffect(() => {
        if (initialData) {
            setNodes(initialData.nodes || []);
            setEdges(initialData.edges || []);
        } else {
            setNodes([]);
            setEdges([]);
        }
    }, [initialData, setNodes, setEdges]);

    const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed } }, eds)), [setEdges]);

    const addNode = () => {
        const id = `${Date.now()}`;
        const newNode: Node = {
            id,
            data: { label: 'Nova Etapa' },
            position: { x: Math.random() * 300, y: Math.random() * 300 },
            style: {
                background: '#1a1a1c',
                color: 'white',
                border: '1px solid #CCFF00',
                borderRadius: '8px',
                padding: '10px',
                width: 150,
                textAlign: 'center',
                fontSize: '12px'
            }
        };
        setNodes((nds) => nds.concat(newNode));
    };

    const handleDelete = () => {
        const selectedNodes = nodes.filter(node => node.selected);
        const selectedEdges = edges.filter(edge => edge.selected);

        if (selectedNodes.length === 0 && selectedEdges.length === 0) {
            alert('Selecione uma etapa ou conexão para excluir.');
            return;
        }

        setNodes((nds) => nds.filter((node) => !node.selected));
        setEdges((eds) => eds.filter((edge) => !edge.selected));
    };

    const onNodeDoubleClick: NodeMouseHandler = useCallback((event, node) => {
        const newLabel = prompt('Nome da Etapa:', node.data.label);
        if (newLabel !== null) {
            setNodes((nds) =>
                nds.map((n) => {
                    if (n.id === node.id) {
                        return { ...n, data: { ...n.data, label: newLabel } };
                    }
                    return n;
                })
            );
        }
    }, [setNodes]);

    const handleSave = () => {
        onSave({ nodes, edges });
    };

    return (
        <div className="relative h-[600px] w-full border border-white/10 rounded-xl overflow-hidden bg-[#1A1A1C]">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button
                    onClick={addNode}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-sm transition-colors border border-white/5"
                >
                    <Plus size={16} /> Adicionar Etapa
                </button>
                <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-2 rounded-lg text-sm transition-colors border border-red-500/20"
                >
                    <Trash2 size={16} /> Excluir
                </button>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-brand-lime text-black px-3 py-2 rounded-lg text-sm font-bold hover:bg-white transition-colors"
                >
                    <Save size={16} /> Salvar Funil
                </button>
            </div>
            {nodes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <p className="text-gray-500 text-sm">Nenhuma etapa criada. Adicione etapas para começar.</p>
                </div>
            )}
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeDoubleClick={onNodeDoubleClick}
                fitView
                deleteKeyCode={['Backspace', 'Delete']}
            >
                <Background color="#333" gap={20} />
                <Controls />
            </ReactFlow>
        </div>
    );
};
