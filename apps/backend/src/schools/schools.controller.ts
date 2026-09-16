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
import { SchoolsService } from './schools.service'
import { CreateSchoolDto } from './dto/create-school.dto'
import { UpdateSchoolDto } from './dto/update-school.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { UserRole } from '@prisma/client'

@Controller('schools')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchoolsController {
  constructor(private schoolsService: SchoolsService) {}

  // POST /api/schools
  @Post()
  @Roles(UserRole.DIRECTOR)
  create(@Body() dto: CreateSchoolDto) {
    return this.schoolsService.create(dto)
  }

  // GET /api/schools
  @Get()
  @Roles(UserRole.DIRECTOR)
  findAll() {
    return this.schoolsService.findAll()
  }

  // GET /api/schools/:id
  @Get(':id')
  @Roles(UserRole.DIRECTOR)
  findOne(@Param('id') id: string) {
    return this.schoolsService.findOne(id)
  }

  // PUT /api/schools/:id
  @Put(':id')
  @Roles(UserRole.DIRECTOR)
  update(@Param('id') id: string, @Body() dto: UpdateSchoolDto) {
    return this.schoolsService.update(id, dto)
  }

  // DELETE /api/schools/:id
  @Delete(':id')
  @Roles(UserRole.DIRECTOR)
  remove(@Param('id') id: string) {
    return this.schoolsService.remove(id)
  }
}