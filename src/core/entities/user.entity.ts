export interface UserEntity {
  id: string;
  email: string;
  password: string;
  roleId: string;
  createdAt: Date;
}

export interface UserPayload {
  id: string;
  role: string;
}
