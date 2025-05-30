import { parse } from "@formatjs/icu-messageformat-parser";

export const validateMessage = (
  message: string
): { valid: boolean; error?: Error } => {
  try {
    parse(message);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error as Error };
  }
};
