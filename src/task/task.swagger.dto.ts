import { ApiProperty, ApiResponseOptions } from '@nestjs/swagger';

class TaskCreateDtoBody {
  @ApiProperty({ type: 'string', required: true })
  title: string;

  @ApiProperty({ type: 'string', required: true })
  description: string;

  @ApiProperty({ type: 'string', required: true })
  targetCompletionAt: Date;
}

export const TaskCreateDTO: ApiResponseOptions = {
  description: 'Task create schema',
  type: TaskCreateDtoBody,
};
