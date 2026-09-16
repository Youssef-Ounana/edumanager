import {
  Controller,
  Post,
  Body,
  ConflictException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { IsString, IsEmail, MinLength } from 'class-validator'
import * as bcrypt from 'bcryptjs'

export class SetupDto {
  @IsString()
  @MinLength(3)
  schoolName: string

  @IsString()
  @MinLength(3)
  schoolSlug: string

  @IsEmail()
  schoolEmail: string

  @IsString()
  @MinLength(3)
  city: string

  @IsEmail()
  directorEmail: string

  @IsString()
  @MinLength(6)
  directorPassword: string

  @IsString()
  directorFirstName: string

  @IsString()
  directorLastName: string
}

@Controller('setup')
export class SetupController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async setup(@Body() dto: SetupDto) {
    // Vérifier que le setup n'a pas déjà été fait
    const existingSchool = await this.prisma.school.findFirst()
    if (existingSchool) {
      throw new ConflictException('Le système est déjà initialisé')
    }

    // Créer l'école
    const school = await this.prisma.school.create({
      data: {
        name: dto.schoolName,
        slug: dto.schoolSlug,
        email: dto.schoolEmail,
        city: dto.city,
        country: 'MA',
      },
    })

    // Créer le directeur
    const hashedPassword = await bcrypt.hash(dto.directorPassword, 12)
    const director = await this.prisma.user.create({
      data: {
        email: dto.directorEmail,
        password: hashedPassword,
        firstName: dto.directorFirstName,
        lastName: dto.directorLastName,
        role: 'DIRECTOR',
        schoolId: school.id,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        schoolId: true,
      },
    })

    return {
      message: 'Système initialisé avec succès',
      school,
      director,
    }
  }
}