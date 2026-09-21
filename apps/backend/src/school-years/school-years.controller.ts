import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common'
import { SchoolYearsService } from './school-years.service'
import { CreateSchoolYearDto } from './dto/create-school-year.dto'
import { CreateClassroomDto } from './dto/create-classroom.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { UserRole } from '@prisma/client'

@Controller('school-years')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchoolYearsController {
  constructor(private schoolYearsService: SchoolYearsService) {}

  // ─── ANNÉES SCOLAIRES ───────────────────────────────────────────────────────

  // POST /api/school-years
  @Post()
  @Roles(UserRole.DIRECTOR)
  createSchoolYear(
    @Body() dto: CreateSchoolYearDto,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.schoolYearsService.createSchoolYear(dto, schoolId)
  }

  // GET /api/school-years
  @Get()
  @Roles(UserRole.DIRECTOR, UserRole.SECRETARY)
  findAllSchoolYears(@CurrentUser('schoolId') schoolId: string) {
    return this.schoolYearsService.findAllSchoolYears(schoolId)
  }

  // GET /api/school-years/:id
  @Get(':id')
  @Roles(UserRole.DIRECTOR, UserRole.SECRETARY)
  findOneSchoolYear(
    @Param('id') id: string,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.schoolYearsService.findOneSchoolYear(id, schoolId)
  }

  // PATCH /api/school-years/:id/set-current
  @Patch(':id/set-current')
  @Roles(UserRole.DIRECTOR)
  setCurrentYear(
    @Param('id') id: string,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.schoolYearsService.setCurrentYear(id, schoolId)
  }

  // DELETE /api/school-years/:id
  @Delete(':id')
  @Roles(UserRole.DIRECTOR)
  removeSchoolYear(
    @Param('id') id: string,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.schoolYearsService.removeSchoolYear(id, schoolId)
  }

  // ─── CLASSES ────────────────────────────────────────────────────────────────

  // POST /api/school-years/classrooms
  @Post('classrooms')
  @Roles(UserRole.DIRECTOR, UserRole.SECRETARY)
  createClassroom(
    @Body() dto: CreateClassroomDto,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.schoolYearsService.createClassroom(dto, schoolId)
  }

  // GET /api/school-years/:id/classrooms
  @Get(':id/classrooms')
  @Roles(UserRole.DIRECTOR, UserRole.SECRETARY)
  findAllClassrooms(
    @Param('id') schoolYearId: string,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.schoolYearsService.findAllClassrooms(schoolYearId, schoolId)
  }

  // DELETE /api/school-years/classrooms/:id
  @Delete('classrooms/:id')
  @Roles(UserRole.DIRECTOR)
  removeClassroom(
    @Param('id') id: string,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.schoolYearsService.removeClassroom(id, schoolId)
  }

  // ─── INSCRIPTION ÉLÈVE ──────────────────────────────────────────────────────

  // POST /api/school-years/enroll
  @Post('enroll')
  @Roles(UserRole.DIRECTOR, UserRole.SECRETARY)
  enrollStudent(
    @Body() body: { studentId: string; classroomId: string },
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.schoolYearsService.enrollStudent(
      body.studentId,
      body.classroomId,
      schoolId,
    )
  }
}