import { useEffect, useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/navbar";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { BookCartPlaceholder } from "../books/bookPlaceholder";
import { useNavigate } from "react-router-dom";

interface CartItem {
    id: number;
    book_id: number;
    amount: number;
    checkout_id: string;
    book: {
        id: number;
        title: string;
        author: string;
        price: number;
        image: string;
    };
}

const BookImage = ({ src, title }: { src: string, title: string; author: string }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <div className="w-24 h-32 object-cover rounded-lg bg-gray-200 border border-gray-300">
            {!imageLoaded && <BookCartPlaceholder title={title} />}
            <img
                src={src}
                alt={title}
                className={`w-24 h-32 object-cover rounded-lg transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"
                    }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(false)}
            />
        </div>
    );
};

const CartsPage = () => {
    const navigate = useNavigate();
    const { fetchWithAuth } = useAuthFetch();

    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState<{ [key: number]: boolean }>({});

    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                const cartResponse = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/carts/user`);
                const cartData = await cartResponse.json();

                const filteredCart = cartData.data.filter((item: any) => item.checkout_id === "00000000-0000-0000-0000-000000000000");

                const bookPromises = filteredCart.map(async (item: any) => {
                    const bookResponse = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/books/${item.book_id}`);
                    const bookData = await bookResponse.json();
                    return { ...item, book: bookData.data };
                });

                const cartWithBooks = await Promise.all(bookPromises);
                setCartItems(cartWithBooks);
            } catch (error) {
                console.error("Error fetching cart items: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCartItems();
    }, [fetchWithAuth]);

    const updateQuantity = async (id: number, delta: number) => {
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id ? { ...item, amount: Math.max(1, item.amount + delta) } : item
            )
        );
    
        try {
            const item = cartItems.find(item => item.id === id);
            if (!item) {
                throw new Error("Cart item not found.");
            }

            if (Math.max(1, item.amount + delta) == 1) {
                toast.error("Couldn't update quantity less than one, try remove the cart instead!");
                return
            }

            const cart_id = item.id;
            const amount = Math.max(1, item.amount + delta)

            const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/carts`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({cart_id, amount})
            });
    
            if (!response.ok) {
                throw new Error("Failed to update cart quantity.");
            }
    
            toast.success("Cart quantity updated successfully.");
        } catch (error) {
            toast.error("Failed to update cart quantity.");
            console.error("Error updating cart:", error);
        }
    };    

    const removeItem = async (id: number) => {
        try {
            const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/carts/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
                toast.info("Cart removed succesfully.")
            } else {
                throw new Error("Failed to delete cart.");
            }
        } catch (error) {
            console.error("Error removing item: ", error);
            toast.error("Failed to delete cart.")
        }
    };

    const checkout = async () => {
        const carts_id = cartItems.map(item => item.id);
        
        try {
            const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/checkouts/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ carts_id })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            window.open(data.data.redirect_url, "_blank");
            // change later to payments list page
            navigate("/checkouts");
            toast.info("Succesfully checkouts cart");
        } catch (error) {
            console.error("Error during checkout:", error);
            toast.error("Failed to checkout the carts.")
        }
    };    

    const toggleSelect = (id: number) => {
        setSelectedItems((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const totalCost = cartItems.reduce((sum, item) => sum + (selectedItems[item.id] ? item.amount * item.book.price : 0), 0);

    if (loading) return <p className="text-center text-gray-500"></p>;

    return (
        <div className="flex flex-col items-center p-6 space-y-4 w-full">
            <NavBar />
            <h1 className="text-2xl font-bold">Your Cart</h1>
            {cartItems.length === 0 ? (
                <p className="text-gray-500 text-center">Your cart is empty</p>
            ) : (
                <div className="grid grid-cols-1 gap-6 w-full max-w-2xl">
                    {cartItems.map((item) => (
                        <Card
                            key={item.id}
                            className={`shadow-md cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg ${selectedItems[item.id] ? 'bg-green-100' : ''}`}
                            onClick={() => toggleSelect(item.id)}
                        >
                            <CardContent className="flex items-start space-x-4 w-full">
                                {item.book.image ? (
                                    <BookImage src={item.book.image} title={item.book.title} author={item.book.author} />
                                ) : (
                                    <BookCartPlaceholder title={item.book.title} />
                                )}
                                <div className="flex flex-1 flex-col">
                                    <CardTitle>{item.book.title}</CardTitle>
                                    <p className="text-gray-600 text-sm">{item.book.author}</p>
                                    <p className="text-gray-500 text-sm">Price: {item.book.price.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</p>
                                    <p className="text-base font-semibold mt-2">Subtotal: {(item.amount * item.book.price).toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</p>
                                </div>
                                <div className="flex flex-col items-end space-y-2 ml-auto">
                                    <div className="flex items-center border border-gray-300 rounded-md px-2 py-1">
                                        <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }} className="p-2"><Minus size={16} /></button>
                                        <span className="px-4 text-lg font-semibold">{item.amount}</span>
                                        <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }} className="p-2"><Plus size={16} /></button>
                                    </div>
                                    <Button onClick={(e) => { e.stopPropagation(); removeItem(item.id); }} variant="outline" className="w-full bg-red-500 text-white hover:bg-red-600 hover:text-white">Remove</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            {cartItems.length > 0 && (
                <div className="fixed bottom-0 left-0 w-full bg-white shadow-md p-4 flex justify-between items-center">
                    <p className="text-lg font-bold">Total: {totalCost.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</p>
                    <Button disabled={totalCost === 0} className="bg-green-400 text-white px-6 py-2 rounded-lg hover:bg-green-500" onClick={() => checkout()}>Checkout</Button>
                </div>
            )}
        </div>
    );
};

export default CartsPage;