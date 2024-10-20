import { UserDto } from "src/users/dto/User.dto";
import { JwtToken } from "./dtos/jwt-token.dto";

export class UserLogin extends JwtToken {
    user: UserDto;
  }
  