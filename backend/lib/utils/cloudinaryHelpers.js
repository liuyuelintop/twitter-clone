import { v2 as cloudinary } from "cloudinary";

/**
 * 上传图片到 Cloudinary
 *
 * 该函数接收图片路径，将图片上传到 Cloudinary，并返回上传结果。
 * 如果上传过程中发生错误，将抛出错误。
 *
 * @param {string} imagePath - 图片路径
 * @returns {Promise<Object>} - 返回包含上传结果的对象
 *
 * @throws {Error} - 如果上传过程中发生错误，抛出错误
 */
export const uploadImage = async (imagePath) => {
  try {
    const result = await cloudinary.uploader.upload(imagePath);
    return result;
  } catch (error) {
    console.error("Error uploading image: ", error.message);
    throw error;
  }
};

/**
 * 从 Cloudinary 删除图片
 *
 * 该函数接收图片 URL，提取其 publicId，然后从 Cloudinary 删除该图片。
 * 如果删除过程中发生错误，将抛出错误。
 *
 * @param {string} imageUrl - 图片的 URL
 * @returns {Promise<void>} - 无返回值
 * @throws {Error} - 如果删除过程中发生错误，抛出错误
 */
export const destroyImage = async (imageUrl) => {
  try {
    const publicId = imageUrl.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error destroying image: ", error.message);
    throw error;
  }
};

/**
 * 处理图片更新
 *
 * @param {string} existingImageUrl - 现有图片 URL
 * @param {string} newImageUrl - 新图片 URL
 * @returns {Promise<string>} - 新图片的 URL
 * @throws {Error} - 如果上传或删除过程中发生错误，抛出错误
 */
export const handleImageUpdate = async (existingImageUrl, newImageUrl) => {
  if (!newImageUrl) return existingImageUrl;

  if (existingImageUrl) {
    await destroyImage(existingImageUrl);
  }

  const uploadedResponse = await uploadImage(newImageUrl);
  return uploadedResponse.secure_url;
};
