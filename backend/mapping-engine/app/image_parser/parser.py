import json
import os

from dotenv import load_dotenv
from google import genai
from google.genai import types

from .prompt import SYSTEM_PROMPT


load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError("GEMINI_API_KEY is not configured.")

client = genai.Client(api_key=api_key)


def parse_er_image(image_bytes: bytes, content_type: str) -> dict:
    """
    Send an ER diagram image to Gemini and return
    the extracted ER Model JSON as a Python dictionary.
    """

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=[
            types.Part.from_text(text=SYSTEM_PROMPT),
            types.Part.from_bytes(
                data=image_bytes,
                mime_type=content_type,
            ),
        ],
    )

    output_text = response.text.strip()

    # Remove Markdown code fences if Gemini returns them
    if output_text.startswith("```"):
        output_text = output_text.strip("`")

        if output_text.startswith("json"):
            output_text = output_text[4:].strip()

    try:
        result = json.loads(output_text)
    except json.JSONDecodeError as exc:
        raise ValueError(
            "Gemini did not return valid JSON."
        ) from exc

    return result