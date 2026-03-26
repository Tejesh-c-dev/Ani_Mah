// Input sanitization — strips unsafe HTML from incoming payloads
import sanitizeHtml from "sanitize-html";

const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === "string") {
    return sanitizeHtml(value, {
      allowedTags: [],
      allowedAttributes: {},
    }).trim();
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (value && typeof value === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value)) {
      sanitized[key] = sanitizeValue(nestedValue);
    }
    return sanitized;
  }

  return value;
};

/**
 * Sanitize a request body object
 */
export const sanitizeBody = <T>(body: T): T => {
  if (body && typeof body === "object") {
    return sanitizeValue(body) as T;
  }
  return body;
};
