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
    }

    location /api/ {
        proxy_pass $ARTEMIS_URL;
    }

    location /auth/ {
        proxy_pass $AUTH_URL;
    }

    location /prepayment/ {
        proxy_pass $PREPAYMENT_URL;
    }

    location /contract/ {
        proxy_pass $CONTRACT_URL;
    }

    location /supplier/ {
        proxy_pass $SUPPLIER_URL;
    }
    location /job/ {
        proxy_pass $JOB_URL;
    }
    location /payment/ {
        proxy_pass $PAYMENT_URL;
    }

    location /accounting/ {
        proxy_pass $ACCOUNTING_URL;
    }

    location /budget/ {
        proxy_pass $BUDGRT_URL;
    }

    location /location/ {
        proxy_pass $LOCATION_URL;
    }

    location /brms/ {
        proxy_pass $BRMS_URL;
    }

    location /invoice/ {
        proxy_pass $INVOICE_URL;
    }

    location /expense/ {
        proxy_pass $EXPENSE_URL;
    }
    location /config/ {
        proxy_pass $CONFIG_URL;
    }
}

EOF

echo "starting web server"

nginx -g 'daemon off;'
