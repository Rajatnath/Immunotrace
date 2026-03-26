import mongoose from "mongoose";

export function isMongoError(error: unknown): error is mongoose.Error {
  return error instanceof mongoose.Error;
}

export function getMongoErrorMessage(error: unknown): string {
  if (error instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(error.errors).map((err) => err.message);
    return `Validation error: ${messages.join(", ")}`;
  }

  if (error instanceof mongoose.Error.CastError) {
    return `Invalid ${error.path}: ${error.value}`;
  }

  if (isMongoError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown database error";
}

export function isConnectionError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes("ECONNREFUSED") ||
      error.message.includes("connection") ||
      error.message.includes("timeout"))
  );
}
