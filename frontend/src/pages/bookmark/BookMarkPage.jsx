import Posts from "../../components/common/Posts";

const BookmarkPage = () => {
    return (
        <div className='flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen'>
            {/* Header */}
            <div className='flex w-full border-b border-gray-700 p-4'>
                <h1 className='text-xl font-bold'>Bookmarked Posts</h1>
            </div>

            {/* Bookmarked POSTS */}
            <Posts feedType="bookmarks" />
        </div>
    );
};

export default BookmarkPage;
