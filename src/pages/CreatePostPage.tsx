import { CreatePost } from '../components/CreatePost'

export const CreatepostPage = () => {
    return (
        <div>
            {" "}
            <h2 className="text-6xl font-bold mb-6 text-center bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">Create New Post</h2>
            <CreatePost />
        </div>
    )
}