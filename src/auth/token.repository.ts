import { Injectable, Logger } from "@nestjs/common";
import { Token } from "./entities/token.entity";
import { DataSource, EntityRepository, Not, Repository } from "typeorm";
import { ETokenType } from "./enums/token-type.enum";

@Injectable()

export class TokenRepository extends Repository<Token> {
 

  constructor(private dataSource: DataSource) {
    super(Token, dataSource.createEntityManager());
  }

  async saveTokens(accessToken: Token, refreshToken: Token): Promise<void> {
    try {
      await this.dataSource.transaction(async (manager) => {
        await manager.save(accessToken, { data: accessToken.user });
        await manager.save(refreshToken, { listeners: false });
      });
    } catch (err) {
      console.log("TokenRepository, saveTokens => ", err);
    }
  }
  async removeTokens(refreshToken: string): Promise<void> {
    await this.manager.transaction(async (manager) => {
      const refresh = await manager.findOne(Token, { where: { token: refreshToken }, relations: ["user"] });

      if (refresh?.sessionId) {
        const access = await manager.findOne(Token, { where: { sessionId: refresh.sessionId } });
        await manager.remove(refresh, { listeners: false });
        await manager.remove(access, { data: refresh.user });
      }
    });
  }

//   async removeOtherTokens(sessionId: string, userId: string): Promise<any> {
//     try {
//       this.logger.log(`TokenRepository, Attempting to remove tokens for userId: ${userId}`);
//       const accessTokens = [];

//       await this.manager.transaction(async (manager) => {
//         const existingTokens = await manager.find(Token, { where: { sessionId: Not(sessionId), userId } });
//         this.logger.log(`TokenRepository, Found ${existingTokens?.length} tokens for userId: ${userId}`);

//         for (const token of existingTokens) {
//           if (token.tokenType === ETokenType.ACCESS) {
//             accessTokens.push(token.token);
//           }

//           this.logger.log(`TokenRepository, Removing token: ${token.token} for userId: ${userId}`);
//           await manager.remove(token, { listeners: false, data: token.user });
//         }

//         this.logger.log(`TokenRepository, Removed ${existingTokens.length} tokens for userId: ${userId} successfully.`);
//       });

//       return accessTokens;
//     } catch (err) {
//       this.logger.error(`TokenRepository, removeOtherTokens => ${err.message}`, err.stack);
//       console.log("TokenRepository, removeOtherTokens => ", err);
//     }
//   }
}
