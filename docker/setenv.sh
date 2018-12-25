#! /bin/sh -e

echo "setting environment config"
echo "$ARTEMIS_URL"

cat >> /etc/nginx/conf.d/hly-admin.conf <<EOF
server {
    listen      80;
    server_name   $SERVER_NAME;

    gzip on;
    gzip_min_length 1k;
    gzip_buffers 4 16k;
    #gzip_http_version 1.0;
    gzip_comp_level 2;
    gzip_types text/plain application/javascript application/x-javascript text/css application/xml text/javascript application/x-httpd-php image/jpeg image/gif image/png;
    gzip_vary off;
    gzip_disable "MSIE [1-6]\.";

    location / {
        try_files \$uri /index.html;
        root /app/www/;
        client_max_body_size  $MAX_FILE_SIZE;
    }

    location /api/ {
        proxy_pass $ARTEMIS_URL;
        client_max_body_size  $MAX_FILE_SIZE;
    }

    location /auth/ {
        proxy_pass $AUTH_URL;
        client_max_body_size  $MAX_FILE_SIZE;
    }

    location /prepayment/ {
        proxy_pass $PREPAYMENT_URL;
        client_max_body_size  $MAX_FILE_SIZE;
    }

    location /contract/ {
        proxy_pass $CONTRACT_URL;
        client_max_body_size  $MAX_FILE_SIZE;
    }

    location /supplier/ {
        proxy_pass $SUPPLIER_URL;
        client_max_body_size  $MAX_FILE_SIZE;
    }
    location /job/ {
        proxy_pass $JOB_URL;
        client_max_body_size  $MAX_FILE_SIZE;
    }
    location /payment/ {
        proxy_pass $PAYMENT_URL;
        client_max_body_size  $MAX_FILE_SIZE;
    }

    location /accounting/ {
        proxy_pass $ACCOUNTING_URL;
        client_max_body_size  $MAX_FILE_SIZE;
    }

    location /budget/ {
        proxy_pass $BUDGRT_URL;
        client_max_body_size  $MAX_FILE_SIZE;
    }

    location /location/ {
        proxy_pass $LOCATION_URL;
        client_max_body_size  $MAX_FILE_SIZE;
    }

    location /brms/ {
        proxy_pass $BRMS_URL;
        client_max_body_size  $MAX_FILE_SIZE;
    }

    location /invoice/ {
        proxy_pass $INVOICE_URL;
        client_max_body_size  $MAX_FILE_SIZE;
    }

    location /expense/ {
        proxy_pass $EXPENSE_URL;
        client_max_body_size  $MAX_FILE_SIZE;
    }
    location /config/ {
        proxy_pass $CONFIG_URL;
        client_max_body_size  $MAX_FILE_SIZE;
    }

    location /tx-manager/ {
        proxy_pass $TX_MANAGER_URL;
        client_max_body_size  $MAX_FILE_SIZE;
    }
}

EOF

echo "starting web server"

nginx -g 'daemon off;'
