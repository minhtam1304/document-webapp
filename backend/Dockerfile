FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
	python3 \
	make \
	g++ \
	&& rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm_config_build_from_source=true npm ci --omit=dev

COPY src ./src
RUN mkdir -p uploads

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "src/server.js"]
