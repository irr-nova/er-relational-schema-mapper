
import json
import os
import random
import time

from dotenv import load_dotenv
from google import genai
from google.genai import types


from .prompt import SYSTEM_PROMPT


load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not configured.")


MODEL_NAME = "gemini-3.5-flash-lite"

# Maximum total attempts, including the first attempt.
MAX_ATTEMPTS = 3

# Backoff delays are approximately 2 and 4 seconds,
# with a small random variation.
INITIAL_BACKOFF_SECONDS = 2

# Request timeout in milliseconds.
REQUEST_TIMEOUT_MS = 60000

client = genai.Client(
    api_key=API_KEY,
    http_options=types.HttpOptions(
        timeout=REQUEST_TIMEOUT_MS
    ),
)


def _get_status_code(exc: Exception):
    """Extract an HTTP status code when the SDK provides one."""

    code = getattr(exc, "code", None)

    if code is None:
        code = getattr(exc, "status_code", None)

    if code is None:
        response = getattr(exc, "response", None)
        code = getattr(response, "status_code", None)

    try:
        return int(code) if code is not None else None
    except (TypeError, ValueError):
        return None


def _is_retryable(exc: Exception) -> bool:
    """
    Retry temporary server failures and rate limits.
    Do not retry authentication, invalid-request, or
    other permanent client errors.
    """

    status_code = _get_status_code(exc)

    if status_code in {408, 429, 500, 502, 503, 504}:
        return True

    # Some network/timeout errors do not expose an HTTP code.
    class_name = type(exc).__name__.lower()

    return any(
        keyword in class_name
        for keyword in (
            "timeout",
            "connection",
            "temporarily",
        )
    )


def _safe_error_message(exc: Exception) -> str:
    """Return a useful error without exposing credentials."""

    status_code = _get_status_code(exc)

    if status_code == 429:
        return (
            "Gemini is rate-limiting requests or its quota "
            "has been reached. Please wait and try again."
        )

    if status_code in {500, 502, 503, 504}:
        return (
            "Gemini is temporarily unavailable. "
            "Please try again shortly."
        )

    if status_code == 408 or "timeout" in type(exc).__name__.lower():
        return (
            "The Gemini request timed out. "
            "Please try again with a clearer or smaller image."
        )

    if status_code in {400, 401, 403, 404}:
        return (
            "Gemini rejected the request. Check the configured "
            "model, API key permissions, and request format."
        )

    return (
        "The ER diagram could not be processed by Gemini. "
        "Please try again."
    )


def parse_er_image(image_bytes: bytes, content_type: str) -> dict:
    """
    Send an ER diagram image to Gemini and return the extracted
    ER Model JSON as a Python dictionary.

    Retries temporary failures at most twice after the first
    attempt. Permanent errors are not retried.
    """

    if not image_bytes:
        raise ValueError("The uploaded image is empty.")

    last_error = None

    for attempt in range(MAX_ATTEMPTS):
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=[
                    types.Part.from_text(text=SYSTEM_PROMPT),
                    types.Part.from_bytes(
                        data=image_bytes,
                        mime_type=content_type,
                    ),
                ],
            )

            output_text = (response.text or "").strip()

            if not output_text:
                raise ValueError(
                    "Gemini returned an empty response. "
                    "Please try again."
                )

            # Remove Markdown code fences if present.
            if output_text.startswith("```"):
                lines = output_text.splitlines()

                if lines and lines[0].strip().startswith("```"):
                    lines = lines[1:]

                if lines and lines[-1].strip() == "```":
                    lines = lines[:-1]

                output_text = "\n".join(lines).strip()

            if output_text.lower().startswith("json"):
                output_text = output_text[4:].strip()

            try:
                result = json.loads(output_text)
            except json.JSONDecodeError as exc:
                raise ValueError(
                    "Gemini returned invalid JSON. "
                    "Please retry the image extraction."
                ) from exc

            if not isinstance(result, dict):
                raise ValueError(
                    "Gemini returned an unexpected response format."
                )

            if "entities" not in result or "relationships" not in result:
                raise ValueError(
                    "Gemini's response is missing entities "
                    "or relationships."
                )

            return result

        except ValueError:
            # Invalid JSON or invalid response format should not
            # trigger repeated API calls.
            raise

        except Exception as exc:
            last_error = exc

            if (
                not _is_retryable(exc)
                or attempt == MAX_ATTEMPTS - 1
            ):
                break

            delay = (
                INITIAL_BACKOFF_SECONDS * (2 ** attempt)
                + random.uniform(0, 0.5)
            )

            time.sleep(delay)

    # Log only a generic message and exception class.
    # Do not log the exception text, which could contain
    # sensitive request details.
    print(
        "Gemini image parsing failed after "
        f"{MAX_ATTEMPTS} maximum attempts. "
        f"Error type: {type(last_error).__name__}"
    )

    raise RuntimeError(_safe_error_message(last_error)) from None
