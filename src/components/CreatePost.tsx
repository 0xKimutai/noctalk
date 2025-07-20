import React, { useState, type ChangeEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../supabase-client';

interface PostInput {
    title: string;
    content: string;
}

const createPost = async (post: PostInput, imageFile: File) => {
    const filePath = `${post.title}-${Date.now()}-${imageFile.name}`;
    const { error: uploadError } = await supabase.storage.from("post-images").upload(filePath, imageFile);
    if (uploadError) throw new Error(uploadError.message);

    const { data: publicUrlData } = supabase.storage.from("post-images").getPublicUrl(filePath);
    const { data, error } = await supabase.from("posts").insert({ ...post, image_url: publicUrlData.publicUrl });
    if (error) throw new Error(error.message);
    return data;
};

export const CreatePost = () => {
    const [title, setTitle] = useState<string>('');
    const [content, setContent] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { mutate } = useMutation({
        mutationFn: (data: { post: PostInput, imageFile: File }) => {
            return createPost(data.post, data.imageFile);
        }
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!selectedFile) return;
        mutate({ post: { title, content }, imageFile: selectedFile });
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-xl mx-auto mt-10 p-6 bg-[#1a1a1b] text-white rounded-lg shadow-lg space-y-6"
        >
            <h2 className="text-2xl font-semibold">Create a Post</h2>

            <div>
                <label htmlFor="title" className="block mb-1 font-medium text-gray-300">Title</label>
                <input
                    type="text"
                    id="title"
                    required
                    onChange={(event) => setTitle(event.target.value)}
                    className="w-full p-3 rounded-md bg-[#272729] border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
            </div>

            <div>
                <label htmlFor="content" className="block mb-1 font-medium text-gray-300">Content</label>
                <textarea
                    id="content"
                    rows={5}
                    required
                    onChange={(event) => setContent(event.target.value)}
                    className="w-full p-3 rounded-md bg-[#272729] border border-gray-600 text-white resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
            </div>

            <div>
                <label htmlFor="image" className="block mb-1 font-medium text-gray-300">Upload Image</label>
                <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full p-2 text-sm bg-[#272729] text-gray-300 border border-gray-600 rounded-md file:bg-gray-700 file:border-0 file:px-3 file:py-2 file:text-white file:font-medium file:hover:bg-orange-500 transition"
                />
            </div>

            <button
                type="submit"
                className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-md transition duration-200"
            >
                Create Post
            </button>
        </form>
    );
};
