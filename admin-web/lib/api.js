const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
const TOKEN_KEY = 'token';

// Flag to prevent multiple simultaneous redirects
let isRedirecting = false;

/**
 * Gets the auth token from localStorage
 * @returns {string|null}
 */
function getAuthToken() {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Handles 401 unauthorized responses by removing token and redirecting
 */
function handleUnauthorized() {
  // Prevent multiple redirects
  if (isRedirecting) {
    return;
  }
  
  isRedirecting = true;
  
  // Remove token from localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
  
  // Redirect to login using window.location to avoid React re-render loops
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

/**
 * Makes an authenticated API request with automatic token handling
 * @param {string} endpoint - API endpoint (e.g., '/admin/products')
 * @param {Object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<Response|null>} - Returns null on 401 or error, otherwise Response
 */
export async function apiRequest(endpoint, options = {}) {
  try {
    // Get token from localStorage
    const token = getAuthToken();

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    // Build headers
    const headers = {
      ...options.headers,
    };
    
    // Only set Content-Type if body is not FormData (FormData sets it automatically with boundary)
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    // Add Authorization header with Bearer token if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      handleUnauthorized();
      return null;
    }

    return response;
  } catch (error) {
    // Don't throw errors that could trigger infinite retries
    // Just log and return null
    console.error('API request error:', error);
    return null;
  }
}

/**
 * Convenience method for GET requests
 * @param {string} endpoint - API endpoint
 * @returns {Promise<any|null>} - Parsed JSON response, or null on error/401
 */
export async function apiGet(endpoint) {
  const response = await apiRequest(endpoint, { method: 'GET' });
  
  if (!response) {
    return null;
  }
  
  if (!response.ok) {
    // Don't throw errors - just return null to prevent infinite retries
    console.error(`GET ${endpoint} failed with status ${response.status}`);
    return null;
  }

  try {
    return await response.json();
  } catch (error) {
    console.error(`Failed to parse JSON response from ${endpoint}:`, error);
    return null;
  }
}

/**
 * Convenience method for POST requests
 * @param {string} endpoint - API endpoint
 * @param {Object|FormData} body - Request body (can be object or FormData)
 * @returns {Promise<any|null>} - Parsed JSON response, or null on error/401
 */
export async function apiPost(endpoint, body) {
  const response = await apiRequest(
    endpoint,
    {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }
  );

  if (!response) {
    return null;
  }

  if (!response.ok) {
    // Don't throw errors - just return null to prevent infinite retries
    console.error(`POST ${endpoint} failed with status ${response.status}`);
    return null;
  }

  try {
    return await response.json();
  } catch (error) {
    console.error(`Failed to parse JSON response from ${endpoint}:`, error);
    return null;
  }
}

/**
 * Convenience method for PUT requests
 * @param {string} endpoint - API endpoint
 * @param {Object|FormData} body - Request body (can be object or FormData)
 * @returns {Promise<any|null>} - Parsed JSON response, or null on error/401
 */
export async function apiPut(endpoint, body) {
  const response = await apiRequest(
    endpoint,
    {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }
  );

  if (!response) {
    return null;
  }

  if (!response.ok) {
    // Don't throw errors - just return null to prevent infinite retries
    console.error(`PUT ${endpoint} failed with status ${response.status}`);
    return null;
  }

  try {
    return await response.json();
  } catch (error) {
    console.error(`Failed to parse JSON response from ${endpoint}:`, error);
    return null;
  }
}

/**
 * Convenience method for PATCH requests
 * @param {string} endpoint - API endpoint
 * @param {Object} body - Request body
 * @returns {Promise<any|null>} - Parsed JSON response, or null on error/401
 */
export async function apiPatch(endpoint, body) {
  const response = await apiRequest(
    endpoint,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    }
  );

  if (!response) {
    return null;
  }

  if (!response.ok) {
    // Don't throw errors - just return null to prevent infinite retries
    console.error(`PATCH ${endpoint} failed with status ${response.status}`);
    return null;
  }

  try {
    return await response.json();
  } catch (error) {
    console.error(`Failed to parse JSON response from ${endpoint}:`, error);
    return null;
  }
}

/**
 * Convenience method for DELETE requests
 * @param {string} endpoint - API endpoint
 * @returns {Promise<any|null>} - Parsed JSON response (if any), or null on error/401
 */
export async function apiDelete(endpoint) {
  const response = await apiRequest(endpoint, { method: 'DELETE' });

  if (!response) {
    return null;
  }

  if (!response.ok) {
    // Don't throw errors - just return null to prevent infinite retries
    console.error(`DELETE ${endpoint} failed with status ${response.status}`);
    return null;
  }

  // Some DELETE endpoints might not return JSON
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch (error) {
      console.error(`Failed to parse JSON response from ${endpoint}:`, error);
      return null;
    }
  }

  return null;
}
