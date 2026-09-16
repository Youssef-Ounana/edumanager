import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateStudentDto } from './dto/create-student.dto'
import { UpdateStudentDto } from './dto/update-student.dto'

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  // ─── CRÉER UN ÉLÈVE ─────────────────────────────────────────────────────────

  async create(dto: CreateStudentDto, schoolId: string) {
    const existing = await this.prisma.student.findUnique({
      where: { registrationNr: dto.registrationNr },
    })

    if (existing) {
      throw new ConflictException(
        `Le numéro d'inscription "${dto.registrationNr}" est déjà utilisé`,
      )
    }

    return this.prisma.student.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        dateOfBirth: new Date(dto.dateOfBirth),
        gender: dto.gender,
        phone: dto.phone,
        address: dto.address,
        registrationNr: dto.registrationNr,
        schoolId: schoolId,
      },
    })
  }

  // ─── LISTER LES ÉLÈVES D'UNE ÉCOLE ─────────────────────────────────────────

  async findAll(schoolId: string) {
    return this.prisma.student.findMany({
      where: { schoolId },
      orderBy: { lastName: 'asc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        registrationNr: true,
        gender: true,
        dateOfBirth: true,
        phone: true,
        photoUrl: true,
        createdAt: true,
        enrollments: {
          where: {
            classroom: {
              schoolYear: { isCurrent: true },
            },
          },
          select: {
            classroom: {
              select: {
                name: true,
              },
            },
          },
          take: 1,
        },
      },
    })
  }

  // ─── TROUVER UN ÉLÈVE PAR ID ────────────────────────────────────────────────

  async findOne(id: string, schoolId: string) {
    const student = await this.prisma.student.findFirst({
      where: { id, schoolId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        registrationNr: true,
        gender: true,
        dateOfBirth: true,
        phone: true,
        address: true,
        photoUrl: true,
        createdAt: true,
        updatedAt: true,
        enrollments: {
          select: {
            classroom: {
              select: {
                id: true,
                name: true,
                schoolYear: {
                  select: { name: true, isCurrent: true },
                },
              },
            },
          },
        },
        parents: {
          select: {
            relationship: true,
            parent: {
              select: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    phone: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!student) {
      throw new NotFoundException(`Élève avec l'ID "${id}" introuvable`)
    }

    return student
  }

  // ─── METTRE À JOUR UN ÉLÈVE ─────────────────────────────────────────────────

  async update(id: string, dto: UpdateStudentDto, schoolId: string) {
    await this.findOne(id, schoolId)

    return this.prisma.student.update({
      where: { id },
      data: {
        ...dto,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      },
    })
  }

  // ─── SUPPRIMER UN ÉLÈVE ─────────────────────────────────────────────────────

  async remove(id: string, schoolId: string) {
    await this.findOne(id, schoolId)

    await this.prisma.student.delete({ where: { id } })

    return { message: 'Élève supprimé avec succès' }
  }
}