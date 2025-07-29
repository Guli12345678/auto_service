import { Role } from "../../../generated/prisma";

export class CreateUserDto {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  confirm_password: string;
  role: Role;
  is_active?: boolean;
  activation_link?: string;
}
