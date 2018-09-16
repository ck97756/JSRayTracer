let debugging = false;

export function startDebugging(){
	debugging = true;
}


export function stopDebugging() {
	debugging = false;
}

export function isDebugging() {
	return debugging;
}