#! /bin/sh -e

echo "setting environment config"
echo "$ARTEMIS_URL"

cat >> /etc/nginx/conf.d/hly-admin.conf <<EOF
server {
    listen      80;
    server_name   $SERVER_NAME;
    location / {
        try_files \$uri /index.html;
        root /app/www/;
        client_max_body_size  $MAX_FILE_SIZE;
    }

    location /api/ {
        proxy_pass http://$IP:$PORT/artemis-sit/api/;
        client_max_body_size  $MAX_FILE_SIZE;
    }

    location /auth/ {
        proxy_pass http://$IP:$PORT/auth/;
        client_max_body_size  $MAX_FILE_SIZE;
    }

    location /prepayment/ {
        proxy_pass http://$IP:$PORT/prepayment/;
        client_max_body_size  $MAX_FILE_SIZE;
    }

    location /contract/ {
        proxy_pass http://$IP:$PORT/contract/;
        client_max_body_size  $MAX_FILE_SIZE;
    }

    location /supplier/ {
        proxy_pass http://$IP:$PORT/supplier/;
        client_max_body_size  $MAX_FILE_SIZE;
    }
    location /job/ {
        proxy_pass http://$IP:$PORT/job/;
        client_max_body_size  $MAX_FILE_SIZE;
    }
    location /payment/ {
        proxy_pass http://$IP:$PORT/payment/;
        client_max_body_size  $MAX_FILE_SIZE;
    }

    location /accounting/ {
        proxy_pass http://$IP:$PORT/accounting/;
        client_max_body_size  $MAX_FILE_SIZE;
    }

    location /budget/ {
        proxy_pass http://$IP:$PORT/budget/;
        client_max_body_size  $MAX_FILE_SIZE;
    }

    location /location/ {
        proxy_pass http://$IP:$PORT/location/;
        client_max_body_size  $MAX_FILE_SIZE;
    }

    location /brms/ {
        proxy_pass http://$IP:$PORT/brms/;
        client_max_body_size  $MAX_FILE_SIZE;
    }

    location /invoice/ {
        proxy_pass http://$IP:$PORT/artemis-sit/invoice/;
        client_max_body_size  $MAX_FILE_SIZE;
    }

    location /expense/ {
        proxy_pass http://$IP:$PORT/expense/;
        client_max_body_size  $MAX_FILE_SIZE;
    }
    location /config/ {
        proxy_pass http://$IP:$PORT/artemis-sit/config/;
        client_max_body_size  $MAX_FILE_SIZE;
    }

    location /tx-manager/ {
        proxy_pass http://$IP:$PORT/tx-manager/;
        client_max_body_size  $MAX_FILE_SIZE;
    }
}

EOF

echo "starting web server"

nginx -g 'daemon off;'
