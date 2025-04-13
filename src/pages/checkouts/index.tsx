import { useEffect, useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { NavBar } from "@/navbar";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { BookCartPlaceholder } from "../books/bookPlaceholder";

interface Checkout {
    id: string;
    user_id: string;
    books: CheckoutBook[];
    total_price?: number;
    status_id?: number;
    token?: string;
}

interface CheckoutBook {
    id: string;
    user_id: string;
    book_id: string;
    amount: number;
    checkout_id: string;
    book: {
        id: string;
        title: string;
        author: string;
        price: number;
        image: string;
    };
}

const handlePaymentRedirect = (paymentsId?: string) => {
    if (paymentsId) {
        window.open(`https://app.sandbox.midtrans.com/snap/v4/redirection/${paymentsId}#/payment-list`, "_blank");
    }
};


const BookImage = ({ src, title }: { src: string, title: string }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    return (
        <div className="w-24 h-32 object-cover rounded-lg bg-gray-200 border border-gray-300">
            {!imageLoaded && <BookCartPlaceholder title={title} />}
            <img
                src={src}
                alt={title}
                className={`w-24 h-32 object-cover rounded-lg transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(false)}
            />
        </div>
    );
};

const CheckoutsPage = () => {
    const { fetchWithAuth } = useAuthFetch();
    const [checkouts, setCheckouts] = useState<Checkout[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCheckouts = async () => {
            try {
                const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/checkouts/user`);
                const checkoutData = await response.json();

                const paymentsResponse = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/payments/user`);
                const paymentsData = await paymentsResponse.json();

                const checkoutPromises = checkoutData.data.map(async (checkout: any) => {
                    const booksResponse = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/checkouts/${checkout.id}`);
                    const booksData = await booksResponse.json();

                    const bookDetailsPromises = booksData.data.map(async (item: any) => {
                        const bookResponse = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/books/${item.book_id}`);
                        const bookData = await bookResponse.json();
                        return { ...item, book: bookData.data };
                    });

                    const booksWithDetails = await Promise.all(bookDetailsPromises);
                    const payment = paymentsData.data.find((p: any) => p.checkout_id === checkout.id);

                    return { ...checkout, books: booksWithDetails, total_price: payment?.total_price, status_id: payment?.status_id, token: payment?.token };
                });

                const checkoutsWithBooks = await Promise.all(checkoutPromises);
                setCheckouts(checkoutsWithBooks);
            } catch (error) {
                console.error("Error fetching checkouts: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCheckouts();
    }, [fetchWithAuth]);

    if (loading) return <p className="text-center text-gray-500">Loading...</p>;

    return (
        <div className="flex flex-col items-center p-6 space-y-4 w-full">
            <NavBar />
            <h1 className="text-2xl font-bold">Your Checkouts</h1>
            {checkouts.length === 0 ? (
                <p className="text-gray-500 text-center">No checkouts available</p>
            ) : (
                <div className="grid grid-cols-1 gap-6 w-full max-w-2xl">
                    {checkouts.map((checkout) => (
                        <Card key={checkout.id} className="shadow-md">
                            <CardContent className="space-y-4">
                                <CardTitle>
                                    <div className="flex items-center space-x-2">
                                        {[1, 2, 3].includes(checkout.status_id ?? -1) ? (
                                            <span
                                                className={`px-3 py-1 text-sm font-semibold rounded-lg text-white
      ${checkout.status_id === 1 ? "bg-green-500" : "bg-red-600"}
    `}
                                            >
                                                {checkout.status_id === 1
                                                    ? "Success"
                                                    : "Denied or Cancelled"}
                                            </span>
                                        ) : (
                                            <button
                                                className="px-3 py-1 text-sm font-semibold rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition"
                                                onClick={() => handlePaymentRedirect(checkout.token)}
                                            >
                                                Waiting for Payment
                                            </button>
                                        )}
                                    </div>
                                </CardTitle>

                                {checkout.books.map((bookItem) => (
                                    <div key={bookItem.id} className="flex items-start space-x-4 border-t pt-4">
                                        {bookItem.book.image ? (
                                            <BookImage src={bookItem.book.image} title={bookItem.book.title} />
                                        ) : (
                                            <BookCartPlaceholder title={bookItem.book.title} />
                                        )}
                                        <div className="flex flex-col">
                                            <h2 className="font-semibold">{bookItem.book.title}</h2>
                                            <p className="text-gray-600 text-sm">{bookItem.book.author}</p>
                                            <p className="text-gray-500 text-sm">Price: {bookItem.book.price.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</p>
                                            <p className="text-base font-semibold mt-2">Amount: {bookItem.amount}</p>
                                        </div>
                                    </div>
                                ))}
                                <p className="text-lg font-bold text-left border-t pt-4">Total: {checkout.total_price?.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CheckoutsPage;
