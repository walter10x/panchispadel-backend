import { UserResponseDTO } from './user-response.dto';

export interface AuthResponseDTO {
  user: UserResponseDTO;
  accessToken: string;
  refreshToken: string;
}
