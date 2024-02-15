import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, Task } from '@prisma/client';
import { PrismaService } from 'src/common/connection/prisma.service';

type updateRequestDTO = {
  title: string;
  description: string;
  targetCompletionAt: Date;
};
@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  async createTaskService(taskData: updateRequestDTO, ownerEmail: string): Promise<string> {
    try {
      const finalTaskData: Prisma.TaskCreateInput = {
        title: taskData.title,
        targetCompletionAt: taskData.targetCompletionAt,
        owner: {
          connect: { email: ownerEmail },
        },
      };
      await this.prisma.task.create({ data: finalTaskData });
      return 'Task created successfully.';
    } catch (error) {
      throw { status: HttpStatus.INTERNAL_SERVER_ERROR, error: 'Task not created.' };
    }
  }

  async getTaskById(id: number): Promise<Task | null> {
    try {
      const task = await this.prisma.task.findUnique({
        where: { id },
      });
      return task;
    } catch (error) {
      throw { status: HttpStatus.INTERNAL_SERVER_ERROR, error: 'Task not found' };
    }
  }

  async updateTask(where: Prisma.TaskWhereUniqueInput, data: Prisma.TaskUpdateInput): Promise<Task> {
    try {
      const task = await this.prisma.task.update({ data, where });
      return task;
    } catch (error) {
      throw { status: HttpStatus.INTERNAL_SERVER_ERROR, error: 'Task not found' };
    }
  }
}
