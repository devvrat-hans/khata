export type AppErrorCode = "not_found" | "forbidden" | "invalid" | "conflict" | "rate_limited" | "unauthenticated";

/**
 * An error whose message is safe to show to the person who caused it.
 * Anything else that is thrown is logged and replaced with a generic message.
 */
export class AppError extends Error {
  readonly code: AppErrorCode;

  constructor(code: AppErrorCode, message: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
}

export const notFound = (what = "That page") => new AppError("not_found", `${what} could not be found.`);
export const forbidden = (message = "You cannot do that.") => new AppError("forbidden", message);
export const invalid = (message: string) => new AppError("invalid", message);
export const conflict = (message: string) => new AppError("conflict", message);
export const rateLimited = (message = "Too many requests. Wait a minute and try again.") =>
  new AppError("rate_limited", message);
