import seed from './syllabus.json';
export type CourseId = 'ai' | 'fusion' | 'linux';
export type Exercise = {id:string; courseId:CourseId; week:number; day:number; title:string; task:string; isMiniProject:boolean};
export type Course = {id:CourseId; name:string; description:string; outcome:string; weeks:{number:number; title:string; exercises:Exercise[]}[]};
export const courses = seed as Course[];
export const exercises = courses.flatMap(c => c.weeks.flatMap(w => w.exercises));
export const exerciseIds = new Set(exercises.map(e => e.id));
export const courseExercises = (id:CourseId) => exercises.filter(e => e.courseId === id);
