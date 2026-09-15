import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import { UserRole } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

export interface RegisterDto {
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
  schoolId?: string
  phone?: string
}

export interface LoginDto {
  email: string
  password: string
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // ─── INSCRIPTION ────────────────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })

    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé')
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12)

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role,
        schoolId: dto.schoolId ?? null,
        phone: dto.phone ?? null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        schoolId: true,
        createdAt: true,
      },
    })

    return user
  }

  // ─── CONNEXION ──────────────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect')
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Compte suspendu ou inactif')
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password)

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect')
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role, user.schoolId)

    await this.saveRefreshToken(user.id, tokens.refreshToken)

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        schoolId: user.schoolId,
      },
      ...tokens,
    }
  }

  // ─── DÉCONNEXION ────────────────────────────────────────────────────────────

  async logout(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    })

    return { message: 'Déconnexion réussie' }
  }

  // ─── RENOUVELLEMENT TOKEN ───────────────────────────────────────────────────

  async refreshTokens(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Utilisateur inactif ou inexistant')
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role, user.schoolId)

    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    })

    await this.saveRefreshToken(user.id, tokens.refreshToken)

    return tokens
  }

  // ─── MÉTHODES PRIVÉES ───────────────────────────────────────────────────────

  private async generateTokens(
  userId: string,
  email: string,
  role: UserRole,
  schoolId: string | null,
) {
  const payload = { sub: userId, email, role, schoolId }

  const [accessToken, refreshToken] = await Promise.all([
    this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: 900, // 15 minutes en secondes
    }),
    this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: 604800, // 7 jours en secondes
    }),
  ])

  return { accessToken, refreshToken }
}

  private async saveRefreshToken(userId: string, token: string) {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    })
  }
}