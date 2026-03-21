import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { SearchRequest, ProviderResponse, PrescriptionResponse, LabResultResponse, PatientRecordResponse, PatientRecordCreate, PatientProfileResponse, PatientProfileUpdate } from '@/types';

export function useProfile() {
    return useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            try {
                const response = await apiClient.get<PatientProfileResponse>('/profiles/patient/me');
                return response.data;
            } catch (err: any) {
                // 403 means not a patient (doctor/lab/pharmacy) — return null silently
                if (err?.response?.status === 403 || err?.response?.status === 404) {
                    return null;
                }
                throw err;
            }
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 0 // Don't retry on error
    })
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: PatientProfileUpdate) => {
            const response = await apiClient.put('/profiles/patient/me', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        }
    })
}

// Search Providers
export function useSearchProviders(params: SearchRequest, enabled: boolean = true) {
    return useQuery({
        queryKey: ['providers', params],
        queryFn: async () => {
            const response = await apiClient.post<ProviderResponse[]>('/search/providers', params);
            return response.data;
        },
        enabled: !!params.latitude && !!params.longitude && enabled,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

export function useNearbyProviders(params: SearchRequest, enabled: boolean = true) {
    return useQuery({
        queryKey: ['providers-nearby', params],
        queryFn: async () => {
            const response = await apiClient.post('/search/nearby', params);
            return response.data; // Returns GeoJSON { type: "FeatureCollection", features: [...] }
        },
        enabled: !!params.latitude && !!params.longitude && enabled,
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

interface AppointmentCreate {
    doctor_id?: number
    lab_id?: number
    pharmacy_id?: number
    appointment_date: string // ISO string
    type: string
    notes?: string
}

export function useCreateAppointment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: AppointmentCreate) => {
            const response = await apiClient.post('/appointments/', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        }
    })
}

export function useAppointments() {
    return useQuery({
        queryKey: ['appointments'],
        queryFn: async () => {
            const response = await apiClient.get('/appointments/');
            return response.data;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchOnWindowFocus: false
    })
}

export function usePrescriptions() {
    return useQuery({
        queryKey: ['prescriptions'],
        queryFn: async () => {
            // Correct endpoint: /clinical/prescriptions
            const response = await apiClient.get<PrescriptionResponse[]>('/clinical/prescriptions');
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false
    })
}

export function useLabResults() {
    return useQuery({
        queryKey: ['lab-results'],
        queryFn: async () => {
            // Correct endpoint: /clinical/lab-results
            const response = await apiClient.get<LabResultResponse[]>('/clinical/lab-results');
            return response.data;
        },
        staleTime: 3 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false
    })
}

export function usePatientRecords() {
    return useQuery({
        queryKey: ['patient-records'],
        queryFn: async () => {
            const response = await apiClient.get<PatientRecordResponse[]>('/clinical/patient-records');
            return response.data;
        },
        staleTime: 3 * 60 * 1000, // 3 minutes
        refetchOnWindowFocus: false
    })
}

export function useUploadRecord() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: PatientRecordCreate) => {
            const response = await apiClient.post('/clinical/patient-records', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patient-records'] });
        }
    })
}

export function useAuditLogs(limit: number = 50) {
    return useQuery({
        queryKey: ['audit-logs', limit],
        queryFn: async () => {
            const response = await apiClient.get(`/profiles/audit-logs?limit=${limit}`);
            return response.data;
        },
        staleTime: 2 * 60 * 1000,
        refetchOnWindowFocus: true
    })
}

// ──────────────────────────────────────
// Chat Hooks
// ──────────────────────────────────────

export function useConversations() {
    return useQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
            const response = await apiClient.get('/chat/conversations');
            return response.data;
        },
        refetchInterval: 10 * 1000, // Poll every 10s for new messages
        staleTime: 5 * 1000,
    })
}

export function useUnreadCount() {
    return useQuery({
        queryKey: ['unread-count'],
        queryFn: async () => {
            try {
                const response = await apiClient.get('/chat/unread-count');
                return response.data.unread_count as number;
            } catch { return 0; }
        },
        refetchInterval: 15 * 1000,
        staleTime: 5 * 1000,
    })
}

export function useStartConversation() {
    return useMutation({
        mutationFn: async (otherUserId: number) => {
            const response = await apiClient.post(`/chat/start/${otherUserId}`);
            return response.data as { room_id: string; other_user: any };
        }
    })
}

// ──────────────────────────────────────
// Doctor Hooks
// ──────────────────────────────────────

export function useDoctorProfile() {
    return useQuery({
        queryKey: ['doctor-profile'],
        queryFn: async () => {
            try {
                const response = await apiClient.get('/profiles/doctor/me');
                return response.data;
            } catch (err: any) {
                if (err?.response?.status === 403 || err?.response?.status === 404) return null;
                throw err;
            }
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 0
    })
}

export function useUpdateDoctorProfile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await apiClient.put('/profiles/doctor/me', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctor-profile'] });
        }
    })
}

export function useDoctorPatients() {
    return useQuery({
        queryKey: ['doctor-patients'],
        queryFn: async () => {
            const response = await apiClient.get('/profiles/doctor/patients');
            return response.data as any[];
        },
        staleTime: 2 * 60 * 1000,
        refetchOnWindowFocus: false,
    })
}

export function useUpdateAppointmentStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status, notes }: { id: number; status: string; notes?: string }) => {
            const response = await apiClient.put(`/appointments/${id}/status`, { status, notes });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        }
    })
}

export function useCreatePrescription() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { patient_id: number; medications: any[]; notes?: string; expiry_date?: string }) => {
            const response = await apiClient.post('/clinical/prescriptions', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
        }
    })
}

export function useUploadLabResult() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { patient_id: number; test_type: string; summary?: string; full_report_url?: string; raw_data?: any }) => {
            const response = await apiClient.post('/clinical/lab-results', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lab-results'] });
        }
    })
}

export function useFillPrescription() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (prescriptionId: number) => {
            const response = await apiClient.post(`/clinical/prescriptions/${prescriptionId}/fill`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
        }
    })
}

// ──────────────────────────────────────
// Lab Hooks
// ──────────────────────────────────────

export function useLabProfile() {
    return useQuery({
        queryKey: ['lab-profile'],
        queryFn: async () => {
            try {
                const response = await apiClient.get('/profiles/lab/me');
                return response.data;
            } catch (err: any) {
                if (err?.response?.status === 403 || err?.response?.status === 404) return null;
                throw err;
            }
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 0
    })
}

export function useUpdateLabProfile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await apiClient.put('/profiles/lab/me', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lab-profile'] });
        }
    })
}

// ──────────────────────────────────────
// Pharmacy Hooks
// ──────────────────────────────────────

export function usePharmacyProfile() {
    return useQuery({
        queryKey: ['pharmacy-profile'],
        queryFn: async () => {
            try {
                const response = await apiClient.get('/profiles/pharmacy/me');
                return response.data;
            } catch (err: any) {
                if (err?.response?.status === 403 || err?.response?.status === 404) return null;
                throw err;
            }
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 0
    })
}

export function useUpdatePharmacyProfile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await apiClient.put('/profiles/pharmacy/me', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pharmacy-profile'] });
        }
    })
}
