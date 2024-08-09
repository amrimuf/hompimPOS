export interface JwtPayload {
  email: string;
  sub: number;
  roles?: string[];
}
