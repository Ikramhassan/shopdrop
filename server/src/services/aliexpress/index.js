const affiliateApi = require("./affiliate");
const scraperApi = require("./scraper");
const rapidApi = require("./rapidapi");
const { db } = require("../../db");

async function getSettings() {
  return db.get("SELECT * FROM settings WHERE id = 'singleton'");
}

async function searchProducts(params) {
  const settings = await getSettings();
  const markup = settings.markup_percent / 100;
  const rate = settings.usd_to_lkr;

  let result;
  if (settings.api_mode === "affiliate") {
    result = await affiliateApi.searchProducts({
      ...params,
      appKey: settings.affiliate_app_key,
      appSecret: settings.affiliate_secret,
    });
  } else if (settings.api_mode === "rapidapi") {
    result = await rapidApi.searchProducts({
      ...params,
      apiKey: settings.rapidapi_key,
    });
  } else {
    result = await scraperApi.searchProducts(params);
  }

  result.products = result.products.map((p) =>
    applyMarkup(p, markup, rate, settings.currency)
  );
  return result;
}

async function getProductDetail(params) {
  const settings = await getSettings();
  const markup = settings.markup_percent / 100;
  const rate = settings.usd_to_lkr;

  let product;
  if (settings.api_mode === "affiliate") {
    product = await affiliateApi.getProductDetail({
      ...params,
      appKey: settings.affiliate_app_key,
      appSecret: settings.affiliate_secret,
    });
  } else if (settings.api_mode === "rapidapi") {
    product = await rapidApi.getProductDetail({
      ...params,
      apiKey: settings.rapidapi_key,
    });
  } else {
    product = await scraperApi.getProductDetail(params);
  }

  return applyMarkup(product, markup, rate, settings.currency);
}

function applyMarkup(product, markup, rate, currency) {
  const convert = (usd) => {
    const withMarkup = usd * (1 + markup);
    return currency === "LKR"
      ? parseFloat((withMarkup * rate).toFixed(2))
      : parseFloat(withMarkup.toFixed(2));
  };

  return {
    ...product,
    priceAliexpress: product.price,
    price: convert(product.price),
    originalPrice: product.originalPrice ? convert(product.originalPrice) : null,
    currency,
    skus: product.skus?.map((s) => ({
      ...s,
      priceAliexpress: s.price,
      price: convert(s.price),
    })),
  };
}

module.exports = { searchProducts, getProductDetail };
