import { Context } from '@fraqjs/fraq';

import StatusPlugin from '../src';

const ctx = Context.fromUrl('http://localhost:30001/');
ctx.install(StatusPlugin);
ctx.start();

process.on('SIGINT', async () => {
  await ctx.stop();
  process.exit(0);
});
