import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { destroyImage, uploadImage } from "../lib/utils/cloudinaryHelpers.js";
import { validatePostInput } from "../lib/utils/validators/post.validator.js";
import { getPosts } from "../lib/utils/post/postHelpers.js";
import mongoose from "mongoose";
export const createPost = async (req, res) => {
  try {
    const { text, img } = req.body;
    const userId = req.user._id.toString();

    // 输入验证
    const { isValid, error, value } = validatePostInput({ text, img });
    if (!isValid) {
      return res.status(400).json({ error });
    }

    let { img: validatedImg } = value;

    // 如果有图片，上传图片
    if (validatedImg) {
      const uploadedResponse = await uploadImage(validatedImg);
      validatedImg = uploadedResponse.secure_url;
    }

    // 创建新帖子
    const newPost = new Post({
      user: userId,
      text: value.text,
      img: validatedImg,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
    console.error("Error in createPost controller: ", error.message);
  }
};

// export const deletePost = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user._id.toString();

//     // 查找帖子
//     const post = await Post.findById(id);
//     if (!post) {
//       return res.status(404).json({ error: "Post not found" });
//     }

//     // 检查权限
//     if (post.user.toString() !== userId) {
//       return res
//         .status(401)
//         .json({ error: "You are not authorized to delete this post" });
//     }

//     // 删除图片（如果有）
//     if (post.img) {
//       await destroyImage(post.img);
//     }

//     // 删除帖子
//     await Post.findByIdAndDelete(id);

//     res.status(200).json({ message: "Post deleted successfully" });
//   } catch (error) {
//     console.error("Error in deletePost controller:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Received post ID:", id); // 输出 ID 以便调试
    const userId = req.user._id.toString();

    // 检查 id 是否为有效的 ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }

    // 查找帖子
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // 检查权限
    if (post.user.toString() !== userId) {
      return res
        .status(401)
        .json({ error: "You are not authorized to delete this post" });
    }

    // 删除图片（如果有）
    if (post.img) {
      await destroyImage(post.img);
    }

    // 清除所有用户的 bookmarkedPosts 列表中相关的 postId
    await User.updateMany(
      { bookmarkedPosts: id },
      { $pull: { bookmarkedPosts: id } }
    );

    // 删除帖子
    await Post.findByIdAndDelete(id);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error in deletePost controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    post.comments.push({ user: userId, text });
    await post.save();

    res.status(200).json(post);
  } catch (error) {
    console.error("Error in commentOnPost controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      // Unlike post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
      res.status(200).json(updatedLikes);
    } else {
      // Like post
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();

      await new Notification({
        from: userId,
        to: post.user,
        type: "like",
      }).save();

      const updatedLikes = post.likes;
      res.status(200).json(updatedLikes);
    }
  } catch (error) {
    console.error("Error in likeUnlikePost controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await getPosts();
    if (posts.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error in getAllPosts controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getLikedPosts = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const likedPosts = await getPosts(
      { _id: { $in: user.likedPosts } },
      { sort: { createdAt: -1 } }
    );

    res.status(200).json(likedPosts);
  } catch (error) {
    console.error("Error in getLikedPosts controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const feedPosts = await getPosts(
      { user: { $in: user.following } },
      { sort: { createdAt: -1 } }
    );

    res.status(200).json(feedPosts);
  } catch (error) {
    console.error("Error in getFollowingPosts controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    const posts = await getPosts(
      { user: user._id },
      { sort: { createdAt: -1 } }
    );

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error in getUserPosts controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const bookmarkPost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const userBookmarkedPost = post.bookmarks.includes(userId);

    if (userBookmarkedPost) {
      // 取消收藏
      await Post.updateOne({ _id: postId }, { $pull: { bookmarks: userId } });
      await User.updateOne(
        { _id: userId },
        { $pull: { bookmarkedPosts: postId } }
      );
      const updatedBookmarks = post.bookmarks.filter(
        (id) => id.toString() !== userId.toString()
      );
      res.status(200).json(updatedBookmarks);
    } else {
      // 收藏帖子
      post.bookmarks.push(userId);
      await User.updateOne(
        { _id: userId },
        { $push: { bookmarkedPosts: postId } }
      );
      await post.save();

      await new Notification({
        from: userId,
        to: post.user,
        type: "bookmark",
      }).save();

      const updatedBookmarks = post.bookmarks;
      res.status(200).json(updatedBookmarks);
    }
  } catch (error) {
    console.error("Error in bookmarkPost controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getBookmarkedPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate({
      path: "bookmarkedPosts",
      populate: {
        path: "user",
        select: "username profileImg fullName",
      },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user.bookmarkedPosts);
  } catch (error) {
    console.error("Error in getBookmarkedPosts controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteAllBookmarks = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate({
      path: "bookmarkedPosts",
      populate: {
        path: "user",
        select: "username profileImg fullName",
      },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Clear user's bookmarkedPosts
    user.bookmarkedPosts = [];
    await user.save();

    // Clear bookmarks in the posts
    await Post.updateMany(
      { bookmarks: userId },
      { $pull: { bookmarks: userId } }
    );

    res.status(200).json({ message: "All bookmarks deleted successfully" });
  } catch (error) {
    console.error("Error in deleteAllBookmarks controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
