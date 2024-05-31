import Notification from "../models/notification.model.js";

// TODO: Fix this function in the future
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "username profileImg",
    });

    await Notification.updateMany({ to: userId }, { read: true });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error in getNotifications function: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// export const getNotifications = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     // 更新读取状态
//     await Notification.updateMany({ to: userId, read: false }, { read: true });

//     // 再次查询以获取更新后的通知状态
//     const notifications = await Notification.find({ to: userId }).populate({
//       path: "from",
//       select: "username profileImg",
//     });

//     res.status(200).json(notifications);
//   } catch (error) {
//     console.error("Error in getNotifications function: ", error.message);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.deleteMany({ to: userId });

    res.status(200).json({ message: "Notifications deleted successfully" });
  } catch (error) {
    console.error("Error in deleteNotifications function: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
