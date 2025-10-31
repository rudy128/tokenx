/**
 * Enhanced debug logger for the admin campaigns feature
 */

// Use a unique namespace for the logger
const DEBUG_NAMESPACE = 'admin-campaigns-debug';

// Control debug output with this flag (can be controlled via localStorage in browser)
let DEBUG_ENABLED = true;

/**
 * Initialize the debug logger
 */
export function initDebugLogger() {
  if (typeof window !== 'undefined') {
    // Check if debug is enabled in localStorage
    DEBUG_ENABLED = localStorage.getItem('DEBUG_ADMIN_CAMPAIGNS') === 'true';
    
    // Add control methods to window for browser console access
    (window as any).enableCampaignsDebug = () => {
      localStorage.setItem('DEBUG_ADMIN_CAMPAIGNS', 'true');
      DEBUG_ENABLED = true;
      console.log('Admin campaigns debugging enabled');
    };
    
    (window as any).disableCampaignsDebug = () => {
      localStorage.setItem('DEBUG_ADMIN_CAMPAIGNS', 'false');
      DEBUG_ENABLED = false;
      console.log('Admin campaigns debugging disabled');
    };
  }
}

/**
 * Log debug information
 */
export function debugLog(message: string, data?: any) {
  if (!DEBUG_ENABLED) return;
  
  const timestamp = new Date().toISOString();
  const prefix = `[${DEBUG_NAMESPACE} ${timestamp}]`;
  
  if (data !== undefined) {
    console.log(prefix, message, data);
  } else {
    console.log(prefix, message);
  }
}

/**
 * Log errors
 */
export function debugError(message: string, error?: any) {
  if (!DEBUG_ENABLED) return;
  
  const timestamp = new Date().toISOString();
  const prefix = `[${DEBUG_NAMESPACE} ERROR ${timestamp}]`;
  
  if (error !== undefined) {
    console.error(prefix, message, error);
  } else {
    console.error(prefix, message);
  }
}

/**
 * Time an operation
 */
export function debugTime<T>(name: string, fn: () => Promise<T>): Promise<T> {
  if (!DEBUG_ENABLED) return fn();
  
  const start = performance.now();
  debugLog(`Starting "${name}"`);
  
  return fn().then(result => {
    const duration = performance.now() - start;
    debugLog(`Completed "${name}" in ${duration.toFixed(2)}ms`);
    return result;
  }).catch(error => {
    const duration = performance.now() - start;
    debugError(`Failed "${name}" after ${duration.toFixed(2)}ms`, error);
    throw error;
  });
}

// Initialize the logger
initDebugLogger();
