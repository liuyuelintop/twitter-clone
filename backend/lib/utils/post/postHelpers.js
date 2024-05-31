import Post from "../../../models/post.model.js";

/**
 * 获取符合条件的帖子
 *
 * 该函数根据提供的查询条件从数据库中获取帖子，并支持自定义排序和填充选项。
 *
 * @param {Object} filter - 查询条件，默认为空对象表示获取所有帖子
 * @param {Object} [options] - 可选参数，如排序条件，默认为按创建时间降序排序
 * @param {Array} [populateOptions] - 可选参数，populate 配置数组，默认为填充 user 和 comments.user，并排除 password 字段
 * @returns {Promise<Array>} - 符合条件的帖子数组
 *
 * @throws {Error} - 如果查询过程中发生错误，抛出错误
 *
 * @example
 * // 获取所有帖子，按创建时间降序排序，并填充 user 和 comments.user
 * const posts = await getPosts();
 *
 * @example
 * // 获取指定用户的所有帖子，按创建时间降序排序
 * const userPosts = await getPosts({ user: userId });
 *
 * @example
 * // 获取用户关注者的帖子，并按创建时间降序排序，使用自定义填充选项
 * const followingPosts = await getPosts(
 *   { user: { $in: followingIds } },
 *   { sort: { createdAt: -1 } },
 *   [
 *     { path: "user", select: "username" },
 *     { path: "comments.user", select: "username email" }
 *   ]
 * );
 */
export const getPosts = async (
  filter = {},
  options = { sort: { createdAt: -1 } },
  populateOptions = [
    { path: "user", select: "-password" },
    { path: "comments.user", select: "-password" },
  ]
) => {
  try {
    let query = Post.find(filter).sort(options.sort);

    // 添加自定义的 populate 配置
    populateOptions.forEach((option) => {
      query = query.populate(option);
    });

    return await query;
  } catch (error) {
    console.error("Error in getPosts function:", error);
    throw error;
  }
};
