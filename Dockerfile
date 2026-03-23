# Stage 1: 빌드
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml* package-lock.json* yarn.lock* ./
RUN npm install --force

COPY . .

# VITE_ 환경변수는 빌드 시점에 번들에 인라인됨
ARG VITE_API_BASE_URL=http://localhost:8081
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Stage 2: nginx로 정적 파일 서빙
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# React Router (SPA) 새로고침 시 404 방지
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
