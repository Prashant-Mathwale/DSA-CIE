import React, { useState, useRef, useEffect } from 'react';

const METHODS = [
  { id: 'name', label: 'Name', badge: 'O(1)', desc: 'HashMap lookup' },
  { id: 'path', label: 'Path', badge: 'O(1)', desc: 'Path HashMap' },
  { id: 'dfs',  label: 'DFS',  badge: 'O(n)', desc: 'Full traversal' },
];

export default function SearchBar({ onSearch, results, meta, onSelectResult }) {
  const [query, setQuery] = useState('');
  const [method, setMethod] = useState('name');
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(query, method);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, method]);

  const placeholder = method === 'path' ? '/Images/Photos/img1.jpg' : 'Search...';

  return (
    <div className="search-section">
      <div className="method-tabs">
        {METHODS.map(m => (
          <button
            key={m.id}
            className={`method-tab ${method === m.id ? 'active' : ''}`}
            onClick={() => setMethod(m.id)}
            title={m.desc}
          >
            {m.label}
            <span className="complexity-badge">{m.badge}</span>
          </button>
        ))}
      </div>

      <div className={`search-input-wrap ${focused ? 'focused' : ''}`}>
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
        />
        {query && (
          <button className="clear-btn" onClick={() => { setQuery(''); onSearch('', method); }}>✕</button>
        )}
      </div>

      {meta && <div className="search-meta">⚡ {meta}</div>}

      {results.length > 0 && query && (
        <div className="search-results">
          {results.map((r, i) => (
            <div
              key={i}
              className="search-result-item"
              onClick={() => onSelectResult(r)}
            >
              <span>{r.type === 'folder' ? '📁' : '📄'}</span>
              <div className="result-info">
                <span className="result-name">{r.name}</span>
                <span className="result-path">{r.path}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && query && focused && (
        <div className="search-results">
          <div className="no-results">No results found</div>
        </div>
      )}
    </div>
  );
}
