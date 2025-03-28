import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { Book } from "lucide-react";

interface Book {
    id: string;
    title: string;
    description: string;
    introduction: string;
    author: string;
    release_date: string;
    image: string;
    file: string;
    price: number;
}

export default function BookEdit() {
    const { id } = useParams<{ id: string }>();
    const { fetchWithAuth } = useAuthFetch();
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchBook = useCallback(async () => {
        try {
            const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/books/${id}`);
            const data = await res.json();
            if (res.ok) setBook(data.data);
            else setBook(null)
        } catch (err) {
            console.error("Error fetching book:", err);
        } finally {
            setLoading(false);
        }
    }, [id, fetchWithAuth]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        try {
            const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/books`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(book)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to save book.");
            }

            toast.info("Successfully save book details.")
        } catch (err: any) {
            console.error(err)
            toast.error("Failed to save book.");
        }
    };

    useEffect(() => {
        fetchBook();
    }, [fetchBook, fetchWithAuth]);

    if (!loading && !book) {
        return (
            <div className="flex flex-col items-center p-6 space-y-4 w-full">
                <div className="flex justify-center items-center w-full h-full">
                    <p className="text-gray-700 text-center">You caught us! Try searching for something else!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gray-200 space-y-6 p-6">
            {/* Book Form */}
            <Card className="w-full max-w-md shadow-lg rounded-lg p-4 bg-gray-100">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Manage Book</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <Input
                                type="text"
                                placeholder="Title"
                                value={book?.title || ""}
                                onChange={(e) => setBook((prev) => ({ ...prev!, title: e.target.value }))}
                                className="border border-gray-300"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <Input
                                type="text"
                                placeholder="Description"
                                value={book?.description || ""}
                                onChange={(e) => setBook((prev) => ({ ...prev!, description: e.target.value }))}
                                className="border border-gray-300"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Introduction</label>
                            <Input
                                type="text"
                                placeholder="Introduction"
                                value={book?.introduction || ""}
                                onChange={(e) => setBook((prev) => ({ ...prev!, introduction: e.target.value }))}
                                className="border border-gray-300"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Author</label>
                            <Input
                                type="text"
                                placeholder="Author"
                                value={book?.author || ""}
                                onChange={(e) => setBook((prev) => ({ ...prev!, author: e.target.value }))}
                                className="border border-gray-300"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Release Date</label>
                            <Input
                                type="date"
                                value={book?.release_date ? book.release_date.split("T")[0] : ""}
                                onChange={(e) => setBook((prev) => ({ ...prev!, release_date: e.target.value }))}
                                className="border border-gray-300"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Image URL</label>
                            <Input
                                type="text"
                                placeholder="Image URL"
                                value={book?.image || ""}
                                onChange={(e) => setBook((prev) => ({ ...prev!, image: e.target.value }))}
                                className="border border-gray-300"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">File URL</label>
                            <Input
                                type="text"
                                placeholder="File URL"
                                value={book?.file || ""}
                                onChange={(e) => setBook((prev) => ({ ...prev!, file: e.target.value }))}
                                className="border border-gray-300"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Price (Rp)</label>
                            <Input
                                type="text"
                                placeholder="Price (Rp)"
                                value={book?.price ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(book.price) : ""}
                                onChange={(e) => {
                                    const numericValue = Number(e.target.value.replace(/\D/g, "")); // Remove non-numeric chars
                                    setBook((prev) => ({ ...prev!, price: numericValue }));
                                }}
                                className="border border-gray-300"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col space-y-2">
                            <Link to="/admin/books" className="w-full">
                                <Button type="button" className="w-full bg-white text-black border border-black hover:bg-gray-200">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" className="w-full bg-black text-white hover:bg-gray-900">
                                Save
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
