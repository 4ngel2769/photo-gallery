/**
 * Generate a browser fingerprint based on various browser characteristics
 * This creates a semi-unique identifier to track unique views
 */
export function generateFingerprint(): string {
  const components: string[] = [];

  // Screen resolution
  components.push(`${window.screen.width}x${window.screen.height}`);
  components.push(`${window.screen.colorDepth}`);

  // Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Language
  components.push(navigator.language);

  // Platform
  components.push(navigator.platform);

  // Hardware concurrency (CPU cores)
  components.push(String(navigator.hardwareConcurrency || 'unknown'));

  // Device memory (if available)
  const nav = navigator as Navigator & { deviceMemory?: number };
  if (nav.deviceMemory) {
    components.push(String(nav.deviceMemory));
  }

  // User agent
  components.push(navigator.userAgent);

  // Canvas fingerprint (more unique)
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      canvas.width = 200;
      canvas.height = 50;
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Browser Fingerprint', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Browser Fingerprint', 4, 17);
      components.push(canvas.toDataURL());
    }
  } catch {
    // Canvas fingerprinting may fail in some browsers
  }

  // WebGL fingerprint
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
        components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
      }
    }
  } catch {
    // WebGL may not be available
  }

  // Combine all components and hash
  const fingerprint = components.join('|');
  return hashString(fingerprint);
}

/**
 * Simple hash function to convert fingerprint components into a hash
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Get or create a persistent fingerprint for this browser session
 * Caches the fingerprint in sessionStorage to avoid recalculating
 */
export function getFingerprint(): string {
  const storageKey = 'browser_fingerprint';
  
  // Check if we already have a fingerprint in session storage
  let fingerprint = sessionStorage.getItem(storageKey);
  
  if (!fingerprint) {
    fingerprint = generateFingerprint();
    sessionStorage.setItem(storageKey, fingerprint);
  }
  
  return fingerprint;
}
