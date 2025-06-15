export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  email: string;
  password: string;
  userName: string;
}

export {
  LoginPayload,
  SignUpPayload,
}