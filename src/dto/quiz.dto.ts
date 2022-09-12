export interface Question {
  label: string;
  values: { id?: number; label: string; isRight: boolean }[];
}

export interface QuizDTO {
  id?: string;
  questionData: Question;
  isUsed?: boolean;
}
