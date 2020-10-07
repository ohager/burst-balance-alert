import FastestValidator, {ValidationError, ValidationSchema} from 'fastest-validator'

const jsonValidator = new FastestValidator()

export const withQueryValidation = (jsonSchema: ValidationSchema,
                                    validationFn: (args: any) => true | ValidationError[] = null) =>
    next => (req, res): void => {
        let validationResult = jsonValidator.validate(req.query, jsonSchema)
        if(validationFn){
            validationResult = validationFn(req.query);
        }
        if (validationResult === true) {
            return next(req, res)
        }
        res.status(404).send(JSON.stringify(validationResult))
    }

