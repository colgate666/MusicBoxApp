import { mkdir, writeFile } from "fs";
import path from "path";
import { promisify } from "util";
import { APP_ROOT, LOG } from "..";

interface Signatures {
    [key: string]: string
};

const signatures: Signatures = {
    R0lGODdh: 'gif',
    R0lGODlh: 'gif',
    iVBORw0KGgo: 'png',
    '/9j/': 'jpg'
};

export function detectMimeType(b64: string) {
  for (const s in signatures) {
    if (b64.indexOf(s) === 0) {
      return signatures[s];
    }
  }
}

export const saveFromBase64 = async (filename: string, data?: string): Promise<string | undefined> => {
    if (!data) {
        return undefined;
    }
    
    try {
        const buffer = Buffer.from(data, "base64");
        const mimetype = detectMimeType(data);
    
        const md = promisify(mkdir);
        const wf = promisify(writeFile);
        const ip = path.join(APP_ROOT, "public", "images", "avatars");
    
        await md(ip, { recursive: true });
        const p = path.join(ip, `${filename}.${mimetype}`); 
    
        await wf(p, buffer);
    
        return `${filename}.${mimetype}`;
    } catch (err) {
        LOG.error(err);
        return undefined;
    }
}