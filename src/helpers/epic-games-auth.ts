import { EGTokenEndpoint } from '../constants';
import { IEGAccessToken, IEGError } from '../interfaces';
import { TEpicGamesClient } from '../types';
import { CustomException } from './app-error';

export const getEGAuthHeader = (client: TEpicGamesClient) => {
  let cliendId: string = '';
  let clientSecret: string = '';
  // Get Client Details before generating header
  switch (client) {
    case 'fortnite_android_game':
      cliendId = '3f69e56c7649492c8cc29f1af08a8a12';
      clientSecret = 'b51ee9cb12234f50a69efa67ef53812e';

      break;

    case 'fortnite_pc_game':
      cliendId = 'ec684b8c687f479fadea3cb2ad83f5c6';
      clientSecret = 'e1f31c211f28413186262d37a13fc84d';

      break;
    default:
      throw new CustomException('Unsupported Client Name provided. Please try again later.', 400);
  }
  // Epic Games expects the header to be like this
  return Buffer.from(`${cliendId}:${clientSecret}`, 'utf8').toString('base64');
};

export const getEGAccountAccessToken = async () => {
  const authHeader = getEGAuthHeader('fortnite_android_game');

  const body = new URLSearchParams({
    grant_type: 'device_auth',
    account_id: process.env.EPIC_GAMES_ACCOUNT_ID!,
    device_id: process.env.EPIC_GAMES_DEVICE_ID!,
    secret: process.env.EPIC_GAMES_DEVICE_ID_SECRET!,
  });

  const response = await fetch(EGTokenEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authHeader}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body,
  });

  if (response.ok) {
    const successData = (await response.json()) as IEGAccessToken;

    return successData;
  } else {
    const errorData = (await response.json()) as IEGError;

    throw errorData;
  }
};
