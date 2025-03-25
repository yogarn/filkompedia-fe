import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { Link } from "react-router-dom";
import { BookPlaceholder } from "./bookPlaceholder";
import { NavBar } from "@/navbar";

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

export default function BookList() {
    const { fetchWithAuth } = useAuthFetch();

    const [books, setBooks] = useState<Book[] | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(9);
    const [hasMore, setHasMore] = useState(true);

    const fetchBooks = useCallback(() => {
        const apiUrl = `${import.meta.env.VITE_API_URL}/books?search=${search}&page=${page}&size=${pageSize}`;

        fetchWithAuth(apiUrl, { credentials: "include" })
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data.data)) {
                    setBooks(data.data);
                    setHasMore(data.data.length > 0);
                } else {
                    setBooks([]);
                    setHasMore(false);
                }
            })
            .catch((err) => {
                console.error("Error fetching books:", err);
                setBooks([]);
            });
    }, [search, page, pageSize, fetchWithAuth]);

    const BookImage = ({ src, title, author }: { src: string, title: string; author: string }) => {
        const [imageLoaded, setImageLoaded] = useState(false);

        return (
            <div className="relative w-32 h-48 border border-gray-300 rounded-lg shadow-md flex-shrink-0">
                {!imageLoaded && <BookPlaceholder title={title} author={author} />}
                <img
                    src={src}
                    alt={title}
                    className={`w-full h-full object-cover rounded-lg transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"
                        }`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageLoaded(false)}
                />
            </div>
        );
    };

    useEffect(() => {
        setPage(1)
    }, [search])

    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    return (
        <div className="flex flex-col items-center p-6 space-y-4 w-full">
            <NavBar />
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
            {books === null || books.length === 0 ? (
                <div className="flex justify-center items-center w-full h-full">
                    <p className="text-gray-500 text-center">That's all for now. Try searching for something else!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
                    {books?.map((book) => (
                        <Link to={`/book/${book.id}`} key={book.id} className="no-underline">
                            <Card className="shadow-md cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
                                <CardContent className="flex items-start space-x-4">
                                    {/* Book Image (Left Side) */}
                                    {book.image ? (
                                        <BookImage src={book.image} title={book.title} author={book.author} />
                                    ) : (
                                        <BookPlaceholder title={book.title} author={book.author} />
                                    )}


                                    {/* Book Details (Right Side) */}
                                    <div className="flex flex-col">
                                        <CardTitle>{book.title}</CardTitle>
                                        <p className="text-gray-600 text-sm mt-1">{book.description}</p>

                                        <p className="text-sm text-gray-500 mt-2">{book.author}</p>
                                        <p className="text-sm text-gray-500">{new Date(book.release_date).toLocaleString("en-US", { month: "long", year: "numeric" })}</p>

                                        <p className="text-base font-semibold mt-2">{book.price.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
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
                        {[9, 18, 27].map(size => (
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
