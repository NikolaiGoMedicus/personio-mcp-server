import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { PersonioClient } from '../api/personio-client.js';

export class DocumentHandlers {
  constructor(private personioClient: PersonioClient) {}

  async handleGetDocumentCategories(args: any) {
    const response = await this.personioClient.getDocumentCategories();
    const formattedCategories = response.data.map(category => 
      this.personioClient.formatDocumentCategoryData(category)
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            document_categories: formattedCategories,
            total: response.metadata?.total_elements || formattedCategories.length,
          }, null, 2),
        },
      ],
    };
  }

  async handleGetEmployeeDocuments(args: any) {
    if (!args || typeof args.employee_id !== 'number') {
      throw new McpError(ErrorCode.InvalidParams, 'employee_id is required and must be a number');
    }

    const response = await this.personioClient.getEmployeeDocuments(args.employee_id, {
      category_id: args.category_id,
      limit: args.limit || 50,
      offset: args.offset || 0,
    });

    const formattedDocuments = response.data.map(document => 
      this.personioClient.formatDocumentData(document)
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            employee_id: args.employee_id,
            documents: formattedDocuments,
            total: response.metadata?.total_elements || formattedDocuments.length,
            filters: {
              category_id: args.category_id,
            },
          }, null, 2),
        },
      ],
    };
  }

  async handleUploadDocument(args: any) {
    if (!args || typeof args.employee_id !== 'number' || typeof args.category_id !== 'number' || !args.title || !args.file_content) {
      throw new McpError(ErrorCode.InvalidParams, 'employee_id, category_id, title, and file_content are required');
    }

    try {
      // Convert base64 content to buffer if needed
      let fileBuffer: Buffer;
      if (typeof args.file_content === 'string') {
        // Assume base64 encoded content
        fileBuffer = Buffer.from(args.file_content, 'base64');
      } else {
        fileBuffer = Buffer.from(args.file_content);
      }

      const response = await this.personioClient.uploadDocument({
        title: args.title,
        employee_id: args.employee_id,
        category_id: args.category_id,
        file: fileBuffer,
        file_name: args.file_name || 'document',
      });

      const formattedDocument = this.personioClient.formatDocumentData(response.data);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              document: formattedDocument,
              message: 'Document uploaded successfully',
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to upload document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleDownloadDocument(args: any) {
    if (!args || typeof args.document_id !== 'number') {
      throw new McpError(ErrorCode.InvalidParams, 'document_id is required and must be a number');
    }

    try {
      const documentBuffer = await this.personioClient.downloadDocument(args.document_id);
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
              message: 'Document downloaded successfully',
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to download document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleDeleteDocument(args: any) {
    if (!args || typeof args.document_id !== 'number') {
      throw new McpError(ErrorCode.InvalidParams, 'document_id is required and must be a number');
    }

    try {
      await this.personioClient.deleteDocument(args.document_id);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              document_id: args.document_id,
              message: 'Document deleted successfully',
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleGetDocumentsByCategory(args: any) {
    if (!args || typeof args.category_id !== 'number') {
      throw new McpError(ErrorCode.InvalidParams, 'category_id is required and must be a number');
    }

    // Get all employees first, then get their documents for the specified category
    const employeesResponse = await this.personioClient.getEmployees({
      limit: args.employee_limit || 100,
    });

    const allDocuments = [];
    const employees = employeesResponse.data.map(emp => this.personioClient.formatEmployeeData(emp));

    for (const employee of employees) {
      try {
        const documentsResponse = await this.personioClient.getEmployeeDocuments(employee.id, {
          category_id: args.category_id,
          limit: 50,
        });

        const employeeDocuments = documentsResponse.data.map(doc => ({
          ...this.personioClient.formatDocumentData(doc),
          employee_name: employee.name,
          employee_email: employee.email,
        }));

        allDocuments.push(...employeeDocuments);
      } catch (error) {
        // Continue with other employees if one fails
        console.error(`Failed to get documents for employee ${employee.id}:`, error);
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            category_id: args.category_id,
            documents: allDocuments,
            total_documents: allDocuments.length,
            employees_checked: employees.length,
          }, null, 2),
        },
      ],
    };
  }
}
