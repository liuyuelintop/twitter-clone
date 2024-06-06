import { IoSettingsOutline } from "react-icons/io5";
import Posts from "../../components/common/Posts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const BookmarkPage = () => {
    const queryClient = useQueryClient();

    const { mutate: deleteBookmarks, isPending: isDeleting } = useMutation({
        mutationFn: async () => {
            try {
                const res = await fetch("/api/posts/bookmarks", {
                    method: "DELETE",
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || "Something went wrong");
                }
                return data;
            } catch (error) {
                throw new Error(error);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const handleDeleteBookmarks = () => {
        if (isDeleting) return;
        deleteBookmarks();
    };

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
                            <a onClick={handleDeleteBookmarks}>Delete all bookmarked posts</a>
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
