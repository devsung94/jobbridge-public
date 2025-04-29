import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;
  userId: string;
  role: string;
}

export const getTokenExpiry = (token: string): number => {
  const decoded = jwtDecode<DecodedToken>(token);
  return decoded.exp;
};
