import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateStudentDto } from './dto/create-student.dto'
import { UpdateStudentDto } from './dto/update-student.dto'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  // ─── CRÉER UN ÉLÈVE + PARENT (optionnel) ────────────────────────────────────

  async create(dto: CreateStudentDto, schoolId: string) {
    const existing = await this.prisma.student.findUnique({
      where: { registrationNr: dto.registrationNr },
    })

    if (existing) {
      throw new ConflictException(
        `Le numéro d'inscription "${dto.registrationNr}" est déjà utilisé`,
      )
    }

    // Vérifier email parent si fourni
    if (dto.parent) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.parent.email },
      })
      if (existingUser) {
        throw new ConflictException(
          `L'email parent "${dto.parent.email}" est déjà utilisé`,
        )
      }
    }

    const result = await this.prisma.$transaction(async (tx: any) => {
      // Créer l'élève
      const student = await tx.student.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          dateOfBirth: new Date(dto.dateOfBirth),
          gender: dto.gender,
          phone: dto.phone,
          address: dto.address,
          registrationNr: dto.registrationNr,
          schoolId,
        },
      })

      // Créer le parent si 
      
      const hashedPassword = await bcrypt.hash(dto.parent.password, 12)

      const parentUser = await tx.user.create({
        data: {
          email: dto.parent.email,
          password: hashedPassword,
          firstName: dto.parent.firstName,
          lastName: dto.parent.lastName,
          role: 'PARENT',
          schoolId,
          phone: dto.parent.phone,
        },
      })

      const parent = await tx.parent.create({
        data: {
          userId: parentUser.id,
          schoolId,
          occupation: dto.parent.occupation,
        },
      })

      await tx.studentParent.create({
        data: {
          studentId: student.id,
          parentId: parent.id,
          relationship: dto.parent.relationship,
        },
      })

      return student
    })

    return result
  }

  // ─── LISTER LES ÉLÈVES ──────────────────────────────────────────────────────

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
              select: { name: true },
            },
          },
          take: 1,
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
                  },
                },
              },
            },
          },
        },
      },
    })
  }

  // ─── TROUVER UN ÉLÈVE ───────────────────────────────────────────────────────

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
            isEmergency: true,
            parent: {
              select: {
                id: true,
                occupation: true,
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
      throw new NotFoundException(`Élève introuvable`)
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