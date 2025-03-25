import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { BookPagePlaceholder } from "../books/bookPlaceholder";
import { Button } from "@/components/ui/button";
import CommentSection from "./comments";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";

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

const BookDetail = () => {
    const { id } = useParams<{ id: string }>();
    const { fetchWithAuth } = useAuthFetch();
    const [book, setBook] = useState<Book | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const fetchBook = useCallback(() => {
        fetchWithAuth(`${import.meta.env.VITE_API_URL}/books/${id}`)
            .then(res => res.json())
            .then(data => setBook(data.data))
            .catch(err => console.error("Error fetching book:", err))
            .finally(() => setLoading(false));
    }, [id, fetchWithAuth]);

    const handleAddToCart = async () => {
        if (!book) return;
        setAddingToCart(true);
        try {
            const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/carts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ user_id: currentUserId, book_id: book.id, amount: quantity }),
            });
            if (!response.ok) throw new Error("Failed to add to cart");
            toast.info("Item succesfully added to cart.")
        } catch (error) {
            console.error("Error adding to cart:", error);
            toast.error("Failed to add to cart.")
        } finally {
            setAddingToCart(false);
        }
    };

    useEffect(() => {
        fetchWithAuth(`${import.meta.env.VITE_API_URL}/users/me`)
        .then(res => res.json())
        .then(data => setCurrentUserId(data.data.id))
        .catch(err => console.error("Error fetching user:", err));

        fetchBook();
    }, [fetchBook, fetchWithAuth]);

    if (loading) return <p className="text-center text-gray-500">Loading...</p>;
    if (!book) return <p className="text-center text-gray-500">Book not found.</p>;

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
                                <div className="flex items-center border border-gray-300 rounded-md px-2 py-1">
                                    <button onClick={() => setQuantity(prev => Math.max(1, prev - 1))} className="p-2"><Minus size={16} /></button>
                                    <span className="px-4 text-lg font-semibold">{quantity}</span>
                                    <button onClick={() => setQuantity(prev => prev + 1)} className="p-2"><Plus size={16} /></button>
                                </div>
                                <Button className="h-auto px-6 py-2 bg-gray-500 text-white" onClick={handleAddToCart} disabled={addingToCart}>
                                    {addingToCart ? "Adding..." : "Add to Cart"}
                                </Button>
                                <Button className="h-auto px-6 py-2 bg-gray-800 text-white">Buy Now</Button>

                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Comment Section */}
            <CommentSection bookId={book.id} />
        </div>
    );
};

export default BookDetail;
