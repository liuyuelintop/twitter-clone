// lib/utils/responseHelper.js

export const createResponse = (payload, excludeFields = []) => {
  const response = { ...payload };
  excludeFields.forEach((field) => delete response[field]);
  return response;
};
