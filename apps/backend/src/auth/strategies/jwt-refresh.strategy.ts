import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET!,
    })
  }

  async validate(payload: { sub: string }) {
    const refreshToken = await this.prisma.refreshToken.findFirst({
      where: {
        userId: payload.sub,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
    })

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token invalide ou expiré')
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        schoolId: true,
        status: true,
        firstName: true,
        lastName: true,
      },
    })

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Utilisateur inactif ou inexistant')
    }

    return user
  }
}