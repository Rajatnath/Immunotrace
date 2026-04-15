export function getDbErrorMessage(error: any): string {
  if (error?.code && typeof error.code === 'string' && error.code.startsWith('P')) {
    return `Database error: ${error.code}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown database error";
}
