import { isDef } from '../utils/index.js';

let insts = {};

export function set(xeno){
	insts[xeno._uuid] = xeno;
}
export function get(uuid){
	return isDef(uuid) ? insts[uuid] : null;
}
export function remove(uuid){
	delete insts[uuid];
}