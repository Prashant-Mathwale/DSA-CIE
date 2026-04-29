import java.util.*;

public class FileSystemTree {

    // 1. The Node Structure (N-ary Tree)
    public static class Node {
        String id;
        String name;
        String type; // "folder" or "file"
        String parentId;
        String path;
        List<String> children; // Stores IDs of child nodes

        public Node(String id, String name, String type, String parentId, String path) {
            this.id = id;
            this.name = name;
            this.type = type;
            this.parentId = parentId;
            this.path = path;
            this.children = new ArrayList<>();
        }
    }

    // 2. The HashMaps for O(1) Optimization
    private Map<String, Node> nodes;            // Quick lookup by ID
    private Map<String, Node> pathMap;          // O(1) lookup by full path
    private Map<String, List<Node>> nameMap;    // O(1) lookup by name (handles duplicates)

    public FileSystemTree() {
        this.nodes = new HashMap<>();
        this.pathMap = new HashMap<>();
        this.nameMap = new HashMap<>();
        initRoot();
    }

    private void initRoot() {
        Node root = new Node("root", "Root", "folder", null, "/Root");
        registerNode(root);
    }

    // Helper to keep HashMaps in sync
    private void registerNode(Node node) {
        nodes.put(node.id, node);
        pathMap.put(node.path, node);

        // Add to name map (handling multiple files with same name)
        nameMap.putIfAbsent(node.name, new ArrayList<>());
        nameMap.get(node.name).add(node);
    }

    private void unregisterNode(Node node) {
        nodes.remove(node.id);
        pathMap.remove(node.path);

        if (nameMap.containsKey(node.name)) {
            nameMap.get(node.name).removeIf(n -> n.id.equals(node.id));
            if (nameMap.get(node.name).isEmpty()) {
                nameMap.remove(node.name);
            }
        }
    }

    // ── Public API ────────────────────────────

    // INSERT: O(1) time
    public void insert(String parentId, String name, String type) throws Exception {
        Node parent = nodes.get(parentId);
        if (parent == null) throw new Exception("Parent not found");
        if (!parent.type.equals("folder")) throw new Exception("Cannot add children to a file");

        String id = UUID.randomUUID().toString();
        String path = parent.path + "/" + name;

        if (pathMap.containsKey(path)) throw new Exception("Node already exists at path");

        Node newNode = new Node(id, name, type, parentId, path);
        parent.children.add(id);
        registerNode(newNode);
    }

    // DELETE: O(k) where k is size of subtree
    public void deleteNode(String id) throws Exception {
        if (id.equals("root")) throw new Exception("Cannot delete root");
        Node node = nodes.get(id);
        if (node == null) throw new Exception("Node not found");

        // Remove from parent's children list
        Node parent = nodes.get(node.parentId);
        if (parent != null) {
            parent.children.remove(id);
        }

        // Recursively delete all children
        deleteSubtree(id);
    }

    private void deleteSubtree(String id) {
        Node node = nodes.get(id);
        if (node == null) return;

        // Copy list to avoid ConcurrentModificationException
        List<String> childrenCopy = new ArrayList<>(node.children);
        for (String childId : childrenCopy) {
            deleteSubtree(childId);
        }
        unregisterNode(node);
    }

    // SEARCH 1: O(1) HashMap lookup by Path
    public Node searchByPath(String path) {
        return pathMap.get(path);
    }

    // SEARCH 2: O(1) HashMap lookup by Name
    public List<Node> searchByName(String name) {
        return nameMap.getOrDefault(name, new ArrayList<>());
    }

    // SEARCH 3: O(n) DFS Traversal Fallback
    public List<Node> searchDFS(String query) {
        List<Node> results = new ArrayList<>();
        dfs("root", query.toLowerCase(), results);
        return results;
    }

    private void dfs(String nodeId, String query, List<Node> results) {
        Node node = nodes.get(nodeId);
        if (node == null) return;

        if (node.name.toLowerCase().contains(query)) {
            results.add(node);
        }

        for (String childId : node.children) {
            dfs(childId, query, results);
        }
    }
}
