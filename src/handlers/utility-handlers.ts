import { PersonioClient } from '../api/personio-client.js';

export class UtilityHandlers {
  constructor(private personioClient: PersonioClient) {}

  async handleApiHealthCheck(args: any) {
    try {
      const healthStatus = await this.personioClient.healthCheck();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              api_status: 'healthy',
              personio_api: healthStatus,
              server_info: {
                name: 'personio-server',
                version: '0.1.0',
                timestamp: new Date().toISOString(),
              },
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              api_status: 'unhealthy',
              error: error instanceof Error ? error.message : 'Unknown error',
              server_info: {
                name: 'personio-server',
                version: '0.1.0',
                timestamp: new Date().toISOString(),
              },
            }, null, 2),
          },
        ],
        isError: true,
      };
    }
  }
}
