
"use client"
import Image from "next/image";
import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';


interface Paper {
  paper_id: string;
  title: string;
  abstract: string;
  authors: string[];
  url: string;
  journal: string;
  year: number;
}

interface Result {
  papers: Paper[];
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [description, setDescription] = useState("");
  const [useDescription, setUseDescription] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [openAbstractIndex, setOpenAbstractIndex] = useState<number | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [initialSearch, setInitialSearch] = useState(searchParams.get("search"));


  useEffect(() => {
    console.log("NGROK",process.env.NEXT_PUBLIC_NGROK_URL)
    if (initialSearch) {
      console.log('Initial Search:', initialSearch);
      setUseDescription(true);
      setDescription(initialSearch);
    }
  }, [initialSearch]);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetchData();
  };

  const fetchData = async () => {
    try {
      const requestBody = new FormData();
      const apiURL = process.env.NEXT_PUBLIC_NGROK_URL;
      
      // Set search type based on whether a file is uploaded or not
      if (uploadedFile) {
        requestBody.append('search_type', 'attachment');
        requestBody.append('file', uploadedFile); // Attach the PDF file
      } else {
        requestBody.append('search_type', useDescription ? 'description' : 'keyword');
        requestBody.append('query', useDescription ? description : query);
      }
      console.log('Request Body:', requestBody);
      const response = await fetch(`${apiURL}/query`, {
        method: 'POST',
        body: requestBody, // Send as FormData to handle file upload
      });
      const data = await response.json();
      setResult(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const toggleAbstract = (index: number) => {
    setOpenAbstractIndex(openAbstractIndex === index ? null : index);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFile(e.target.files[0]);
      setQuery("");
      setDescription("");
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
  };

  const viewPaper = async (id: string, url:string) => {
    const apiURL = process.env.NEXT_PUBLIC_NGROK_URL;
    setIndexing(true);
    try {
      const response = await fetch(`${apiURL}/index_paper`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ "pdf_url": url }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to index the paper');
      }
  
      // Navigate to the PDF viewer after successful indexing
      setIndexing(true);
      router.push(`/pdf-viewer?id=${encodeURIComponent(id)}`);
      setIndexing(false);
    } catch (error) {
      console.error('Error indexing paper:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-pink-200 to-orange-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl text-black font-bold mb-3">Smart Research AI</h1>
      <h3 className="md:text-2xl sm:text-xl mb-6 text-center">
        Quickly Discover the most relevant research papers on any topic <br />
        or provide more context with an abstract, description, or Paper
      </h3>

      {/* Search Box */}
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="relative flex flex-col items-center border border-gray-300 rounded-xl shadow-md bg-white p-2 hover:border-2 hover:border-pink-500">
          {!uploadedFile ? (
            useDescription ? (
              <textarea
                placeholder="Enter detailed description or abstract..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-none p-3 text-black border-none outline-none rounded-lg"
                rows={3}
                required
              />
            ) : (
              <input
                type="text"
                placeholder="Search here..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full p-3 text-black border-none outline-none rounded-lg"
                required
              />
            )
          ) : (
            <div className="w-full bg-gray-100 p-3 rounded-lg flex items-center space-x-2">
              <Image src="/file_icon.svg" alt="File" width={24} height={24} />
              <span className="text-black">{uploadedFile.name}</span>
              <button onClick={removeUploadedFile} className="absolute right-3 top-2 text-red-500 hover:text-red-700 text-sm font-bold">x</button>
            </div>
          )}

          {/* Bottom Bar (Buttons + Search Icon) */}
          <div className="w-full flex justify-between items-center p-2">
            {/* Left Side Buttons */}
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setUseDescription(!useDescription)}
                className="text-xs bg-indigo-500 text-white px-3 py-1 rounded-lg hover:bg-indigo-600 transition disabled:opacity-50"
                disabled={!!uploadedFile}
              >
                {useDescription ? "Keyword" : "Description"}
              </button>
              <label className="text-xs bg-gray-200 px-3 py-1 rounded-lg hover:bg-gray-300 transition cursor-pointer">
                Upload Paper
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            {/* Search Icon (Right Side) */}
            <div>
            <button type="button"
            onClick={() => {
              setQuery("");
              setDescription("");
              setUseDescription(false);
              setUploadedFile(null);
              setResult(null);
              setInitialSearch(null);
              router.push(`/`);
            }}
             className="p-2 bg-transparent hover:bg-gray-100 rounded-lg">
              <Image src="/reset-icon.svg" alt="Reset" width={24} height={24} priority />
            </button>
            <button type="submit" className="p-2 bg-transparent hover:bg-gray-100 rounded-lg">
              <Image src="/search_icon.svg" alt="Search" width={24} height={24} priority />
            </button>
            </div>
          </div>
        </div>
      </form>

      {loading && (
        <div className="mt-6 w-full max-w-2xl space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="animate-pulse bg-gray-300 h-20 rounded-lg"></div>
          ))}
        </div>
      )}

      {result && result.papers && result.papers.length > 0 && !loading && !indexing &&(
        <div className="mt-6 p-4 rounded-lg w-full max-w-2xl">
          <ul className="space-y-4">
            {result.papers.map((paper, index) => (
              <li key={index} className="bg-purple-50 p-4 border rounded-lg">
                <a
                  href={paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="md:text-xl sm:text-lg font-bold text-purple-600 hover:underline"
                >
                  {paper.title}
                </a>
                <p className="text-sm mt-1">
                  <span className="font-semibold">Authors:</span> {paper.authors}
                </p>

                <p className="text-sm mt-1">
                  <span className="font-semibold">Year:</span> {paper.year}
                  </p>

                <p className="text-sm mt-1">
                  <span className="font-semibold">Journal:</span> {paper.journal}
                </p>

                <div className="flex items-center space-x-4 mt-2">
                  <button
                    onClick={() => toggleAbstract(index)}
                    className="bg-white text-indigo-500 py-1 px-3 rounded-lg hover:text-indigo-600 cursor-pointer border border-indigo-500"
                  >
                    {openAbstractIndex === index ? "Hide Abstract" : "Show Abstract"}
                  </button>
                  <button
                    onClick={() => viewPaper(paper.paper_id, paper.url)}
                    className="bg-indigo-500 text-white py-1 px-3 rounded-lg hover:bg-indigo-600"
                  >
                    View Paper
                  </button>
                </div>

                {openAbstractIndex === index && (
                  <p className="mt-2 text-gray-700">{paper.abstract}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {indexing && (
        <div className="mt-6 text-gray-700">Indexing paper... Please wait.</div>
      )}

      {result && (!result.papers || result.papers.length === 0) && (
        <p className="mt-6 text-gray-500">No results found.</p>
      )}
    </div>
  );
}