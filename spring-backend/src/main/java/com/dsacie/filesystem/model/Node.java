package com.dsacie.filesystem.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Node structure for the N-ary Tree representation of the file system.
 * Each Node represents either a file or a folder.
 */
public class Node {
    public String id;           // Unique identifier for the node
    public String name;         // Name of the file or folder
    public String type;         // "folder" or "file"
    public String parentId;     // ID of the parent folder
    public String path;         // Full path from root (e.g., /Root/src)
    public List<String> children; // List of child node IDs (The Tree Structure)

    /**
     * Constructor to initialize a new Node in the file system tree.
     */
    public Node(String id, String name, String type, String parentId, String path) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.parentId = parentId;
        this.path = path;
        // Initialize an empty list for children, forming the branches of the tree
        this.children = new ArrayList<>();
    }
}
