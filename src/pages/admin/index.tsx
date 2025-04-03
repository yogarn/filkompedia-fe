import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { AdminNavBar } from "@/navbar";
import RequireRole from "@/props/requiredRole";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
    return (
        <RequireRole allowedRole={1}>
            <div className="flex flex-col items-center pt-6 space-y-4 w-full">
                <AdminNavBar />
                <div className="max-w-5xl mx-auto p-6">
                    <h1 className="text-2xl font-bold mt-4 mb-4 ml-2">Admin Dashboard</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">

                        <Link to={`/admin/users`} className="no-underline">
                            <Card className="shadow-md cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
                                <CardContent className="space-x-4">
                                    <CardTitle>Manage Users</CardTitle>
                                    <p className="text-gray-600 text-sm mt-1">Click here to manage users, including manage roles.</p>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link to={`/admin/books`} className="no-underline">
                            <Card className="shadow-md cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
                                <CardContent className="space-x-4">
                                    <CardTitle>Manage Books</CardTitle>
                                    <p className="text-gray-600 text-sm mt-1">Click here to manage books, including creating, updating, or deleting books.</p>
                                </CardContent>
                            </Card>
                        </Link>

                        <a href="https://dashboard.sandbox.midtrans.com/beta/transactions" target="_blank" rel="noopener noreferrer" className="no-underline">
                            <Card className="shadow-md cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
                                <CardContent className="space-x-4">
                                    <CardTitle>Monitor Transactions</CardTitle>
                                    <p className="text-gray-600 text-sm mt-1">Click here to monitoring transactions. You will be redirected to Midtrans.</p>
                                </CardContent>
                            </Card>
                        </a>

                        <a href="https://grafana-filkompedia.yogarn.my.id" target="_blank" rel="noopener noreferrer" className="no-underline">
                            <Card className="shadow-md cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
                                <CardContent className="space-x-4">
                                    <CardTitle>Monitor Server Metrics</CardTitle>
                                    <p className="text-gray-600 text-sm mt-1">Click here to monitoring server metrics. You will be redirected to Grafana Dashboard.</p>
                                </CardContent>
                            </Card>
                        </a>
                    </div>
                </div>
            </div>
        </RequireRole>
    )
}

export default AdminDashboard;