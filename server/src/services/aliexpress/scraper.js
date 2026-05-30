/**
 * AliExpress Unofficial Scraper Mode
 * Uses AliExpress internal search/product APIs that the website itself calls.
 * No API key needed — mimics browser requests.
 */
const axios = require("axios");

const SEARCH_URL = "https://www.aliexpress.com/w/wholesale-search.html";
const PRODUCT_URL = "https://www.aliexpress.com/item/";

// AliExpress internal search API (used by their own frontend)
const INTERNAL_SEARCH_API =
  "https://www.aliexpress.com/fn/search-pc/index";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://www.aliexpress.com/",
  Origin: "https://www.aliexpress.com",
};

async function searchProducts({ query, page = 1, pageSize = 20 }) {
  try {
    // Method 1: AliExpress internal search API
    const res = await axios.get(INTERNAL_SEARCH_API, {
      headers: HEADERS,
      params: {
        searchText: query,
        page,
        pageSize,
        origin: "y",
        sortType: "default",
        groupsort: 1,
        tag_id: 0,
        pvid: Date.now(),
      },
      timeout: 15000,
    });

    if (res.data?.result?.mods?.itemList?.content) {
      const items = res.data.result.mods.itemList.content;
      const total = res.data.result.mods.itemList.resultCount || items.length;
      return {
        products: items.map(normalizeScraperProduct),
        total,
        page,
        pageSize,
      };
    }

    // Method 2: fallback to mock data for dev/demo
    return getMockProducts(query, page, pageSize);
  } catch (err) {
    console.warn("[Scraper] Live fetch failed, using mock data:", err.message);
    return getMockProducts(query, page, pageSize);
  }
}

async function getProductDetail({ productId }) {
  try {
    // Try to get product data from AliExpress detail page data endpoint
    const res = await axios.get(
      `https://www.aliexpress.com/item/${productId}.html`,
      {
        headers: {
          ...HEADERS,
          Accept: "text/html,application/xhtml+xml",
        },
        timeout: 15000,
      }
    );

    const html = res.data;
    // Extract window.runParams JSON embedded in page
    const match = html.match(/window\.runParams\s*=\s*(\{.+?\});\s*\n/s);
    if (match) {
      const data = JSON.parse(match[1]);
      const item = data.data || data.pageData;
      if (item) return normalizeScraperDetail(productId, item);
    }

    return getMockProductDetail(productId);
  } catch (err) {
    console.warn("[Scraper] Product fetch failed, using mock:", err.message);
    return getMockProductDetail(productId);
  }
}

function normalizeScraperProduct(item) {
  const price = item.prices?.salePrice?.minPrice || item.prices?.originalPrice?.minPrice || 0;
  return {
    id: String(item.productId || item.itemId),
    title: item.title?.displayTitle || item.title || "Product",
    image: item.image?.imgUrl
      ? `https:${item.image.imgUrl}`
      : "https://via.placeholder.com/300",
    price: parseFloat(price),
    originalPrice: parseFloat(item.prices?.originalPrice?.minPrice || price),
    rating: parseFloat(item.evaluation?.starRating || 0),
    orders: parseInt(item.trade?.realTradeCount || 0),
    source: "scraper",
    url: `https://www.aliexpress.com/item/${item.productId || item.itemId}.html`,
  };
}

function normalizeScraperDetail(productId, data) {
  return {
    id: String(productId),
    title: data.productInfoComponent?.subject || "Product",
    images: (data.imageComponent?.imagePathList || []).map((img) =>
      img.startsWith("http") ? img : `https:${img}`
    ),
    description: data.productDescComponent?.descriptionUrl || "",
    price: parseFloat(data.priceComponent?.discountPrice?.value || data.priceComponent?.price?.value || 0),
    originalPrice: parseFloat(data.priceComponent?.price?.value || 0),
    rating: parseFloat(data.feedbackComponent?.evarageStar || 0),
    orders: parseInt(data.tradeComponent?.formatTradeCount || 0),
    skus: (data.skuComponent?.skuPriceList || []).map((s) => ({
      skuId: String(s.skuId),
      price: parseFloat(s.skuVal?.skuPrice?.value || 0),
      stock: parseInt(s.skuVal?.availQuantity || 0),
      properties: s.skuPropIds || "",
    })),
    source: "scraper",
  };
}

