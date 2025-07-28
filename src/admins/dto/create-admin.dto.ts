export class CreateAdminDto {
  full_name: string;
  phone: string;
  email: string;
  is_creator: boolean;
  password: string;
  confirm_password: string;
}
