export interface UserResponseDTO {
  id: string;
  email: string;
  name: string;
  level: string;
  photoUrl: string | undefined;
  phone: string | undefined;
  createdAt: Date;
}
