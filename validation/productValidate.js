import joi from "joi";

export const wishListValidate = joi.object({
  id: joi.number().required(),
  title: joi.string().required().max(150),
  posterPath: joi.string().required().max(200),
});
