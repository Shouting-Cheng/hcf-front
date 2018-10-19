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

    location /api/ {
        proxy_pass http://115.159.108.80:25297/artemis-sit/api/;
    }

    location /oauth/ {
        proxy_pass http://115.159.108.80:25297/oauth/;
    }

    location /auth/ {
        proxy_pass http://115.159.108.80:25297/auth/;
    }

    location /prepayment/ {
        proxy_pass http://115.159.108.80:25297/prepayment/;
    }

    location /contract/ {
        proxy_pass http://115.159.108.80:25297/contract/;
    }

    location /supplier/ {
        proxy_pass http://115.159.108.80:25297/contract/;
    }
    
    location /accounting/ {
        proxy_pass http://115.159.108.80:25297/contract/;
    }
}


EOF

echo "starting web server"

nginx -g 'daemon off;'
