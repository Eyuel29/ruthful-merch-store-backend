import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';

import { errorSchema } from '@/db/validation';

export const commonResponses = {
  [HttpStatusCodes.BAD_REQUEST]: jsonContent(
    errorSchema,
    'The request is malformed or contains invalid data.',
  ),
  [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
    errorSchema,
    'Authentication required. The request did not include valid credentials.',
  ),
  [HttpStatusCodes.FORBIDDEN]: jsonContent(
    errorSchema,
    'The authenticated user does not have permission for this action.',
  ),
  [HttpStatusCodes.NOT_FOUND]: jsonContent(
    errorSchema,
    'The requested resource could not be found.',
  ),
  [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
    errorSchema,
    'Validation failed. The request contains invalid or inconsistent values.',
  ),
  [HttpStatusCodes.TOO_MANY_REQUESTS]: jsonContent(
    errorSchema,
    'The client has sent too many requests in a short time (rate limit exceeded).',
  ),
  [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
    errorSchema,
    'Unexpected server error. Please try again later.',
  ),
  [HttpStatusCodes.SERVICE_UNAVAILABLE]: jsonContent(
    errorSchema,
    'The service is temporarily unavailable. Try again later.',
  ),
};
