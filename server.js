import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

// Self-healing: if dist/index.html is missing (e.g. build command was only "bun install"), trigger build automatically
if (!fs.existsSync(indexPath)) {
  console.log('⚠️ dist/index.html not found. Running automatic build via vite build...');
  try {
    execSync('npx vite build', { stdio: 'inherit' });
    console.log('✅ Automatic build succeeded.');
  } catch (err) {
    console.error('❌ Failed to run automatic vite build:', err?.message || err);
  }
}

// Serve built static assets if dist exists
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// SPA catch-all fallback for client-side routing (/admin, /district/:id, /article/:slug, etc.)
app.get('*', (req, res) => {
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Build Missing - News Bharat Plus</title></head>
        <body style="font-family: sans-serif; padding: 40px; text-align: center; background: #0f172a; color: #f8fafc;">
          <h1 style="color: #ef4444;">Deployment Notice: Build step was skipped</h1>
          <p style="font-size: 16px; color: #94a3b8; max-width: 600px; margin: 0 auto 20px;">
            The <code>dist/</code> folder was not found because Render's Build Command was configured as only <code>bun install</code> instead of building the Vite frontend.
          </p>
          <div style="background: #1e293b; padding: 20px; border-radius: 8px; display: inline-block; text-align: left;">
            <p style="margin: 0 0 10px; font-weight: bold;">To fix this permanently on Render:</p>
            <ol style="margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Go to your Render Dashboard &gt; <b>Settings</b></li>
              <li>Change <b>Build Command</b> from <code>bun install</code> to:</li>
              <li><code style="background: #0f172a; padding: 4px 8px; color: #38bdf8; border-radius: 4px;">bun install && bun run build</code></li>
              <li>Click <b>Save Changes</b> and redeploy.</li>
            </ol>
          </div>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`News Bharat Plus server running on port ${PORT}`);
});
