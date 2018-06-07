let Joi = require('joi');

module.exports = {
    validateBody: (schema) => {
        return (req, res, next) => {
            const result = Joi.validate(req.body, schema);
            if (result.error) {
                return res.status(400).json(result.error);
            }

            if (!req.value) { req.value = {}; }
            req.value['body'] = result.value;
            next();
        }
    },

    schemas: {
        sendingSchema: Joi.object().keys({
            addresses: Joi.array().max(50).items(Joi.string().length(42).required()),
            amounts: Joi.array().max(50).items(Joi.number().required())
        })
    }
}
