import { useEffect, useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { AdminNavBar } from "@/navbar";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import RequireRole from "@/props/requiredRole";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface User {
    id: number;
    username: string;
    email: string;
    roleId: number;
}

const UsersPage = () => {
    const { fetchWithAuth } = useAuthFetch();

    const [Users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(9);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const cartResponse = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/users?page=${page}&size=${pageSize}`);
                const cartData = await cartResponse.json();
                if (Array.isArray(cartData.data)) {
                    setUsers(cartData.data);
                    setHasMore(cartData.data.length > 0);
                } else {
                    setUsers([]);
                    setHasMore(false);
                }
            } catch (error) {
                console.error("Error fetching users data: ", error);
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [fetchWithAuth, page, pageSize]);

    const handleRoleChange = async (userId: number, newRoleId: number) => {
        try {
            const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/users/role`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: userId,
                    roleId: newRoleId,
                }),
            });

            if (response.ok) {
                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        user.id === userId ? { ...user, roleId: newRoleId } : user
                    )
                );
                toast.info("Succesfully changed user's role.");
            } else {
                console.error("Error updating role");
                toast.error("Failed to change user's role.")
            }
        } catch (error) {
            console.error("Error updating role:", error);
        }
    };

    if (loading) return <p className="text-center text-gray-500"></p>;

    return (
        <RequireRole allowedRole={1}>
            <div className="flex flex-col items-center p-6 space-y-4 w-full">
                <AdminNavBar />
                <h1 className="text-2xl font-bold">Manage Users</h1>
                {Users.length === 0 ? (
                    <p className="text-gray-500 text-center">No users available</p>
                ) : (
                    <div className="grid grid-cols-1 gap-6 w-full max-w-2xl">
                        {Users.map((user) => (
                            <Card
                                key={user.id}
                                className={`shadow-md cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg`}
                            >
                                <CardContent className="flex items-start space-x-4 w-full">
                                    <div className="flex flex-1 flex-col">
                                        <CardTitle>{user.username}</CardTitle>
                                        <p className="text-gray-600 text-sm">{user.email}</p>
                                        <p className="text-gray-500 text-sm">
                                            {user.roleId === 1 ? "Admin" : "User"}
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <Select
                                            value={user.roleId.toString()}
                                            onValueChange={(value) => handleRoleChange(user.id, Number(value))}
                                        >
                                            <SelectTrigger className="w-24">
                                                <SelectValue placeholder={user.roleId === 1 ? "Admin" : "User"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">Admin</SelectItem>
                                                <SelectItem value="0">User</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <div className="flex items-center space-x-2 mt-4">
                    <Select onValueChange={(value) => { setPage(1); setPageSize(Number(value)); }}>
                        <SelectTrigger className="w-full border border-gray-300 rounded-md p-1.5 text-sm">
                            <SelectValue placeholder={`Show ${pageSize} items`} />
                        </SelectTrigger>
                        <SelectContent className="text-sm">
                            {[9, 18, 27].map(size => (
                                <SelectItem key={size} value={size.toString()}>Show {size} items</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        disabled={page === 1 && Users === null || page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        Prev
                    </Button>

                    <Button
                        variant="outline"
                        disabled={!hasMore || Users === null}
                        onClick={() => setPage(page + 1)}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </RequireRole>
    );
};

export default UsersPage;
