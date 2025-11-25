from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import nlp_engine
import search_engine

app = FastAPI(title="Truth Seeker API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisRequest(BaseModel):
    text: str

class ExpandRequest(BaseModel):
    node_label: str
    context: Optional[str] = ""

class Node(BaseModel):
    id: str
    label: str
    type: str  # e.g., "Person", "Event", "Location"
    details: Optional[str] = ""

class Edge(BaseModel):
    source: str
    target: str
    label: str
    details: Optional[str] = ""

class GraphData(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

@app.get("/")
def read_root():
    return {"message": "Truth Seeker API is running"}

@app.api_route("/analyze", methods=["GET","POST"],response_model=GraphData)
async def analyze_case(request: AnalysisRequest):
    try:
        graph_data = nlp_engine.analyze_text(request.text)
        print("graph_data",graph_data)
        return graph_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/expand", response_model=GraphData)
async def expand_node(request: ExpandRequest):
    try:
        print(f"Expanding node: {request.node_label}")
        graph_data = search_engine.search_and_extract(request.node_label, request.context)
        return graph_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
