import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateSchoolDto } from './dto/create-school.dto'
import { UpdateSchoolDto } from './dto/update-school.dto'

@Injectable()
export class SchoolsService {
  constructor(private prisma: PrismaService) {}

  // ─── CRÉER UNE ÉCOLE ────────────────────────────────────────────────────────

  async create(dto: CreateSchoolDto) {
    const existing = await this.prisma.school.findUnique({
      where: { slug: dto.slug },
    })

    if (existing) {
      throw new ConflictException(`Le slug "${dto.slug}" est déjà utilisé`)
    }

    const existingEmail = await this.prisma.school.findUnique({
      where: { email: dto.email },
    })

    if (existingEmail) {
      throw new ConflictException(`L'email "${dto.email}" est déjà utilisé`)
    }

    return this.prisma.school.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        city: dto.city,
        country: dto.country ?? 'MA',
        level: dto.level,
        maxStudents: dto.maxStudents ?? 1000,
      },
    })
  }

  // ─── LISTER TOUTES LES ÉCOLES ───────────────────────────────────────────────

  async findAll() {
    return this.prisma.school.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        phone: true,
        city: true,
        country: true,
        status: true,
        level: true,
        maxStudents: true,
        createdAt: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
    })
  }

  // ─── TROUVER UNE ÉCOLE PAR ID ───────────────────────────────────────────────

  async findOne(id: string) {
    const school = await this.prisma.school.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        country: true,
        status: true,
        level: true,
        maxStudents: true,
        logoUrl: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
    })

    if (!school) {
      throw new NotFoundException(`École avec l'ID "${id}" introuvable`)
    }

    return school
  }

  // ─── METTRE À JOUR UNE ÉCOLE ────────────────────────────────────────────────

  async update(id: string, dto: UpdateSchoolDto) {
    await this.findOne(id)

    return this.prisma.school.update({
      where: { id },
      data: dto,
    })
  }

  // ─── SUPPRIMER UNE ÉCOLE ────────────────────────────────────────────────────

  async remove(id: string) {
    await this.findOne(id)

    await this.prisma.school.delete({
      where: { id },
    })

    return { message: 'École supprimée avec succès' }
  }
}