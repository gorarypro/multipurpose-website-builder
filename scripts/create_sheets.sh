#!/usr/bin/env bash
# scripts/create_sheets.sh
# Creates CSV templates for Google Sheets

set -euo pipefail

ROOT_DIR="${1:-multipurpose-website-builder}"
echo "📄 [sheets] Using root: $ROOT_DIR"

SHEETS_DIR="$ROOT_DIR/sheets-templates"
mkdir -p "$SHEETS_DIR"

cat > "$SHEETS_DIR/settings.csv" << 'EOF'
Key,Value
site_title,
logo_text,
primary_color,#0d6efd
language_mode,single
default_language,en
currency_symbol,$
ecommerce_included,no
cart_included,no
wishlist_included,no
popup_included,no
popup_delay_seconds,60
popup_html,
product_source,blogger
blogger_feed_url,
wp_api_url,
wp_auth_key,
contact_email,
contact_phone,
contact_whatsapp,
privacy_url,
terms_url,
hero_title,
hero_subtitle,
hero_image_url,
ga_id,
EOF

cat > "$SHEETS_DIR/textmapping.csv" << 'EOF'
key,default,en,fr,ar
HOME,Home,Home,Accueil,الرئيسية
PRODUCTS,Products,Products,Produits,المنتجات
CONTACT,Contact,Contact,Contact,تواصل
ADD_TO_CART,Add to cart,Add to cart,Ajouter,أضف للسلة
CHECKOUT,Checkout,Checkout,Paiement,الدفع
WISHLIST,Wishlist,Wishlist,Favoris,المفضلة
CART_EMPTY,Your cart is empty,Your cart is empty,Panier vide,السلة فارغة
TEXT_BROWSE_PRODUCTS,Browse products,Browse products,Parcourir les produits,تصفح المنتجات
TEXT_CONTACT_US,Contact us,Contact us,Contactez-nous,تواصل معنا
TEXT_CONTACT_INTRO,Send us a message,Send us a message,Envoyez-nous un message,أرسل لنا رسالة
TEXT_NAME,Your name,Your name,Votre nom,اسمك
TEXT_EMAIL,Your email,Your email,Votre email,بريدك الإلكتروني
TEXT_MESSAGE,Your message,Your message,Votre message,رسالتك
TEXT_SEND_MESSAGE,Send message,Send message,Envoyer,أرسل الرسالة
TEXT_CART,Cart,Cart,Panier,السلة
TEXT_CLOSE,Close,Close,Fermer,إغلاق
TEXT_TOTAL,Total,Total,Total,الإجمالي
TEXT_CONTINUE_SHOPPING,Continue shopping,Continue shopping,Continuer vos achats,متابعة التسوق
TEXT_SORT_LATEST,Latest,Latest,Plus récent,الأحدث
TEXT_SORT_PRICE_ASC,Price (low to high),Price (low to high),Prix croissant,السعر تصاعدي
TEXT_SORT_PRICE_DESC,Price (high to low),Price (high to low),Prix décroissant,السعر تنازلي
TEXT_NO_PRODUCTS,No products found,No products found,Aucun produit,لا توجد منتجات
TEXT_WISHLIST,Wishlist,Wishlist,Favoris,المفضلة
TEXT_WISHLIST_EMPTY,Your wishlist is empty,Your wishlist is empty,Pas de favoris,قائمة المفضلة فارغة
TEXT_TESTIMONIALS,Testimonials,Testimonials,Témoignages,آراء العملاء
TEXT_TESTIMONIALS_SUBTITLE,What our customers say,What our customers say,Ce que disent nos clients,ماذا يقول عملاؤنا
TEXT_TESTIMONIAL_SAMPLE,Great service and quality!,Great service and quality!,Service et qualité au top!,خدمة رائعة وجودة عالية!
TEXT_TESTIMONIAL_ROLE,Customer,Customer,Client,عميل
TEXT_PRICING,Pricing,Pricing,Tarifs,الأسعار
TEXT_PRICING_SUBTITLE,Choose the plan that fits you,Choose the plan that fits you,Choisissez votre formule,اختر الخطة المناسبة
TEXT_PLAN_BASIC,Basic,Basic,Essentiel,الأساسية
TEXT_PLAN_BASIC_SUBTITLE,Good for starters,Good for starters,Pour bien commencer,جيدة للمبتدئين
TEXT_MONTH,month,month,mois,شهر
TEXT_FEATURE_1,Feature 1,Feature 1,Caractéristique 1,الميزة 1
TEXT_FEATURE_2,Feature 2,Feature 2,Caractéristique 2,الميزة 2
TEXT_CHOOSE_PLAN,Choose plan,Choose plan,Choisir cette offre,اختر الخطة
TEXT_ALL_RIGHTS_RESERVED,All rights reserved,All rights reserved,Tous droits réservés,جميع الحقوق محفوظة
TEXT_BACK_TO_TOP,Back to top,Back to top,Haut de page,إلى الأعلى
TEXT_PRIVACY,Privacy policy,Privacy policy,Politique de confidentialité,سياسة الخصوصية
TEXT_TERMS,Terms,Terms,Conditions générales,الشروط والأحكام
EOF

cat > "$SHEETS_DIR/entries.csv" << 'EOF'
timestamp,type,product_id,title,variants,qty,price,total,name,email,phone,message
EOF

echo "✅ [sheets] Done."
