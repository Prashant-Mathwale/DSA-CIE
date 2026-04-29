import React, { useState, useRef } from 'react'; // eslint-disable-line

const FILE_ICONS = {
  folder: '📁', 'folder-open': '📂',
  jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️',
  docx: '📝', doc: '📝', txt: '📄', pdf: '📕',
  js: '📜', jsx: '📜', ts: '📜', tsx: '📜',
  json: '🗃️', csv: '📊', mp4: '🎬', mp3: '🎵',
};

function getIcon(node, open) {
  if (node.type === 'folder') return open ? FILE_ICONS['folder-open'] : FILE_ICONS['folder'];
  const ext = node.name.split('.').pop().toLowerCase();
  return FILE_ICONS[ext] || '📄';
}

export default function TreeView({ node, selected, onSelect, onCreate, onDelete, onRename, depth = 0 }) {
  const [open, setOpen] = useState(depth === 0);
  const [showInput, setShowInput] = useState(null); // 'file' | 'folder' | null
  const [inputVal, setInputVal] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [renameVal, setRenameVal] = useState(node.name);
  // eslint-disable-next-line no-unused-vars
  const [contextMenu, setContextMenu] = useState(false);
  const inputRef = useRef(null);

  const isSelected = selected?.id === node.id;
  const isFolder = node.type === 'folder';

  const handleToggle = (e) => {
    e.stopPropagation();
    if (isFolder) setOpen(o => !o);
    onSelect(node);
  };

  const handleAdd = (type) => {
    setShowInput(type);
    setContextMenu(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const commitAdd = () => {
    if (inputVal.trim()) onCreate(node.id, inputVal.trim(), showInput);
    setShowInput(null);
    setInputVal('');
  };

  const commitRename = () => {
    if (renameVal.trim() && renameVal !== node.name) onRename(node.id, renameVal.trim());
    setRenaming(false);
  };

  return (
    <div className="tree-node" style={{ '--depth': depth }}>
      <div
        className={`node-row ${isSelected ? 'selected' : ''}`}
        onClick={handleToggle}
        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setContextMenu(c => !c); }}
      >
        {isFolder && (
          <span className="chevron">{open ? '▾' : '▸'}</span>
        )}
        {!isFolder && <span className="chevron-spacer" />}

        <span className="node-icon">{getIcon(node, open)}</span>

        {renaming ? (
          <input
            className="rename-input"
            value={renameVal}
            onChange={e => setRenameVal(e.target.value)}
            onBlur={commitRename}
            onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenaming(false); }}
            autoFocus
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span className="node-name">{node.name}</span>
        )}

        <div className="node-actions">
          {isFolder && (
            <>
              <button className="action-btn" title="New File" onClick={e => { e.stopPropagation(); handleAdd('file'); }}>+📄</button>
              <button className="action-btn" title="New Folder" onClick={e => { e.stopPropagation(); handleAdd('folder'); }}>+📁</button>
            </>
          )}
          {depth > 0 && (
            <>
              <button className="action-btn rename-btn" title="Rename" onClick={e => { e.stopPropagation(); setRenaming(true); setRenameVal(node.name); }}>✏️</button>
              <button className="action-btn delete-btn" title="Delete" onClick={e => { e.stopPropagation(); onDelete(node.id); }}>🗑️</button>
            </>
          )}
        </div>
      </div>

      {showInput && (
        <div className="new-node-input" style={{ paddingLeft: `${(depth + 1) * 20 + 24}px` }}>
          <span>{showInput === 'folder' ? '📁' : '📄'}</span>
          <input
            ref={inputRef}
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            placeholder={`New ${showInput} name...`}
            onKeyDown={e => { if (e.key === 'Enter') commitAdd(); if (e.key === 'Escape') setShowInput(null); }}
            onBlur={() => setTimeout(() => setShowInput(null), 150)}
          />
          <button onClick={commitAdd}>✓</button>
        </div>
      )}

      {isFolder && open && node.children && (
        <div className="children">
          {node.children.map(child => (
            <TreeView
              key={child.id}
              node={child}
              selected={selected}
              onSelect={onSelect}
              onCreate={onCreate}
              onDelete={onDelete}
              onRename={onRename}
              depth={depth + 1}
            />
          ))}
          {node.children.length === 0 && (
            <div className="empty-folder">Empty folder</div>
          )}
        </div>
      )}
    </div>
  );
}
