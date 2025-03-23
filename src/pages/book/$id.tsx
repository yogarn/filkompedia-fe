import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { BookPagePlaceholder } from "../books/bookPlaceholder";
import { Button } from "@/components/ui/button";

interface Book {
    id: string;
    title: string;
    author: string;
    description: string;
    introduction: string;
    release_date: string;
    price: number;
    image: string;
}

const BookDetail = () => {
    const { id } = useParams<{ id: string }>();
    const { fetchWithAuth } = useAuthFetch();
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchBook = useCallback(() => {
        const apiUrl = `${import.meta.env.VITE_API_URL}/books/${id}`;

        fetchWithAuth(apiUrl, { credentials: "include" })
            .then((res) => res.json())
            .then((data) => {
                setBook(data.data)
            })
            .catch((err) => {
                console.error("Error fetching books:", err);
                setBook(null)
            })
            .finally(() => {
                setLoading(false)
            });
    }, [id, fetchWithAuth]);

    const BookImage = ({ src, title, author }: { src: string, title: string; author: string }) => {
        const [imageLoaded, setImageLoaded] = useState(false);

        return (
            <div className="relative w-full h-96 border border-gray-300 rounded-lg shadow-md flex-shrink-0">
                {!imageLoaded && <BookPagePlaceholder title={title} author={author} />}
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
        fetchBook();
    }, [fetchBook]);

    if (loading) {
        return <p className="text-center text-gray-500">Loading...</p>;
    }

    if (!book) {
        return <p className="text-center text-gray-500">Book not found.</p>;
    }

    return (
        <div className="max-w-5xl mx-auto p-6">
            <Card className="shadow-md mt-10">
                <CardContent className="grid grid-cols-3 gap-6 p-6">
                    {/* Book Cover */}
                    <div className="col-span-1">
                        {book.image ? (
                            <BookImage src={book.image} title={book.title} author={book.author} />
                        ) : (
                            <BookPagePlaceholder title={book.title} author={book.author} />
                        )}
                        <h1 className="text-2xl font-bold mt-4">{book.title}</h1>
                        <p className="text-gray-600 text-sm">by {book.author}</p>
                        <p className="text-gray-500">
                            {new Date(book.release_date).toLocaleString("en-US", {
                                month: "long",
                                year: "numeric",
                            })}
                        </p>
                    </div>

                    {/* Book Details */}
                    <div className="col-span-2">
                        <p className="text-gray-700"><a href="/books">&larr; Find another book</a></p>
                        <p className="text-gray-700 text-lg font-bold">{book.description}</p>
                        <p className="text-gray-700 mt-1">{book.introduction}</p>
                        <div className="flex justify-between items-center mt-4">
                            <p className="text-xl font-bold text-gray-800">
                                {book.price.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                            </p>
                            <div className="flex gap-4">
                                <Button className="px-6 py-2 bg-gray-500 text-white">Add to Cart</Button>
                                <Button className="px-6 py-2 bg-gray-800 text-white">Buy Now</Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Comments and Reviews */}
            <div className="mt-6 p-6 bg-gray-100 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Comments & Reviews</h2>
                <p className="text-gray-500">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
            </div>
        </div>
    );
};

export default BookDetail;