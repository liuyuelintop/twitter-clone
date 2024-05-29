import Joi from "joi";

const userSchema = Joi.object({
  fullName: Joi.string().min(3).required(),
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  profileImg: Joi.string().uri().allow(""),
  coverImg: Joi.string().uri().allow(""),
  bio: Joi.string().max(500).allow(""),
  link: Joi.string().uri().allow(""),
  followers: Joi.array().items(Joi.string().hex().length(24)).default([]),
  following: Joi.array().items(Joi.string().hex().length(24)).default([]),
});

export const validateUser = (data) => {
  return userSchema.validate(data);
};
