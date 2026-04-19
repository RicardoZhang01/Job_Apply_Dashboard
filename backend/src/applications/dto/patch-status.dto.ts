import { IsIn, IsString } from 'class-validator';
import { APPLICATION_STATUSES } from '../../common/constants';

export class PatchStatusDto {
  @IsString()
  @IsIn([...APPLICATION_STATUSES])
  status!: string;
}
