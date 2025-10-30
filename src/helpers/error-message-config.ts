import { ContentfulStatusCode } from 'hono/utils/http-status';
import z from 'zod';
import { DrizzleError } from 'drizzle-orm';
import { DrizzleQueryError } from 'drizzle-orm/errors';

import { CustomException } from './';

export const globalErrorMessage = (error: any) => {
    let statusCode: ContentfulStatusCode = 500;
    let message: string = error?.message || 'Unknown Error Occured. Please try again later.';

    if (error instanceof SyntaxError) {
        statusCode = 400;
        message = 'Invalid JSON format, please check your request body.';
    };

    if (error instanceof CustomException) {
        statusCode = error.statusCode;
        message = error.message;
    };

    if (error instanceof z.ZodError) {
        statusCode = 400;
        message = `Unknown Validation Error: ${error.issues.join(', ')}`;

        if (error.issues.length > 0) {
            message = error.issues[0].message;
        };
    };

    if (error instanceof DrizzleError) {
        message = error.message;
    };

    if (error instanceof DrizzleQueryError) {
        message = `There is an error getting data from database. Reason: ${error.message}`;
    };

    return { message, status_code: statusCode };
};