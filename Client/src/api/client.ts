import axios, { AxiosError } from 'axios';
import { ENV } from '../config/env';
import { ApiErrorResponse } from '../types/api';

export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Interceptor to format API errors consistently into standard Error objects
 * with clean human-readable error messages.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.data?.error) {
      // Backend returned custom error object { error: "Human readable message" }
      return Promise.reject(new Error(error.response.data.error));
    }

    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 400:
          return Promise.reject(new Error('Invalid or missing details. Please check your input.'));
        case 404:
          return Promise.reject(new Error('Requested resource, schedule, or booking was not found.'));
        case 409:
          return Promise.reject(new Error('Conflict: Booking operation or cancellation has already been processed.'));
        case 500:
          return Promise.reject(new Error('Server error occurred. Please try again later.'));
        default:
          return Promise.reject(new Error(`Server returned error code ${status}.`));
      }
    }

    if (error.request) {
      return Promise.reject(new Error('Network error. Unable to connect to the Railway backend server.'));
    }

    return Promise.reject(new Error(error.message || 'An unexpected error occurred.'));
  }
);

