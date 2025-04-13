import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthFetch } from "@/hooks/useAuthFetch";

export default function UserProfileView() {
    const { fetchWithAuth } = useAuthFetch();
    const { id } = useParams<{ id: string }>();

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<{
        username: string;
        profilePicture: string;
        roleId: number;
        email: string;
    } | null>(null);

    const fetchUserProfile = useCallback(async () => {
        try {
            const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/users/${id}`);
            const data = await res.json();

            if (res.ok) {
                setProfile({
                    username: data.data.username,
                    profilePicture: data.data.profilePicture,
                    roleId: data.data.roleId,
                    email: data.data.email,
                });
            } else {
                throw new Error("Failed to fetch user profile");
            }
        } catch (err) {
            console.error("Error fetching user profile:", err);
            toast.error("Error fetching user profile.");
        } finally {
            setLoading(false);
        }
    }, [fetchWithAuth, id]);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-200">
                <p className="text-gray-700">Loading profile...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-200">
                <p className="text-gray-700">User not found.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-200 p-6 space-y-6">
            {profile.profilePicture && (
                <img
                    src={profile.profilePicture}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover shadow-md"
                />
            )}

            <div className="w-full max-w-sm space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">User Id</label>
                    <Input value={id || ""} disabled className="border border-gray-300" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <Input value={profile.email} disabled className="border border-gray-300" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <Input value={profile.username} disabled className="border border-gray-300" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <Input
                        value={profile.roleId === 1 ? "Admin" : "User"}
                        disabled
                        className="border border-gray-300"
                    />
                </div>

                <Link to="/books" className="w-full">
                    <Button className="w-full bg-black text-white hover:bg-gray-900">Back to Books</Button>
                </Link>
            </div>
        </div>
    );
}
