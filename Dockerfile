# Node runtime image
FROM node:18-alpine

# 1. Tạo thư mục làm việc
WORKDIR /app

# 2. Cài dependency production
COPY package*.json ./
RUN npm ci --production

# 3. Copy toàn bộ source
COPY . .

# 4. Mở cổng ứng dụng
EXPOSE 3000

# 5. Lệnh khởi động
CMD ["npm","start"]