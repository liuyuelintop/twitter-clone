import Joi from "joi";

const postSchema = Joi.object({
  text: Joi.string().allow(""), // 允许文本为空
  img: Joi.string().uri().allow(""), // 允许图片URL为空
}).or("text", "img"); // 至少需要一个字段

/**
 * 验证帖子输入
 *
 * 该函数使用 Joi 库验证帖子输入，确保 `text` 和 `img` 至少有一个存在。
 * 验证规则包括：文本可以为空，图片必须是有效的 URI，可以为空。
 *
 * @param {Object} data - 要验证的帖子数据对象
 * @param {string} data.text - 帖子文本
 * @param {string} data.img - 图片URL
 * @returns {Object} - 包含 `isValid` 布尔值、`error` 字符串和 `value` 验证后的值的对象
 *
 * @example
 * // 验证帖子输入
 * const { isValid, error, value } = validatePostInput({ text: "Hello, world!", img: "" });
 * if (isValid) {
 *   console.log("Valid input:", value);
 * } else {
 *   console.error("Validation error:", error);
 * }
 */
export const validatePostInput = (data) => {
  const { error, value } = postSchema.validate(data, { abortEarly: false });
  if (error) {
    return {
      isValid: false,
      error: error.details.map((x) => x.message).join(", "),
    };
  }
  return { isValid: true, error: null, value };
};
