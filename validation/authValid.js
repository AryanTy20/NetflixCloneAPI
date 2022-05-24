import joi from "joi";

export const RValidator = joi.object({
  username: joi.string().min(3).max(10).required().alphanum(),
  email: joi
    .string()
    .email({
      minDomainSegments: 1,
      tlds: { allow: ["com"] },
    })
    .required(),
  password: joi
    .string()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[#$@!%&*?])[A-Za-z\\d#$@!%&*?]{8,20}$"
      )
    )
    .required(),
  repeatPassword: joi.ref("password"),
});

export const LValidator = joi.object({
  username: [
    joi.string().min(3).max(10).required().alphanum(),
    joi
      .string()
      .email({
        minDomainSegments: 1,
        tlds: { allow: ["com"] },
      })
      .required(),
  ],
  password: joi
    .string()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[#$@!%&*?])[A-Za-z\\d#$@!%&*?]{8,20}$"
      )
    )
    .required(),
  remember: joi.boolean(),
});

export const Resetvalidator = joi.object({
  email: joi.string().email({
    minDomainSegments: 1,
    tlds: { allow: ["com"] },
  }),
  password: joi
    .string()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[#$@!%&*?])[A-Za-z\\d#$@!%&*?]{8,20}$"
      )
    )
    .required()
    .label("password"),
  repeatPassword: joi.ref("password"),
});
