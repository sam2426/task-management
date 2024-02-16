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
import { ApiBody, ApiHeader, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TaskCreateDTO } from './task.swagger.dto';
type ResponseBody = {
  message: string;
  data?: Record<string, any>;
};

type updateRequestDTO = {
  title: string;
  description: string;
  targetCompletionAt: Date;
};

type whereCustomFilter = 'id' | 'title' | 'select' | 'sort' | 'page' | 'limit';
@Controller('task')
@ApiHeader({
  name: 'bearerAuth',
  description: 'Bearer Token',
  required: true,
  schema: {
    type: 'string',
    format: 'Bearer <token>',
  },
})
@ApiTags('Tasks')
@UseInterceptors(TransformerInterceptor)
export class TaskController {
  constructor(private readonly Task: TaskService) {}

  @Post('create')
  @ApiOperation({
    summary: 'Create a task',
  })
  @ApiBody(TaskCreateDTO)
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
  @ApiOperation({ summary: 'Search all Tasks. Can be used along with searching, sorting, filtering' })
  @ApiQuery({
    name: 'select',
    description: 'mention here the fields to be selected in the output',
  })
  @ApiQuery({
    name: 'sort',
    description:
      'add sorting according to some field. for eg: sort=-title sorts according to title in descending order, sort=title sorts in ascending order',
  })
  @ApiQuery({
    name: 'page',
    description: 'used for pagination, enter the page number for which data required. default = 0',
  })
  @ApiQuery({
    name: 'limit',
    description: 'used for pagination, enter the limit of records to be sent in one page',
  })
  async searchTasks(
    @Query() query: Record<whereCustomFilter, any>,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ResponseBody> {
    const ownerId = response.locals.tokenData.id;
    const reqQuery = { ...query };
    const removeFields = ['select', 'sort', 'page', 'limit'];
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

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 100;
    const skip = (page - 1) * limit;

    const data = await this.Task.tasks({
      where: {
        ...reqQuery,
        ownerId,
        isDeleted: false,
      },
      select: selectFields,
      orderBy: sortFields,
      skip,
      take: limit,
    });
    return { message: data.length ? 'Tasks fetched' : 'Tasks not found.', data: { count: data.length, records: data } };
  }

  @Get('search/:Id')
  @ApiParam({
    name: 'id',
    description: 'Task Id',
  })
  @ApiOperation({ summary: 'Get details of a single Task' })
  async searchOne(@Param('Id') taskId: number, @Res({ passthrough: true }) response: Response): Promise<ResponseBody> {
    const data = await this.Task.getTaskById(Number(taskId));
    response.status(HttpStatus.OK);
    return { message: 'Task Details', data };
  }

  @Put('update/:id')
  @ApiParam({
    name: 'id',
    description: 'Task Id',
  })
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
  @ApiParam({
    name: 'id',
    description: 'Task Id',
  })
  async completeTask(@Param('id') id: string, @Res({ passthrough: true }) response: Response): Promise<ResponseBody> {
    const ownerId = response.locals.tokenData.id;
    const data = await this.Task.updateTask({ id: Number(id), ownerId }, { isCompleted: true });
    response.status(HttpStatus.OK);
    return { message: `Task ${data.id} marked completed.` };
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    description: 'Task Id',
  })
  async deleteTask(@Param('id') id: string, @Res({ passthrough: true }) response: Response): Promise<ResponseBody> {
    const ownerId = response.locals.tokenData.id;
    const data = await this.Task.updateTask({ id: Number(id), ownerId }, { isDeleted: true });
    response.status(HttpStatus.OK);
    return { message: `Task ${data.id} deleted.` };
  }
}
