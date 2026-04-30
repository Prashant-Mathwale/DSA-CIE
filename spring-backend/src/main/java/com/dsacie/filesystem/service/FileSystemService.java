package com.dsacie.filesystem.service;

import com.dsacie.filesystem.model.Node;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Service class that manages the File System using an N-ary Tree
 * and HashMaps for O(1) performance optimization.
 */
@Service
public class FileSystemService {

    // HashMap for O(1) constant time lookup by Node UUID
    private Map<String, Node> nodes = new HashMap<>();
    
    // HashMap for O(1) constant time lookup by exact file/folder path
    private Map<String, Node> pathMap = new HashMap<>();
    
    // HashMap for O(1) constant time lookup by name (handles duplicates as a List)
    private Map<String, List<Node>> nameMap = new HashMap<>();

    /**
     * Constructor initializes the File System with a default 'Root' folder
     * and populates it with some dummy folders so the UI isn't empty.
     */
    public FileSystemService() {
        // Create the root node of our tree
        Node root = new Node("root", "Root", "folder", null, "/Root");
        registerNode(root); // Add to hash maps for instant lookup

        // Pre-populate with some initial folders and files for testing
        try {
            Node docs = insert("root", "Documents", "folder");
            Node pics = insert("root", "Pictures", "folder");
            Node downloads = insert("root", "Downloads", "folder");

            insert(docs.id, "DSA_Project", "folder");
            insert(docs.id, "resume.pdf", "file");
            insert(pics.id, "vacation.png", "file");
            insert(downloads.id, "movie.mp4", "file");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * Helper method to add a node to all HashMaps for fast O(1) lookup.
     */
    private void registerNode(Node node) {
        nodes.put(node.id, node);       // Register by ID
        pathMap.put(node.path, node);   // Register by Path
        
        // Register by Name (allowing multiple files/folders to share the same name)
        nameMap.putIfAbsent(node.name, new ArrayList<>());
        nameMap.get(node.name).add(node);
    }

    /**
     * Helper method to remove a node from all HashMaps.
     */
    private void unregisterNode(Node node) {
        nodes.remove(node.id);      // Remove ID reference
        pathMap.remove(node.path);  // Remove Path reference

        // Remove from the name mapping
        if (nameMap.containsKey(node.name)) {
            nameMap.get(node.name).removeIf(n -> n.id.equals(node.id));
            // If no more files/folders have this name, remove the key entirely
            if (nameMap.get(node.name).isEmpty()) {
                nameMap.remove(node.name);
            }
        }
    }

    /**
     * Retrieves the entire file system tree starting from the root node.
     * Recursively hydrates the children from IDs to actual node objects for the frontend.
     */
    public Object getFullTree() {
        return buildTree("root");
    }

    private Map<String, Object> buildTree(String nodeId) {
        Node node = nodes.get(nodeId);
        if (node == null) return null;

        Map<String, Object> map = new HashMap<>();
        map.put("id", node.id);
        map.put("name", node.name);
        map.put("type", node.type);
        map.put("parentId", node.parentId);
        map.put("path", node.path);

        List<Map<String, Object>> hydratedChildren = new ArrayList<>();
        for (String childId : node.children) {
            Map<String, Object> childMap = buildTree(childId);
            if (childMap != null) {
                hydratedChildren.add(childMap);
            }
        }
        map.put("children", hydratedChildren);
        
        return map;
    }

    /**
     * Inserts a new node (file or folder) into the N-ary tree structure.
     * Time Complexity: O(1) due to HashMap lookup of the parent node.
     */
    public Node insert(String parentId, String name, String type) throws Exception {
        // Find the parent node in O(1) time
        Node parent = nodes.get(parentId);
        if (parent == null) throw new Exception("Parent not found");
        if (!parent.type.equals("folder")) throw new Exception("Cannot add children to a file");

        // Generate a new UUID and construct the full path
        String id = UUID.randomUUID().toString();
        String path = parent.path + "/" + name;

        // Check if the path is already occupied in O(1) time
        if (pathMap.containsKey(path)) throw new Exception("Node already exists at path");

        // Create the new node and attach it to the parent's children list (Tree Connection)
        Node newNode = new Node(id, name, type, parentId, path);
        parent.children.add(id); // Connect the branch
        
        // Register in HashMaps for O(1) lookups later
        registerNode(newNode);
        return newNode;
    }

    /**
     * Deletes a node and all of its descendants from the tree.
     */
    public void deleteNode(String id) throws Exception {
        if (id.equals("root")) throw new Exception("Cannot delete root");
        
        // Find the node to delete in O(1) time
        Node node = nodes.get(id);
        if (node == null) throw new Exception("Node not found");

        // Detach the node from its parent's children list (Severing the tree branch)
        Node parent = nodes.get(node.parentId);
        if (parent != null) {
            parent.children.remove(id);
        }

        // Recursively delete all children (Post-order tree traversal)
        deleteSubtree(id);
    }

    /**
     * Recursive helper method to delete an entire subtree.
     * Traverses the tree via the children list and unregisters every node.
     */
    private void deleteSubtree(String id) {
        Node node = nodes.get(id);
        if (node == null) return;

        // Copy list to avoid ConcurrentModificationException during recursion
        List<String> childrenCopy = new ArrayList<>(node.children);
        
        // Recursively go deep into the tree branches
        for (String childId : childrenCopy) {
            deleteSubtree(childId);
        }
        
        // Unregister the current node from HashMaps
        unregisterNode(node);
    }

    /**
     * Searches for a specific node by its exact path.
     * Time Complexity: O(1) using the HashMap, bypassing tree traversal.
     */
    public Node searchByPath(String path) {
        return pathMap.get(path);
    }

    /**
     * Searches for all nodes that match a specific name.
     * Time Complexity: O(1) using the HashMap, bypassing tree traversal.
     */
    public List<Node> searchByName(String name) {
        return nameMap.getOrDefault(name, new ArrayList<>());
    }
}
