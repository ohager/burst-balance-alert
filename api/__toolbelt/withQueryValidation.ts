import FastestValidator, {ValidationError, ValidationSchema} from 'fastest-validator'

const jsonValidator = new FastestValidator()

const AlwaysTrue = (): true => true

export const withQueryValidation = (jsonSchema: ValidationSchema,
                                    validationFn: (args: object) => true | ValidationError[] = AlwaysTrue) =>
    next => (req, res): void => {
        let validationResult = jsonValidator.validate(req.query, jsonSchema)
        validationResult = validationFn(req.query);
        if (validationResult === true) {
            return next(req, res)
        }
        res.status(404).send(JSON.stringify(validationResult))
    }

