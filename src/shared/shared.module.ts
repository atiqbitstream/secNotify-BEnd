import { Module } from '@nestjs/common';
import { TokenRepository } from './repos/token.repository';
import { TokenService } from './services/token.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports:[ JwtModule.register({})],
    providers: [TokenService, TokenRepository],
    exports: [TokenService, TokenRepository],
})
export class SharedModule {}
