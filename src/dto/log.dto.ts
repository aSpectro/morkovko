export interface Arguments {
  mention?: { id: string };
  count?: number;
}

export interface LogDTO {
  id?: string;
  userId: string;
  commandName: string;
  executeDate?: Date;
  arguments: Arguments;
  reported?: boolean;
}
