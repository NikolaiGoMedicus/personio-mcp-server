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

// V2 API Response interface (different structure from v1)
export interface PersonioApiResponseV2<T = any> {
  data: T;
  meta?: {
    pagination?: {
      current_page: number;
      per_page: number;
      total_pages: number;
      total_count: number;
    };
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
    department: {
      label: string;
      value: {
        type: string;
        attributes: {
          id: number;
          name: string;
        };
      } | string | null;
    };
    office: {
      label: string;
      value: {
        type: string;
        attributes: {
          id: number;
          name: string;
        };
      } | null;
    };
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

// V2 Attendance Period interface (based on v2 API structure)
export interface AttendancePeriodV2 {
  id: number;
  type: 'AttendancePeriod' | 'Break';
  person: {
    id: number;
    type: 'Person';
  };
  start: {
    date_time: string;
    time_zone: string;
  };
  end?: {
    date_time: string;
    time_zone: string;
  };
  comment?: string;
  is_holiday: boolean;
  is_on_time_off: boolean;
  created_at: string;
  updated_at: string;
}

export interface AttendancePeriodV2Request {
  person_id: number;
  type: 'AttendancePeriod' | 'Break';
  start: {
    date_time: string;
    time_zone: string;
  };
  end?: {
    date_time: string;
    time_zone: string;
  };
  comment?: string;
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
    office?: string;
  }): Promise<PersonioApiResponse<Employee[]>> {
    const queryParams = new URLSearchParams();

    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.attributes) {
      params.attributes.forEach(attr => queryParams.append('attributes[]', attr));
    }

    const response = await this.axiosInstance.get(`/v1/company/employees?${queryParams}`);

    // Client-side filtering by office if specified
    if (params?.office && response.data.data) {
      const filteredData = response.data.data.filter((employee: Employee) => {
        const officeName = employee.attributes.office?.value?.attributes?.name;
        return officeName?.toLowerCase().includes(params.office!.toLowerCase());
      });

      return {
        ...response.data,
        data: filteredData,
      };
    }

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

    // Extract department name from nested object or use string value
    let departmentName = null;
    if (attrs.department?.value) {
      if (typeof attrs.department.value === 'object' && attrs.department.value.attributes) {
        departmentName = attrs.department.value.attributes.name;
      } else if (typeof attrs.department.value === 'string') {
        departmentName = attrs.department.value;
      }
    }

    return {
      id: attrs.id?.value,
      name: `${attrs.first_name?.value || ''} ${attrs.last_name?.value || ''}`.trim(),
      email: attrs.email?.value,
      position: attrs.position?.value,
      department: departmentName,
      office: attrs.office?.value?.attributes?.name || null,
      status: attrs.status?.value,
      hire_date: attrs.hire_date?.value,
      weekly_hours: attrs.weekly_working_hours?.value,
      shoe_size: attrs.dynamic_14285869?.value || null,
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

  // ====== V2 Attendance Period Methods ======

  // List attendance periods (v2)
  async getAttendancePeriodsV2(params?: {
    person_id?: number;
    start_date_time?: string;
    end_date_time?: string;
    limit?: number;
    offset?: number;
  }): Promise<PersonioApiResponseV2<AttendancePeriodV2[]>> {
    const queryParams = new URLSearchParams();

    if (params?.person_id) queryParams.append('person.id', params.person_id.toString());
    if (params?.start_date_time) queryParams.append('start.date_time.gte', params.start_date_time);
    if (params?.end_date_time) queryParams.append('end.date_time.lte', params.end_date_time);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    try {
      const response = await this.axiosInstance.get(`/v2/attendance-periods?${queryParams}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        throw new Error(`V2 Attendance API access denied. This may be due to insufficient scopes. Required scope may be different from 'attendances:read'. Error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  // Get single attendance period by ID (v2)
  async getAttendancePeriodV2(id: number): Promise<PersonioApiResponseV2<AttendancePeriodV2>> {
    try {
      const response = await this.axiosInstance.get(`/v2/attendance-periods/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        throw new Error(`V2 Attendance API access denied. This may be due to insufficient scopes. Error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  // Create attendance period (v2)
  async createAttendancePeriodV2(params: AttendancePeriodV2Request): Promise<PersonioApiResponseV2<AttendancePeriodV2>> {
    try {
      const response = await this.axiosInstance.post('/v2/attendance-periods', params);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        throw new Error(`V2 Attendance API access denied. This may be due to insufficient scopes. Required scope may be different from 'attendances:write'. Error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  // Update attendance period (v2)
  async updateAttendancePeriodV2(id: number, params: Partial<AttendancePeriodV2Request>): Promise<PersonioApiResponseV2<AttendancePeriodV2>> {
    try {
      const response = await this.axiosInstance.patch(`/v2/attendance-periods/${id}`, params);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        throw new Error(`V2 Attendance API access denied. This may be due to insufficient scopes. Error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  // Delete attendance period (v2)
  async deleteAttendancePeriodV2(id: number): Promise<PersonioApiResponseV2<any>> {
    try {
      const response = await this.axiosInstance.delete(`/v2/attendance-periods/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        throw new Error(`V2 Attendance API access denied. This may be due to insufficient scopes. Error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  // Helper method to format v2 attendance data for display
  formatAttendanceDataV2(attendance: AttendancePeriodV2): any {
    return {
      id: attendance.id,
      type: attendance.type,
      person_id: attendance.person.id,
      start_date_time: attendance.start.date_time,
      start_time_zone: attendance.start.time_zone,
      end_date_time: attendance.end?.date_time,
      end_time_zone: attendance.end?.time_zone,
      comment: attendance.comment,
      is_holiday: attendance.is_holiday,
      is_on_time_off: attendance.is_on_time_off,
      created_at: attendance.created_at,
      updated_at: attendance.updated_at,
    };
  }

  // Helper method to convert v1 format to v2 format for backward compatibility
  convertV1ToV2Format(v1Attendance: any): AttendancePeriodV2Request {
    // Convert date + time format to ISO datetime
    const startDateTime = `${v1Attendance.date}T${v1Attendance.start_time}:00`;
    const endDateTime = v1Attendance.end_time ? `${v1Attendance.date}T${v1Attendance.end_time}:00` : undefined;

    return {
      person_id: v1Attendance.employee_id,
      type: 'AttendancePeriod',
      start: {
        date_time: startDateTime,
        time_zone: 'Europe/Berlin', // Default timezone - should be configurable
      },
      end: endDateTime ? {
        date_time: endDateTime,
        time_zone: 'Europe/Berlin',
      } : undefined,
      comment: v1Attendance.comment,
    };
  }

  // Helper method to convert v2 format to v1 format for backward compatibility
  convertV2ToV1Format(v2Attendance: AttendancePeriodV2): any {
    const startDate = new Date(v2Attendance.start.date_time);
    const endDate = v2Attendance.end ? new Date(v2Attendance.end.date_time) : null;

    return {
      id: v2Attendance.id,
      employee_id: v2Attendance.person.id,
      date: startDate.toISOString().split('T')[0],
      start_time: startDate.toTimeString().substring(0, 5),
      end_time: endDate ? endDate.toTimeString().substring(0, 5) : null,
      break_minutes: 0, // V2 doesn't have break field directly
      comment: v2Attendance.comment || '',
      is_holiday: v2Attendance.is_holiday,
      is_on_time_off: v2Attendance.is_on_time_off,
      updated_at: v2Attendance.updated_at,
    };
  }
}
