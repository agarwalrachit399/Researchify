"use client"
import { FormEvent, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Document, Page, pdfjs } from "react-pdf";
import ReactMarkdown from 'react-markdown';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';


pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();


interface Message {
  text: string;
  sender: "user" | "bot";
}

export default function PdfViewer() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [greetingVisible, setGreetingVisible] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1); 
  const [scale, setScale] = useState(1.0);
  const [paperId, setPaperId] = useState<string | null>(null);

  useEffect(() => {
  const apiURL = process.env.NEXT_PUBLIC_NGROK_URL
    setPdfUrl(`${apiURL}/get_pdf`);
   
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
      setPaperId(id);
    }
  }, []);

  const viewGraph = async () => {
    if (paperId) {
      if (typeof paperId === 'string') {
        router.push(`/reference-graph?id=${encodeURIComponent(paperId)}`);
      }
    }
  };

  const viewSimilarPapers = async () => {
    if (paperId) {
      const apiURL = process.env.NEXT_PUBLIC_NGROK_URL
      const response = await fetch(`${apiURL}/get_abstract?id=${paperId}`)
      console.log(response) 
      const data = await response.json();
      try {
        if (data.abstract) {
          router.push(`/?search=${encodeURIComponent(data.abstract)}`);
        }
      }
      catch (error) {
        console.error("Error fetching abstract:", error);
      }
    }
  };


  const handleQuerySubmit = async (e: FormEvent) => {
    const apiURL = process.env.NEXT_PUBLIC_NGROK_URL
    e.preventDefault();
    if (!query.trim()) return;

    const newMessage: Message = { text: query, sender: "user" };
    setMessages((prev) => [...prev, newMessage]);
    setQuery('');
    setLoading(true);
    setGreetingVisible(false);

    try {
      const response = await fetch(`${apiURL}/search_paper`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await response.json();

      if (response.ok && data.answer) {
        setMessages((prev) => [...prev, { text: data.answer, sender: "bot" }]);
      } else {
        setMessages((prev) => [...prev, { text: "Sorry, I couldn't find an answer.", sender: "bot" }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { text: "An error occurred. Please try again.", sender: "bot" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-row bg-indigo-50 p-4 space-x-4">
      {/* Left Panel - Chat UI with cards */}
      <div className="w-1/2 flex flex-col space-y-4">
     
        <div className="flex-grow bg-gradient-to-b from-purple-100 via-pink-200 to-orange-100 shadow-lg rounded-lg p-4 h-[60vh]">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">
          Home
        </button>
          {greetingVisible ? (
            <div className="flex flex-col justify-center items-center h-full">
              <h1 className="md:text-xl sm:text-lg text-sm font-bold text-indigo-600 mb-4">Hello! How can I assist you with this paper?</h1>
              <form onSubmit={handleQuerySubmit} className="w-full max-w-md relative">
                <input
                  type="text"
                  placeholder="Type your question..."
                  className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={loading}
                />
                <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full" disabled={loading}>
                  <img src="/send-icon.svg" alt="Send" className="w-6 h-6" />
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col h-full justify-between">
              <div className="overflow-y-auto space-y-2">
              {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`px-4 py-2 rounded-lg max-w-fit overflow-auto ${msg.sender === "user" ? "bg-pink-500 text-white ml-auto" : "bg-white text-black"}`}
              >
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            ))}
                {loading && (
                  <div className="px-4 py-2 rounded-lg max-w-fit bg-white text-black">
                    <span className="loading-dots"></span>
                  </div>
                )}
              </div>
              <form onSubmit={handleQuerySubmit} className="w-full relative">
                <input
                  type="text"
                  placeholder="Type your question..."
                  className="w-full px-4 py-2 mt-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={loading}
                />
                <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full" disabled={loading}>
                  <img src="/send-icon.svg" alt="Send" className="w-6 h-6" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Cards below chat UI */}
        <div className="flex space-x-4">
          <div
           onClick={viewGraph}
           className="w-1/2 bg-white p-4 rounded-lg shadow-md text-center border border-indigo-400 hover:bg-indigo-200 cursor-pointer">
            <h2 className="font-bold text-indigo-600">Visualize Citation Graph</h2>
          </div>
          <div 
          onClick={viewSimilarPapers}
          className="w-1/2 bg-white p-4 rounded-lg shadow-md text-center border border-indigo-400 hover:bg-indigo-200 cursor-pointer">
            <h2 className="font-bold text-indigo-600">Search Similar Papers</h2>
          </div>
        </div>
      </div>

      {/* Right Panel - PDF Viewer */}
      <div className="w-1/2 flex flex-col p-4">
        <div className="w-full h-[95vh] rounded-lg shadow-md overflow-hidden bg-white flex flex-col items-center">
          {pdfUrl ? (
            <>
              <Document
                file={pdfUrl}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                className="w-full h-full flex justify-center overflow-auto"
              >
                <Page pageNumber={pageNumber} width={600} scale={scale} />
              </Document>
              {numPages !== null && (
                <div className="mt-2 flex w-full justify-between px-4 py-2 bg-gray-100 border-t border-gray-200">
                  <button onClick={() => { setPageNumber(1); setScale(1.0); }}>
                    <img src="/home-icon.svg" alt="Home" className="w-7 h-7" />
                  </button>
                  <div className='flex space-x-2 items-center'>
                    <button onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))} disabled={pageNumber <= 1}>
                      <img src="/previous-icon.svg" alt="Previous" className="w-4 h-4" />
                    </button>
                    <span className="text-black text-xs font-semibold">
                      {pageNumber}/{numPages}
                    </span>
                    <button onClick={() => setPageNumber((prev) => Math.min(prev + 1, numPages))} disabled={pageNumber >= numPages}>
                      <img src="/next-icon.svg" alt="Next" className="w-4 h-4" />
                    </button>
                  </div>
                  <div className='flex space-x-2'>
                    <button onClick={() => setScale((prev) => Math.min(prev + 0.1, 2))}>
                      <img src="/zoom-in-icon.svg" alt="Zoom In" className="w-6 h-6" />
                    </button>
                    <button onClick={() => setScale((prev) => Math.max(prev - 0.1, 0.5))}>
                      <img src="/zoom-out-icon.svg" alt="Zoom Out" className="w-7 h-7" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-red-600">No PDF available.</p>
          )}
        </div>
      </div>

      {/* Loading Animation CSS */}
      <style jsx>{`
        .loading-dots::after {
          content: " ";
          display: inline-block;
          width: 1em;
          text-align: left;
          animation: dots 1.5s steps(3, end) infinite;
        }

        @keyframes dots {
          0% { content: "."; }
          33% { content: ".."; }
          66% { content: "..."; }
        }
      `}</style>
    </div>
  );
}
