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
    - "label": short relationship name (e.g., "visited", "knows")
    - "details": detailed explanation of the relationship (e.g., "visited on Jan 5th according to witness", "alleged father of based on court docs")
    
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
        nodes_idx = content.find('"nodes"')
        
        # Check if "nodes" key appears before the first curly brace (implies missing outer braces)
        if nodes_idx != -1 and (start_idx == -1 or nodes_idx < start_idx):
            # Model forgot outer braces, start from "nodes"
            # Find the last closing character, could be } or ]
            end_idx = max(content.rfind('}'), content.rfind(']')) + 1
            json_str = "{" + content[nodes_idx:end_idx] + "}"
        elif start_idx != -1:
            # Standard case: found an opening brace
            end_idx = content.rfind('}') + 1
            json_str = content[start_idx:end_idx]
        else:
            # No braces and no "nodes" key found
            raise ValueError("Could not find JSON structure in model output")

        try:
            # print(f"DEBUG: Raw model output: {content}")
            print(f"DEBUG: Extracted JSON string: {json_str}")
            return json.loads(json_str)
        except json.JSONDecodeError:
            # Fallback for single quotes (common LLM issue)
            import ast
            print(f"DEBUG: JSONDecodeError, attempting ast.literal_eval for: {json_str}")
            return ast.literal_eval(json_str)

    except Exception as e:
        print(f"Error in NLP processing: {e}")
        # Return empty graph on error for now, or re-raise
        return {"nodes": [], "edges": []}
