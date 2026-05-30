/**
 * AliExpress Affiliate / Dropship API (Official)
 * Uses the AliExpress DS (Dropship) Open Platform API
 * Docs: https://developers.aliexpress.com/en/doc.htm
 */
const axios = require("axios");
const crypto = require("crypto");

const BASE_URL = "https://api-sg.aliexpress.com/sync";

function buildSign(params, appSecret) {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}${params[k]}`)
    .join("");
  const str = appSecret + sorted + appSecret;
  return crypto.createHash("md5").update(str).digest("hex").toUpperCase();
}

function getCommonParams(appKey, method) {
  return {
    app_key: appKey,
    method,
    format: "json",
    v: "2.0",
    sign_method: "md5",
    timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
  };
}

async function searchProducts({ query, page = 1, pageSize = 20, appKey, appSecret }) {
  const method = "aliexpress.affiliate.product.query";
  const params = {
    ...getCommonParams(appKey, method),
    keywords: query,
    page_no: page,
    page_size: pageSize,
    fields: "product_id,product_title,product_main_image_url,original_price,sale_price,evaluate_rate,order_count,shop_id",
    target_currency: "USD",
    target_language: "EN",
    sort: "LAST_VOLUME_DESC",
  };
  params.sign = buildSign(params, appSecret);

  const res = await axios.post(BASE_URL, null, { params });
  const data = res.data?.aliexpress_affiliate_product_query_response?.resp_result;

  if (!data || data.resp_code !== 200) {
    throw new Error(data?.resp_msg || "AliExpress API error");
  }

  const products = data.result?.products?.product || [];
  return {
    products: products.map(normalizeAffiliateProduct),
    total: data.result?.total_record_count || 0,
    page,
    pageSize,
  };
}

async function getProductDetail({ productId, appKey, appSecret }) {
  const method = "aliexpress.ds.product.get";
  const params = {
    ...getCommonParams(appKey, method),
    product_id: productId,
    target_currency: "USD",
    target_language: "EN",
  };
  params.sign = buildSign(params, appSecret);

  const res = await axios.post(BASE_URL, null, { params });
  const data = res.data?.aliexpress_ds_product_get_response?.result;

  if (!data) throw new Error("Product not found");

  return normalizeAffiliateProductDetail(data);
}

function normalizeAffiliateProduct(p) {
  return {
    id: String(p.product_id),
    title: p.product_title,
    image: p.product_main_image_url,
    price: parseFloat(p.sale_price || p.original_price || 0),
    originalPrice: parseFloat(p.original_price || 0),
    rating: parseFloat(p.evaluate_rate || 0) / 100 * 5,
    orders: parseInt(p.order_count || 0),
    source: "affiliate",
    url: `https://www.aliexpress.com/item/${p.product_id}.html`,
  };
}

function normalizeAffiliateProductDetail(p) {
  const info = p.product || p;
  const skus = info.sku_info?.sku_list || [];
  return {
    id: String(info.product_id),
    title: info.subject,
    images: info.image_list?.map((i) => i.image_url) || [info.main_image_url],
    description: info.description || "",
    price: parseFloat(skus[0]?.sku_price || info.original_price || 0),
    originalPrice: parseFloat(info.original_price || 0),
    rating: parseFloat(info.evaluation_count || 0),
    orders: parseInt(info.trade_count || 0),
    skus: skus.map((s) => ({
      skuId: s.sku_id,
      price: parseFloat(s.sku_price || 0),
      stock: parseInt(s.sku_available_stock || 0),
      properties: s.sku_attr || "",
    })),
    shipping: info.shipping_info?.shipping_list?.[0] || null,
    source: "affiliate",
  };
}

module.exports = { searchProducts, getProductDetail };
