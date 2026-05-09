const joi = require("joi");

const schemas = {
    register: joi.object({
        userName: joi.string().alphanum().min(3).max(30).required(),
        password: joi.string().alphanum().min(8).max(20).required()
    }),
    login: joi.object({
        userName: joi.string().required(),
        password: joi.string().required()
    })
};

const validate = (schema) => (req, res, next) => {
    if (!req.body) return res.status(400).json({ message: "Request body is missing" });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    next();
};

module.exports = { validate, schemas };