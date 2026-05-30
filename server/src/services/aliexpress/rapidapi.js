/**
 * AliExpress via RapidAPI (real data, free tier available)
 *
 * Sign up at https://rapidapi.com — it's free.
 * Then subscribe (free) to "AliExpress DataHub API":
 *   https://rapidapi.com/datascraper/api/aliexpress-datahub
 * Paste your RapidAPI key in Admin → Settings.
 */
const axios = require("axios");

const HOST = "aliexpress-datahub.p.rapidapi.com";
const BASE = `https://${HOST}`;

function client(apiKey) {
  return axios.create({
    baseURL: BASE,
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": HOST,
    },
    timeout: 15000,
  });
}

async function searchProducts({ query, page = 1, pageSize = 20, apiKey }) {
  const http = client(apiKey);
  const res = await http.get("/item/search/2", {
    params: {
      q: query,
      page,
      sort: "default",
      locale: "en_US",
      currency: "USD",
      region: "US",
    },
  });

  const result = res.data?.result;
  if (!result) throw new Error("No results from RapidAPI");

  const items = result.resultList || [];
  return {
    products: items.map(normalizeItem),
    total: result.totalCount || items.length,
    page,
    pageSize,
  };
}

async function getProductDetail({ productId, apiKey }) {
  const http = client(apiKey);
  const res = await http.get("/item/detail", {
    params: {
      itemId: productId,
      locale: "en_US",
      currency: "USD",
      region: "US",
    },
  });

  const item = res.data?.result;
  if (!item) throw new Error("Product not found");
  return normalizeDetail(item);
}

function normalizeItem(item) {
  const info = item.item || item;
  const prices = info.sku?.def?.prices || {};
  const price = parseFloat(prices.actPrice || prices.price || info.salePrice?.minPrice || 0);
  const originalPrice = parseFloat(prices.price || info.originalPrice?.minPrice || price * 1.3);

  return {
    id: String(info.itemId || info.productId),
    title: info.title,
    image: info.image
      ? (info.image.startsWith("//") ? "https:" + info.image : info.image)
      : "",
    price,
    originalPrice,
    rating: parseFloat(info.averageRating || info.averageStar || 0),
    orders: parseInt(info.tradeCount || info.sold || 0),
    source: "rapidapi",
    url: `https://www.aliexpress.com/item/${info.itemId || info.productId}.html`,
  };
}

function normalizeDetail(item) {
  const images = (item.images || []).map((img) =>
    img.startsWith("//") ? "https:" + img : img
  );
  const skus = (item.skuAttr || []).flatMap((attr) =>
    (attr.attrValues || []).map((v) => ({
      skuId: v.skuId,
      price: parseFloat(v.price || item.salePrice?.minPrice || 0),
      stock: parseInt(v.stock || 99),
      properties: `${attr.attrName}: ${v.attrValue}`,
    }))
  );

  return {
    id: String(item.itemId || item.productId),
    title: item.title,
    images: images.length ? images : [item.image].filter(Boolean),
    description: item.description || "",
    price: parseFloat(item.salePrice?.minPrice || 0),
    originalPrice: parseFloat(item.originalPrice?.minPrice || 0),
    rating: parseFloat(item.averageRating || 0),
    orders: parseInt(item.tradeCount || 0),
    skus: skus.length ? skus : [],
    source: "rapidapi",
    url: `https://www.aliexpress.com/item/${item.itemId}.html`,
  };
}

module.exports = { searchProducts, getProductDetail };
