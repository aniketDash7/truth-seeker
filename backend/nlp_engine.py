import ollama
import json
from typing import Dict, Any

def analyze_text(text: str) -> Dict[str, Any]:
    """
    Analyzes the provided text using Ollama to extract entities and relationships.
    Returns a dictionary matching the GraphData schema (nodes, edges).
    """
    
    prompt = f"""
    Analyze the following text and extract key entities (people, places, events, objects) and the relationships between them.
    Return the output strictly as a valid JSON object with two keys: "nodes" and "edges".
    Do not use markdown formatting (no ```json blocks).
    Use double quotes for all keys and string values.
    
    "nodes" should be a list of objects with:
    - "id": unique string identifier
    - "label": display name
    - "type": category (e.g., Person, Location, Event)
    - "details": brief description or context
    
    "edges" should be a list of objects with:
    - "source": id of the source node
    - "target": id of the target node
    - "label": description of the relationship (e.g., "visited", "knows", "occurred at")
    
    Text to analyze:
    "{text}"
    
    JSON Output:
    """
    try:
        response = ollama.chat(model='llama3.2:3b', messages=[
            {
                'role': 'user',
                'content': prompt,
            },
        ])
        
        content = response['message']['content']
        # Clean up markdown code blocks if present
        if "```json" in content:
            content = content.replace("```json", "").replace("```", "")
        elif "```" in content:
            content = content.replace("```", "")
            
        start_idx = content.find('{')
        end_idx = content.rfind('}') + 1
        if start_idx != -1 and end_idx != -1:
            json_str = content[start_idx:end_idx]
            # print(f"DEBUG: Raw model output: {content}")
            print(f"DEBUG: Extracted JSON string: {json_str}")
            data = json.loads(json_str)
            return data

        else:
            raise ValueError("Could not parse JSON from model output")

    except Exception as e:
        print(f"Error in NLP processing: {e}")
        # Return empty graph on error for now, or re-raise
        return {"nodes": [], "edges": []}
