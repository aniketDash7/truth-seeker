# Truth Seeker 🕵️‍♂️

**Truth Seeker** is an AI-powered case analysis tool designed to help investigators, journalists, and researchers visualize complex narratives. By analyzing textual evidence (witness statements, police reports, etc.), it extracts key entities and relationships to build an interactive knowledge graph.

Users can further explore the graph by expanding nodes using real-time web search to uncover hidden connections.

![Truth Seeker Screenshot](https://via.placeholder.com/800x450?text=Truth+Seeker+Dashboard)

## ✨ Features

-   **AI-Powered Analysis**: Uses local LLMs (Ollama/Llama 3.2) to extract entities (People, Locations, Events) and relationships from raw text.
-   **Interactive Knowledge Graph**: Visualize connections with a dynamic, force-directed graph (powered by React Flow & Dagre).
-   **Node Expansion**: Click on any node to search the web (DuckDuckGo) for more information and automatically add new findings to the graph.
-   **Rich Details**: Hover over connection lines to see detailed relationship context (e.g., "alleged father of based on court docs").
-   **Modern UI**: Sleek, dark-mode interface with glassmorphism effects and smooth animations.

## 🛠️ Tech Stack

### Backend
-   **Python 3.10+**
-   **FastAPI**: High-performance web framework.
-   **Ollama**: Local LLM runner (using `llama3.2:3b`).
-   **DuckDuckGo Search**: For real-time web intelligence.
-   **Pydantic**: Data validation.

### Frontend
-   **React (Vite)**: Fast frontend build tool.
-   **TypeScript**: Type-safe development.
-   **Tailwind CSS v4**: Utility-first styling with a CSS-first configuration.
-   **React Flow**: Interactive node-based graph.
-   **Dagre**: Graph layout algorithms.
-   **Lucide React**: Beautiful icons.

## 🚀 Prerequisites

1.  **Node.js** (v18 or higher)
2.  **Python** (v3.10 or higher)
3.  **Ollama**: Download and install from [ollama.com](https://ollama.com/).
    -   Pull the required model: `ollama pull llama3.2:3b`

## 📦 Installation

### 1. Backend Setup

Navigate to the `backend` directory:

```bash
cd backend
```

Create a virtual environment (optional but recommended):

```bash
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the backend server:

```bash
uvicorn main:app --reload
```

The server will run at `http://localhost:8000`.

### 2. Frontend Setup

Open a new terminal and navigate to the `frontend` directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will open at `http://localhost:5173`.

## 📖 Usage

1.  **Paste Evidence**: Copy text from a case file, article, or report into the "Case Evidence" text area on the left.
2.  **Analyze**: Click **"Analyze Case"**. The AI will process the text and generate a graph on the right.
3.  **Explore**:
    -   **Drag** nodes to rearrange them.
    -   **Hover** over edges (lines) to see detailed relationship info.
    -   **Click** a node to select it.
4.  **Expand**: With a node selected, click **"Expand Node"** in the left panel. The system will search the web for more context and add new connections to the graph.

## 📂 Project Structure

```
truth-seeker/
├── backend/
│   ├── main.py           # FastAPI entry point & API endpoints
│   ├── nlp_engine.py     # Ollama integration for text analysis
│   ├── search_engine.py  # DuckDuckGo integration for web search
│   └── requirements.txt  # Python dependencies
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── GraphView.tsx  # React Flow graph component
    │   ├── App.tsx            # Main application logic & UI
    │   ├── index.css          # Global styles & Tailwind config
    │   └── main.tsx           # React entry point
    ├── index.html
    ├── package.json
    └── vite.config.ts
```

## 📄 License

MIT License. Feel free to use and modify for your own investigations!
