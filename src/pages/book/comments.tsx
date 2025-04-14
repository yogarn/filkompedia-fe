import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Link } from "react-router-dom";

interface Comment {
    id: string;
    user_id: string;
    username: string;
    profilePicture: string;
    book_id: string;
    comment: string;
    rating: string;
    created_at: string;
}

const CommentSection = ({ bookId }: { bookId: string }) => {
    const { fetchWithAuth } = useAuthFetch();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [rating, setRating] = useState("5");
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [editingComment, setEditingComment] = useState<Comment | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [hasPurchased, setHasPurchased] = useState(false);
    const [roleId, setRoleId] = useState(0);

    const fetchComments = useCallback(() => {
        fetchWithAuth(`${import.meta.env.VITE_API_URL}/comments/book/${bookId}`)
            .then(res => res.json())
            .then(data => setComments(data.data || []))
            .catch(err => console.error("Error fetching comments:", err));
    }, [fetchWithAuth, bookId]);

    useEffect(() => {
        fetchWithAuth(`${import.meta.env.VITE_API_URL}/users/me`)
            .then(res => res.json())
            .then(data => {
                setCurrentUserId(data.data.id);
                setRoleId(data.data.roleId);
            }
            )
            .catch(err => console.error("Error fetching user:", err));

        fetchWithAuth(`${import.meta.env.VITE_API_URL}/payments/book/${bookId}`)
            .then(res => res.json())
            .then(data => setHasPurchased(data.data))
            .catch(err => console.error("Error checking purchase status:", err));

        fetchComments();
    }, [fetchWithAuth, fetchComments, bookId]);

    const submitComment = async () => {
        if (newComment.length < 5) {
            toast.error("Comment must be at least 5 characters long.");
            return;
        }

        try {
            const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ book_id: bookId, comment: newComment, rating: Number(rating) })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to submit comment.");
            }

            setNewComment("");
            setRating("5");
            fetchComments();
        } catch (err: any) {
            console.error(err)
            toast.error("Failed to submit comment.");
        }
    };

    const deleteComment = async (commentId: string) => {
        try {
            await fetchWithAuth(`${import.meta.env.VITE_API_URL}/comments/${commentId}`, { method: "DELETE" });
            toast.success("Comment deleted successfully.");
            fetchComments();
        } catch (err: any) {
            console.error("Error deleting comment:", err);
            toast.error(err.response?.data?.message || "Failed to delete comment.");
        }
    };


    const editComment = async () => {
        if (!editingComment) return;

        if (editingComment.comment.length < 5) {
            toast.error("Comment must be at least 5 characters long.");
            return;
        }

        try {
            const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/comments/book/${bookId}/comment/${editingComment.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ comment: editingComment.comment, rating: Number(editingComment.rating) })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to edit comment.");
            }

            setIsDialogOpen(false);
            setTimeout(() => setEditingComment(null), 200);
            fetchComments();
        } catch (err: any) {
            console.error("Error editing comment:", err);
            toast.error("Failed to edit comment.");
        }
    };

    return (
        <div className="mt-6 p-6 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Comments & Reviews</h2>

            <Textarea
                placeholder={hasPurchased ? "Write a comment..." : "You must buy this book first before giving a comment."}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-4"
                minLength={5}
                required
                disabled={!hasPurchased}
            />

            <div className="flex items-center gap-4 mb-6">
                <Select value={rating} onValueChange={setRating} disabled={!hasPurchased}>
                    <SelectTrigger className="w-20">
                        <SelectValue placeholder="Rating" />
                    </SelectTrigger>
                    <SelectContent>
                        {[1, 2, 3, 4, 5].map((num) => (
                            <SelectItem key={num} value={String(num)}>
                                {num}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button onClick={submitComment} className="ml-auto" disabled={!hasPurchased}>Submit</Button>
            </div>

            <div className="space-y-4">
                {comments.length === 0 ? (
                    <p className="text-gray-500">No comments yet.</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="p-4 bg-white rounded-lg shadow-md">
                            <div className="flex items-center space-x-3">
                                <Avatar className="w-12 h-12 overflow-hidden">
                                    <AvatarImage src={comment.profilePicture} className="w-full h-full object-cover" />
                                    <AvatarFallback>AV</AvatarFallback>
                                </Avatar>

                                <div>
                                    <Link to={`/profile/${comment.user_id}`} className="text-gray-800 font-semibold hover:underline">
                                        {comment.username}
                                    </Link>
                                    <p className="text-sm text-gray-500">{new Date(comment.created_at).toLocaleString()}</p>
                                </div>
                            </div>

                            <p className="mt-2" dangerouslySetInnerHTML={{ __html: comment.comment }} />
                            <p className="text-sm text-gray-600">Rating: {comment.rating}/5</p>

                            <div className="mt-2 flex gap-2">
                                {comment.user_id === currentUserId && (
                                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button onClick={() => {
                                                setEditingComment(comment);
                                                setIsDialogOpen(true);
                                            }}>Edit</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Edit Comment</DialogTitle>
                                            </DialogHeader>
                                            <Textarea
                                                value={editingComment?.comment || ""}
                                                onChange={(e) => setEditingComment(prev => prev ? { ...prev, comment: e.target.value } : null)}
                                            />
                                            <div className="flex items-center gap-2">
                                                <Select
                                                    value={String(editingComment?.rating ?? "5")}
                                                    onValueChange={(value) =>
                                                        setEditingComment((prev) => (prev ? { ...prev, rating: value } : null))
                                                    }
                                                >
                                                    <SelectTrigger className="w-20">
                                                        <SelectValue placeholder="Rating" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {[1, 2, 3, 4, 5].map((num) => (
                                                            <SelectItem key={num} value={String(num)}>
                                                                {num}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                <DialogFooter className="flex justify-between items-center w-full">
                                                    <Button variant="outline" onClick={() => {
                                                        setIsDialogOpen(false);
                                                        setTimeout(() => setEditingComment(null), 200);
                                                    }}>
                                                        Cancel
                                                    </Button>
                                                    <Button onClick={() => { editComment(); }}>
                                                        Save
                                                    </Button>
                                                </DialogFooter>
                                            </div>

                                        </DialogContent>
                                    </Dialog>
                                )}
                                {(comment.user_id === currentUserId || roleId == 1) && (
                                    <Button className="bg-red-500 text-white" onClick={() => deleteComment(comment.id)}>
                                        Delete
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CommentSection;
