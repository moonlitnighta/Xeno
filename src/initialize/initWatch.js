export default function (xeno){
	let watchs = xeno.$options.watch;
	if(!watchs) return;

	for(let k in watchs){
		xeno.$watch(k , watchs[k]);
	}
}