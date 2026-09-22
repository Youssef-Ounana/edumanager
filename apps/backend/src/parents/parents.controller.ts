import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common'
import { ParentsService } from './parents.service'
import { CreateParentDto } from './dto/create-parent.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { UserRole } from '@prisma/client'

@Controller('parents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ParentsController {
  constructor(private parentsService: ParentsService) {}

  // POST /api/parents
  @Post()
  @Roles(UserRole.DIRECTOR, UserRole.SECRETARY)
  create(
    @Body() dto: CreateParentDto,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.parentsService.create(dto, schoolId)
  }

  // GET /api/parents
  @Get()
  @Roles(UserRole.DIRECTOR, UserRole.SECRETARY)
  findAll(@CurrentUser('schoolId') schoolId: string) {
    return this.parentsService.findAll(schoolId)
  }

  // GET /api/parents/:id
  @Get(':id')
  @Roles(UserRole.DIRECTOR, UserRole.SECRETARY)
  findOne(
    @Param('id') id: string,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.parentsService.findOne(id, schoolId)
  }

  // GET /api/parents/student/:studentId
  @Get('student/:studentId')
  @Roles(UserRole.DIRECTOR, UserRole.SECRETARY)
  findByStudent(
    @Param('studentId') studentId: string,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.parentsService.findByStudent(studentId, schoolId)
  }

  // DELETE /api/parents/:id
  @Delete(':id')
  @Roles(UserRole.DIRECTOR)
  remove(
    @Param('id') id: string,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.parentsService.remove(id, schoolId)
  }
}