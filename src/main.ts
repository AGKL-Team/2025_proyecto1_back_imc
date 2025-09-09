import { createApp } from './bootstrap';

async function bootstrap() {
  const app = await createApp();
  app.listen(3000, () => {
    console.log('🚀 Server running on http://localhost:3000');
  });
}

void bootstrap();
