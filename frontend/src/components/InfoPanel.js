import React from 'react';


function getBreadcrumbs(path) {
  if (!path) return [];
  return path.split('/').filter(Boolean);
}

export default function InfoPanel({ node }) {
  if (!node) {
    return (
      <div className="info-panel empty-state">
        <div className="empty-icon">🗂️</div>
        <h2>TreeFS Explorer</h2>
        <p>Select a file or folder from the tree to view its details</p>
        <div className="dsa-cards">
          <div className="dsa-card"><span>📌</span><strong>Tree</strong><p>Hierarchical structure for files & folders</p></div>
          <div className="dsa-card"><span>⚡</span><strong>HashMap</strong><p>O(1) lookup by name or full path</p></div>

          <div className="dsa-card"><span>🔍</span><strong>DFS</strong><p>O(n) full tree traversal fallback</p></div>
        </div>
      </div>
    );
  }

  const crumbs = getBreadcrumbs(node.path);
  const ext = node.type === 'file' ? node.name.split('.').pop().toUpperCase() : null;

  return (
    <div className="info-panel">
      <div className="info-header">
        <div className="info-icon">{node.type === 'folder' ? '📂' : '📄'}</div>
        <div>
          <h2 className="info-name">{node.name}</h2>
          <span className={`type-badge ${node.type}`}>{node.type.toUpperCase()}{ext ? ` · ${ext}` : ''}</span>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="breadcrumb">
        {crumbs.map((crumb, i) => (
          <React.Fragment key={i}>
            <span className={i === crumbs.length - 1 ? 'crumb active' : 'crumb'}>{crumb}</span>
            {i < crumbs.length - 1 && <span className="crumb-sep">/</span>}
          </React.Fragment>
        ))}
      </div>

      {/* Details */}
      <div className="info-grid">
        <div className="info-row"><span className="info-label">📋 Node ID</span><code className="info-val">{node.id}</code></div>
        <div className="info-row"><span className="info-label">📂 Type</span><span className="info-val">{node.type}</span></div>
        <div className="info-row"><span className="info-label">🔗 Full Path</span><code className="info-val path-val">{node.path}</code></div>
        <div className="info-row"><span className="info-label">👆 Parent ID</span><code className="info-val">{node.parentId || 'none'}</code></div>
        {node.type === 'folder' && (
          <div className="info-row"><span className="info-label">📦 Children</span><span className="info-val">{node.children?.length ?? 0} item(s)</span></div>
        )}
      </div>

      {/* DSA metrics */}
      <div className="dsa-metrics">
        <h3>⚙️ Data Structure Operations</h3>
        <div className="metric-list">
          <div className="metric"><span className="metric-op">Path lookup</span><span className="metric-badge green">O(1) HashMap</span></div>
          <div className="metric"><span className="metric-op">Name lookup</span><span className="metric-badge green">O(1) HashMap</span></div>

          <div className="metric"><span className="metric-op">DFS traversal</span><span className="metric-badge amber">O(n) Tree</span></div>
          <div className="metric"><span className="metric-op">Insert</span><span className="metric-badge green">O(1) indexed</span></div>
          <div className="metric"><span className="metric-op">Delete (recursive)</span><span className="metric-badge amber">O(k) subtree</span></div>
        </div>
      </div>
    </div>
  );
}
