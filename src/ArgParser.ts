type ArgType = string | number | boolean;

export default class ArgParser {
    argNames: string[];

    constructor(argNames: string[]) {
        this.argNames = argNames;
    }

    parse<T>(args: ArgType[], defaultValues: T): T {
        const result: any = {};
        Object.assign(result, defaultValues);
        
        let index = 0;
        for (const arg of args) {
            if (typeof arg === 'string') {
                if (arg.startsWith('--')) {
                    let argName = arg;
                    let argValue: ArgType = true;
                    const eqIndex = arg.indexOf('=');
                    if (eqIndex > 2) {
                        argName = arg.substring(2, eqIndex);
                        argValue = arg.substring(eqIndex+1);
                    }
                    result[argName] = argValue;
                    continue;
                }
            }
            let argName = this.argNames[index++];
            let argValue = arg;
            result[argName] = argValue;
        }
        
        return result as T;
    }
}
