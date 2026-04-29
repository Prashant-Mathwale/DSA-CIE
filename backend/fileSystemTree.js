const { v4: uuidv4 } = require('uuid');

// ─────────────────────────────────────────────
//  FileSystemTree – the main in-memory engine
//  Uses: Tree + Path HashMap (O1) + Name HashMap (O1)
// ─────────────────────────────────────────────
class FileSystemTree {
  constructor() {
    // Map<id, node>
    this.nodes = {};
    // HashMap: path → node   (O(1) lookup)
    this.pathMap = {};
    // HashMap: name → [node] (handles duplicates)
    this.nameMap = {};

    this._initRoot();
  }

  _initRoot() {
    const root = {
      id: 'root',
      name: 'Root',
      type: 'folder',
      parentId: null,
      path: '/Root',
      children: [],
    };
    this._registerNode(root);
  }

  // ── Internal helpers ──────────────────────

  _registerNode(node) {
    this.nodes[node.id] = node;
    this.pathMap[node.path] = node;

    if (!this.nameMap[node.name]) this.nameMap[node.name] = [];
    if (!this.nameMap[node.name].find(n => n.id === node.id)) {
      this.nameMap[node.name].push(node);
    }
  }

  _unregisterNode(node) {
    delete this.nodes[node.id];
    delete this.pathMap[node.path];

    if (this.nameMap[node.name]) {
      this.nameMap[node.name] = this.nameMap[node.name].filter(n => n.id !== node.id);
      if (this.nameMap[node.name].length === 0) delete this.nameMap[node.name];
    }
  }

  // ── Public API ────────────────────────────

  getTree() {
    return this.nodes['root'];
  }

  getFullTree() {
    const build = (nodeId) => {
      const node = this.nodes[nodeId];
      if (!node) return null;
      return {
        ...node,
        children: node.children.map(cid => build(cid)).filter(Boolean),
      };
    };
    return build('root');
  }

  insert(parentId, name, type) {
    const parent = this.nodes[parentId];
    if (!parent) throw new Error(`Parent not found: ${parentId}`);
    if (parent.type !== 'folder') throw new Error('Cannot add children to a file');

    const id = uuidv4();
    const path = parent.path + '/' + name;

    if (this.pathMap[path]) throw new Error(`Node already exists at path: ${path}`);

    const node = { id, name, type, parentId, path, children: [] };
    parent.children.push(id);
    this._registerNode(node);
    return node;
  }

  delete(nodeId) {
    const node = this.nodes[nodeId];
    if (!node) throw new Error(`Node not found: ${nodeId}`);
    if (nodeId === 'root') throw new Error('Cannot delete root');

    // Recursively collect all descendants
    const toDelete = [];
    const collect = (id) => {
      const n = this.nodes[id];
      if (!n) return;
      toDelete.push(n);
      n.children.forEach(collect);
    };
    collect(nodeId);

    // Unregister all
    toDelete.forEach(n => this._unregisterNode(n));

    // Remove from parent's children list
    const parent = this.nodes[node.parentId];
    if (parent) parent.children = parent.children.filter(id => id !== nodeId);

    return toDelete.length;
  }

  // ── Search methods ────────────────────────

  searchByName(name) {
    return this.nameMap[name] || [];
  }

  searchByPath(path) {
    return this.pathMap[path] || null;
  }

  // DFS search (fallback, O(n))
  dfsSearch(name, nodeId = 'root') {
    const node = this.nodes[nodeId];
    if (!node) return [];
    const results = [];
    if (node.name.toLowerCase().includes(name.toLowerCase())) results.push(node);
    for (const cid of node.children) {
      results.push(...this.dfsSearch(name, cid));
    }
    return results;
  }

  // Rename a node and recursively update all descendant paths
  rename(nodeId, newName) {
    const node = this.nodes[nodeId];
    if (!node) throw new Error(`Node not found: ${nodeId}`);
    if (nodeId === 'root') throw new Error('Cannot rename root');

    const parent = this.nodes[node.parentId];
    const newPath = parent.path + '/' + newName;
    if (this.pathMap[newPath]) throw new Error(`A node already exists at: ${newPath}`);

    // Collect all nodes under this one (BFS)
    const queue = [node];
    while (queue.length) {
      const cur = queue.shift();
      const oldPath = cur.path;

      // Unregister old
      delete this.pathMap[oldPath];
      if (this.nameMap[cur.name]) {
        this.nameMap[cur.name] = this.nameMap[cur.name].filter(n => n.id !== cur.id);
        if (this.nameMap[cur.name].length === 0) delete this.nameMap[cur.name];
      }

      // Update path/name
      if (cur.id === nodeId) {
        cur.path = newPath;
        cur.name = newName;
      } else {
        cur.path = cur.path.replace(node.path, newPath);
      }

      // Re-register new
      this.pathMap[cur.path] = cur;
      if (!this.nameMap[cur.name]) this.nameMap[cur.name] = [];
      this.nameMap[cur.name].push(cur);

      cur.children.forEach(cid => queue.push(this.nodes[cid]));
    }

    return node;
  }

  // ── Serialization ─────────────────────────

  toJSON() {
    return Object.values(this.nodes);
  }

  loadFromJSON(nodeArray) {
    this.nodes = {};
    this.pathMap = {};
    this.nameMap = {};

    for (const node of nodeArray) {
      this.nodes[node.id] = node;
      this.pathMap[node.path] = node;
      if (!this.nameMap[node.name]) this.nameMap[node.name] = [];
      this.nameMap[node.name].push(node);
    }
  }
}

module.exports = FileSystemTree;
