import { ApiError } from "./apiError";

export function mapDbError(
  error: unknown,
  contextMessage: string = "Internal server error"
): ApiError {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: string }).code;

    switch (code) {
      case "23505":
        return new ApiError("Resource already exists", 409, "UNIQUE_VIOLATION");

      case "23503":
        return new ApiError("Invalid reference", 400, "FOREIGN_KEY_VIOLATION");
    }
  }

  return new ApiError(contextMessage, 500);
}
