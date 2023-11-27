import { NS, Server } from "@ns";
import ArgParser from "./ArgParser";

var ns: NS;

interface Args {
    host?: string;
    output?: string;
}

interface TreeNode {
    name: string;
    children: TreeNode[];
}

interface ScanResult {
    root: TreeNode;
    servers: Server[];
}

class Scaner {
    servers: Map<string, Server>;

    constructor() {
        this.servers = new Map<string, Server>();
    }

    scanRecursion(host: string): TreeNode | null {
        if (this.servers.has(host)) {
            return null;
        }

        const server = ns.getServer(host);
        this.servers.set(host, server);

        const node = {
            name: host,
            children: [],
        } as TreeNode;

        const childrenNames = ns.scan(host);
        for (const childName of childrenNames) {
            const child = this.scanRecursion(childName);
            if (child != null) {
                node.children.push(child);
            }
        }

        return node;
    }

    async scan(host?: string): Promise<ScanResult> {
        if (host == undefined) {
            host = ns.getHostname();
        }
        
        const root = this.scanRecursion(host);
        return {
            root: root,
            servers: [...this.servers.values()],
        } as ScanResult;
    }
}

export async function main(nsp: NS): Promise<void> {
    ns = nsp;
    const argParser = new ArgParser(["host"]);
    const args = argParser.parse(ns.args, {
        host: ns.getHostname(),
    } as Args);
    const scaner = new Scaner();
    const result = await scaner.scan(args.host);

    const json = JSON.stringify(result);
    if (args.output != undefined) {
        ns.write(args.output, json, "w");
    }
    else {
        ns.tprint(json);
    }
}
