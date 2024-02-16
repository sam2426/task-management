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
  name: 'bearerauth',
  description: 'Bearer Token - add `Bearer` at start of token',
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
    description:
      'data to be passed in the body - `title` is title of the task; `description` is extra description of the task; `targetCompletionAt` is the date-time at which the user targets to complete the task for eg: `"2024-02-17T00:06:03.346Z"`',
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
  @ApiOperation({
    summary: 'Search all Tasks. Can be used along with searching, sorting, filtering',
    description:
      'along with `select`, `sort`, `limit`, `page`, normal fields can also be used to query the tasks; One such example of querying the app is:  `localhost:3000/task/search?title=cleaning&select=title,description&sort=-title&limit=5&page=1` title=cleaning is check from db, but rest of them are updating the search query',
  })
  @ApiQuery({
    name: 'select',
    description: 'mention here the fields to be selected in the output',
    required: false,
  })
  @ApiQuery({
    name: 'sort',
    description:
      'add sorting according to some field. for eg: sort=-title sorts according to title in descending order, sort=title sorts in ascending order',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    description: 'used for pagination, enter the page number for which data required. default = 0',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'used for pagination, enter the limit of records to be sent in one page. default = 100',
    required: false,
  })
  async searchTasks(
    @Query() query: Record<whereCustomFilter, any>,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ResponseBody> {
    const ownerId = response.locals.tokenData.id;
    const reqQuery = { ...query };
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach((param) => delete reqQuery[param]);

    let selectFields = null;
    if (query.select) {
      const selectProps = (<string>query.select).split(',').map((field) => field.trim());
      const selectedProps = {};
      selectProps.forEach((prop) => {
        selectedProps[prop] = true;
      });
      selectFields = selectedProps;
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

  @Get('search/:id')
  @ApiParam({
    name: 'id',
    description: 'Task Id',
  })
  @ApiOperation({
    summary: 'Get details of a single Task',
    description: 'Get the details of one task along with owner',
  })
  async searchOne(@Param('id') taskId: string, @Res({ passthrough: true }) response: Response): Promise<ResponseBody> {
    const data = await this.Task.getTaskById(Number(taskId));
    response.status(HttpStatus.OK);
    return { message: 'Task Details', data };
  }

  @Put('update/:id')
  @ApiParam({
    name: 'id',
    description: 'Task Id',
  })
  @ApiOperation({
    summary: 'Update the task',
    description: 'Update the task for any field',
  })
  async updateTask(
    @Param('id') id: string,
    @Body() body: updateRequestDTO,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ResponseBody> {
    const ownerId = response.locals.tokenData.id;
    const data = await this.Task.updateTask({ id: Number(id), ownerId, isDeleted: false }, { ...body });
    response.status(HttpStatus.OK);
    return { message: 'Task updated.', data };
  }

  @Patch('markComplete/:id')
  @ApiParam({
    name: 'id',
    description: 'Task Id',
  })
  @ApiOperation({
    summary: 'Marks the task as complete by id.',
    description: 'The tasks in the db can be marked as complete.',
  })
  async completeTask(@Param('id') id: string, @Res({ passthrough: true }) response: Response): Promise<ResponseBody> {
    const ownerId = response.locals.tokenData.id;
    const data = await this.Task.updateTask({ id: Number(id), ownerId, isDeleted: false }, { isCompleted: true });
    response.status(HttpStatus.OK);
    return { message: `Task ${data.id} marked completed.` };
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    description: 'Task Id',
  })
  @ApiOperation({
    summary: 'Delete a task',
    description: 'Soft deleting a task by id.',
  })
  async deleteTask(@Param('id') id: string, @Res({ passthrough: true }) response: Response): Promise<ResponseBody> {
    const ownerId = response.locals.tokenData.id;
    const data = await this.Task.updateTask({ id: Number(id), ownerId }, { isDeleted: true });
    response.status(HttpStatus.OK);
    return { message: `Task ${data.id} deleted.` };
  }
}
