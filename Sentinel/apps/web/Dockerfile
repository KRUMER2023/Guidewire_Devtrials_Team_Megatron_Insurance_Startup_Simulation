FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Skip package-lock.json to avoid platform/version conflicts in this environment
RUN npm install --legacy-peer-deps && npm cache clean --force

COPY . .

EXPOSE 3000

ENV NEXT_TELEMETRY_DISABLED 1
ENV PATH /app/node_modules/.bin:$PATH

# Robust start: check if next binary exists, if not install it, then run npm run dev
CMD ["sh", "-c", "if [ ! -d \"node_modules\" ] || [ ! -f \"node_modules/.bin/next\" ]; then npm install --legacy-peer-deps; fi && npm run dev"]