// --- Mock data for development / demo ---
function getMockProducts(query, page, pageSize) {
  const categories = [
    { kw: "phone", title: "Wireless Bluetooth Earbuds", price: 12.99, image: "https://picsum.photos/seed/earbud/400/400", orders: 5420 },
    { kw: "watch", title: "Smart Watch Fitness Tracker", price: 18.5, image: "https://picsum.photos/seed/watch/400/400", orders: 3200 },
    { kw: "bag", title: "Women's Leather Handbag", price: 22.0, image: "https://picsum.photos/seed/bag/400/400", orders: 7810 },
    { kw: "shoes", title: "Men's Running Sneakers", price: 28.99, image: "https://picsum.photos/seed/shoes/400/400", orders: 9340 },
    { kw: "lamp", title: "LED Desk Lamp USB Charging", price: 8.99, image: "https://picsum.photos/seed/lamp/400/400", orders: 4120 },
    { kw: "jacket", title: "Winter Puffer Jacket", price: 35.0, image: "https://picsum.photos/seed/jacket/400/400", orders: 2890 },
    { kw: "camera", title: "Mini Sports Action Camera 4K", price: 45.0, image: "https://picsum.photos/seed/camera/400/400", orders: 1560 },
    { kw: "chair", title: "Ergonomic Office Chair", price: 89.0, image: "https://picsum.photos/seed/chair/400/400", orders: 870 },
    { kw: "sunglasses", title: "Polarized UV400 Sunglasses", price: 6.5, image: "https://picsum.photos/seed/sunglasses/400/400", orders: 12300 },
    { kw: "toy", title: "Remote Control Racing Car", price: 15.99, image: "https://picsum.photos/seed/rctoy/400/400", orders: 6700 },
    { kw: "headphone", title: "Noise Cancelling Headphones", price: 32.0, image: "https://picsum.photos/seed/headphones/400/400", orders: 4580 },
    { kw: "watch2", title: "Digital Sport Stopwatch", price: 4.5, image: "https://picsum.photos/seed/stopwatch/400/400", orders: 18900 },
    { kw: "phone2", title: "Phone Case with Card Holder", price: 3.99, image: "https://picsum.photos/seed/phonecase/400/400", orders: 22400 },
    { kw: "keyboard", title: "Mechanical Gaming Keyboard", price: 42.0, image: "https://picsum.photos/seed/keyboard/400/400", orders: 3100 },
    { kw: "mouse", title: "RGB Gaming Mouse Wireless", price: 19.5, image: "https://picsum.photos/seed/mouse/400/400", orders: 5630 },
    { kw: "lights", title: "LED Strip Lights RGB 5m", price: 7.99, image: "https://picsum.photos/seed/ledstrip/400/400", orders: 31200 },
    { kw: "ring", title: "Sterling Silver Ring Set", price: 5.99, image: "https://picsum.photos/seed/rings/400/400", orders: 14500 },
    { kw: "yoga", title: "Non-slip Yoga Mat 6mm", price: 11.0, image: "https://picsum.photos/seed/yoga/400/400", orders: 8900 },
    { kw: "bottle", title: "Stainless Steel Water Bottle 1L", price: 9.5, image: "https://picsum.photos/seed/bottle/400/400", orders: 25600 },
    { kw: "pen", title: "Ballpoint Pen Set (10 pcs)", price: 2.5, image: "https://picsum.photos/seed/pens/400/400", orders: 44000 },
  ];

  const q = query.toLowerCase();
  let pool = categories.filter((c) => c.kw.includes(q) || c.title.toLowerCase().includes(q));
  if (!pool.length) pool = categories;

  const start = (page - 1) * pageSize;
  const expanded = Array.from({ length: Math.max(pageSize * 3, pool.length) }, (_, i) => {
    const base = pool[i % pool.length];
    const variation = i > pool.length - 1 ? ` - Model ${i + 1}` : "";
    return {
      id: `mock-${base.kw}-${i + 1}`,
      title: base.title + variation,
      image: base.image,
      price: parseFloat((base.price * (0.8 + Math.random() * 0.4)).toFixed(2)),
      originalPrice: parseFloat((base.price * 1.3).toFixed(2)),
      rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
      orders: Math.floor(base.orders * (0.5 + Math.random())),
      source: "scraper_mock",
      url: `https://www.aliexpress.com/item/mock-${base.kw}-${i + 1}.html`,
    };
  });

  return {
    products: expanded.slice(start, start + pageSize),
    total: expanded.length,
    page,
    pageSize,
  };
}

function getMockProductDetail(productId) {
  const seed = String(productId).replace(/[^a-z0-9]/gi, "");
  return {
    id: String(productId),
    title: `Product ${productId} - High Quality Item`,
    images: [
      `https://picsum.photos/seed/${seed}a/600/600`,
      `https://picsum.photos/seed/${seed}b/600/600`,
      `https://picsum.photos/seed/${seed}c/600/600`,
    ],
    description: "High quality product. Fast shipping. Best price guaranteed.",
    price: parseFloat((10 + Math.random() * 40).toFixed(2)),
    originalPrice: parseFloat((15 + Math.random() * 50).toFixed(2)),
    rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
    orders: Math.floor(1000 + Math.random() * 10000),
    skus: [
      { skuId: "sku-1", price: 14.99, stock: 100, properties: "Color: Black" },
      { skuId: "sku-2", price: 14.99, stock: 85, properties: "Color: White" },
      { skuId: "sku-3", price: 16.99, stock: 50, properties: "Color: Red" },
    ],
    source: "scraper_mock",
  };
}

module.exports = { searchProducts, getProductDetail };
