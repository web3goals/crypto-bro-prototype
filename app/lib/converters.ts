import axios from "axios";

export function errorToString(error: unknown): string {
  let message = JSON.stringify(error);
  if (error instanceof Error) {
    message = error.message;
  }
  if (axios.isAxiosError(error)) {
    message = JSON.stringify({
      status: error.response?.status,
      data: error.response?.data,
    });
  }
  return message;
}
