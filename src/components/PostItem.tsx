import { Link } from 'react-router';
import type { Post } from './PostList';

interface Props {
    post: Post;
}

export const PostItem = ({ post }: Props) => {
    return (
        <div className="bg-[#15202B] text-white border border-[#2F3336] rounded-xl mb-6 max-w-xl mx-auto shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="p-4">
                <Link to={`/post/${post.id}`} className="no-underline text-white">
                    {/* Header: Avatar and title */}
                    <div className="flex items-center gap-3 mb-3">
                        {post.avatar_url ? (
                        <img
                            src={post.avatar_url}
                            alt="User Avatar"
                            className="w-[35px] h-[35px] rounded-full object-cover"
                        />
                        ) : (
                        <div className="w-[35px] h-[35px] rounded-full bg-gradient-to-tl from-[#0d4117] to-[#00a]" />
                        )}
                        <div className="flex flex-col">
                            <div className="font-semibold text-base">{post.title}</div>
                        </div>
                    </div>

                    {/* Spacing above image */}
                    <div className="mb-2 text-sm text-gray-300">
                        {post.content}
                    </div>

                    {/* Image banner */}
                    <div className="rounded-lg overflow-hidden">
                        <img 
                            src={post.image_url} 
                            alt={post.title}
                            className="w-full h-64 object-cover"
                        />
                    </div>
                </Link>
            </div>
        </div>
    )
}
