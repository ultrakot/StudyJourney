import { exerciseIds } from './data';
export const STORAGE_KEY = 'study-tracker:v1';
export type Progress = {completed:boolean; completedAt?:string; notes:string; checklist?:{id:string;text:string;done:boolean}[]; hint?:string; solution?:string; referenceUrls?:string[]};
export type State = {schemaVersion:1; exercises:Record<string,Progress>; theme?:'light'|'dark'|'system'};
export const blankState = ():State => ({schemaVersion:1, exercises:{}, theme:'system'});
export const blankProgress = ():Progress => ({completed:false,notes:''});
const object = (v:unknown):v is Record<string,unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
export function validUrl(value:string) {try {return ['http:','https:'].includes(new URL(value).protocol);} catch {return false;}}
export function validateState(value:unknown):State {
  if(!object(value) || value.schemaVersion !== 1) throw Error('Unsupported backup version. Expected schema version 1; existing data has not been changed.');
  if(!object(value.exercises)) throw Error('Backup must contain an exercises object.');
  if(value.theme !== undefined && !['light','dark','system'].includes(String(value.theme))) throw Error('Invalid theme in backup.');
  const result:State = {schemaVersion:1,exercises:{},theme:value.theme as State['theme']};
  for(const [id,p] of Object.entries(value.exercises)) {
    if(!exerciseIds.has(id)) throw Error(`Unknown exercise ID: ${id}. This backup may belong to another syllabus.`);
    if(!object(p) || typeof p.completed !== 'boolean' || typeof p.notes !== 'string') throw Error(`Invalid progress for ${id}.`);
    if(p.completedAt !== undefined && (typeof p.completedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(p.completedAt) || !Number.isFinite(Date.parse(p.completedAt)))) throw Error(`Invalid completion date for ${id}.`);
    for(const key of ['hint','solution']) if(p[key] !== undefined && typeof p[key] !== 'string') throw Error(`Invalid ${key} for ${id}.`);
    if(p.checklist !== undefined && (!Array.isArray(p.checklist) || p.checklist.some(c => !object(c) || typeof c.id !== 'string' || !c.id || typeof c.text !== 'string' || typeof c.done !== 'boolean') || new Set(p.checklist.map(c => c.id)).size !== p.checklist.length)) throw Error(`Invalid checklist for ${id}.`);
    if(p.referenceUrls !== undefined && (!Array.isArray(p.referenceUrls) || p.referenceUrls.some(u => typeof u !== 'string' || !validUrl(u)))) throw Error(`References for ${id} must be HTTP(S) URLs.`);
    result.exercises[id] = {completed:p.completed,notes:p.notes,...(p.completedAt !== undefined ? {completedAt:p.completedAt as string}:{}),...(p.checklist !== undefined ? {checklist:p.checklist as Progress['checklist']} : {}),...(p.hint !== undefined ? {hint:p.hint as string}:{}),...(p.solution !== undefined ? {solution:p.solution as string}:{}),...(p.referenceUrls !== undefined ? {referenceUrls:p.referenceUrls as string[]}: {})};
  }
  return result;
}
export function parseBackup(text:string) {let data:unknown;try {data = JSON.parse(text);} catch {throw Error('This file is not valid JSON. Choose a Study Journey backup.');} return validateState(data);}
export function loadState():{state:State;error:string;raw:string|null} {
  let raw:string|null = null;
  try {raw = localStorage.getItem(STORAGE_KEY);return {state:raw ? parseBackup(raw):blankState(),error:'',raw};}
  catch(error) {return {state:blankState(),error:`Your saved data could not be loaded. Autosave is paused to preserve it. ${error instanceof Error ? error.message:'Browser storage is unavailable.'}`,raw};}
}
export function toggleProgress(p:Progress):Progress {return {...p,completed:!p.completed,completedAt:p.completed ? undefined:new Date().toISOString()};}
export function resetCompletion(state:State, ids:string[]):State {const next = {...state,exercises:{...state.exercises}};for(const id of ids) if(next.exercises[id]) next.exercises[id] = {...next.exercises[id],completed:false,completedAt:undefined};return next;}
