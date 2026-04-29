import React, { useState, useEffect, useCallback } from 'react';
import TreeView from './components/TreeView';
import SearchBar from './components/SearchBar';
import InfoPanel from './components/InfoPanel';
import './App.css';

const API = '/api';

export default function App() {
  const [tree, setTree] = useState(null);
  const [selected, setSelected] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchMeta, setSearchMeta] = useState('');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTree = useCallback(async () => {
    const res = await fetch(`${API}/tree`);
    const data = await res.json();
    setTree(data.tree);
  }, []);

  useEffect(() => { fetchTree(); }, [fetchTree]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = async (parentId, name, type) => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId, name: name.trim(), type }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      await fetchTree();
      showToast(`Created "${name}" successfully`);
    } catch (e) { showToast(e.message, 'error'); }
    setLoading(false);
  };

  const handleDelete = async (nodeId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/delete/${nodeId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      if (selected?.id === nodeId) setSelected(null);
      await fetchTree();
      showToast(`Deleted ${data.deletedCount} item(s)`);
    } catch (e) { showToast(e.message, 'error'); }
    setLoading(false);
  };

  const handleRename = async (nodeId, newName) => {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/rename/${nodeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      await fetchTree();
      showToast(`Renamed to "${newName}"`);
    } catch (e) { showToast(e.message, 'error'); }
    setLoading(false);
  };

  const handleSearch = async (query, method) => {
    if (!query.trim()) { setSearchResults([]); setSearchMeta(''); return; }
    try {
      let url, res, data;
      if (method === 'name') {
        url = `${API}/search?name=${encodeURIComponent(query)}`;
      } else if (method === 'path') {
        url = `${API}/path?path=${encodeURIComponent(query)}`;
      } else {
        url = `${API}/dfs?name=${encodeURIComponent(query)}`;
      }
      res = await fetch(url);
      data = await res.json();
      if (!data.success) throw new Error(data.error);

      if (method === 'path') {
        setSearchResults(data.node ? [data.node] : []);
      } else {
        setSearchResults(data.results || []);
      }
      setSearchMeta(data.method || '');
    } catch (e) { showToast(e.message, 'error'); }
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🗂️</span>
            <div>
              <h1>TreeFS</h1>
              <p>DSA File Explorer</p>
            </div>
          </div>
        </div>

        <SearchBar onSearch={handleSearch} results={searchResults} meta={searchMeta} onSelectResult={setSelected} />

        <div className="tree-container">
          {loading && <div className="loading-bar" />}
          {tree ? (
            <TreeView
              node={tree}
              selected={selected}
              onSelect={setSelected}
              onCreate={handleCreate}
              onDelete={handleDelete}
              onRename={handleRename}
            />
          ) : (
            <div className="skeleton-loader">Loading tree...</div>
          )}
        </div>
      </aside>

      {/* Main panel */}
      <main className="main">
        <InfoPanel node={selected} />
      </main>

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}
    </div>
  );
}
