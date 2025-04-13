import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuthFetch } from "@/hooks/useAuthFetch";

export default function ProfileEdit() {
    const { fetchWithAuth } = useAuthFetch();
    const [loading, setLoading] = useState(true);
    const [id, setId] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchProfile = useCallback(async () => {
        try {
            const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/users/me`);
            const data = await res.json();
            if (res.ok) {
                setUsername(data.data.username);
                setId(data.data.id);
                setProfilePicture(data.data.profilePicture);
            } else {
                setUsername(null);
                throw new Error("Failed to fetch profile");
            }
        } catch (err) {
            console.error("Error fetching profile:", err);
            toast.error("Error fetching profile.");
        } finally {
            setLoading(false);
        }
    }, [fetchWithAuth]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username) {
            toast.error("Username cannot be empty.");
            return;
        }

        try {
            const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/users`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, profilePicture }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to save profile.");
            }

            navigate("/books");
            toast.success("Successfully saved profile details.");
        } catch (err: any) {
            console.error("Error:", err);
            toast.error(err.message || "Failed to save profile.");
        }
    };

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!id) {
            toast.error("User ID is missing.");
            return;
        }

        try {
            const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/users/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to delete account.");
            }

            toast.success("Successfully deleted account.");
            navigate("/login");
        } catch (err: any) {
            console.error("Error:", err);
            toast.error("Failed to delete account.");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            toast.error("No file selected.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/users/picture`, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to upload image.");
            }

            setProfilePicture(data.data);
            toast.success("File uploaded successfully.");
        } catch (err: any) {
            console.error("Upload error:", err);
            toast.error(err.message || "Failed to upload image.");
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    if (!loading && !id) {
        return (
            <div className="flex flex-col items-center p-6 space-y-4 w-full">
                <div className="flex justify-center items-center w-full h-full">
                    <p className="text-gray-700 text-center">No profile found. Please try again later.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gray-200 space-y-6 p-6">
            <Card className="w-full max-w-md shadow-lg rounded-lg p-4 bg-gray-100">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Manage Account</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <Input
                                type="text"
                                placeholder="Username"
                                value={username || ""}
                                onChange={(e) => setUsername(e.target.value)}
                                className="border border-gray-300"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                            {profilePicture && (
                                <img src={profilePicture} alt="Profile" className="w-24 h-24 object-cover" />
                            )}
                            <div className="flex space-x-2">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="border border-gray-300"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col space-y-2">
                            <Link to="/books" className="w-full">
                                <Button type="button" className="w-full bg-white text-black border border-black hover:bg-gray-200">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" className="w-full bg-black text-white hover:bg-gray-900">
                                Save
                            </Button>
                            <Button
                                type="button"
                                onClick={handleDelete}
                                className="w-full bg-red-600 text-white hover:bg-red-700"
                            >
                                Delete Account
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
