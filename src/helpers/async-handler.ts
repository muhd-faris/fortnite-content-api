import { TCFContext } from '../types';
import { globalErrorMessage } from './';

type THandlerFunction = (c: TCFContext) => Promise<Response> | Response;

export const asyncHandler = (handler: THandlerFunction) => {
  return async (c: TCFContext): Promise<Response> => {
    try {
      return await handler(c);
    } catch (error: any) {
      const err = globalErrorMessage(error);

      return c.json({ message: err.message }, err.status_code);
    }
  };
};
