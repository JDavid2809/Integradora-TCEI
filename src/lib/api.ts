// API utility function for making HTTP requests
interface ApiOptions extends RequestInit {
  signal?: AbortSignal;
}

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function api<T = any>(url: string, options: ApiOptions = {}): Promise<T> {
  const { signal, ...fetchOptions } = options;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
    signal,
    ...fetchOptions,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new ApiError(
        `HTTP error! status: ${response.status}`,
        response.status
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw error;
      }
      throw new ApiError(error.message);
    }
    throw new ApiError('Unknown error occurred');
  }
}

export default api;
export { ApiError };