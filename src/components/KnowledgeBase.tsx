import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Plus, Trash2, Calendar, Database, CheckCircle, RefreshCcw, BookOpen, AlertCircle, FilePlus, ChevronRight } from 'lucide-react';
import { TRANSLATIONS, LanguageKey } from '../data/translations';
import { UploadedDoc } from '../types';

interface KnowledgeBaseProps {
  language: LanguageKey;
  onDocumentAdded: () => void;
}

export default function KnowledgeBase({ language, onDocumentAdded }: KnowledgeBaseProps) {
  const t = TRANSLATIONS[language];
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Selection state for active memory loading
  const [selectedDoc, setSelectedDoc] = useState<UploadedDoc | null>(null);

  // Form State
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

  const handleDocClick = (doc: UploadedDoc) => {
    setSelectedDoc(doc);
    setTitle(doc.title);
    setContent(doc.content);
  };

  const handleClearSelection = () => {
    setSelectedDoc(null);
    setTitle('');
    setContent('');
  };

  // Fetch current documents from backend
  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/documents');
      if (!response.ok) {
        throw new Error('Failed to retrieve policy G.O. circulars database');
      }
      const data = await response.json();
      setDocuments(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Connecting to server failed.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    setUploadSuccess(false);
    setError(null);

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedDoc?.id, title, content }),
      });

      if (!response.ok) {
        throw new Error('Failed to load document into context memory.');
      }

      setTitle('');
      setContent('');
      setSelectedDoc(null);
      setUploadSuccess(true);
      
      // Refresh documents
      await fetchDocuments();
      onDocumentAdded();

      setTimeout(() => setUploadSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Server upload failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle File Upload/Drag and Drop
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setTitle(file.name.replace(/\.[^/.]+$/, "")); // Strip extension
        setContent(text);
      }
    };
    reader.readAsText(file);
  };

  // Delete Document
  const handleDelete = async (id: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Could not delete circular.');
      }
      fetchDocuments();
      onDocumentAdded();
    } catch (err: any) {
      setError(err.message || 'Failed to remove document.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-transparent" id="kb-root">
      
      {/* Upload and Input Form */}
      <div className="lg:col-span-7">
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-xs border border-earth-100 space-y-6">
          <div className="flex justify-between items-start flex-wrap gap-3 border-b border-stone-100 pb-3 mb-4">
            <div className="space-y-1 text-left flex-1 min-w-[200px]">
              <h2 className="text-lg md:text-xl font-display font-bold text-crop-900 tracking-tight flex items-center gap-2">
                <FilePlus className="w-5.5 h-5.5 text-crop-600 shrink-0" />
                {selectedDoc ? "✏️ Loaded Circular Editor" : t.ragHeader}
              </h2>
              <p className="text-xs text-stone-500 leading-relaxed">
                {selectedDoc ? "You are viewing/modifying an active G.O. policy. Click 'Reset Form' to start a new document write." : t.ragDesc}
              </p>
            </div>
            {selectedDoc && (
              <button
                type="button"
                onClick={handleClearSelection}
                className="px-2.5 py-1 text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded text-[10px] font-mono font-bold tracking-tight uppercase cursor-pointer shrink-0"
              >
                Reset Form ✕
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Title */}
            <div className="space-y-1.5">
              <label htmlFor="doc-title-in" className="text-[11px] font-mono font-bold text-stone-600 uppercase tracking-wider pl-1">
                {t.docTitle}
              </label>
              <input
                id="doc-title-in"
                type="text"
                className="w-full bg-stone-50 border border-crop-200 rounded-lg py-2.5 px-4 text-xs focus:ring-2 focus:ring-crop-600 focus:outline-none"
                placeholder="e.g. Telangana Rain-fed Compensation GO 103"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Drag Drop or Upload Trigger */}
            <div className="p-4 border-2 border-dashed border-crop-200 hover:border-crop-600 rounded-lg bg-stone-50 text-center transition-colors relative cursor-pointer group">
              <input
                id="file-upload-input"
                type="file"
                accept=".txt,.json,.csv"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
              <div className="space-y-1">
                <p className="text-xs font-sans text-stone-600 font-medium group-hover:text-crop-700 transition-colors">
                  📎 Drag / Upload reference text circular (.txt)
                </p>
                <p className="text-[10px] text-stone-400">
                  Will auto-populate title and circular briefs below
                </p>
              </div>
            </div>

            {/* Content Textarea */}
            <div className="space-y-1.5">
              <label htmlFor="doc-content-in" className="text-[11px] font-mono font-bold text-stone-600 uppercase tracking-wider pl-1">
                {t.docContent}
              </label>
              <textarea
                id="doc-content-in"
                rows={6}
                className="w-full bg-stone-50 border border-crop-200 rounded-lg p-4 text-xs focus:ring-2 focus:ring-crop-600 focus:outline-none leading-relaxed font-sans"
                placeholder="Paste the official administrative text, circular terms, and guidelines here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            {/* Alert Logs */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-red-100/50 text-red-800 rounded-lg text-xs flex items-center gap-2 border border-red-200"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {uploadSuccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-crop-50 text-crop-800 rounded-lg text-xs flex items-center gap-2 border border-crop-200 font-medium"
                >
                  <CheckCircle className="w-4 h-4 shrink-0 text-crop-600" />
                  <span>{t.docAdded}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              id="btn-upload-doc"
              type="submit"
              disabled={submitting || !title || !content}
              className="w-full bg-crop-600 hover:bg-crop-700 active:bg-crop-800 disabled:bg-stone-200 disabled:text-stone-400 text-white font-sans font-bold py-3.5 px-6 rounded-lg text-xs transition-all shadow-sm flex items-center justify-center gap-2 tracking-wider border-b-2 border-crop-800 uppercase cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                  Parsing Circular Guidelines...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  {t.uploadDoc}
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Loaded Policies Display */}
      <div className="lg:col-span-5 h-full flex flex-col justify-start">
        <div className="bg-crop-900 text-white p-6 rounded-xl shadow-md border border-crop-950 space-y-4 min-h-[440px] flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-medium tracking-widest text-crop-200 uppercase bg-crop-950/40 px-3 py-1 rounded-full border border-crop-700/20 inline-block">
              📂 Policy Knowledge Cache (RAG)
            </h3>
            
            <h2 className="text-lg font-display font-medium text-white pl-1 text-left">
              {t.currentDocs}
            </h2>

            <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
              {isLoading ? (
                <div className="text-center py-12 text-xs text-stone-300">
                  <RefreshCcw className="w-6 h-6 animate-spin mx-auto mb-2 text-crop-400" />
                  Loading state orders...
                </div>
              ) : documents.length > 0 ? (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    id={`doc-card-${doc.id}`}
                    onClick={() => handleDocClick(doc)}
                    className={`p-3.5 rounded-lg border transition-all text-left flex items-start gap-3 relative group cursor-pointer ${
                      selectedDoc?.id === doc.id
                        ? 'bg-crop-800 border-crop-300 shadow-md ring-1 ring-crop-400'
                        : 'bg-crop-750/35 hover:bg-crop-800/50 border-white/5'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-md bg-crop-700/20 border border-crop-600/30 flex items-center justify-center text-crop-200 shrink-0 mt-0.5">
                      <BookOpen className="w-4 h-4" />
                    </div>

                    <div className="space-y-1.5 flex-1 pr-6">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-display font-bold text-white leading-snug line-clamp-2 flex-1">
                          {doc.title}
                        </h4>
                        {selectedDoc?.id === doc.id && (
                          <span className="shrink-0 bg-crop-400 text-crop-950 font-mono font-black text-[8px] px-1.5 py-0.5 rounded tracking-wider uppercase">
                            Active
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2.5 text-[9px] font-mono text-stone-300">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          {new Date(doc.uploadDate).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>{doc.charCount} chars</span>
                      </div>
                    </div>

                    {/* Prohibited delete for seed documents go_1/go_2 to maintain fallback knowledge */}
                    {!['go_1', 'go_2'].includes(doc.id) && (
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="absolute right-2 top-2 p-1.5 rounded-lg text-stone-400 hover:text-red-400 hover:bg-crop-950 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                        title={t.deleteDoc}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-stone-400 text-xs font-medium">
                  Empty knowledge base cache.
                </div>
              )}
            </div>
          </div>

          <div className="bg-crop-950/40 p-4 rounded-lg border border-white/5 text-left space-y-1">
            <p className="text-[10px] font-mono text-crop-200 uppercase tracking-wider">💡 RAG Intelligence Feature</p>
            <p className="text-[11px] text-stone-200 leading-relaxed font-sans">
              Rythu Sethu bypasses rigid text matching. Uploading any G.O. details above automatically appends it into the Gemini Chat context. Any farmer can then query it using the Chat tab instantly.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
