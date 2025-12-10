import { type ZodSchema } from 'zod';

/**
 * Creates a validator function for TanStack Form that uses Zod v4 schemas
 * @param schema - A Zod schema to validate against
 * @returns A validator function compatible with TanStack Form
 */
export function zodValidator<T>(schema: ZodSchema<T>) {
  return ({ value }: { value: T }) => {
    const result = schema.safeParse(value);
    if (!result.success) {
      return result.error.issues.map((error: { message: string }) => error.message).join(', ');
    }
    return undefined;
  };
}

/**
 * Creates a field-level validator function for TanStack Form using Zod schemas
 * @param schema - A Zod schema to validate the field value against
 * @returns A validator function compatible with TanStack Form field validators
 */
export function zodFieldValidator<T>(schema: ZodSchema<T>) {
  return ({ value }: { value: T }): string | undefined => {
    const result = schema.safeParse(value);
    if (!result.success) {
      return result.error.issues[0]?.message;
    }
    return undefined;
  };
}
