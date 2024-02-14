import { Controller, Delete, Get, Patch, Post, Put } from '@nestjs/common';

@Controller('task')
export class TaskController {
  constructor() {}

  @Post('create')
  async createTask() {}

  @Get('search')
  async searchTasks() {}

  @Put('update/:id')
  async updateTask() {}

  @Patch('completeTask/:id')
  async completeTask() {}

  @Delete(':id')
  async deleteTask() {}
}
