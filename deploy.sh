#!/bin/bash

# Exit on error
set -e

echo "Building frontend assets..."
cd frontend/home
npm install
npm run build
cd ../..

echo "Packaging theme..."
# Clean up any existing zip
rm -f theme.zip

# Zip the theme, excluding unnecessary files
zip -r theme.zip . -x "*.git*" "*.github*" "frontend/home/node_modules/*" "frontend/home/tmp/*" "frontend/home/heroui-docs/*" "node_modules/*" "theme.zip" "*.DS_Store" "deploy.sh"

echo "Uploading theme to server (kartnc)..."
scp theme.zip kartnc:~/public_html/wp-content/themes/

echo "Extracting theme and setting up plugins on the server..."
ssh kartnc << 'SERVER_EOF'
    # Ensure theme directory exists and extract
    mkdir -p ~/public_html/wp-content/themes/dc
    unzip -o ~/public_html/wp-content/themes/theme.zip -d ~/public_html/wp-content/themes/dc/
    rm ~/public_html/wp-content/themes/theme.zip

    # Setup dc-essentials plugin
    cat << 'PHP_EOF' > ~/public_html/wp-content/plugins/dc-essentials.php
<?php
/*
 * Plugin Name: Digicomp Essentials
 * Description: Essential functionalities for Digicomp Site
 * Version: 1.0.0
 * Author: Karthik
 */

require_once get_theme_root( 'dc' ) . '/dc/plugins/skai-essentials/index.php';
PHP_EOF

    # Setup soon plugin
    cat << 'PHP_EOF' > ~/public_html/wp-content/plugins/soon.php
<?php
/*
 * Plugin Name: Coming Soon
 * Description: Loads the Coming Soon plugin from the theme
 * Version: 1.0.0
 * Author: Karthik
 */

require_once get_theme_root( 'dc' ) . '/dc/plugins/soon/index.php';
PHP_EOF

    # Install WP-CLI if it doesn't exist
    if [ ! -f /usr/local/bin/wp ]; then
        echo "Installing WP-CLI..."
        curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
        chmod +x wp-cli.phar
        mv wp-cli.phar /usr/local/bin/wp
    fi

    # Install dependency plugins and activate loader plugins
    echo "Installing dependency plugins and activating loader plugins..."
    cd ~/public_html
    # Install and activate external dependencies
    wp plugin install woocommerce advanced-custom-fields seo-by-rank-math --activate
    # Activate the locally created loader plugins
    wp plugin activate dc-essentials soon

    # Install parent theme and activate child theme
    echo "Installing parent theme and activating dc theme..."
    wp theme install greenlet
    wp theme activate dc

SERVER_EOF

echo "Deployment and first-time setup complete!"
