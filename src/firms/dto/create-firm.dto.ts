export class CreateFirmDto {
  name: string;
  description: string;
  location: string;
  regionId: number;
  districtId: number;
  ownerId: number;
  is_active: boolean;
  phone_number: string;
}
