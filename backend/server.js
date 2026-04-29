const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const FileSystemTree = require('./fileSystemTree');

const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, 'filesystem.json');

// ── Middleware ────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Init tree ─────────────────────────────────
const fst = new FileSystemTree();

// Load persisted data from JSON file
function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const nodes = JSON.parse(raw);
      if (Array.isArray(nodes) && nodes.length > 0) {
        fst.loadFromJSON(nodes);
        console.log(`✅ Loaded ${nodes.length} nodes from filesystem.json`);
        return;
      }
    } catch (e) {
      console.warn('⚠️  Could not parse filesystem.json, seeding defaults.');
    }
  }
  seedDefaults();
  saveData();
}

function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(fst.toJSON(), null, 2), 'utf8');
}

function seedDefaults() {
  const docs     = fst.insert('root', 'Documents', 'folder');
  fst.insert(docs.id, 'Resume.docx', 'file');
  fst.insert(docs.id, 'Notes.txt', 'file');

  const images   = fst.insert('root', 'Images', 'folder');
  const photos   = fst.insert(images.id, 'Photos', 'folder');
  fst.insert(photos.id, 'img1.jpg', 'file');
  fst.insert(photos.id, 'img2.jpg', 'file');
  const screens  = fst.insert(images.id, 'Screenshots', 'folder');
  fst.insert(screens.id, 'ss1.png', 'file');
  fst.insert(screens.id, 'ss2.png', 'file');
  console.log('🌱 Seeded default file system');
}

loadData();

// ── Routes ────────────────────────────────────

// GET /api/tree – full nested tree
app.get('/api/tree', (req, res) => {
  res.json({ success: true, tree: fst.getFullTree() });
});

// POST /api/create – insert node
app.post('/api/create', (req, res) => {
  const { parentId, name, type } = req.body;
  if (!parentId || !name || !type) {
    return res.status(400).json({ success: false, error: 'parentId, name, and type are required' });
  }
  try {
    const node = fst.insert(parentId, name, type);
    saveData();
    res.json({ success: true, node });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

// DELETE /api/delete/:id – recursive delete
app.delete('/api/delete/:id', (req, res) => {
  try {
    const count = fst.delete(req.params.id);
    saveData();
    res.json({ success: true, deletedCount: count });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

// GET /api/search?name=xyz – name HashMap lookup
app.get('/api/search', (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ success: false, error: 'name query param required' });
  const results = fst.searchByName(name);
  res.json({ success: true, method: 'HashMap (O(1))', results });
});

// GET /api/path?path=/Images/Photos/img1.jpg – O(1) path lookup
app.get('/api/path', (req, res) => {
  const { path: p } = req.query;
  if (!p) return res.status(400).json({ success: false, error: 'path query param required' });
  const node = fst.searchByPath(p);
  if (!node) return res.status(404).json({ success: false, error: 'No node found at that path' });
  res.json({ success: true, method: 'Path HashMap (O(1))', node });
});


// GET /api/dfs?name=xyz – DFS fallback search
app.get('/api/dfs', (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ success: false, error: 'name query param required' });
  const results = fst.dfsSearch(name);
  res.json({ success: true, method: 'DFS (O(n))', results });
});

// PUT /api/rename/:id – rename + path cascade
app.put('/api/rename/:id', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ success: false, error: 'name is required' });
  try {
    const node = fst.rename(req.params.id, name);
    saveData();
    res.json({ success: true, node });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

// ── Start ─────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 DSA File-System API running at http://localhost:${PORT}`);
});
