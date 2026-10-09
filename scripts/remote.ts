/**
 * `pnpm remote <key> [<key> …]`: press remote buttons on the Vega Virtual
 * Device (or a connected Fire TV). Keys: up down left right select back home
 * menu playpause. Add a number to repeat: `pnpm remote right3 select`.
 */
import { execFileSync } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";

const KEYS: Record<string, string> = {
  up: "KEY_UP",
  down: "KEY_DOWN",
  left: "KEY_LEFT",
  right: "KEY_RIGHT",
  select: "KEY_ENTER",
  enter: "KEY_ENTER",
  back: "KEY_BACK",
  home: "KEY_HOME",
  menu: "KEY_MENU",
  playpause: "KEY_PLAYPAUSE",
};

const vega = join(homedir(), "vega", "bin", "vega");
const presses = process.argv.slice(2).flatMap((arg) => {
  const m = arg.toLowerCase().match(/^([a-z]+)(\d*)$/);
  const key = m && KEYS[m[1]!];
  if (!key) {
    console.error(`Unknown key "${arg}". Use: ${Object.keys(KEYS).join(", ")}`);
    process.exit(1);
  }
  return Array<string>(Number(m![2] || 1)).fill(key);
});

for (const key of presses) {
  execFileSync(vega, ["exec", "vda", "shell", `inputd-cli button_press ${key}`], { stdio: "ignore" });
  await new Promise((r) => setTimeout(r, 700));
}
console.log(`Pressed: ${presses.join(" ")}`);
