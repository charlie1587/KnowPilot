import json
import requests
from fastapi import HTTPException

def call_llm(prompt: str,
            model: str = "llama3.2",
            temperature: float = 0.1,
            max_tokens: int = 100) -> str:
    """
    Call Ollama API to generate text.
    
    Args:
        prompt: The prompt to send to the LLM
        model: The model to use (default: llama3.2)
        temperature: Controls randomness (default: 0.1 for more deterministic responses)
        max_tokens: Maximum number of tokens in the response
        
    Returns:
        Generated text from LLM
    """
    url = "http://localhost:11434/api/generate"

    payload = {
        "model": model,
        "prompt": prompt,
        "temperature": temperature,
        "max_tokens": max_tokens
    }

    try:
        # Use requests with stream=True to handle streaming response
        response = requests.post(url, json=payload, stream=True, timeout=60)

        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to call LLM API")

        # Process streaming response
        full_response = ""
        for line in response.iter_lines():
            if line:
                data = json.loads(line)
                full_response += data.get("response", "")
                if data.get("done", False):
                    break

        return full_response.strip()

    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"LLM API error: {str(e)}")