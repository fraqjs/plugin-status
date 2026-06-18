import { definePlugin, milkyPackageVersion, milkyVersion } from '@fraqjs/fraq';

function formatDuration(duration: number): string {
  const seconds = Math.floor(duration / 1000) % 60;
  const minutes = Math.floor(duration / (1000 * 60)) % 60;
  const hours = Math.floor(duration / (1000 * 60 * 60)) % 24;
  const days = Math.floor(duration / (1000 * 60 * 60 * 24));

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}min`);
  if (seconds > 0) parts.push(`${seconds}s`);
  return parts.join(' ');
}

export type StatusInfoLayoutComponent =
  | '$title'
  | '$platform'
  | '$fraq-version'
  | '$milky-version'
  | '$impl-info'
  | '$uptime'
  | (string & {})
  | (() => string | Promise<string>);

export interface StatusPluginOptions {
  enableCommand?: boolean;
  commandName?: string;
  title?: string;
  layout?: StatusInfoLayoutComponent[];
}

export class StatusService {
  private readonly startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  async getFraqVersion(): Promise<string> {
    const { default: pkg } = await import('@fraqjs/fraq/package.json', { with: { type: 'json' } });
    return pkg.version;
  }

  getUptimeMs(): number {
    return Date.now() - this.startTime;
  }

  getUptimeFormatted(): string {
    return formatDuration(this.getUptimeMs());
  }
}

export const StatusPlugin = definePlugin({
  name: 'status',
  provides: [StatusService],
  async apply(ctx, options?: StatusPluginOptions) {
    const status = new StatusService();
    ctx.provide(StatusService, status);

    const enableCommand = options?.enableCommand ?? true;
    if (!enableCommand) return;

    const commandName = options?.commandName || '#fraq';
    const title = options?.title || 'Fraq 运行状态';
    const layout = options?.layout || [
      '$title',
      '$platform',
      '$fraq-version',
      '$milky-version',
      '$impl-info',
      '$uptime',
    ];

    const componentProviders: Record<
      Extract<StatusInfoLayoutComponent, string>,
      (() => Promise<string>) | undefined
    > = {
      $title: async () => `===== ${title} =====`,
      $platform: async () => `运行平台: ${process.platform} (${process.arch})`,
      '$fraq-version': async () => `Fraq 版本: ${await status.getFraqVersion()}`,
      '$milky-version': async () => `Milky 版本: ${milkyVersion} (${milkyPackageVersion})`,
      '$impl-info': async () => {
        const implInfo = await ctx.client.get_impl_info();
        return `协议端: ${implInfo.impl_name} v${implInfo.impl_version} @ ${implInfo.qq_protocol_type} ${implInfo.qq_protocol_version}`;
      },
      $uptime: async () => `运行时间: ${status.getUptimeFormatted()}`,
    };
    ctx.router.command(commandName || '#fraq').execute(async (session) => {
      const components = await Promise.all(
        layout.map(async (component) => {
          if (typeof component === 'function') {
            try {
              const result = component();
              return result instanceof Promise ? await result : result;
            } catch (error) {
              return `组件渲染错误: ${(error as Error).message}`;
            }
          }
          const provider = componentProviders[component];
          if (provider) {
            return await provider();
          } else {
            return component;
          }
        }),
      );
      await session.reply(components.join('\n'));
    });
  },
});

export default StatusPlugin;
