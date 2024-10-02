import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class JwtToken {
  @ApiProperty()
  accessToken: string;

  @ApiPropertyOptional()
  @IsOptional()
  refreshToken?: string;

  sessionId?: string;
}
