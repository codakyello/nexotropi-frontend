"use client"
import React, { useCallback, useState } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    MarkerType,
    Node,
    Edge,
    Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Handle, Position } from 'reactflow';
import { Users, Building2, Package, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface NodeData {
    label: string;
    status?: 'active' | 'at-risk' | 'negotiating';
    description?: string;
    contractValue?: string;
    performanceScore?: number;
    riskLevel?: string;
    lastNegotiation?: string;
    savings?: string;
    contactName?: string;
    contactBusiness?: string;
    contactEmail?: string;
}

interface DetailedNodeData {
    id: string;
    type: string;
    data: NodeData;
}

// Custom Node Components
const VendorNode = ({ data }: { data: NodeData }) => (
    <div className="relative px-6 py-3 bg-green-700 text-white rounded-lg shadow-lg flex items-center gap-2 min-w-[140px]">
        <Handle type="source" position={Position.Right} style={{ background: '#10b981' }} />
        <Handle type="target" position={Position.Bottom} style={{ background: '#10b981' }} />
        <Users className="w-5 h-5" />
        <span className="font-medium">{data.label}</span>
    </div>
);

const SupplierNode = ({ data }: { data: NodeData }) => (
    <div className="relative px-6 py-3 bg-gray-800 text-white rounded-lg shadow-lg flex items-center gap-2 min-w-[140px]">
        <Handle type="target" position={Position.Left} style={{ background: '#6b7280' }} />
        <Handle type="source" position={Position.Bottom} style={{ background: '#f59e0b' }} />
        <Users className="w-5 h-5" />
        <span className="font-medium">{data.label}</span>
    </div>
);

const CompanyNode = ({ data }: { data: NodeData }) => (
    <div className="relative px-8 py-4 bg-[#1A4A7A] text-white rounded-lg shadow-xl flex items-center gap-3 min-w-[180px]">
        <Handle type="target" position={Position.Left} style={{ background: '#10b981' }} />
        <Handle type="source" position={Position.Right} style={{ background: '#6b7280' }} />
        <Handle type="target" position={Position.Top} style={{ background: '#10b981' }} />
        <Building2 className="w-6 h-6" />
        <span className="font-semibold text-lg">{data.label}</span>
    </div>
);

const ProductNode = ({ data }: { data: NodeData }) => {
    const bgColor = data.status === 'active' ? 'bg-green-600' : 'bg-orange-500';
    return (
        <div className={`relative px-6 py-3 ${bgColor} text-white rounded-lg shadow-lg flex items-center gap-2 min-w-[140px]`}>
            <Handle type="target" position={Position.Top} style={{ background: 'white' }} />
            <Package className="w-5 h-5" />
            <span className="font-medium">{data.label}</span>
        </div>
    );
};

const nodeTypes = {
    vendor: VendorNode,
    supplier: SupplierNode,
    company: CompanyNode,
    product: ProductNode,
};

const initialNodes: Node[] = [
    {
        id: '1',
        type: 'company',
        data: {
            label: 'My Company',
            description: 'Main company hub',
        },
        position: { x: 400, y: 300 },
    },
    {
        id: '2',
        type: 'vendor',
        data: {
            label: 'Vendor',
            description: 'Primary vendor',
            status: 'active' as const,
            contractValue: '$250k',
            performanceScore: 92,
            riskLevel: 'Low',
            lastNegotiation: '2 months ago',
            savings: '$25k',
            contactName: 'Jane Smith',
            contactBusiness: 'Vendor Corp',
            contactEmail: 'jane@vendor.com',
        },
        position: { x: 150, y: 100 },
    },
    {
        id: '3',
        type: 'supplier',
        data: {
            label: 'Supplier',
            description: 'Negotiating terms',
            status: 'negotiating' as const,
            contractValue: '$180k',
            performanceScore: 85,
            riskLevel: 'Medium',
            lastNegotiation: '2 weeks ago',
            savings: '$15k',
            contactName: 'Mike Johnson',
            contactBusiness: 'Supplier Inc',
            contactEmail: 'mike@supplier.com',
        },
        position: { x: 650, y: 100 },
    },
    {
        id: '4',
        type: 'product',
        data: {
            label: 'Product X',
            status: 'active' as const,
            description: 'Cybersecurity solutions',
            contractValue: '$386k',
            performanceScore: 96,
            riskLevel: 'Low',
            lastNegotiation: '1 month ago',
            savings: '$38k',
            contactName: 'John Doe',
            contactBusiness: 'Product X',
            contactEmail: 'example@gmail.com',
        },
        position: { x: 200, y: 450 },
    },
    {
        id: '5',
        type: 'product',
        data: {
            label: 'Product Y',
            status: 'at-risk' as const,
            description: 'Cloud infrastructure',
            contractValue: '$420k',
            performanceScore: 68,
            riskLevel: 'High',
            lastNegotiation: '3 months ago',
            savings: '$12k',
            contactName: 'Sarah Wilson',
            contactBusiness: 'Product Y',
            contactEmail: 'sarah@producty.com',
        },
        position: { x: 600, y: 450 },
    },
];

const initialEdges: Edge[] = [
    {
        id: 'e1-2',
        source: '2',
        target: '1',
        sourceHandle: null,
        targetHandle: null,
        label: 'Active contract',
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#10b981', strokeWidth: 2 },
        markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#10b981',
        },
    },
    {
        id: 'e1-3',
        source: '1',
        target: '3',
        sourceHandle: null,
        targetHandle: null,
        label: 'Negotiating',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#6b7280', strokeWidth: 2, strokeDasharray: '5,5' },
        markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#6b7280',
        },
    },
    {
        id: 'e2-4',
        source: '2',
        target: '4',
        sourceHandle: null,
        targetHandle: null,
        label: 'Supplies',
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#10b981', strokeWidth: 2 },
        markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#10b981',
        },
    },
    {
        id: 'e3-5',
        source: '3',
        target: '5',
        sourceHandle: null,
        targetHandle: null,
        label: 'Provides',
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#f59e0b', strokeWidth: 2 },
        markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#f59e0b',
        },
    },
];

