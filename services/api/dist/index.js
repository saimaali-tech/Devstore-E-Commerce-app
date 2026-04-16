import cors from "cors";
import express from "express";
import helmet from "helmet";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const app = express();
function releaseLevel() {
    const r = (process.env.APP_RELEASE || "v3").toLowerCase();
    const m = r.match(/^v(\d+)/);
    return m ? parseInt(m[1], 10) : 3;
}
function parseJsonField(value, fallback) {
    try {
        return JSON.parse(value);
    }
    catch {
        return fallback;
    }
}
function corsOrigins() {
    const raw = process.env.WEB_ORIGINS;
    if (!raw || raw === "*")
        return true;
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
}
app.use(helmet());
app.use(cors({
    origin: corsOrigins(),
    credentials: true,
}));
app.use(express.json());
app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "devstore-api" });
});
app.get("/ready", async (_req, res) => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        res.json({ status: "ready" });
    }
    catch {
        res.status(503).json({ status: "not_ready" });
    }
});
const api = express.Router();
api.get("/version", (_req, res) => {
    res.json({
        service: "devstore-api",
        release: process.env.APP_RELEASE || "v3",
        imageTag: process.env.IMAGE_TAG || "local",
        features: {
            wishlist: releaseLevel() >= 2,
            opsSummary: releaseLevel() >= 3,
        },
    });
});
api.get("/products", async (req, res) => {
    try {
        const search = String(req.query.search || "");
        const category = String(req.query.category || "");
        const sort = String(req.query.sort || "featured");
        const featured = req.query.featured === "true";
        const page = Math.max(1, parseInt(String(req.query.page || "1"), 10) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || "12"), 10) || 12));
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { category: { contains: search, mode: "insensitive" } },
            ];
        }
        if (category)
            where.category = category;
        if (featured)
            where.featured = true;
        let orderBy;
        switch (sort) {
            case "price-asc":
                orderBy = { price: "asc" };
                break;
            case "price-desc":
                orderBy = { price: "desc" };
                break;
            case "rating":
                orderBy = { rating: "desc" };
                break;
            case "newest":
                orderBy = { id: "desc" };
                break;
            default:
                orderBy = [{ featured: "desc" }, { id: "desc" }];
        }
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where: where,
                orderBy: orderBy,
                skip,
                take: limit,
            }),
            prisma.product.count({ where: where }),
        ]);
        const parsedProducts = products.map((product) => ({
            ...product,
            images: parseJsonField(product.images, [product.image]),
            tags: parseJsonField(product.tags, []),
        }));
        res.json({
            products: parsedProducts,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});
