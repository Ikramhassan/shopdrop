let toastFn: ((msg: string, type?: "success" | "error" | "info") => void) | null = null;

export function registerToast(fn: typeof toastFn) {
  toastFn = fn;
}

export function toast(msg: string, type: "success" | "error" | "info" = "success") {
  if (toastFn) toastFn(msg, type);
  else console.log("[toast]", msg);
}
