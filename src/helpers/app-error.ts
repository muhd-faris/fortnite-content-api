import { ContentfulStatusCode } from 'hono/utils/http-status';

class AppError extends Error {
    public statusCode: ContentfulStatusCode;

    constructor(
        message: string,
        statusCode: ContentfulStatusCode = 500
    ) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    };
};

export class CustomException extends AppError {
    constructor(message = 'Unknown error occured. Please try again later.', errorCode: ContentfulStatusCode) {
        super(
            message,
            errorCode || 500
        );
        this.name = 'CustomException';
    };
};