import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useEffect, useState } from "react";

interface User {
    id: string;
    username: string;
    email: string;
    roleId: number;
}

interface RequireRoleProps {
    allowedRole: number;
    children: React.ReactNode;
}

const RequireRole = ({ allowedRole, children }: RequireRoleProps) => {
    const { fetchWithAuth, authChecking } = useAuthFetch();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWithAuth(`${import.meta.env.VITE_API_URL}/users/me`)
            .then(res => res.json())
            .then(data => {
                setCurrentUser(data.data);
            })
            .catch(err => console.error("Error fetching user:", err))
            .finally(() => setLoading(false));
    }, [fetchWithAuth]);

    if (authChecking || loading) {
        return <p className="text-center"></p>;
    }

    if (!currentUser || allowedRole === -1) {
        return (
            <div className="flex flex-col items-center p-6 space-y-4 w-full">
                <div className="flex justify-center items-center w-full h-full">
                    <p className="text-gray-700 text-center">
                        You don't belong here! Try searching for something else!
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default RequireRole;
