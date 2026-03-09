import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { PersonioClient } from '../api/personio-client.js';

export class RecruitingHandlers {
  constructor(private personioClient: PersonioClient) {}

  async handleListRecruitingApplications(args: any) {
    try {
      const response = await this.personioClient.getRecruitingApplications({
        limit: args?.limit,
        cursor: args?.cursor,
        updated_at_after: args?.updated_at_after,
        updated_at_before: args?.updated_at_before,
        candidate_email: args?.candidate_email,
      });

      const applications = (response._data || []).map(app =>
        this.personioClient.formatRecruitingApplication(app)
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              applications,
              total: applications.length,
              next_cursor: response._meta?.links?.next?.href || null,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return this.handleRecruitingError(error, 'list applications');
    }
  }

  async handleGetRecruitingApplication(args: any) {
    if (!args?.application_id || typeof args.application_id !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'application_id is required and must be a string');
    }

    try {
      const response = await this.personioClient.getRecruitingApplication(args.application_id);
      const application = this.personioClient.formatRecruitingApplication(response._data);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ application }, null, 2),
          },
        ],
      };
    } catch (error) {
      return this.handleRecruitingError(error, 'get application');
    }
  }

  async handleListApplicationStageTransitions(args: any) {
    if (!args?.application_id || typeof args.application_id !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'application_id is required and must be a string');
    }

    try {
      const response = await this.personioClient.getApplicationStageTransitions(args.application_id);
      const transitions = (response._data || []).map(t =>
        this.personioClient.formatStageTransition(t)
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              application_id: args.application_id,
              stage_transitions: transitions,
              total: transitions.length,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return this.handleRecruitingError(error, 'list stage transitions');
    }
  }

  async handleListRecruitingCandidates(args: any) {
    try {
      const response = await this.personioClient.getRecruitingCandidates({
        limit: args?.limit,
        cursor: args?.cursor,
      });

      const candidates = (response._data || []).map(c =>
        this.personioClient.formatRecruitingCandidate(c)
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              candidates,
              total: candidates.length,
              next_cursor: response._meta?.links?.next?.href || null,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return this.handleRecruitingError(error, 'list candidates');
    }
  }

  async handleGetRecruitingCandidate(args: any) {
    if (!args?.candidate_id || typeof args.candidate_id !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'candidate_id is required and must be a string');
    }

    try {
      const response = await this.personioClient.getRecruitingCandidate(args.candidate_id);
      const candidate = this.personioClient.formatRecruitingCandidate(response._data);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ candidate }, null, 2),
          },
        ],
      };
    } catch (error) {
      return this.handleRecruitingError(error, 'get candidate');
    }
  }

  async handleListRecruitingJobs(args: any) {
    try {
      const response = await this.personioClient.getRecruitingJobs({
        limit: args?.limit,
        cursor: args?.cursor,
      });

      const jobs = (response._data || []).map(j =>
        this.personioClient.formatRecruitingJob(j)
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              jobs,
              total: jobs.length,
              next_cursor: response._meta?.links?.next?.href || null,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return this.handleRecruitingError(error, 'list jobs');
    }
  }

  async handleGetRecruitingJob(args: any) {
    if (!args?.job_id || typeof args.job_id !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'job_id is required and must be a string');
    }

    try {
      const response = await this.personioClient.getRecruitingJob(args.job_id);
      const job = this.personioClient.formatRecruitingJob(response._data);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ job }, null, 2),
          },
        ],
      };
    } catch (error) {
      return this.handleRecruitingError(error, 'get job');
    }
  }

  async handleListApplicationDocuments(args: any) {
    if (!args?.application_id || typeof args.application_id !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'application_id is required and must be a string');
    }

    try {
      const response = await this.personioClient.getApplicationDocuments(args.application_id, {
        category_id: args.category_id,
        limit: args.limit,
        cursor: args.cursor,
      });
      const documents = (response._data || []).map(doc =>
        this.personioClient.formatApplicationDocument(doc)
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              application_id: args.application_id,
              documents,
              total: documents.length,
              next_cursor: response._meta?.links?.next?.href || null,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return this.handleRecruitingError(error, 'list application documents');
    }
  }

  async handleDownloadApplicationDocument(args: any) {
    if (!args?.document_id || typeof args.document_id !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'document_id is required and must be a string');
    }

    try {
      const documentBuffer = await this.personioClient.downloadApplicationDocument(args.document_id);
      const base64Content = documentBuffer.toString('base64');

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              document_id: args.document_id,
              content: base64Content,
              content_type: 'base64',
              size: documentBuffer.length,
              message: 'Application document downloaded successfully',
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return this.handleRecruitingError(error, 'download application document');
    }
  }

  async handleListRecruitingCategories(args: any) {
    try {
      const response = await this.personioClient.getRecruitingCategories();
      const categories = (response._data || []).map(c =>
        this.personioClient.formatRecruitingCategory(c)
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              categories,
              total: categories.length,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return this.handleRecruitingError(error, 'list recruiting categories');
    }
  }

  // Shared error handler: returns helpful message for 403/scope errors instead of throwing
  private handleRecruitingError(error: unknown, operation: string) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('access denied') || message.includes('403')) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: `Failed to ${operation}`,
              message,
              hint: 'Ensure your Personio API credentials include the "personio:recruiting:read" scope. ' +
                    'You may need to regenerate your API credentials with recruiting permissions enabled.',
            }, null, 2),
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `Error: Failed to ${operation}: ${message}`,
        },
      ],
      isError: true,
    };
  }
}
