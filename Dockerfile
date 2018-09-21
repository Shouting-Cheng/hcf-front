FROM nginx:alpine

EXPOSE 80
EXPOSE 22

COPY ./docker/setenv.sh /root
RUN chmod +x /root/setenv.sh

RUN mkdir -p /app/www

COPY ./dist /app/www/

CMD ["/root/setenv.sh"]
