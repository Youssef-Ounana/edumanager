import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateParentDto } from './dto/create-parent.dto'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class ParentsService {
  constructor(private prisma: PrismaService) {}

  // ─── CRÉER UN PARENT ────────────────────────────────────────────────────────

  async create(dto: CreateParentDto, schoolId: string) {
    // Vérifier que l'élève appartient à cette école
    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, schoolId },
    })

    if (!student) {
      throw new NotFoundException(`Élève introuvable`)
    }

    // Vérifier que l'email n'est pas déjà utilisé
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })

    if (existingUser) {
      throw new ConflictException(`L'email "${dto.email}" est déjà utilisé`)
    }

    // Créer le compte utilisateur + parent en une transaction
    const result = await this.prisma.$transaction(async (tx: any) => {
      const hashedPassword = await bcrypt.hash(dto.password, 12)

      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: 'PARENT',
          schoolId,
          phone: dto.phone,
        },
      })

      const parent = await tx.parent.create({
        data: {
          userId: user.id,
          schoolId,
          occupation: dto.occupation,
        },
      })

      await tx.studentParent.create({
        data: {
          studentId: dto.studentId,
          parentId: parent.id,
          relationship: dto.relationship,
        },
      })

      return {
        id: parent.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        occupation: parent.occupation,
        relationship: dto.relationship,
        studentId: dto.studentId,
      }
    })

    return result
  }

  // ─── LISTER LES PARENTS D'UNE ÉCOLE ────────────────────────────────────────

  async findAll(schoolId: string) {
    return this.prisma.parent.findMany({
      where: { schoolId },
      select: {
        id: true,
        occupation: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        children: {
          select: {
            relationship: true,
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                registrationNr: true,
              },
            },
          },
        },
      },
    })
  }

  // ─── TROUVER UN PARENT PAR ID ───────────────────────────────────────────────

  async findOne(id: string, schoolId: string) {
    const parent = await this.prisma.parent.findFirst({
      where: { id, schoolId },
      select: {
        id: true,
        occupation: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        children: {
          select: {
            relationship: true,
            isEmergency: true,
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                registrationNr: true,
              },
            },
          },
        },
      },
    })

    if (!parent) {
      throw new NotFoundException(`Parent introuvable`)
    }

    return parent
  }

  // ─── LISTER LES PARENTS D'UN ÉLÈVE ─────────────────────────────────────────

  async findByStudent(studentId: string, schoolId: string) {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, schoolId },
    })

    if (!student) {
      throw new NotFoundException(`Élève introuvable`)
    }

    return this.prisma.studentParent.findMany({
      where: { studentId },
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
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    })
  }

  // ─── SUPPRIMER UN PARENT ────────────────────────────────────────────────────

  async remove(id: string, schoolId: string) {
    const parent = await this.prisma.parent.findFirst({
      where: { id, schoolId },
      include: { user: true },
    })

    if (!parent) {
      throw new NotFoundException(`Parent introuvable`)
    }

    // Supprimer le user supprime aussi le parent (cascade)
    await this.prisma.user.delete({
      where: { id: parent.userId },
    })

    return { message: 'Parent supprimé avec succès' }
  }
}