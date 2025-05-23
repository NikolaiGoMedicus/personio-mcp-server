import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { PersonioAuth, PersonioAuthConfig } from '../auth/personio-auth.js';

export interface PersonioClientConfig extends PersonioAuthConfig {
  baseUrl?: string;
}

export interface PersonioApiResponse<T = any> {
  success: boolean;
  data: T;
  metadata?: {
    total_elements?: number;
    current_page?: number;
    total_pages?: number;
  };
}

export interface Employee {
  type: string;
  attributes: {
    id: { label: string; value: number };
    email: { label: string; value: string };
    first_name: { label: string; value: string };
    last_name: { label: string; value: string };
    status: { label: string; value: string };
    position: { label: string; value: string };
    department: { label: string; value: string };
    hire_date: { label: string; value: string };
    weekly_working_hours: { label: string; value: string };
    [key: string]: any;
  };
}

export interface AttendancePeriod {
  type: string;
  attributes: {
    id: number;
    employee: number;
    date: string;
    start_time: string;
    end_time: string;
    break: number;
    comment: string;
    is_holiday: boolean;
    is_on_time_off: boolean;
    updated_at: string;
  };
}

export interface AbsencePeriod {
  type: string;
  attributes: {
    id: number;
    employee: number;
    time_off_type: {
      type: string;
      attributes: {
        id: number;
        name: string;
        category: string;
      };
    };
    status: string;
    comment: string;
    start_date: string;
    end_date: string;
    days_count: number;
    half_day_start: boolean;
    half_day_end: boolean;
    created_at: string;
    updated_at: string;
  };
}

export interface AbsenceBalance {
  name: string;
  balance: number;
  used: number;
  available: number;
  category: string;
}

export interface DocumentCategory {
  type: string;
  attributes: {
    id: number;
    name: string;
  };
}

export interface Document {
  type: string;
  attributes: {
    id: number;
    title: string;
    category: {
      type: string;
      attributes: {
        id: number;
        name: string;
      };
    };
    employee: number;
    created_at: string;
    updated_at: string;
    file_name: string;
    file_size: number;
    file_type: string;
  };
}

export interface UploadDocumentParams {
  title: string;
  employee_id: number;
  category_id: number;
  file: Buffer | string;
  file_name: string;
}

export class PersonioClient {
  private auth: PersonioAuth;
  private axiosInstance: AxiosInstance;
  private baseUrl: string;

