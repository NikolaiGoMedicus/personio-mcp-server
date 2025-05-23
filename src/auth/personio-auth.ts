import axios, { AxiosInstance } from 'axios';

export interface PersonioAuthConfig {
  clientId: string;
  clientSecret: string;
  baseUrl?: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
}

export class PersonioAuth {
  private config: PersonioAuthConfig;
  private token: AuthToken | null = null;
  private axiosInstance: AxiosInstance;

  constructor(config: PersonioAuthConfig) {
    this.config = {
      baseUrl: 'https://api.personio.de',
      ...config,
    };

    this.axiosInstance = axios.create({
      baseURL: this.config.baseUrl,
      timeout: 30000,
    });
  }

  /**
   * Authenticate with Personio API and get access token
   */
  async authenticate(): Promise<string> {
    try {
      const response = await this.axiosInstance.post('/v1/auth', {
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      });

      if (response.data && response.data.data) {
        this.token = {
          access_token: response.data.data.token,
          token_type: 'Bearer',
          expires_in: 86400, // 24 hours as per Personio docs
          expires_at: Date.now() + (86400 * 1000), // 24 hours from now
        };

        return this.token.access_token;
      } else {
        throw new Error('Invalid authentication response from Personio API');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || error.message;
        throw new Error(`Personio authentication failed: ${message}`);
      }
      throw error;
    }
  }

  /**
   * Get valid access token, refreshing if necessary
   */
  async getValidToken(): Promise<string> {
    if (!this.token || this.isTokenExpired()) {
      await this.authenticate();
    }

    return this.token!.access_token;
  }

  /**
   * Check if current token is expired
   */
  private isTokenExpired(): boolean {
    if (!this.token) return true;
    
    // Add 5 minute buffer before actual expiration
    const bufferTime = 5 * 60 * 1000; // 5 minutes
    return Date.now() >= (this.token.expires_at - bufferTime);
  }

  /**
   * Get authorization header for API requests
   */
  async getAuthHeader(): Promise<{ Authorization: string }> {
    const token = await this.getValidToken();
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Clear stored token (useful for testing or manual refresh)
   */
  clearToken(): void {
    this.token = null;
  }
}
