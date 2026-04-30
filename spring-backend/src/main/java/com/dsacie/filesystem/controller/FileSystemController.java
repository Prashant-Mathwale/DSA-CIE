package com.dsacie.filesystem.controller;

import com.dsacie.filesystem.model.Node;
import com.dsacie.filesystem.service.FileSystemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller exposing File System operations via HTTP endpoints.
 * Matches the frontend React API contracts.
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allows cross-origin requests from the React frontend
public class FileSystemController {

    @Autowired
    private FileSystemService fileSystemService;

    @GetMapping("/tree")
    public Map<String, Object> getTree() {
        Map<String, Object> response = new HashMap<>();
        response.put("tree", fileSystemService.getFullTree());
        return response;
    }

    @PostMapping("/create")
    public ResponseEntity<?> insert(@RequestBody Map<String, String> payload) {
        try {
            Node node = fileSystemService.insert(payload.get("parentId"), payload.get("name"), payload.get("type"));
            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("node", node);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        try {
            fileSystemService.deleteNode(id);
            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("deletedCount", 1);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/search")
    public Map<String, Object> search(@RequestParam String name) {
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("results", fileSystemService.searchByName(name));
        res.put("method", "O(1) HashMap Name Lookup");
        return res;
    }

    @GetMapping("/path")
    public Map<String, Object> searchPath(@RequestParam String path) {
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("node", fileSystemService.searchByPath(path));
        res.put("method", "O(1) HashMap Path Lookup");
        return res;
    }
}
