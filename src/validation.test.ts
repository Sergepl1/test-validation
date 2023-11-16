import { string, number, boolean, Schema, validateObject } from './validation';

describe('validateObject', () => {
    let schema: Schema = {
        name: string().min(2).max(20).required(),
        age: number().min(18).max(99),
        isStudent: boolean().required(),
    };

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should validate object against schema with string, number, and boolean types', () => {

        // Valid object
        const validObject = { name: 'John', age: 25, isStudent: true };
        const result = validateObject(schema, validObject);
        expect(result).toEqual({ value: validObject });
    });

    it('should handle missing required field', () => {
        // Invalid object - missing required field 'name'
        const invalidObject = { age: 25, isStudent: true };
        const result = validateObject(schema, invalidObject);
        expect(result.error).toContain("'name' is required.");
    });

    it('should handle string length validation', () => {
        // Invalid object - 'name' does not meet the minimum length requirement
        const invalidObject = { name: 'J', age: 25, isStudent: true };
        const result = validateObject(schema, invalidObject);
        expect(result.error).toContain("'name' must be at least 2 characters.");
    });

    it('should handle number range validation', () => {
        // Invalid object - 'age' is less than the minimum value
        const invalidObject = { name: 'John', age: 17, isStudent: true };
        const result = validateObject(schema, invalidObject);
        expect(result.error).toContain("'age' must be at least 18.");
    });

    it('should handle missing required boolean field', () => {
        // Invalid object - 'isStudent' is missing
        const invalidObject = { name: 'John', age: 25 };
        const result =  validateObject(schema, invalidObject);
        expect(result.error).toContain("'isStudent' is required.");
    });

    it('should validate object against schema with custom validation functions', () => {
        schema = {
            username: string().validate((value: string) => value.length >= 5),
            password: string().min(8),
            hasSpecialChar: boolean().validate((value: boolean) => value),
        };

        // Valid object
        const validObject = { username: 'john_doe', password: 'securePwd123', hasSpecialChar: true };
        const result = validateObject(schema, validObject);
        expect(result).toEqual({ value: validObject });
    });

    it('should handle custom validation failure for username', () => {
        // Invalid object - custom validation for 'username' fails
        const invalidObject = { username: 'john', password: 'securePwd123', hasSpecialChar: true };
        const result = validateObject(schema, invalidObject);
        expect(result.error).toContain("Custom validation for 'username' did not pass.");
    });

    it('should handle minimum length validation for password', () => {
        // Invalid object - 'password' does not meet the minimum length requirement
        const invalidObject = { username: 'john_doe', password: 'pwd', hasSpecialChar: true };
        const result = validateObject(schema, invalidObject);
        expect(result.error).toContain("'password' must be at least 8 characters.");
    });

    it('should handle custom validation failure for hasSpecialChar', () => {
        // Invalid object - custom validation for 'hasSpecialChar' fails
        const invalidObject = { username: 'john_doe', password: 'securePwd123', hasSpecialChar: false };
        const result = validateObject(schema, invalidObject);
        expect(result.error).toContain("Custom validation for 'hasSpecialChar' did not pass.");
    });

    it('should validate object against schema with string pattern validation', () => {
        schema = {
            email: string().pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/),
        };

        // Valid object
        const validObject = { email: 'john@example.com' };
        const result = validateObject(schema, validObject);
        expect(result).toEqual({ value: validObject });
    });

    it('should handle pattern validation failure for email', () => {
        // Invalid object - 'email' does not match the pattern
        const invalidObject = { email: 'invalid-email' };
        const result = validateObject(schema, invalidObject);
        expect(result.error).toContain("'email' does not match the pattern.");
    });
});