api.get("/products/:id", async (req, res) => {
    try {
        const productId = parseInt(req.params.id, 10);
        if (Number.isNaN(productId)) {
            res.status(400).json({ error: "Invalid product ID" });
            return;
        }
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: { reviews: { orderBy: { createdAt: "desc" } } },
        });
        if (!product) {
            res.status(404).json({ error: "Product not found" });
            return;
        }
        const parsedProduct = {
            ...product,
            images: parseJsonField(product.images, [product.image]),
            tags: parseJsonField(product.tags, []),
        };
        res.json({ product: parsedProduct, reviews: product.reviews });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch product" });
    }
});
api.post("/products/:id/reviews", async (req, res) => {
    try {
        const productId = parseInt(req.params.id, 10);
        if (Number.isNaN(productId)) {
            res.status(400).json({ error: "Invalid product ID" });
            return;
        }
        const { userName, rating, title, comment } = req.body;
        if (!userName || !rating || !title || !comment) {
            res.status(400).json({
                error: "Missing required fields: userName, rating, title, comment",
            });
            return;
        }
        const ratingValue = parseInt(String(rating), 10);
        if (Number.isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
            res.status(400).json({ error: "Rating must be between 1 and 5" });
            return;
        }
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            res.status(404).json({ error: "Product not found" });
            return;
        }
        const review = await prisma.review.create({
            data: {
                productId,
                userName: String(userName),
                rating: ratingValue,
                title: String(title),
                comment: String(comment),
            },
        });
        const allReviews = await prisma.review.findMany({
            where: { productId },
            select: { rating: true },
        });
        const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = Number((totalRating / allReviews.length).toFixed(1));
        await prisma.product.update({
            where: { id: productId },
            data: { rating: avgRating, reviewCount: allReviews.length },
        });
        res.status(201).json(review);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to create review" });
    }
});
api.get("/categories", async (_req, res) => {
    try {
        const categories = await prisma.product.groupBy({
            by: ["category"],
            _count: { category: true },
            orderBy: { category: "asc" },
        });
        res.json(categories.map((cat) => ({
            name: cat.category,
            count: cat._count.category,
        })));
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});
api.get("/stats", async (_req, res) => {
    try {
        const [totalProducts, totalOrders, categoriesResult, ratingResult] = await Promise.all([
            prisma.product.count(),
            prisma.order.count(),
            prisma.product.groupBy({ by: ["category"] }),
            prisma.product.aggregate({ _avg: { rating: true } }),
        ]);
        res.json({
            totalProducts,
            totalOrders,
            categoriesCount: categoriesResult.length,
            averageRating: Number((ratingResult._avg.rating || 0).toFixed(1)),
        });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});
api.get("/cart/:sessionId", async (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        if (!sessionId) {
            res.status(400).json({ error: "Session ID is required" });
            return;
        }
        let cart = await prisma.cart.findUnique({
            where: { id: sessionId },
            include: { items: { orderBy: { createdAt: "desc" } } },
        });
        if (!cart) {
            cart = await prisma.cart.create({
                data: { id: sessionId },
                include: { items: { orderBy: { createdAt: "desc" } } },
            });
        }
        res.json(cart);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch cart" });
    }
});
api.post("/cart/:sessionId/items", async (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        const { productId, quantity } = req.body;
        if (!productId || !quantity || quantity < 1) {
            res.status(400).json({
                error: "Valid productId and quantity (>= 1) are required",
            });
            return;
        }
        const productIdNum = parseInt(String(productId), 10);
        const quantityNum = parseInt(String(quantity), 10);
        if (Number.isNaN(productIdNum) || Number.isNaN(quantityNum)) {
            res.status(400).json({ error: "Invalid productId or quantity" });
            return;
        }
        const product = await prisma.product.findUnique({
            where: { id: productIdNum },
        });
        if (!product) {
            res.status(404).json({ error: "Product not found" });
            return;
        }
        if (product.stock < quantityNum) {
            res.status(400).json({
                error: `Insufficient stock. Only ${product.stock} available.`,
            });
            return;
        }
        let cart = await prisma.cart.findUnique({ where: { id: sessionId } });
        if (!cart) {
            cart = await prisma.cart.create({ data: { id: sessionId } });
        }
        const existingItem = await prisma.cartItem.findFirst({
            where: { cartId: sessionId, productId: productIdNum },
        });
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantityNum;
            if (product.stock < newQuantity) {
                res.status(400).json({
                    error: `Insufficient stock. Only ${product.stock} available. You already have ${existingItem.quantity} in your cart.`,
                });
                return;
            }
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: newQuantity },
            });
        }
        else {
            await prisma.cartItem.create({
                data: {
                    cartId: sessionId,
                    productId: productIdNum,
                    quantity: quantityNum,
                    productName: product.name,
                    productPrice: product.price,
                    productImage: product.image,
                },
            });
        }
        const updatedCart = await prisma.cart.findUnique({
            where: { id: sessionId },
            include: { items: { orderBy: { createdAt: "desc" } } },
        });
        res.json(updatedCart);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to add item to cart" });
    }
});
api.patch("/cart/:sessionId/items/:id", async (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        const itemId = parseInt(req.params.id, 10);
        if (Number.isNaN(itemId)) {
            res.status(400).json({ error: "Invalid item ID" });
            return;
        }
        const { quantity } = req.body;
        if (quantity === undefined || quantity === null) {
            res.status(400).json({ error: "Quantity is required" });
            return;
        }
        const quantityNum = parseInt(String(quantity), 10);
        if (Number.isNaN(quantityNum) || quantityNum < 0) {
            res.status(400).json({ error: "Quantity must be a non-negative number" });
            return;
        }
        const cartItem = await prisma.cartItem.findFirst({
            where: { id: itemId, cartId: sessionId },
        });
        if (!cartItem) {
            res.status(404).json({ error: "Cart item not found" });
            return;
        }
        if (quantityNum === 0) {
            await prisma.cartItem.delete({ where: { id: itemId } });
        }
        else {
            const product = await prisma.product.findUnique({
                where: { id: cartItem.productId },
            });
            if (product && product.stock < quantityNum) {
                res.status(400).json({
                    error: `Insufficient stock. Only ${product.stock} available.`,
                });
                return;
            }
            await prisma.cartItem.update({
                where: { id: itemId },
                data: { quantity: quantityNum },
            });
        }
        const updatedCart = await prisma.cart.findUnique({
            where: { id: sessionId },
            include: { items: { orderBy: { createdAt: "desc" } } },
        });
        res.json(updatedCart);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to update cart item" });
    }
});
api.delete("/cart/:sessionId/items/:id", async (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        const itemId = parseInt(req.params.id, 10);
        if (Number.isNaN(itemId)) {
            res.status(400).json({ error: "Invalid item ID" });
            return;
        }
        const cartItem = await prisma.cartItem.findFirst({
            where: { id: itemId, cartId: sessionId },
        });
        if (!cartItem) {
            res.status(404).json({ error: "Cart item not found" });
            return;
        }
        await prisma.cartItem.delete({ where: { id: itemId } });
        const updatedCart = await prisma.cart.findUnique({
            where: { id: sessionId },
            include: { items: { orderBy: { createdAt: "desc" } } },
        });
        res.json(updatedCart);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to delete cart item" });
    }
});
api.post("/orders", async (req, res) => {
    try {
        const { customerName, customerEmail, customerPhone, address, city, sessionId, } = req.body;
        if (!customerName || !customerEmail || !sessionId) {
            res.status(400).json({
                error: "Missing required fields: customerName, customerEmail, sessionId",
            });
            return;
        }
        const cart = await prisma.cart.findUnique({
            where: { id: sessionId },
            include: { items: true },
        });
        if (!cart || cart.items.length === 0) {
            res.status(400).json({ error: "Cart is empty or not found" });
            return;
        }
        const orderNumber = `DEV-${Date.now()}`;
        const total = cart.items.reduce((sum, item) => sum + item.productPrice * item.quantity, 0);
        const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    orderNumber,
                    customerName: String(customerName),
                    customerEmail: String(customerEmail),
                    customerPhone: customerPhone ? String(customerPhone) : null,
                    address: address ? String(address) : null,
                    city: city ? String(city) : null,
                    total,
                    items: {
                        create: cart.items.map((item) => ({
                            productId: item.productId,
                            productName: item.productName,
                            productPrice: item.productPrice,
                            quantity: item.quantity,
                        })),
                    },
                },
                include: { items: true },
            });
            for (const item of cart.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                });
            }
            await tx.cartItem.deleteMany({ where: { cartId: sessionId } });
            return newOrder;
        });
        res.status(201).json(order);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to create order" });
    }
});
api.get("/orders/:orderNumber", async (req, res) => {
    try {
        const orderNumber = req.params.orderNumber;
        const order = await prisma.order.findUnique({
            where: { orderNumber },
            include: { items: { orderBy: { id: "asc" } } },
        });
        if (!order) {
            res.status(404).json({ error: "Order not found" });
            return;
        }
        res.json(order);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch order" });
    }
});
api.get("/wishlist/:sessionId", async (req, res) => {
    if (releaseLevel() < 2) {
        res.status(404).json({ error: "Not found" });
        return;
    }
    try {
        const sessionId = req.params.sessionId;
        const items = await prisma.wishlistItem.findMany({
            where: { sessionId },
            include: { product: true },
            orderBy: { createdAt: "desc" },
        });
        res.json({
            items: items.map((w) => ({
                id: w.id,
                productId: w.productId,
                createdAt: w.createdAt,
                product: {
                    ...w.product,
                    images: parseJsonField(w.product.images, [w.product.image]),
                    tags: parseJsonField(w.product.tags, []),
                },
            })),
        });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch wishlist" });
    }
});
api.post("/wishlist/:sessionId", async (req, res) => {
    if (releaseLevel() < 2) {
        res.status(404).json({ error: "Not found" });
        return;
    }
    try {
        const sessionId = req.params.sessionId;
        const productId = parseInt(String(req.body.productId), 10);
        if (Number.isNaN(productId)) {
            res.status(400).json({ error: "productId required" });
            return;
        }
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            res.status(404).json({ error: "Product not found" });
            return;
        }
        await prisma.wishlistItem.upsert({
            where: {
                sessionId_productId: { sessionId, productId },
            },
            create: { sessionId, productId },
            update: {},
        });
        res.status(201).json({ ok: true });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to update wishlist" });
    }
});
api.delete("/wishlist/:sessionId/:productId", async (req, res) => {
    if (releaseLevel() < 2) {
        res.status(404).json({ error: "Not found" });
        return;
    }
    try {
        const sessionId = req.params.sessionId;
        const productId = parseInt(req.params.productId, 10);
        if (Number.isNaN(productId)) {
            res.status(400).json({ error: "Invalid product" });
            return;
        }
        await prisma.wishlistItem.deleteMany({
            where: { sessionId, productId },
        });
        res.json({ ok: true });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to remove wishlist item" });
    }
});
api.get("/ops/summary", async (_req, res) => {
    if (releaseLevel() < 3) {
        res.status(404).json({ error: "Not found" });
        return;
    }
    try {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const [orders24h, wishlistRows, productsLowStock] = await Promise.all([
            prisma.order.count({ where: { createdAt: { gte: since } } }),
            prisma.wishlistItem.count(),
            prisma.product.count({ where: { stock: { lte: 5 } } }),
        ]);
        res.json({
            window: "24h",
            ordersCreated: orders24h,
            wishlistEntries: wishlistRows,
            productsLowStock,
            generatedAt: new Date().toISOString(),
        });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to build summary" });
    }
});
app.use("/api", api);
const port = parseInt(process.env.PORT || "4000", 10);
app.listen(port, "0.0.0.0", () => {
    console.log(`devstore-api listening on :${port} (release v${releaseLevel()})`);
});
