/**
 * Tauri Bridge Service
 * Provides seamless integration with Tauri v2 desktop environment,
 * falling back transparently to browser/REST APIs when in web mode.
 */

export function isTauriEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as any).__TAURI_INTERNALS__ ||
    (window as any).__TAURI__ ||
    (window as any).__TAURI_IPC__
  );
}

export async function invokeTauri<T>(command: string, args?: Record<string, unknown>): Promise<T | null> {
  if (!isTauriEnvironment()) {
    return null;
  }

  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke<T>(command, args);
  } catch (err) {
    console.warn(`[Tauri Bridge] invoke failed for command "${command}":`, err);
    return null;
  }
}
