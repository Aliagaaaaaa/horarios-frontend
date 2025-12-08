export interface Course {
  id: number;
  code: string;
  name: string;
  prerequisites: number[];
  semestre?: number;
  electivo?: boolean;
  dificultad?: number;
}
