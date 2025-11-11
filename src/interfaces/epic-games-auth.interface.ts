export interface IEGAccessToken {
    access_token: string;
    expires_in: number;
    expires_at: string;
    token_type: string;
    refresh_token: string;
    refresh_expires: number;
    refresh_expires_at: string;
    account_id: string;
    client_id: string;
    internal_client: boolean;
    client_service: string;
    displayName: string;
    app: string;
    in_app_id: string;
    device_id: string;
    product_id: string;
    application_id: string;
    acr: string;
    auth_time: string;
};

export interface IEGError {
  errorCode: string;
  errorMessage: string;
  messageVars: string[];
  numericErrorCode: number;
  originatingService: string;
  intent: string;
  error_description: string;
  error: string;
};