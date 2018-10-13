# Highscore Server
Simple HTTP highscore server.

## Deploying
### Node
Remember to create a /data directory.
```bash
npm install
npm run build
npm run start
```

### Docker
```bash
docker build -t whitebock/highscore .
docker run -p 80:80 -v /hostpath:/app/data -e TOKEN:"your-token" whitebock/highscore
```