import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, Task } from '@prisma/client';
import { PrismaService } from 'src/common/connection/prisma.service';

type updateRequestDTO = {
  title: string;
  description: string;
  targetCompletionAt: Date;
};

const throwableErrorNames = ['PrismaClientValidationError'];
@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  async createTaskService(taskData: updateRequestDTO, ownerEmail: string): Promise<Task> {
    try {
      const finalTaskData: Prisma.TaskCreateInput = {
        ...taskData,
        owner: {
          connect: { email: ownerEmail },
        },
      };
      const task = await this.prisma.task.create({ data: finalTaskData });
      return task;
    } catch (error) {
      if (error instanceof Error && throwableErrorNames.includes(error.name)) {
        throw error;
      }
      throw { status: HttpStatus.BAD_REQUEST, error: 'Task not created.' };
    }
  }

  async getTaskById(id: number): Promise<Task | null> {
    try {
      const task = await this.prisma.task.findUnique({
        where: { id, isDeleted: false },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
      return task;
    } catch (error) {
      throw { status: HttpStatus.INTERNAL_SERVER_ERROR, error: 'Task not found' };
    }
  }

  async tasks(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TaskWhereUniqueInput;
    where?: Prisma.TaskWhereInput;
    orderBy?: Prisma.TaskOrderByWithRelationInput;
    select?: Prisma.TaskSelect;
  }): Promise<Partial<Task>[]> {
    const { skip, take, cursor, where, orderBy, select } = params;
    return this.prisma.task.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      select,
    });
  }

  async updateTask(where: Prisma.TaskWhereUniqueInput, data: Prisma.TaskUpdateInput): Promise<Task> {
    try {
      const task = await this.prisma.task.update({ data, where });
      return task;
    } catch (error) {
      if (error instanceof Error && throwableErrorNames.includes(error.name)) {
        throw error;
      }
      throw { status: HttpStatus.BAD_REQUEST, error: 'Task not found' };
    }
  }
}
