import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { useQuery } from "@tanstack/react-query";
import { CommentItem } from "./CommentItem";


interface Props {
    postId: number;
}

interface NewComment{
  content: string;
  parent_comment_id?: number | null;  
}

export interface Comment {
    id: number;
    post_id: number;
    parent_comment_id: number | null;
    content: string;
    created_at: string;
    author: string;
}

const createComment = async (
    newComment: NewComment, 
    postId: number, 
    userId?: string, 
    author?: string
) => {
    if (!userId || !author) {
        throw new Error (" You must be logged in to comment! ")
        
    }

    const { error } = await supabase.from ("comments").insert({
       post_id: postId,
       content: newComment.content,
       parent_comment_id: newComment.parent_comment_id || null,
       user_id: userId,
       author: author, 
    });

    if (error) throw new Error(error.message);
};

const fetchComments = async (postId: number): Promise<Comment[]> => {
    const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true })

    if (error) throw new Error(error.message);
    return data as Comment[];
}

export const CommentSection = ({postId}: Props) => {
const { user } = useAuth();
const queryClient = useQueryClient();

 const {
    data: comments,
    isLoading,
    error,
  } = useQuery<Comment[], Error>({
    queryKey: ["comments", postId],
    queryFn: () => fetchComments(postId),
    refetchInterval: 5000,
  });

const { mutate, isPending, isError } = useMutation({
    mutationFn: (newComment: NewComment) => createComment(
        newComment, 
        postId, 
        user?.id, 
        user?.user_metadata?.user_name
    ),

    onSuccess: () => {
        queryClient.invalidateQueries({queryKey: ["comments", postId]})
    }
});

    const [newCommentText, setNewCommentText] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if(!newCommentText.trim()) return;

        mutate({content: newCommentText, parent_comment_id: null});
        setNewCommentText("");
    };

    /* Map of comments - Organize replies - Return Tree */
    const buildCommentTree = (
        flatComments: Comment[]
    ): (Comment & { children?: Comment[] })[] => {
        const map = new Map<number, Comment & { children?: Comment[] }>();
        const roots: (Comment & { children?: Comment[] })[] = [];

        flatComments.forEach((comment) => {
            map.set(comment.id, { ...comment, children: [] });
        });

        flatComments.forEach((comment) => {
            if (comment.parent_comment_id) {
            const parent = map.get(comment.parent_comment_id);
            if (parent) {
                parent.children!.push(map.get(comment.id)!);
            }
            } else {
            roots.push(map.get(comment.id)!);
            }
        });

        return roots;
        };


    if (isLoading) {
    return <div> Loading comments...</div>;
    }

    if (error) {
        return <div> Error: {error.message}</div>;
    }

    const commentTree = comments ? buildCommentTree(comments) : [];


    return (
        <div className="max-w-2xl mx-auto mt-10 bg-zinc-900 p-6 rounded-xl shadow-lg text-white">
            {/* Create commnt Section */}
            <h3 className="text-xl font-semibold mb-4 border-b border-zinc-700 pb-2">Comments</h3>

            {user ? (
            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                value={newCommentText}
                rows={3}
                placeholder="Write a comment..."
                onChange={(e) => setNewCommentText(e.target.value)}
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                type="submit"
                disabled={!newCommentText}
                className={`px-4 py-2 rounded-md font-medium transition ${
                    newCommentText
                    ? "bg-cyan-600 hover:bg-cyan-700"
                    : "bg-zinc-700 cursor-not-allowed"
                }`}
                >
                {isPending ? "Posting your comment..." : "Comment"}
                </button>
                {isError && (
                <p className="text-red-500 text-sm">Error posting your comment!</p>
                )}
            </form>
            ) : (
            <p className="text-zinc-400">You must be logged in to comment!</p>
            )}

            {/* Comments display section */}
            <div className="mt-6 space-y-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            {commentTree.map((comment, key) => (
                <CommentItem key={key} comment={comment} postId={postId} />
            ))}
            </div>


        </div>

    );

};