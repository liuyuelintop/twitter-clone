import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../../../models/user.model.js";
/**
 * 获取指定用户关注的用户 ID 列表
 *
 * @param {ObjectId} userId - 要查找的用户的 ID
 * @returns {Promise<Array<string>>} - 返回一个包含关注用户的 ObjectId 数组
 *
 * @throws {Error} - 如果用户未找到或者查询过程中发生错误，抛出错误
 */
export const getUserFollowing = async (userId) => {
  try {
    const user = await User.findById(userId).select("following");
    if (!user) {
      throw new Error("User not found");
    }
    return user.following;
  } catch (error) {
    console.error("Error in getUserFollowing:", error.message);
    throw error;
  }
};

/**
 * 获取随机推荐用户
 *
 * @param {ObjectId} currentUserId - 当前用户的 ID
 * @param {Array<ObjectId>} excludeUserIds - 需要排除的用户 ID 列表
 * @param {Number} sampleSize - 随机获取的用户数量
 * @returns {Promise<Array<Object>>} - 随机推荐的用户列表
 *
 * @throws {Error} - 如果查询过程中发生错误，抛出错误
 */
export const getRandomUsers = async (
  currentUserId,
  excludeUserIds = [],
  sampleSize = 4
) => {
  try {
    const users = await mongoose.model("User").aggregate([
      {
        $match: {
          _id: { $ne: currentUserId, $nin: excludeUserIds },
        },
      },
      {
        $sample: { size: sampleSize },
      },
      {
        $project: {
          password: 0,
        },
      },
    ]);
    return users;
  } catch (error) {
    console.error("Error in getRandomUsers:", error.message);
    throw error;
  }
};

/**
 * 更新用户密码
 *
 * @param {Object} user - 用户对象
 * @param {string} currentPassword - 当前密码
 * @param {string} newPassword - 新密码
 * @throws {Error} - 如果当前密码不正确或新密码不符合要求，抛出错误
 */
export const handlePasswordUpdate = async (
  user,
  currentPassword,
  newPassword
) => {
  if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
    throw new Error("Please provide both current password and new password");
  }

  if (currentPassword && newPassword) {
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new Error("Current password is incorrect");
    if (newPassword.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
  }
};
