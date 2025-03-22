import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthFetch } from "@/hooks/useAuthFetch";

interface Book {
    id: string;
    title: string;
    description: string;
    author: string;
    release_date: string;
    price: number;
}

export default function BookList() {
    const { fetchWithAuth } = useAuthFetch();
    
    const [books, setBooks] = useState<Book[] | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [hasMore, setHasMore] = useState(true);
    
    const fetchBooks = useCallback(() => {
        const apiUrl = `${import.meta.env.VITE_API_URL}/books?search=${search}&page=${page}&size=${pageSize}`;
        console.log("query: " + search + " page: " + page + " size: " + pageSize)

        fetchWithAuth(apiUrl, { credentials: "include" })
            .then((res) => res.json())
            .then((data) => {
                setBooks(data.data.length > 0 ? data.data : null);
                setHasMore(data.data.length > 0);
            })
            .catch((err) => {
                console.error("Error fetching books:", err);
                setBooks(null);
            });
    }, [search, page, pageSize, fetchWithAuth]);

    useEffect(() => {
        setPage(1)
    }, [search])

    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    return (
        <div className="flex flex-col items-center p-6 space-y-4 w-full">
            <h1 className="text-2xl font-bold">FilkomPedia</h1>

            {/* Search Input and Button */}
            <div className="flex space-x-2 w-full max-w-md">
                <Input
                    type="text"
                    placeholder="Search books..."
                    className="w-full"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Books Grid */}
            {books === null ? (
                <div className="flex justify-center items-center w-full h-full">
                    <p className="text-gray-500 text-center">That's all for now. Try search something else!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">

                    {books.map((book) => (
                        <Card key={book.id} className="shadow-md">
                            <CardHeader>
                                <CardTitle>{book.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">{book.description}</p>
                                <p className="text-sm text-gray-500 mt-2">Author: {book.author}</p>
                                <p className="text-sm text-gray-500">
                                    Release: {new Date(book.release_date).toDateString()}
                                </p>
                                <p className="text-lg font-semibold mt-2">
                                    Price: Rp {book.price.toLocaleString()}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination and Page Size */}
            <div className="flex items-center space-x-2 mt-4">
                <Select onValueChange={(value) => { setPage(1); setPageSize(Number(value)); }}>
                    <SelectTrigger className="w-full border border-gray-300 rounded-md p-1.5 text-sm">
                        <SelectValue placeholder={`Show ${pageSize} items`} />
                    </SelectTrigger>
                    <SelectContent className="text-sm">
                        {[10, 20, 30].map(size => (
                            <SelectItem key={size} value={size.toString()}>Show {size} items</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button
                    variant="outline"
                    disabled={page === 1 && books === null || page === 1}
                    onClick={() => setPage(page - 1)}
                >
                    Prev
                </Button>

                <Button
                    variant="outline"
                    disabled={!hasMore || books === null}
                    onClick={() => setPage(page + 1)}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
