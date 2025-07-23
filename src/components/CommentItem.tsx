import { useState } from "react";
import type { Comment } from "./CommentSection";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Props {
  comment: Comment & {
    children?: Comment[];
  };
  postId: number;
}

const createReply = async (
  replyContent: string,
  postId: number,
  parent_comment_id: number,
  userId?: string,
  author?: string
) => {
  if (!userId || !author) {
    throw new Error("You must be logged in to reply!");
  }

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    content: replyContent,
    parent_comment_id: parent_comment_id || null,
    user_id: userId,
    author: author,
  });

  if (error) throw new Error(error.message);
};

export const CommentItem = ({ comment, postId }: Props) => {
  const [showReply, setShowReply] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>("");
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true); // ← true means replies are hidden

  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (replyContent: string) =>
      createReply(
        replyContent,
        postId,
        comment.id,
        user?.id,
        user?.user_metadata?.user_name
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      setReplyText("");
      setShowReply(false);
    },
  });

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    mutate(replyText);
  };

  return (
    <div>
      <div className="bg-zinc-900 text-white p-4 rounded-xl shadow-md mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold text-sm text-cyan-400">@{comment.author}</span>
          <span className="text-xs text-zinc-400">
            {new Date(comment.created_at).toLocaleString()}
          </span>
        </div>

        <p className="text-sm text-zinc-100 mb-3">{comment.content}</p>

        <button
          onClick={() => setShowReply((prev) => !prev)}
          className="text-sm text-cyan-400 hover:underline hover:text-cyan-300 transition"
        >
          {showReply ? "Cancel" : "Reply"}
        </button>
      </div>

      {/* Reply Form */}
      {showReply && user && (
        <form onSubmit={handleReplySubmit} className="space-y-4 ml-4 mb-4">
          <textarea
            value={replyText}
            rows={2}
            placeholder="Write a reply..."
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button
            type="submit"
            disabled={!replyText.trim()}
            className={`px-4 py-2 rounded-md font-medium transition ${
              replyText.trim()
                ? "bg-cyan-600 hover:bg-cyan-700"
                : "bg-zinc-700 cursor-not-allowed"
            }`}
          >
            {isPending ? "Posting your reply..." : "Reply"}
          </button>
          {isError && (
            <p className="text-red-500 text-sm">Error posting your reply!</p>
          )}
        </form>
      )}

      {/* Toggle Replies Button */}
      {comment.children && comment.children.length > 0 && (
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="text-sm text-cyan-400 ml-4 mb-2 hover:underline hover:text-cyan-300 transition"
        >
          {isCollapsed ? (
            <>Show Replies <span className="ml-1">▼</span></>
          ) : (
            <>Hide Replies <span className="ml-1">▲</span></>
          )}
        </button>
      )}

      {/* Replies Section */}
      {!isCollapsed && comment.children && (
        <div className="ml-6 space-y-4">
          {comment.children.map((child, key) => (
            <CommentItem key={key} comment={child} postId={postId} />
          ))}
        </div>
      )}
    </div>
  );
};
