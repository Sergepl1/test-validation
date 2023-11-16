type DataType = 'string' | 'number' | 'boolean';

class FieldValidator {
    private field: FieldDefinition = {} as FieldDefinition;

    constructor(public type: DataType) {}

    public required(): this {
        this.field.required = true;
        return this;
    }

    public validate(validator: (value: any) => boolean): this {
        this.field.validate = validator;
        return this;
    }

    public min(minValue: number): this {
        if (this.type === 'string') {
            (this.field as StringFieldDefinition).minLength = minValue;
        } else if (this.type === 'number') {
            (this.field as NumberFieldDefinition).min = minValue;
        }
        return this;
    }

    public max(maxValue: number): this {
        if (this.type === 'string') {
            (this.field as StringFieldDefinition).maxLength = maxValue;
        } else if (this.type === 'number') {
            (this.field as NumberFieldDefinition).max = maxValue;
        }
        return this;
    }

    public pattern(regexp: RegExp): this {
        if (this.type === 'string') {
            (this.field as StringFieldDefinition).pattern = regexp;
        }
        return this;
    }

    public build(): FieldDefinition {
        this.field.type = this.type
        return this.field;
    }
}

export function string(): FieldValidator {
    return new FieldValidator('string');
}

export function number(): FieldValidator {
    return new FieldValidator('number');
}

export function boolean(): FieldValidator {
    return new FieldValidator('boolean');
}

interface BaseFieldDefinition {
    type?: DataType;
    required?: boolean;
    validate?: (value: any) => boolean;
}

interface StringFieldDefinition extends BaseFieldDefinition {
    type: 'string';
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
}

interface NumberFieldDefinition extends BaseFieldDefinition {
    type: 'number';
    min?: number;
    max?: number;
}

interface BooleanFieldDefinition extends BaseFieldDefinition {
    type: 'boolean';
}

type FieldDefinition = StringFieldDefinition | NumberFieldDefinition | BooleanFieldDefinition;

export type Schema = { [key: string]: FieldValidator };

export function validateObject(schema: Schema, obj: any): { value?: any; error?: string } {
    try {
        const validatedObject: { [key: string]: any } = {};

        for (const fieldName in schema) {
            const field = schema[fieldName].build(); // Build the FieldDefinition
            const value = obj[fieldName];

            // Check if required field is missing
            if (field.required && value === undefined) {
                throw new Error(`'${fieldName}' is required.`);
            }

            // Check data type
            if (field.type && typeof value !== field.type) {
                throw new Error(`'${fieldName}' must be of type '${field.type}'.`);
            }

            // String-specific validations
            if (field.type === 'string') {
                const stringField = field as StringFieldDefinition;

                // Pattern validation
                if (stringField.pattern && !stringField.pattern.test(value)) {
                    throw new Error(`'${fieldName}' does not match the pattern.`);
                }

                // Length validation
                if (stringField.minLength && value.length < stringField.minLength) {
                    throw new Error(`'${fieldName}' must be at least ${stringField.minLength} characters.`);
                }

                if (stringField.maxLength && value.length > stringField.maxLength) {
                    throw new Error(`'${fieldName}' must be at most ${stringField.maxLength} characters.`);
                }
            }

            // Number-specific validations
            if (field.type === 'number') {
                const numberField = field as NumberFieldDefinition;

                // Min and max value validation
                if (numberField.min !== undefined && value < numberField.min) {
                    throw new Error(`'${fieldName}' must be at least ${numberField.min}.`);
                }

                if (numberField.max !== undefined && value > numberField.max) {
                    throw new Error(`'${fieldName}' must be at most ${numberField.max}.`);
                }
            }

            // Custom validation
            if (field.validate && !field.validate(value)) {
                throw new Error(`Custom validation for '${fieldName}' did not pass.`);
            }

            // If all validations passed, add to the validated object
            validatedObject[fieldName] = value;
        }

        return { value: validatedObject };
    } catch (error: any) {
        return { error: error.message };
    }
}
