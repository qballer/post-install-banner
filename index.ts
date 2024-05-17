import { tmpdir } from "os";
import path from "path";
import fs from "fs";

export interface FundingConfig {
  kind: string;
  url: string;
}

export interface BannerConfig {
  Funding: FundingConfig[];
  StarUrl: string;
  ProjectName: string;
}

export function shouldBannerRender(config: BannerConfig) {
  return (
    process.env.CI !== "true" &&
    process.env.NO_POST_INSTALL_BANNER !== "true" &&
    config.ProjectName !== ""
  );
}

const colorize = (...args: any) => ({
  black: `\x1b[30m${args.join(" ")}`,
  red: `\x1b[31m${args.join(" ")}`,
  green: `\x1b[32m${args.join(" ")}`,
  yellow: `\x1b[33m${args.join(" ")}`,
  blue: `\x1b[34m${args.join(" ")}`,
  magenta: `\x1b[35m${args.join(" ")}`,
  cyan: `\x1b[36m${args.join(" ")}`,
  white: `\x1b[37m${args.join(" ")}`,
  bgBlack: `\x1b[40m${args.join(" ")}\x1b[0m`,
  bgRed: `\x1b[41m${args.join(" ")}\x1b[0m`,
  bgGreen: `\x1b[42m${args.join(" ")}\x1b[0m`,
  bgYellow: `\x1b[43m${args.join(" ")}\x1b[0m`,
  bgBlue: `\x1b[44m${args.join(" ")}\x1b[0m`,
  bgMagenta: `\x1b[45m${args.join(" ")}\x1b[0m`,
  bgCyan: `\x1b[46m${args.join(" ")}\x1b[0m`,
  bgWhite: `\x1b[47m${args.join(" ")}\x1b[0m`,
});

export function render(config: BannerConfig) {
  const GREEN = "\x1b[32m";
  const YELLOW = "\x1b[33m";

  let renderResult = colorize(
    `Thank you for installing ${config.ProjectName}!\n`
  ).green;
  renderResult += colorize(
    `Please consider donating to help us maintain it.\n`
  ).green;

  renderResult += colorize(
    config.Funding.reduce((acc, funding) => {
      return acc + `${funding.kind} : ${funding.url}\n`;
    },'')
  ).magenta;

  renderResult += colorize(
    `You can also star the project on GitHub: ${config.StarUrl}\n`
  ).green;
  console.log(renderResult);
}

export function runBanner(config?: BannerConfig) {
  config = config || readConfiguration();

  if (!shouldBannerRender(config)) return;
  render(config);
}

function readConfiguration(): BannerConfig {
  const configPath = getConfigPath();
  try {
    const config = fs.readFileSync(configPath, "utf8");
    return JSON.parse(config);
  } catch (error) {
    // will not break install script
    const config = JSONSafeParse(process.env.POST_INSTALL_BANNER_CONFIG || "");
    return config || { Funding: [], ProjectName: "", StarUrl: "" };
  }
}

export function writeConfiguration(config?: BannerConfig) {
  config =
    config || JSONSafeParse(process.env.POST_INSTALL_BANNER_CONFIG || "");
  if (!config) {
    config = {
      Funding: [
        {
          kind: "OpenCollective",
          url: "https://opencollective.com/automock",
        },
      ],
      ProjectName: "Automock",
      StarUrl: "https://github.com/automock/automock",
    };
  }

  const configPath = getConfigPath();

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function getConfigPath(): string {
  return path.join(tmpdir(), "banner.config.json");
}

export function JSONSafeParse(toParse: string) {
  try {
    return JSON.parse(toParse);
  } catch {
    return null;
  }
}
