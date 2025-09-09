import { createMiddleware } from 'hono/factory';
import { DatabaseError } from 'pg';
import * as HttpStatusCodes from 'stoker/http-status-codes';

export interface ErrorHandlerEnv {
  Variables: {
    error: {
      message: string;
      status: number;
    } | null;
  };
}

export const errorHandler = createMiddleware<ErrorHandlerEnv>(async (c, next) => {
  try {
    await next();
  }
  catch (error) {
    console.error('Unhandled Error:', error);
    const errorResponse = {
      message: 'An unexpected error occurred.',
      status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
    };
    if (error instanceof DatabaseError) {
      errorResponse.message = 'Database error occurred. Please try again later.';
      errorResponse.status = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    }
    else {
      errorResponse.message = 'Internal server error!';
      errorResponse.status = HttpStatusCodes.UNAUTHORIZED;
    }

    c.set('error', errorResponse);
    return c.json({ message: errorResponse.message });
  }
});

export default errorHandler;
