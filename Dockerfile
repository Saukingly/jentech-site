# ---- Jentech Group of Companies website ----
# Build:  docker build -t jentech-site .
# Run:    docker run -p 3000:3000 --env-file server/.env jentech-site
#
# IMPORTANT: uploaded report files are saved to /app/server/uploads inside
# the container. On any host (Railway, a VPS, etc.) you MUST mount a
# persistent volume at that exact path, or every uploaded document
# disappears the next time you redeploy. See the deployment notes for
# your specific host on how to attach a volume there.

FROM node:20-alpine

WORKDIR /app

# Install dependencies first, in their own layer — Docker only re-runs this
# step when package.json/package-lock.json actually change, so normal code
# edits rebuild in seconds instead of minutes.
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy the rest of the project, preserving the sibling folder layout
# server.js expects (server/, public/, database/ all under the same root).
COPY server ./server
COPY public ./public
COPY database ./database

WORKDIR /app/server

EXPOSE 3000

CMD ["node", "server.js"]
