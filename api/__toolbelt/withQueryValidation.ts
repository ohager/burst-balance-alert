import FastestValidator, {ValidationSchema} from 'fastest-validator'

const jsonValidator = new FastestValidator()

export const withQueryValidation = (jsonSchema: ValidationSchema) => next => (req, res): void => {
    const validationResult = jsonValidator.validate(req.query, jsonSchema)
    if (validationResult === true) {
        return next(req, res)
    }
    res.status(404).send(JSON.stringify(validationResult))
}

