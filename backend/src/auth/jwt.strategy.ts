import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/user/user.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class JsonWebTokenStrategy extends PassportStrategy(
  Strategy,
  'jsonwebtoken',
) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userService.findOne(payload.email);
    if (!user) {
      return null;
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: user.role,
      isVerified: user.isVerified,
    };
  }
}
