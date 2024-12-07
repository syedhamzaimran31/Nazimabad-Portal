import Cookies from 'js-cookie';

import {
  cookieAuth,
  cookieData,
  cookieRefresh,
  tokenRetries,
  cookieUserId,
  cookieUserRole,
} from '@/lib/cookies';
import { userType } from '@/lib/types';

class TokenService {
  getLocalAccessToken = () => {
    return Cookies.get(cookieAuth);
  };
  saveLocalAccessToken = (token: string) => {
    Cookies.set(cookieAuth, token, { sameSite: 'strict' });
  };
  getLocalRefreshToken = () => {
    return Cookies.get(cookieRefresh);
  };
  saveLocalRefreshToken = (token: string) => {
    Cookies.set(cookieRefresh, token);
  };
  getUser = (): null | userType => {
    const user = localStorage.getItem(cookieData);
    console.log('Retrieved user from localStorage:', user);
    return user ? JSON.parse(user) : null;
  };
  setUser = (user: userType) => {
    console.log('Setting user in localStorage:', user);
    localStorage.setItem(cookieData, JSON.stringify(user));
    Cookies.set(cookieUserId, user.id);
    Cookies.set(cookieUserRole, user.roles[0]);
  };
  getUserId = () => {
    return Cookies.get(cookieUserId);
  };
  getUserRole = () => {
    return Cookies.get(cookieUserRole); // Retrieve the role from cookies
  };
  updateUser = <T extends keyof userType>(key: T, value: userType[T]) => {
    const userObject = this.getUser();
    if (userObject) {
      userObject[key] = value;
      this.setUser(userObject);
      if (key === 'roles') {
        Cookies.set(cookieUserRole, value[0]);
      }
    } else {
      throw new Error('Error');
    }
  };
  setTokenRetries = (retries: number) => {
    localStorage.setItem(tokenRetries, retries.toString());
  };
  getTokenRetries = () => {
    return parseInt(localStorage.getItem(tokenRetries)!);
  };
  clearStorage = () => {
    localStorage.clear();
    Cookies.remove(cookieAuth);
    Cookies.remove(cookieData);
    Cookies.remove(cookieUserId); // Remove userId from cookies
    Cookies.remove(cookieUserRole)
  };
}
export default new TokenService();
