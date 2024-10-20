import { IsOptional } from "class-validator";

export class JwtToken {

    accessToken: string;
 
    @IsOptional()
    refreshToken?: string;
  
    sessionId?: string;
  }