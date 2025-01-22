FROM node:18 as build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build --prod

FROM nginx:latest
COPY dist/banking-portal /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
