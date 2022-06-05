import { getFormattedTime } from "../lib/getFormattedTime";

export const log = (component: string) => (msg: string, payload: string | {} | undefined = undefined) => console.info("\x1b[36m%s\x1b[0m", (getFormattedTime() + " : " + component + " : " + msg + " : "), (payload != undefined) ? payload : "")
export const elog = (component: string) => (msg: string, payload: string | {} | undefined = undefined) => console.info("\x1b[33m%s\x1b[0m", (getFormattedTime() + " : " + component + " : " + msg + " : "), (payload != undefined) ? payload : "")