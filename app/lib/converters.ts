import axios from "axios";

/**
 * Convert "0x4306D7a79265D2cb85Db0c5a55ea5F4f6F73C4B1" to "0x430...c4b1".
 */
export function addressToShortAddress(
  address: string | undefined
): string | undefined {
  let shortAddress = address;
  if (address && address.length > 10) {
    shortAddress = `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  }
  return shortAddress?.toLowerCase();
}

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
