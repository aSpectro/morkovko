import { LogDTO } from './log.dto';

export interface ReportDTO {
  id?: string;
  userId: string;
  fineCount: number;
  reportDate?: Date;
  commandsLogs: { [key: string]: LogDTO[] };
}
