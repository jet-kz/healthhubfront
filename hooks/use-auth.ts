import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { LoginResponse, User, RegisterPayload } from '@/types';
import { useRouter } from 'next/navigation';

export function useAuth() {
    const { setUser } = useAuthStore();
    const queryClient = useQueryClient();
    const router = useRouter();

    // Load User Query - Use Zustand persisted data as initial, then refresh from API
    const { data: user, isLoading, isError } = useQuery<User>({
        queryKey: ['user'],
        queryFn: async () => {
            const response = await apiClient.get<User>('/auth/me'); // Hits proxy -> backend
            const userData = response.data;
            setUser(userData); // Sync with Zustand + localStorage
            return userData;
        },
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: typeof window !== 'undefined' && document.cookie.includes('access_token'), // Only fetch if token exists
        initialData: () => {
            // Use persisted data from Zustand/localStorage as initial data
            // This prevents flash of unauthenticated state on page reload
            if (typeof window !== 'undefined') {
                const persistedState = useAuthStore.getState();
                return persistedState.user || undefined;
            }
            return undefined;
        },
    });

    // Login Mutation
    const loginMutation = useMutation({
        mutationFn: async (credentials: any) => {
            // Hits /api/auth/login proxy
            const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
            return response.data;
        },
        onSuccess: (data) => {
            setUser(data.user);
            queryClient.setQueryData(['user'], data.user);
            
            // Redirect based on role
            const role = data.user.role?.toLowerCase()
            if (role === 'doctor') router.push('/dashboard/doctor')
            else if (role === 'lab') router.push('/dashboard/lab')
            else if (role === 'pharmacy') router.push('/dashboard/pharmacy')
            else router.push('/dashboard')
        },
    });

    // Logout Mutation
    const logoutMutation = useMutation({
        mutationFn: async () => {
            await apiClient.post('/auth/logout');
        },
        onSuccess: () => {
            // Clear Zustand state (which also clears localStorage)
            const { logout: clearAuth } = useAuthStore.getState();
            clearAuth();
            // Clear React Query cache
            queryClient.setQueryData(['user'], null);
            queryClient.clear();
            // Redirect to login
            router.push('/login');
        },
    });

    // Register Mutation
    const registerMutation = useMutation({
        mutationFn: async (data: RegisterPayload) => {
            // Hits /api/auth/register proxy
            const response = await apiClient.post<LoginResponse>('/auth/register', data);
            return response.data;
        },
        onSuccess: (data) => {
            setUser(data.user);
            queryClient.setQueryData(['user'], data.user);
            
            // Redirect based on role
            const role = data.user.role?.toLowerCase()
            if (role === 'doctor') router.push('/dashboard/doctor')
            else if (role === 'lab') router.push('/dashboard/lab')
            else if (role === 'pharmacy') router.push('/dashboard/pharmacy')
            else router.push('/dashboard')
        },
    });

    return {
        user,
        isLoading,
        isError,
        login: loginMutation.mutate,
        isLoggingIn: loginMutation.isPending,
        loginError: loginMutation.error,
        register: registerMutation.mutate,
        isRegistering: registerMutation.isPending,
        registerError: registerMutation.error,
        logout: logoutMutation.mutate,
    };
}
