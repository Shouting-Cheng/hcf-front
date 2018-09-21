#! /bin/sh -e

echo "setting environment config"
echo "$ARTEMIS_WS_URL"
echo "$ARTEMIS_URL"

cat >> /etc/nginx/conf.d/hly-admin.conf <<EOF
server {
    listen      80;
    server_name   $SERVER_NAME;
    location / {
        try_files \$uri /index.html;
        root /app/www/;
    }

    location /oauth/ {
        proxy_pass http://116.228.77.183:25297/oauth;
    }

     location /auth/ {
        proxy_pass http://116.228.77.183:25297/auth;
    }
  
}
EOF

echo "starting web server"

nginx -g 'daemon off;'
