import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import {
  getUserFollowing,
  getRandomUsers,
  handlePasswordUpdate,
} from "../lib/utils/user/userHelpers.js";
import { handleImageUpdate } from "../lib/utils/cloudinaryHelpers.js";
export const getUserProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error("Error in getUserProfile: ", error.message);
  }
};

export const followUnfollowUser = async (req, res) => {
  const { id } = req.params;
  try {
    if (id === req.user._id.toString())
      return res
        .status(400)
        .json({ error: "You cannot follow or unfollow yourself" });
    const currentUser = await User.findById(req.user._id);
    const userToModify = await User.findById(id);

    if (!currentUser || !userToModify)
      return res.status(400).json({ error: "User not found" });

    const isFollowing = currentUser.following.includes(id);
    if (isFollowing) {
      // Unfollow the user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      // TODO: return the id of the user as a response
      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      // Follow the user
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      // Send notification to the user
      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: userToModify._id,
      });

      await newNotification.save();

      // TODO: return the id of the user as a response
      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error("Error in followUnfollowUser: ", error.message);
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const usersFollowedByMe = await getUserFollowing(userId);
    const suggestedUsers = await getRandomUsers(userId, usersFollowedByMe, 4);
    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.error("Error in getSuggestedUsers: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { fullName, email, username, currentPassword, newPassword, bio, link } =
    req.body;
  let { profileImg, coverImg } = req.body;

  const userId = req.user._id;

  try {
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await handlePasswordUpdate(user, currentPassword, newPassword);
    profileImg = await handleImageUpdate(user.profileImg, profileImg);
    coverImg = await handleImageUpdate(user.coverImg, coverImg);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullName: fullName || user.fullName,
        email: email || user.email,
        username: username || user.username,
        bio: bio || user.bio,
        link: link || user.link,
        profileImg: profileImg || user.profileImg,
        coverImg: coverImg || user.coverImg,
      },
      { new: true, runValidators: true }
    ).select("-password");

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in updateUser: ", error.message);
    res.status(500).json({ error: error.message });
  }
};
