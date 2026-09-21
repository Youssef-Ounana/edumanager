import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateSchoolYearDto } from './dto/create-school-year.dto'
import { CreateClassroomDto } from './dto/create-classroom.dto'

@Injectable()
export class SchoolYearsService {
  constructor(private prisma: PrismaService) {}

  // ─── ANNÉES SCOLAIRES ───────────────────────────────────────────────────────

  async createSchoolYear(dto: CreateSchoolYearDto, schoolId: string) {
    // Vérifier que les dates sont cohérentes
    if (new Date(dto.startDate) >= new Date(dto.endDate)) {
      throw new BadRequestException('La date de début doit être avant la date de fin')
    }

    // Si isCurrent = true, désactiver les autres années courantes
    if (dto.isCurrent) {
      await this.prisma.schoolYear.updateMany({
        where: { schoolId, isCurrent: true },
        data: { isCurrent: false },
      })
    }

    return this.prisma.schoolYear.create({
      data: {
        name: dto.name,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        isCurrent: dto.isCurrent ?? false,
        schoolId,
      },
    })
  }

  async findAllSchoolYears(schoolId: string) {
    return this.prisma.schoolYear.findMany({
      where: { schoolId },
      orderBy: { startDate: 'desc' },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        isCurrent: true,
        createdAt: true,
        _count: {
          select: { classrooms: true },
        },
      },
    })
  }

  async findOneSchoolYear(id: string, schoolId: string) {
    const schoolYear = await this.prisma.schoolYear.findFirst({
      where: { id, schoolId },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        isCurrent: true,
        classrooms: {
          select: {
            id: true,
            name: true,
            capacity: true,
            _count: {
              select: { enrollments: true },
            },
          },
        },
      },
    })

    if (!schoolYear) {
      throw new NotFoundException(`Année scolaire introuvable`)
    }

    return schoolYear
  }

  async setCurrentYear(id: string, schoolId: string) {
    await this.findOneSchoolYear(id, schoolId)

    // Désactiver toutes les années courantes
    await this.prisma.schoolYear.updateMany({
      where: { schoolId, isCurrent: true },
      data: { isCurrent: false },
    })

    // Activer celle-ci
    return this.prisma.schoolYear.update({
      where: { id },
      data: { isCurrent: true },
    })
  }

  async removeSchoolYear(id: string, schoolId: string) {
    const schoolYear = await this.findOneSchoolYear(id, schoolId)

    if (schoolYear.isCurrent) {
      throw new ConflictException('Impossible de supprimer l\'année scolaire courante')
    }

    await this.prisma.schoolYear.delete({ where: { id } })
    return { message: 'Année scolaire supprimée avec succès' }
  }

  // ─── CLASSES ────────────────────────────────────────────────────────────────

  async createClassroom(dto: CreateClassroomDto, schoolId: string) {
    // Vérifier que l'année scolaire appartient à cette école
    const schoolYear = await this.prisma.schoolYear.findFirst({
      where: { id: dto.schoolYearId, schoolId },
    })

    if (!schoolYear) {
      throw new NotFoundException(`Année scolaire introuvable`)
    }

    return this.prisma.classroom.create({
      data: {
        name: dto.name,
        capacity: dto.capacity ?? 30,
        schoolYearId: dto.schoolYearId,
        schoolId,
      },
    })
  }

  async findAllClassrooms(schoolYearId: string, schoolId: string) {
    // Vérifier que l'année appartient à l'école
    const schoolYear = await this.prisma.schoolYear.findFirst({
      where: { id: schoolYearId, schoolId },
    })

    if (!schoolYear) {
      throw new NotFoundException(`Année scolaire introuvable`)
    }

    return this.prisma.classroom.findMany({
      where: { schoolYearId, schoolId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        capacity: true,
        _count: {
          select: { enrollments: true },
        },
      },
    })
  }

  async removeClassroom(id: string, schoolId: string) {
    const classroom = await this.prisma.classroom.findFirst({
      where: { id, schoolId },
    })

    if (!classroom) {
      throw new NotFoundException(`Classe introuvable`)
    }

    await this.prisma.classroom.delete({ where: { id } })
    return { message: 'Classe supprimée avec succès' }
  }

  // ─── INSCRIPTION ÉLÈVE DANS UNE CLASSE ──────────────────────────────────────

  async enrollStudent(
    studentId: string,
    classroomId: string,
    schoolId: string,
  ) {
    // Vérifier que l'élève appartient à cette école
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, schoolId },
    })

    if (!student) {
      throw new NotFoundException(`Élève introuvable`)
    }

    // Vérifier que la classe appartient à cette école
    const classroom = await this.prisma.classroom.findFirst({
      where: { id: classroomId, schoolId },
      include: { schoolYear: true },
    })

    if (!classroom) {
      throw new NotFoundException(`Classe introuvable`)
    }

    // Vérifier que l'élève n'est pas déjà inscrit dans cette année
    const existing = await this.prisma.studentEnrollment.findFirst({
      where: {
        studentId,
        classroom: { schoolYearId: classroom.schoolYearId },
      },
    })

    if (existing) {
      throw new ConflictException(`L'élève est déjà inscrit dans une classe pour cette année scolaire`)
    }

    return this.prisma.studentEnrollment.create({
      data: {
        studentId,
        classroomId,
        schoolYearId: classroom.schoolYearId,
      },
    })
  }
}