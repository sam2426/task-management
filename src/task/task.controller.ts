import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
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
// import { Prisma, Task } from '@prisma/client';
type ResponseBody = {
  message: string;
  data?: Record<string, any>;
};

type updateRequestDTO = {
  title: string;
  description: string;
  targetCompletionAt: Date;
};

type whereCustomFilter = 'id' | 'title' | 'select' | 'sort';
@Controller('task')
@UseInterceptors(TransformerInterceptor)
export class TaskController {
  constructor(private readonly Task: TaskService) {}

  @Post('create')
  async createTask(
    @Body() body: updateRequestDTO,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ResponseBody> {
    const email = response.locals.tokenData.email;
    const data = await this.Task.createTaskService(body, email);
    response.status(HttpStatus.CREATED);
    return { message: 'Task created', data };
  }

  @Get('search')
  async searchTasks(
    @Query() query: Record<whereCustomFilter, any>,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ResponseBody> {
    const ownerId = response.locals.tokenData.id;
    const reqQuery = { ...query };
    const removeFields = ['select', 'sort'];
    removeFields.forEach((param) => delete reqQuery[param]);

    const selectFields = {};
    if (query.select) {
      const selectProps = (<string>query.select).split(',').map((field) => field.trim());
      selectProps.forEach((prop) => {
        selectFields[prop] = true;
      });
    }

    const sortFields = {};
    if (query.sort) {
      const sortProps = (<string>query.sort).split(',').map((field) => field.trim());
      sortProps.forEach((prop) => {
        let order = 'asc';
        let field = prop;
        if (prop.startsWith('-')) {
          order = 'desc';
          field = prop.substring(1);
        }
        sortFields[field] = order;
      });
    }
    const data = await this.Task.tasks({
      where: {
        ...reqQuery,
        ownerId,
        isDeleted: false,
      },
      select: selectFields,
      orderBy: sortFields,
    });
    return { message: data.length ? 'Tasks fetched' : 'Tasks not found.', data: { count: data.length, records: data } };
  }

  @Get('search/:Id')
  async searchOne(@Param('Id') taskId: number, @Res({ passthrough: true }) response: Response): Promise<ResponseBody> {
    const data = await this.Task.getTaskById(Number(taskId));
    response.status(HttpStatus.OK);
    return { message: 'Task Details', data };
  }

  @Put('update/:id')
  async updateTask(
    @Param('id') id: string,
    @Body() body: updateRequestDTO,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ResponseBody> {
    const ownerId = response.locals.tokenData.id;
    const data = await this.Task.updateTask({ id: Number(id), ownerId }, { ...body });
    response.status(HttpStatus.OK);
    return { message: 'Task updated.', data };
  }

  @Patch('markComplete/:id')
  async completeTask(@Param('id') id: string, @Res({ passthrough: true }) response: Response): Promise<ResponseBody> {
    const ownerId = response.locals.tokenData.id;
    const data = await this.Task.updateTask({ id: Number(id), ownerId }, { isCompleted: true });
    response.status(HttpStatus.OK);
    return { message: `Task ${data.id} marked completed.` };
  }

  @Delete(':id')
  async deleteTask(@Param('id') id: string, @Res({ passthrough: true }) response: Response): Promise<ResponseBody> {
    const ownerId = response.locals.tokenData.id;
    const data = await this.Task.updateTask({ id: Number(id), ownerId }, { isDeleted: true });
    response.status(HttpStatus.OK);
    return { message: `Task ${data.id} deleted.` };
  }
}
