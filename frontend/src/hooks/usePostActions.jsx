import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
    deletePostRequest,
    likePostRequest,
    commentPostRequest,
    bookmarkPostRequest
} from "../services/postService";

/**
 * Custom hook to handle various actions on a post such as delete, like, comment, and bookmark.
 * 
 * @param {Object} post - The post object that contains the details of the post.
 * @param {Object} authUser - The authenticated user object.
 * @param {Object} location - The location object from react-router.
 * 
 * @returns {Object} - Returns an object containing the mutation functions for delete, like, comment, and bookmark actions.
 * 
 * @example
 * const { deletePost, likePost, commentPost, bookmarkPost } = usePostActions(post, authUser, location);
 */
export const usePostActions = (post, authUser, location) => {
    const queryClient = useQueryClient();

    /**
     * Mutation function to delete a post.
     * 
     * @returns {Mutation} - Returns a mutation object for deleting the post.
     * 
     * @example
     * deletePost.mutate();
     */
    const {
        mutate: deletePost,
        isLoading: isDeleting,
    } = useMutation({
        mutationFn: () => deletePostRequest(post._id),
        onSuccess: () => {
            toast.success("Post deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    /**
     * Mutation function to like a post.
     * 
     * @returns {Mutation} - Returns a mutation object for liking the post.
     * 
     * @example
     * likePost.mutate();
     */
    const {
        mutate: likePost,
        isLoading: isLiking,
    } = useMutation({
        mutationFn: () => likePostRequest(post._id),
        onSuccess: (updatedLikes) => {
            queryClient.setQueryData(["posts"], (oldData) =>
                oldData.map((p) => (p._id === post._id ? { ...p, likes: updatedLikes } : p))
            );
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    /**
     * Mutation function to comment on a post.
     * 
     * @returns {Mutation} - Returns a mutation object for commenting on the post.
     * 
     * @example
     * commentPost.mutate(commentText);
     */
    const {
        mutate: commentPost,
        isLoading: isCommenting,
    } = useMutation({
        mutationFn: (comment) => commentPostRequest(post._id, comment),
        onSuccess: () => {
            toast.success("Comment posted successfully");
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    /**
     * Mutation function to bookmark a post.
     * 
     * @returns {Mutation} - Returns a mutation object for bookmarking the post.
     * 
     * @example
     * bookmarkPost.mutate();
     */
    const {
        mutate: bookmarkPost,
        isLoading: isBookmarking,
    } = useMutation({
        mutationFn: () => bookmarkPostRequest(post._id),
        onSuccess: (updatedBookmarks) => {
            if (/^\/bookmarks\/[^\/]+$/.test(location.pathname)) {
                queryClient.invalidateQueries({ queryKey: ["posts"] });
            } else {
                queryClient.setQueryData(["posts"], (oldData) =>
                    oldData.map((p) => (p._id === post._id ? { ...p, bookmarks: updatedBookmarks } : p))
                );
            }
            toast.success("Bookmarks have been updated!");
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    return { deletePost, likePost, commentPost, bookmarkPost, isDeleting, isLiking, isCommenting, isBookmarking };
};
