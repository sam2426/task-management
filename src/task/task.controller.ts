import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { TransformerInterceptor } from 'src/common/helpers';
import { TaskService } from './task.service';
import { Response } from 'express';
type ResponseBody = {
  message: string;
  data?: Record<string, any>;
};

type updateRequestDTO = {
  title: string;
  description: string;
  targetCompletionAt: Date;
};
@Controller('task')
@UseInterceptors(TransformerInterceptor)
export class TaskController {
  constructor(private readonly Task: TaskService) {}

  @Post('create')
  async createTask(
    @Body() body: updateRequestDTO,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ResponseBody> {
    const email = response.locals.emailId;
    await this.Task.createTaskService(body, email);
    response.status(HttpStatus.CREATED);
    return { message: 'Task created' };
  }

  @Get('search')
  async searchTasks() {}

  @Put('update/:id')
  async updateTask(
    @Query('id') id: string,
    @Body() body: updateRequestDTO,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ResponseBody> {
    await this.Task.updateTask({ id: Number(id) }, { ...body });
    response.status(HttpStatus.OK);
    return { message: 'Task updated.' };
  }

  @Patch('markComplete/:id')
  async completeTask(@Query('id') id: string, @Res({ passthrough: true }) response: Response): Promise<ResponseBody> {
    await this.Task.updateTask({ id: Number(id) }, { completed: true });
    response.status(HttpStatus.OK);
    return { message: 'Task marked completed.' };
  }

  @Delete(':id')
  async deleteTask(@Query('id') id: string, @Res({ passthrough: true }) response: Response): Promise<ResponseBody> {
    await this.Task.updateTask({ id: Number(id) }, { isDeleted: true });
    response.status(HttpStatus.OK);
    return { message: 'Task deleted.' };
  }
}
