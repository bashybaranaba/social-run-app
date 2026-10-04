import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "../apps/mobile/assets");
const svg = (background, foreground = "#D8F370", transparent = false) => `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${transparent ? "" : `<rect width="1024" height="1024" rx="220" fill="${background}"/>`}
  <circle cx="512" cy="512" r="344" fill="none" stroke="${foreground}" stroke-width="22" opacity=".35"/>
  <path d="M 241 750 C 392 683 549 605 754 294" fill="none" stroke="${foreground}" stroke-width="32" stroke-linecap="round" opacity=".8"/>
  <path d="M 335 733 V 294 H 504 C 618 294 680 350 680 442 C 680 517 630 564 544 579 L 686 733 H 541 L 412 590 H 455 V 733 Z M 455 394 V 499 H 503 C 546 499 564 481 564 447 C 564 412 543 394 500 394 Z" fill="${foreground}"/>
  <circle cx="733" cy="285" r="38" fill="${foreground}"/>
</svg>`;
await sharp(Buffer.from(svg("#214D3D"))).png().toFile(join(root, "icon.png"));
await sharp(Buffer.from(svg("#214D3D", "#D8F370", true))).png().toFile(join(root, "android-icon-foreground.png"));
await sharp(Buffer.from(svg("#214D3D", "#FFFFFF", true))).png().toFile(join(root, "android-icon-monochrome.png"));
await sharp({ create: { width: 1024, height: 1024, channels: 3, background: "#214D3D" } }).png().toFile(join(root, "android-icon-background.png"));
await sharp(Buffer.from(svg("#214D3D"))).resize(512).png().toFile(join(root, "splash-icon.png"));
await sharp(Buffer.from(svg("#214D3D"))).resize(64).png().toFile(join(root, "favicon.png"));
