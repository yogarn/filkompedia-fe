import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

let refreshPromise: Promise<void> | null = null;

export function useAuthFetch() {
    const navigate = useNavigate();

    const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}, retry = true) => {
        const response = await fetch(url, {
            ...options,
            credentials: "include",
        });

        if (response.status === 401 && retry) {
            if (!refreshPromise) {
                refreshPromise = fetch(`${import.meta.env.VITE_API_URL}/auths/refresh`, {
                    method: "POST",
                    credentials: "include",
                }).then(res => {
                    if (!res.ok) {
                        navigate("/login")
                        throw new Error("Refresh failed");
                    }
                    return res.json();
                }).finally(() => {
                    refreshPromise = null;
                });
            }

            await refreshPromise;
            return await fetchWithAuth(url, options, false);
        }

        return response;
    }, [navigate]);

    return { fetchWithAuth };
}
