interface IResponseModel<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const createSuccessResponse = <T>(
  data: T,
  message?: string
): IResponseModel<T> => ({
  success: true,
  data,
  message,
});

export const createErrorResponse = (
  message: string,
  error?: string
): IResponseModel<null> => ({
  success: false,
  message,
  error,
});
