import {
    getAccessToken,
    getUserInfo,
    FacebookUserDetailsResponse,
    FacebookErrorResponse,
    FacebookTokenResponse,
} from '@/lib/auth/_facebook/utils.server';
import FacebookLoginButton from '@/lib/auth/_facebook/FacebookLoginButton';

export { FacebookLoginButton, getAccessToken, getUserInfo };
export type { FacebookUserDetailsResponse, FacebookErrorResponse, FacebookTokenResponse };
