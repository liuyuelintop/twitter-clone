import { IoSettingsOutline } from "react-icons/io5";
import Posts from "../../components/common/Posts";

// TODO: complete this mutation func in both backend and frontend
const deleteBookMarks = () => { };


const BookmarkPage = () => {
    return (
        <div className='flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen'>
            {/* Header */}
            <div className='flex justify-between items-center p-4 border-b border-gray-700'>
                <p className='font-bold'>BookMarked Posts</p>
                <div className='dropdown '>
                    <div tabIndex={0} role='button' className='m-1'>
                        <IoSettingsOutline className='w-4' />
                    </div>
                    <ul
                        tabIndex={0}
                        className='dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52'
                    >
                        <li>
                            <a onClick={deleteBookMarks}>Delete all bookmarked posts</a>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Bookmarked POSTS */}
            <Posts feedType="bookmarks" />
        </div>
    );
};

export default BookmarkPage;
