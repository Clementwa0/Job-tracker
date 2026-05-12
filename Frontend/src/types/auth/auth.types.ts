export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface AuthData {
  user: User;
  token: string;
}