FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5173

# --host 0.0.0.0을 지정해야 호스트 PC 브라우저에서 컨테이너의 Vite 서버에 접속할 수 있습니다.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
