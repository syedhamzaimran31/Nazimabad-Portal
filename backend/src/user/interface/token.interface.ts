export interface UserPayload {
  userId: string;
  fullName: string;
  email: string;
  iat?: number;
  exp?: number;
}
