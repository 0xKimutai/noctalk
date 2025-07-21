import { PostList } from '../components/PostList';

export const Home = () => {
  return (
    <div >
        <div>
          <h2 className='text-5xl text-center mb-10'>Recent Updates</h2>
          <div>
            <PostList />
          </div>
        </div>
    </div>
  );
}