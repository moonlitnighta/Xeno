import component from './component.js';

export const internalComponent = [];

export function regComponent(Xeno){
	Xeno.component(component.name , component);
	internalComponent.push(component.name);
}
