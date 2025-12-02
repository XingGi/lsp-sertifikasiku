// frontend/src/features/bpr/BPRDesignerPage.jsx

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ReactFlow, useNodesState, useEdgesState, addEdge, Background, Controls, MiniMap, Panel } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { Button, Title, Text, Badge } from "@tremor/react";
import { FiPlus, FiSave, FiArrowLeft, FiSend, FiCheckSquare, FiGitMerge, FiClock } from "react-icons/fi";
import { toast } from "sonner";
import apiClient from "../../../api/api";
import ProcessStepNode from "./components/ProcessStepNode";
import NodeRiskSidebar from "./components/NodeRiskSidebar";
import ConfirmationDialog from "../../../components/common/ConfirmationDialog";
import { useAuth } from "../../../context/AuthContext";

const nodeTypes = {
  processStep: ProcessStepNode,
};

const initialNodes = [{ id: "1", type: "processStep", position: { x: 250, y: 5 }, data: { label: "Mulai Proses" } }];

function BPRDesignerPage() {
  const { user } = useAuth();
  const { docId } = useParams();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [docInfo, setDocInfo] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  const [statusConfirm, setStatusConfirm] = useState({ isOpen: false, newStatus: null });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Logic Permission: Admin atau User dengan permission 'approve_bpr'
  const canApprove = user?.role === "Admin" || user?.permissions?.includes("approve_bpr");

  const fetchDiagram = async () => {
    try {
      const res = await apiClient.get(`/bpr/documents/${docId}`);
      setDocInfo(res.data);
      if (res.data.nodes && res.data.nodes.length > 0) {
        setNodes(res.data.nodes);
        setEdges(res.data.edges);
      } else {
        setNodes(initialNodes);
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat diagram.");
    }
  };

  useEffect(() => {
    fetchDiagram();
  }, [docId]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, animated: true, type: "smoothstep" }, eds)), [setEdges]);

  const onAddNode = () => {
    const id = `node_${Date.now()}`;
    const newNode = {
      id,
      type: "processStep",
      position: { x: 250, y: 200 },
      data: { label: `Langkah Baru`, riskCount: 0 },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const onNodeLabelChange = useCallback(
    (nodeId, newLabel) => {
      setNodes((nds) => nds.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, label: newLabel } } : node)));
      setSelectedNode((prev) => (prev && prev.id === nodeId ? { ...prev, data: { ...prev.data, label: newLabel } } : prev));
    },
    [setNodes]
  );

  const onNodeClick = (event, node) => {
    if (!node.db_id) toast.warning("Simpan diagram dulu untuk menambah risiko.");
    setSelectedNode(node);
    setIsSidebarOpen(true);
  };

  const onSave = async () => {
    setIsSaving(true);
    try {
      const payload = { nodes, edges };
      await apiClient.post(`/bpr/documents/${docId}/save-diagram`, payload);
      toast.success("Diagram berhasil disimpan!");
      const res = await apiClient.get(`/bpr/documents/${docId}`);
      if (res.data.nodes) {
        setNodes((currentNodes) =>
          currentNodes.map((n) => {
            const savedNode = res.data.nodes.find((sn) => sn.id === n.id);
            return savedNode ? { ...n, db_id: savedNode.db_id } : n;
          })
        );
      }
    } catch (error) {
      toast.error("Gagal menyimpan diagram.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmStatus = async () => {
    const { newStatus } = statusConfirm;
    if (!newStatus) return;
    setIsUpdatingStatus(true);
    try {
      await apiClient.put(`/bpr/documents/${docId}/status`, { status: newStatus });
      toast.success(`Status diubah menjadi ${newStatus}`);
      const res = await apiClient.get(`/bpr/documents/${docId}`);
      setDocInfo(res.data);
      setStatusConfirm({ isOpen: false, newStatus: null });
    } catch (error) {
      toast.error("Gagal mengubah status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (!docInfo) return <div className="flex h-screen items-center justify-center text-slate-500">Memuat Designer...</div>;

  const isReadOnly = docInfo.status === "Final" || docInfo.status === "Archived";

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 overflow-hidden">
      {/* --- HEADER TOOLBAR (MODERN) --- */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm z-10">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Button variant="light" icon={FiArrowLeft} onClick={() => navigate("/addons/bpr")} className="rounded-full p-2 hover:bg-slate-100 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded hidden sm:block">
                <FiGitMerge />
              </div>
              <Title className="text-lg font-bold text-slate-800 truncate">{docInfo.name}</Title>
              <Badge size="xs" className="rounded-md px-2 shrink-0" color={docInfo.status === "Final" ? "emerald" : docInfo.status === "In Review" ? "orange" : "slate"}>
                {docInfo.status}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
              <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                <FiClock size={10} /> v{docInfo.version || 1}
              </span>
              <span>•</span>
              <span>{nodes.length} Langkah</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 items-center w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {!isReadOnly && (
            <>
              <Button variant="secondary" className="rounded-md whitespace-nowrap" color="emerald" icon={FiPlus} onClick={onAddNode} size="xs">
                Langkah
              </Button>
              <Button variant="secondary" className="rounded-md whitespace-nowrap" color="blue" icon={FiSave} loading={isSaving} onClick={onSave} size="xs">
                Simpan
              </Button>
              <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>
            </>
          )}

          {/* Workflow Actions */}
          {docInfo.status === "Draft" && (
            <Button icon={FiSend} size="xs" className="rounded-md whitespace-nowrap" color="orange" onClick={() => setStatusConfirm({ isOpen: true, newStatus: "In Review" })}>
              Submit Review
            </Button>
          )}
          {docInfo.status === "In Review" && canApprove && (
            <Button icon={FiCheckSquare} className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600 whitespace-nowrap" size="xs" onClick={() => setStatusConfirm({ isOpen: true, newStatus: "Final" })}>
              Approve
            </Button>
          )}
        </div>
      </div>

      {/* --- CANVAS AREA --- */}
      <div className="flex-grow relative flex">
        <div className="flex-grow h-full bg-slate-50">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            nodesDraggable={!isReadOnly}
            nodesConnectable={!isReadOnly}
            elementsSelectable={!isReadOnly}
            snapToGrid={true}
            snapGrid={[15, 15]}
          >
            <Controls showInteractive={false} className="bg-white shadow-md border border-gray-200 rounded-lg overflow-hidden m-4" />
            <MiniMap style={{ border: "1px solid #e2e8f0", borderRadius: "8px", margin: "10px" }} nodeColor="#3b82f6" maskColor="rgba(240, 242, 245, 0.7)" />
            <Background color="#cbd5e1" gap={20} size={1} variant="dots" />
            <Panel position="top-center" className="bg-white/90 px-4 py-1.5 rounded-md shadow-sm border border-gray-200 backdrop-blur text-xs text-slate-500 font-medium mt-4">
              Klik Node untuk edit detail. Tarik garis (handle) untuk menghubungkan.
            </Panel>
          </ReactFlow>
        </div>

        {/* Sidebar */}
        <NodeRiskSidebar
          isOpen={isSidebarOpen}
          onClose={() => {
            setIsSidebarOpen(false);
            setSelectedNode(null);
          }}
          selectedNode={selectedNode}
          onDataChange={fetchDiagram}
          onLabelChange={onNodeLabelChange}
        />
      </div>

      <ConfirmationDialog
        isOpen={statusConfirm.isOpen}
        onClose={() => setStatusConfirm({ ...statusConfirm, isOpen: false })}
        onConfirm={handleConfirmStatus}
        title="Konfirmasi Status"
        message={`Ubah status dokumen menjadi "${statusConfirm.newStatus}"?`}
        isLoading={isUpdatingStatus}
      />
    </div>
  );
}

export default BPRDesignerPage;
