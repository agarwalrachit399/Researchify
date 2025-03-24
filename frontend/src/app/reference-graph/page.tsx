"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Network } from "vis-network/standalone";

type Node = {
  id: string | number;
  label: string;
  group?: string;
  data: {
    title: string;
    semantic_scholar_url: string;
    year: number;
    citationCount: number;
    authors: string;
    journal_name: string;
  };
  title: string;
};

type Edge = {
  from: string | number;
  to: string | number;
};

export default function ReferenceGraph() {
  const [graphData, setGraphData] = useState<{ nodes: Node[]; edges: Edge[] }>({
    nodes: [],
    edges: [],
  });
  const [loading, setLoading] = useState(true);
  const graphRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const networkInstance = useRef<Network | null>(null);
  const router = useRouter();
  const apiURL = process.env.NEXT_PUBLIC_NGROK_URL;


  useEffect(() => {
    const fetchGraphData = async () => {
      try {
          const urlParams = new URLSearchParams(window.location.search);
          const paperId = urlParams.get("id");
        if (!paperId) return;
          setLoading(true);
       
          const response = await fetch(`${apiURL}/graph?id=${paperId}`);
          const data = await response.json();

          const nodes = data.nodes.map((node: any) => ({
            id: node.id,
            label: node.label.title || node.id,
            group: node.id === paperId ? "main" : "reference",
            data: node.label,
            title: node.label.title,
          }));

          const edges = data.edges.map((edge: any) => ({
            from: edge.from,
            to: edge.to,
          }));

          setGraphData({ nodes, edges });
          setLoading(false);
      
      } catch (error) {
        console.error("Error fetching graph data:", error);
        setLoading(false);
      }
    };

    fetchGraphData();
  }, []);

  useEffect(() => {
    if (graphRef.current && graphData.nodes.length > 0) {
      const network = new Network(graphRef.current, graphData, {
        nodes: {
          shape: "dot",
          size: 15,
          font: { size: 0, color: "#333" },
        },
        edges: {
          arrows: "to",
          color: "#90a1b9",
          smooth: true,
        },
        groups: {
          main: { color: { background: "#c27aff", border: "#a664dc",
            hover: {
              border: '#a664dc',
              background: '#ce94ff'
            }
           }, size: 20,borderWidth: 2 },
          reference: { color: { background: "#7c86ff", border: "#575fd1",
            hover: {
              border: '#575fd1',
              background: '#979eff'
            }
           }, borderWidth: 2 },
        },
        physics: {
          enabled: true,
          barnesHut: {
            gravitationalConstant: -5000,
            centralGravity: 0.5,
            springLength: 120,
          },
        },
        interaction: {
          hover: true, 
        },
      });

      // Handle node click to highlight connected edges
      network.on("click", function (params) {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          const node = graphData.nodes.find((n) => n.id === nodeId);
          setSelectedNode(node || null);

          const updatedNodes = graphData.nodes.map((n) => ({
            ...n, 
            color: n.id === nodeId ? "#f94144" : n.group === "main" ? "#c27aff" : "#7c86ff",
            borderWidth: n.id === nodeId ? 4 : 2
          }))

          // Find edges connected to the selected node
          const updatedEdges = graphData.edges.map((edge) => ({
            ...edge,
            color: edge.from === nodeId || edge.to === nodeId ? "black" : "#90a1b9",
          }));

          network.setData({ nodes: updatedNodes, edges: updatedEdges });
        }
      });

      networkInstance.current = network;
    }
  }, [graphData]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-indigo-50 p-8 relative">
      {/* Navigation Buttons */}
      <div className="flex flex-row justify-between w-full">
        <div className="space-x-4">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
        >
          Back
        </button>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
        >
          Home
        </button>
        </div>

      <h1 className="text-2xl font-bold text-indigo-800 mb-6">
        Reference Graph Visualization
      </h1>
      <p></p>
      </div>
      {loading ? (
        <div className="w-full h-[70vh] bg-gray-200 animate-pulse rounded-lg" />
      ) : (
        <div
          className="w-full h-[70vh] bg-gradient-to-b from-purple-100 via-pink-200 to-orange-100 rounded-lg shadow-lg"
          ref={graphRef}
        />
      )}
      {!loading && selectedNode && (
        <div className="mt-4 p-4 bg-white rounded-lg w-1/2 border-2 border-pink-300">
          <a
            href={selectedNode.data.semantic_scholar_url}
            className="text-xl font-medium text-pink-600 hover:underline"
          >
            <strong>{selectedNode.label}</strong>
          </a>
          <p className="text-sm">
            Authors: <strong>{selectedNode.data.authors}</strong>
          </p>
          <p className="text-sm">
            Journal: <strong>{selectedNode.data.journal_name}</strong>
          </p>
          <p className="text-sm">
            Publication Year: <strong>{selectedNode.data.year}</strong>
          </p>
          <p className="text-sm">
            Citation Count: <strong>{selectedNode.data.citationCount}</strong>
          </p>
        </div>
      )}
    </div>
  );
}
