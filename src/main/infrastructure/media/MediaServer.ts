import http from "http";
import fs from "fs";
import path from "path";

const HTTP_PORT = 49153;
const MAX_MEDIA_SECONDS = 4;

const PAGE = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: transparent; width: 100vw; height: 100vh; overflow: hidden; display: flex; align-items: center; justify-content: center; }
  video, img { max-width: 100%; max-height: 100%; object-fit: contain; display: none; }
  .active { display: block; }
  #closeBtn { position: fixed; top: 8px; right: 8px; background: rgba(0,0,0,0.6); color: #fff; border: none; border-radius: 50%; width: 28px; height: 28px; font-size: 16px; cursor: pointer; display: none; align-items: center; justify-content: center; }
  #closeBtn.visible { display: flex; }
</style>
</head>
<body>
  <video id="vid" autoplay muted playsinline></video>
  <img id="img"/>
  <button id="closeBtn" onclick="clearMedia()">✕</button>
<script>
  const MAX_MEDIA_SECONDS = ${MAX_MEDIA_SECONDS};
  const vid = document.getElementById('vid');
  const img = document.getElementById('img');
  const closeBtn = document.getElementById('closeBtn');
  let timer = null;

  function clearMedia() {
    if (timer) { clearTimeout(timer); timer = null; }
    vid.pause(); vid.src = '';
    vid.classList.remove('active');
    img.src = '';
    img.classList.remove('active');
    closeBtn.classList.remove('visible');
  }

  function setMedia(uri) {
    if (!uri) { clearMedia(); return; }
    if (timer) { clearTimeout(timer); timer = null; }
    const isVideo = /\\.(mp4|webm|mov)$/i.test(uri);
    if (isVideo) {
      img.classList.remove('active');
      vid.src = uri;
      vid.classList.add('active');
      vid.play();
    } else {
      vid.classList.remove('active');
      img.src = uri;
      img.classList.add('active');
    }
    timer = setTimeout(clearMedia, MAX_MEDIA_SECONDS * 1000);
    closeBtn.classList.add('visible');
  }

  const es = new EventSource('/events');
  es.onmessage = (e) => setMedia(e.data);
</script>
</body>
</html>`;

export class MediaServer {
  private server: http.Server | null = null;
  private currentUri = "";
  private clients: http.ServerResponse[] = [];
  private clearTimer: ReturnType<typeof setTimeout> | null = null;

  start(): void {
    this.server = http.createServer((req, res) => {
      if (req.url === "/events") {
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "Access-Control-Allow-Origin": "*",
        });
        this.clients.push(res);
        req.on("close", () => {
          this.clients = this.clients.filter((c) => c !== res);
        });
        return;
      }

      if (req.url === "/") {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(PAGE);
        return;
      }

      if (req.url?.startsWith("/file")) {
        const filePath = decodeURIComponent(new URL(req.url, `http://localhost`).searchParams.get("p") ?? "");
        if (!filePath || !fs.existsSync(filePath)) { res.writeHead(404); res.end(); return; }
        const ext = path.extname(filePath).toLowerCase();
        const mime: Record<string, string> = { ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime", ".gif": "image/gif" };
        res.writeHead(200, { "Content-Type": mime[ext] ?? "application/octet-stream" });
        fs.createReadStream(filePath).pipe(res);
        return;
      }

      res.writeHead(404); res.end();
    });

    this.server.listen(HTTP_PORT);
    console.log(`[MediaServer] http://localhost:${HTTP_PORT}`);
  }

  setMedia(uri: string): void {
    if (this.clearTimer) { clearTimeout(this.clearTimer); this.clearTimer = null; }
    const localPath = uri.replace(/^file:\/\/\//i, "");
    const servedUri = fs.existsSync(localPath)
      ? `/file?p=${encodeURIComponent(localPath)}`
      : uri;
    this.currentUri = servedUri;
    this.clients.forEach((c) => c.write(`data: ${servedUri}\n\n`));
    this.clearTimer = setTimeout(() => this.clearMedia(), MAX_MEDIA_SECONDS * 1000);
  }

  clearMedia(): void {
    if (this.clearTimer) { clearTimeout(this.clearTimer); this.clearTimer = null; }
    this.currentUri = "";
    this.clients.forEach((c) => c.write(`data: \n\n`));
  }

  get url(): string { return `http://localhost:${HTTP_PORT}`; }

  stop(): void { this.server?.close(); this.server = null; }
}
