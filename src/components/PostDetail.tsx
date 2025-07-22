import { supabase } from "../supabase-client";
import { useQuery } from "@tanstack/react-query";
import type { Post } from "./PostList";
import { LikeButton } from "./LikeButton";


interface Props {
    postId: number;
}

const fetchPostsById = async (id: number): Promise<Post> => {
        const {data, error} = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

        if (error) throw new Error(error.message);
    
        return data as Post;
    }

export const PostDetail = ({ postId }: Props) => {

    const {data, error, isLoading} = useQuery<Post, Error>({
        
        queryKey: ['post', postId], 
        queryFn: () => fetchPostsById(postId),
        
    });

        if(isLoading) return (
            <div>
                Loading Posts ...
            </div>
        )

        if(error) return (
            <div>
                Error loading post: {error.message}
            </div>  
        )

    return (
        <div className="pt-10 max-w-2xl mx-auto px-4 text-white">
            <h2 className="text-3xl text-center font-bold mb-4">{data?.title}</h2>

            <div className="rounded-lg overflow-hidden mb-6">
                <img 
                    src={data?.image_url} 
                    alt={data?.title} 
                    className="w-full h-72 object-cover"
                />
            </div>

             <p className="text-lg text-gray-300 mb-6 leading-relaxed">{data?.content}</p>

            <p className="mt-5 italic text-sm text-gray-400">
                Posted on: {new Date(data!.created_at).toLocaleDateString()}
            </p>

            <LikeButton postId={postId} />


        </div>
    )
}