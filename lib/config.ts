// lib/config.ts
import Constants from 'expo-constants';

const extras =
  // Expo SDK 45+ uses expoConfig, some environments use manifest
  (Constants as any).expoConfig?.extra ?? (Constants as any).manifest?.extra ?? {};

// Provide API_PREFIX via app config (see instructions below)
export const API_PREFIX = `https://brt30fpab4.execute-api.ap-south-1.amazonaws.com`; //extras.API_PREFIX ?? process.env.API_PREFIX ?? 'http://hogg5a.hostwincloud.in:7001/main';
export const media_PREFIX = `https://d38etmv7ts3dga.cloudfront.net`; //extras.API_PREFIX ?? process.env.API_PREFIX ?? 'http://hogg5a.hostwincloud.in:7001/main';

export default {
  API_PREFIX,
};