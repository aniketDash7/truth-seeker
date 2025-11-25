from ddgs import DDGS
import nlp_engine
from typing import Dict, Any, List

def search_and_extract(node_label: str, context: str = "") -> Dict[str, Any]:
    """
    Searches for information about the node_label (with optional context)
    and uses the NLP engine to extract new entities and relationships.
    """
    query = f"{node_label} {context}".strip()
    print(f"DEBUG: Searching for: {query}")
    
    try:
        results = DDGS().text(query, max_results=3)
        if not results:
            print("DEBUG: No search results found.")
            return {"nodes": [], "edges": []}
            
        # Combine snippets into a single text block for analysis
        combined_text = "\n\n".join([f"Source: {r['title']}\n{r['body']}" for r in results])
        print(f"DEBUG: Analyzing search results (length: {len(combined_text)})")
        
        # Use existing NLP engine to extract graph from the search results
        # We might want to prepend a prompt instruction to focus on connections to the original node
        graph_data = nlp_engine.analyze_text(combined_text)
        
        # Post-processing: Ensure the original node is connected? 
        # For now, rely on the NLP engine finding connections.
        
        return graph_data

    except Exception as e:
        print(f"Error in search_and_extract: {e}")
        return {"nodes": [], "edges": []}