  constructor(config: PersonioClientConfig) {
    this.baseUrl = config.baseUrl || 'https://api.personio.de';
    this.auth = new PersonioAuth(config);
    
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Add request interceptor to include auth header
    this.axiosInstance.interceptors.request.use(async (config) => {
      const authHeader = await this.auth.getAuthHeader();
      Object.assign(config.headers, authHeader);
      return config;
    });

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.error?.message || error.message;
          throw new Error(`Personio API error: ${message}`);
        }
        throw error;
      }
    );
  }

  // Employee endpoints
  async getEmployees(params?: {
    limit?: number;
    offset?: number;
    attributes?: string[];
  }): Promise<PersonioApiResponse<Employee[]>> {
    const queryParams = new URLSearchParams();
    
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.attributes) {
      params.attributes.forEach(attr => queryParams.append('attributes[]', attr));
    }

    const response = await this.axiosInstance.get(`/v1/company/employees?${queryParams}`);
    return response.data;
  }

  async getEmployee(employeeId: number, attributes?: string[]): Promise<PersonioApiResponse<Employee>> {
    const queryParams = new URLSearchParams();
    if (attributes) {
      attributes.forEach(attr => queryParams.append('attributes[]', attr));
    }

    const response = await this.axiosInstance.get(`/v1/company/employees/${employeeId}?${queryParams}`);
    return response.data;
  }

  // Attendance endpoints
  async getAttendances(params?: {
    start_date?: string;
    end_date?: string;
    employees?: number[];
    limit?: number;
    offset?: number;
  }): Promise<PersonioApiResponse<AttendancePeriod[]>> {
    const queryParams = new URLSearchParams();
    
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.employees) {
      params.employees.forEach(emp => queryParams.append('employees[]', emp.toString()));
    }

    const response = await this.axiosInstance.get(`/v1/company/attendances?${queryParams}`);
    return response.data;
  }

  // Absence endpoints
  async getAbsences(params?: {
    start_date?: string;
    end_date?: string;
    employees?: number[];
    limit?: number;
    offset?: number;
  }): Promise<PersonioApiResponse<AbsencePeriod[]>> {
    const queryParams = new URLSearchParams();
    
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.employees) {
      params.employees.forEach(emp => queryParams.append('employees[]', emp.toString()));
    }

    const response = await this.axiosInstance.get(`/v1/company/time-offs?${queryParams}`);
    return response.data;
  }

  async getAbsenceBalance(employeeId: number): Promise<PersonioApiResponse<AbsenceBalance[]>> {
    const response = await this.axiosInstance.get(`/v1/company/employees/${employeeId}/absences/balance`);
    return response.data;
  }

  async getAbsenceTypes(): Promise<PersonioApiResponse<any[]>> {
    const response = await this.axiosInstance.get('/v1/company/time-off-types');
    return response.data;
  }

  // Document endpoints
  async getDocumentCategories(): Promise<PersonioApiResponse<DocumentCategory[]>> {
    const response = await this.axiosInstance.get('/v1/company/document-categories');
    return response.data;
  }

  async getEmployeeDocuments(employeeId: number, params?: {
    category_id?: number;
    limit?: number;
    offset?: number;
  }): Promise<PersonioApiResponse<Document[]>> {
    const queryParams = new URLSearchParams();
    
    if (params?.category_id) queryParams.append('category_id', params.category_id.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const response = await this.axiosInstance.get(`/v1/company/employees/${employeeId}/documents?${queryParams}`);
    return response.data;
  }

  async uploadDocument(params: UploadDocumentParams): Promise<PersonioApiResponse<Document>> {
    const formData = new FormData();
    formData.append('title', params.title);
    formData.append('employee_id', params.employee_id.toString());
    formData.append('category_id', params.category_id.toString());
    
    // Handle file upload - this would need proper file handling in a real implementation
    if (typeof params.file === 'string') {
      // Base64 or file path handling
      formData.append('file', params.file);
    } else {
      // Buffer handling
      const blob = new Blob([params.file]);
      formData.append('file', blob, params.file_name);
    }

    const response = await this.axiosInstance.post('/v1/company/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async downloadDocument(documentId: number): Promise<Buffer> {
    const response = await this.axiosInstance.get(`/v1/company/documents/${documentId}/download`, {
      responseType: 'arraybuffer',
    });
    return Buffer.from(response.data);
  }

  async deleteDocument(documentId: number): Promise<PersonioApiResponse<any>> {
    const response = await this.axiosInstance.delete(`/v1/company/documents/${documentId}`);
    return response.data;
  }

  // Approval workflow endpoints
  async createAttendanceWithApproval(params: {
    employee_id: number;
    date: string;
    start_time: string;
    end_time: string;
    break_minutes?: number;
    comment?: string;
    skip_approval?: boolean;
  }): Promise<PersonioApiResponse<AttendancePeriod>> {
    const response = await this.axiosInstance.post('/v1/company/attendances', {
      employee_id: params.employee_id,
      date: params.date,
      start_time: params.start_time,
      end_time: params.end_time,
      break: params.break_minutes || 0,
      comment: params.comment || '',
      skip_approval: params.skip_approval || false,
    });
    return response.data;
  }

  async getPendingApprovals(params?: {
    type?: 'attendance' | 'absence' | 'document';
    employee_id?: number;
    limit?: number;
    offset?: number;
  }): Promise<PersonioApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    
    if (params?.type) queryParams.append('type', params.type);
    if (params?.employee_id) queryParams.append('employee_id', params.employee_id.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    // Note: This endpoint might not exist in the current API, but it's a common pattern
    const response = await this.axiosInstance.get(`/v1/company/approvals?${queryParams}`);
    return response.data;
  }

  // Utility methods
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      await this.auth.getValidToken();
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper method to format employee data for display
  formatEmployeeData(employee: Employee): any {
    const attrs = employee.attributes;
    return {
      id: attrs.id?.value,
      name: `${attrs.first_name?.value || ''} ${attrs.last_name?.value || ''}`.trim(),
      email: attrs.email?.value,
      position: attrs.position?.value,
      department: attrs.department?.value,
      status: attrs.status?.value,
      hire_date: attrs.hire_date?.value,
      weekly_hours: attrs.weekly_working_hours?.value,
    };
  }

  // Helper method to format attendance data
  formatAttendanceData(attendance: AttendancePeriod): any {
    const attrs = attendance.attributes;
    return {
      id: attrs.id,
      employee_id: attrs.employee,
      date: attrs.date,
      start_time: attrs.start_time,
      end_time: attrs.end_time,
      break_minutes: attrs.break,
      comment: attrs.comment,
      is_holiday: attrs.is_holiday,
      is_on_time_off: attrs.is_on_time_off,
      updated_at: attrs.updated_at,
    };
  }

  // Helper method to format absence data
  formatAbsenceData(absence: AbsencePeriod): any {
    const attrs = absence.attributes;
    return {
      id: attrs.id,
      employee_id: attrs.employee,
      type: attrs.time_off_type?.attributes?.name,
      category: attrs.time_off_type?.attributes?.category,
      status: attrs.status,
      start_date: attrs.start_date,
      end_date: attrs.end_date,
      days_count: attrs.days_count,
      half_day_start: attrs.half_day_start,
      half_day_end: attrs.half_day_end,
      comment: attrs.comment,
      created_at: attrs.created_at,
      updated_at: attrs.updated_at,
    };
  }

  // Helper method to format document data
  formatDocumentData(document: Document): any {
    const attrs = document.attributes;
    return {
      id: attrs.id,
      title: attrs.title,
      employee_id: attrs.employee,
      category_id: attrs.category?.attributes?.id,
      category_name: attrs.category?.attributes?.name,
      file_name: attrs.file_name,
      file_size: attrs.file_size,
      file_type: attrs.file_type,
      created_at: attrs.created_at,
      updated_at: attrs.updated_at,
    };
  }

  // Helper method to format document category data
  formatDocumentCategoryData(category: DocumentCategory): any {
    const attrs = category.attributes;
    return {
      id: attrs.id,
      name: attrs.name,
    };
  }
}