export default function NetworkOverview() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedNode, setSelectedNode] = useState<DetailedNodeData | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const filterByStatus = (status: string) => {
        setSelectedStatus(status);
    };

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setSelectedNode({
            id: node.id,
            type: node.type || 'unknown',
            data: node.data as NodeData,
        });
        setIsDialogOpen(true);
    }, []);

    const getStatusBadgeColor = (status?: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-50 text-green-700 border-green-700';
            case 'at-risk':
                return 'bg-orange-50 text-orange-700 border-orange-700';
            case 'negotiating':
                return 'bg-gray-50 text-gray-700 border-gray-700';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-300';
        }
    };

    return (
        <div className="w-full h-screen bg-white">
            {/* Header */}
            <div className="z-10 bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Network overview</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Update your personal details and professional information
                        </p>
                    </div>

                    {/* Filter Dropdown */}
                    <div className="flex items-center gap-3">
                        <select
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={selectedStatus}
                            onChange={(e) => filterByStatus(e.target.value)}
                        >
                            <option value="all">All</option>
                            <option value="suppliers">Suppliers</option>
                            <option value="products">Products</option>
                            <option value="partners">Partners</option>
                            <option value="customers">Customers</option>
                        </select>
                    </div>
                </div>

                {/* Status Badges */}
                <div className="flex justify-end gap-3 mt-4">
                    <button
                        onClick={() => filterByStatus('active')}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${selectedStatus === 'active'
                            ? 'bg-green-50 text-green-700 border-green-700'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-green-700'
                            }`}
                    >
                        <span className="inline-block w-2 h-2 rounded-full bg-green-600 mr-2"></span>
                        Active
                    </button>
                    <button
                        onClick={() => filterByStatus('negotiating')}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${selectedStatus === 'negotiating'
                            ? 'bg-gray-50 text-gray-700 border-gray-700'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-700'
                            }`}
                    >
                        <span className="inline-block w-2 h-2 rounded-full bg-gray-600 mr-2"></span>
                        Negotiating
                    </button>
                    <button
                        onClick={() => filterByStatus('at-risk')}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${selectedStatus === 'at-risk'
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-700'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-yellow-700'
                            }`}
                    >
                        <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                        At risk
                    </button>
                </div>
            </div>

            {/* React Flow Canvas */}
            <div style={{ width: '100%', height: 'calc(100vh - 200px)' }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    nodeTypes={nodeTypes}
                    fitView
                    attributionPosition="bottom-left"
                    minZoom={0.2}
                    maxZoom={4}
                >
                    <Controls />
                    <Background gap={12} size={1} />
                </ReactFlow>
            </div>

            {/* Details Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-xl p-0">
                    <div className="p-6">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <DialogTitle className="text-2xl font-semibold text-gray-900">
                                    {selectedNode?.data.label}
                                </DialogTitle>
                                <p className="text-sm text-gray-600 mt-1">
                                    {selectedNode?.data.description}
                                </p>
                            </div>
                        </div>

                        {selectedNode?.data.status && (
                            <div className="mt-4">
                                <span className={`inline-block px-4 py-1.5 rounded-md text-sm font-medium border ${getStatusBadgeColor(selectedNode.data.status)}`}>
                                    {selectedNode.data.status.charAt(0).toUpperCase() + selectedNode.data.status.slice(1)}
                                </span>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-6 mt-6">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Contract Value</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {selectedNode?.data.contractValue || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Performance score</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {selectedNode?.data.performanceScore || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Risk Level</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {selectedNode?.data.riskLevel || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Last Negotiation</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {selectedNode?.data.lastNegotiation || 'N/A'}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm text-gray-500 mb-1">Savings</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {selectedNode?.data.savings || 'N/A'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Contact</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Name</p>
                                    <p className="text-base text-gray-900">
                                        {selectedNode?.data.contactName || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Business</p>
                                    <p className="text-base text-gray-900">
                                        {selectedNode?.data.contactBusiness || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Email</p>
                                    <p className="text-base text-gray-900">
                                        {selectedNode?.data.contactEmail || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button className="w-full mt-6 bg-[#1A4A7A] hover:bg-[#153a61] text-white py-3 rounded-lg font-medium transition-colors">
                            View details
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}