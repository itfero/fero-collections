/**
 * AWS Utilities Module
 * Centralized logging, error handling, and AWS API monitoring
 */

export enum AWSOperation {
  READ = 'READ',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  UPLOAD = 'UPLOAD',
}

export interface AWSLogEntry {
  timestamp: string;
  operation: AWSOperation;
  resource: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  duration?: number;
}

class AWSLogger {
  private logs: AWSLogEntry[] = [];
  private maxLogs = 100;

  log(
    operation: AWSOperation,
    resource: string,
    status: 'success' | 'error' | 'pending',
    message: string,
    duration?: number
  ) {
    const entry: AWSLogEntry = {
      timestamp: new Date().toISOString(),
      operation,
      resource,
      status,
      message,
      duration,
    };

    this.logs.push(entry);

    // Keep only last 100 logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    const logLevel = status === 'error' ? 'error' : 'log';
    console.log(`[AWS:${operation}:${status.toUpperCase()}] ${resource} - ${message}${duration ? ` (${duration}ms)` : ''}`);
  }

  getLogs(): AWSLogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const awsLogger = new AWSLogger();

/**
 * Track AWS API call with automatic logging
 */
export async function trackAWSCall<T>(
  operation: AWSOperation,
  resource: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  
  try {
    awsLogger.log(operation, resource, 'pending', 'Request initiated');
    const result = await fn();
    const duration = Date.now() - startTime;
    awsLogger.log(operation, resource, 'success', 'Completed successfully', duration);
    return result;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    const errorMessage = error?.message || String(error);
    awsLogger.log(operation, resource, 'error', errorMessage, duration);
    throw error;
  }
}

/**
 * Handle AWS API errors gracefully
 */
export function handleAWSError(error: any, context: string): string {
  if (error instanceof Error) {
    if (error.message.includes('Failed to fetch')) {
      return 'Network error. Please check your internet connection.';
    }
    if (error.message.includes('AWS API Error')) {
      return `AWS Service Error: ${error.message}`;
    }
    return `Error: ${error.message}`;
  }
  return `Unknown error in ${context}`;
}

/**
 * Retry AWS API call with exponential backoff
 */
export async function retryAWSCall<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries - 1) {
        const delay = delayMs * Math.pow(2, attempt);
        console.warn(`[AWS] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

export default awsLogger;
