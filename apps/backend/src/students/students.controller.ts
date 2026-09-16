import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common'
import { StudentsService } from './students.service'
import { CreateStudentDto } from './dto/create-student.dto'
import { UpdateStudentDto } from './dto/update-student.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { UserRole } from '@prisma/client'

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  // POST /api/students
  @Post()
  @Roles(UserRole.DIRECTOR, UserRole.SECRETARY)
  create(
    @Body() dto: CreateStudentDto,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.studentsService.create(dto, schoolId)
  }

  // GET /api/students
  @Get()
  @Roles(UserRole.DIRECTOR, UserRole.SECRETARY, UserRole.TEACHER)
  findAll(@CurrentUser('schoolId') schoolId: string) {
    return this.studentsService.findAll(schoolId)
  }

  // GET /api/students/:id
  @Get(':id')
  @Roles(UserRole.DIRECTOR, UserRole.SECRETARY, UserRole.TEACHER)
  findOne(
    @Param('id') id: string,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.studentsService.findOne(id, schoolId)
  }

  // PUT /api/students/:id
  @Put(':id')
  @Roles(UserRole.DIRECTOR, UserRole.SECRETARY)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStudentDto,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.studentsService.update(id, dto, schoolId)
  }

  // DELETE /api/students/:id
  @Delete(':id')
  @Roles(UserRole.DIRECTOR)
  remove(
    @Param('id') id: string,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.studentsService.remove(id, schoolId)
  }
}