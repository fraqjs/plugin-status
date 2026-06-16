# fraq-plugin-status

用于 [Fraq](https://fraq.ntqqrev.org/) 的状态查询插件，提供了状态查询服务，并且默认提供了一个基于该服务的状态查询命令。

## 安装与配置

将插件添加至 `dependencies`，然后在创建 `Context` 时引入并配置插件：

```typescript
import StatusPlugin from "fraq-plugin-status";

ctx.install(StatusPlugin, {
  // 在这里传入 StatusPlugin 的配置选项
});
```

`StatusPlugin` 有如下配置项：

- `enableCommand`：是否启用默认的状态查询命令，默认为 `true`。
- `commandName`：状态查询命令的名称，默认为 `#fraq`。
- `title`：状态信息的标题，默认为 “Fraq 运行状态”。
- `layout`：状态信息的布局，默认为 `['$title', '$platform', '$fraq-version', '$milky-version', '$impl-info', '$uptime']`。

如果你是插件开发者，请将本插件添加到项目的 `peerDependencies` 中，并在自己的插件中声明依赖：

```typescript
import { StatusService } from "fraq-plugin-status";

definePlugin({
  name: "my-plugin",
  inject: {
    status: StatusService,
  },
  apply(ctx) {
    // 使用 ctx.status 来访问 StatusService
  },
});
```

## 配置 Layout

`layout` 配置项是一个数组，定义了状态信息的布局，提供了以下预定义组件：

- `$title`：显示由两侧等号包围的标题，例如 `===== Fraq 运行状态 =====`。
- `$platform`：显示运行平台信息，例如 `运行平台: win32 (x64)`。
- `$fraq-version`：显示 Fraq 版本信息。
- `$milky-version`：显示 Milky 版本信息。
- `$protocol-info`：显示协议端信息。
- `$uptime`：显示运行时长信息，精确到秒。

数组也可以传入不同于上述预定义组件的字符串，此时会将传入的字符串直接作为状态信息的一行显示。

## 使用 `StatusService`

`StatusService` 封装了简单的用于获取状态信息的 API：

- `getFraqVersion(): Promise<string>`：获取 Fraq 版本信息。
- `getUptimeMs(): number`：获取运行时长信息，单位为毫秒。
- `getUptimeFormatted(): string`：获取格式化后的运行时长信息，例如 `1d 2h 3m 4s`。
