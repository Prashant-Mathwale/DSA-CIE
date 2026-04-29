# TreeFS: Data Structures & Algorithms (CIE Project)

A full-stack React + Node.js application demonstrating a file system implementation using a **Tree** data structure with **O(1)** HashMap-based search optimizations. Built for a DSA Continuous Internal Evaluation (CIE).

## 🚀 Features & DSA Concepts

This project showcases how foundational Data Structures and Algorithms can heavily optimize a real-world system:

1. **N-ary Tree Structure**: Models the hierarchical nature of a file system (Folders containing Files/Folders).
2. **HashMap Optimization (O(1))**:
   - **Path HashMap**: Maps the exact absolute path (e.g., `/Root/Documents/Notes.txt`) directly to the memory address of the node.
   - **Name HashMap**: Maps the file name to an array of nodes, enabling instant retrieval of files by name without traversing the tree.
3. **Depth-First Search (DFS)**: Included as an **O(n)** fallback search method to demonstrate the contrast between traversing an unindexed tree vs using an indexed HashMap.
4. **Dynamic Index Synchronization**: When files are renamed, moved, or deleted, the system dynamically cascades updates to all affected paths and updates the HashMaps in memory.
5. **JSON Persistence**: Serializes the memory tree into a `filesystem.json` file to persist data across server restarts (acting as a lightweight NoSQL database alternative).

## 🛠️ Tech Stack

- **Frontend**: React.js (CRA), Vanilla CSS
- **Backend**: Node.js, Express.js
- **Data Storage**: In-Memory (Tree + HashMaps) with JSON persistence

---

## 🏃‍♂️ Startup Guide

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine (v18+ recommended).

### 1. Clone the repository
```bash
git clone https://github.com/Prashant-Mathwale/DSA-CIE.git
cd "DSA-CIE"
```

### 2. Start the Backend Server
The backend handles the Tree and HashMap logic in memory.

```bash
cd backend
npm install
npm start
```
*The backend API will start running on `http://localhost:5000`.*

### 3. Start the Frontend React App
Open a **new terminal window/tab**, and start the React UI.

```bash
cd frontend
npm install
npm start
```
*The React app will automatically open in your browser at `http://localhost:3000`.*

---

## 💡 How to use the App

- **Tree Navigation**: Expand folders in the left sidebar to see files.
- **Node Details**: Click on any file or folder to view its metadata, absolute path, and the Big-O metrics for common operations.
- **Create/Delete**: Hover over a folder and click the `+` icons to add new nested files or folders. Use the trash can icon to recursively delete a node.
- **Rename**: Click the pencil icon to rename a file/folder. Watch how the absolute paths of all its children update instantly!
- **Search (Name vs Path)**:
  - Search by **Name** (e.g., `Notes.txt`) to instantly find all instances of that file.
  - Search by **Path** (e.g., `/Root/Documents/Notes.txt`) to find the exact file via O(1) Path HashMap lookup.

---
*Developed for DSA CIE.*
