export function getMongoErrorMessage(error: any): string {
  if (error?.code && typeof error.code === 'string' && error.code.startsWith('P')) {
    return `Database error: ${error.code}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown database error";
}

export function isConnectionError(error: any): boolean {
  return (
    error?.code === 'P1001' ||
    (error instanceof Error &&
    (error.message.includes("ECONNREFUSED") ||
      error.message.includes("connection") ||
      error.message.includes("timeout")))
  );
}
