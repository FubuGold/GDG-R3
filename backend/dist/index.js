import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { connectToDatabase, ensureIngredientsSeeded } from "./helpers/App.helper";
import { IngredientModel } from "./models/Ingredient.model";
import { queryRecommend } from "./recommend";
const app = new Hono();
app.get("/", async (c) => {
    await connectToDatabase();
    return c.json({ status: "success" });
});
app.get("/nutrition/search", async (c) => {
    await connectToDatabase();
    const query = c.req.query("query") ?? c.req.query("q");
    const limitStr = c.req.query("limit");
    const limit = limitStr ? Math.max(1, Math.min(50, Number(limitStr))) : 10;
    if (!query || query.trim() === "") {
        return c.json({ status: "error", message: "Param 'query' là bắt buộc" }, 400);
    }
    const items = await IngredientModel.find({
        ingr_name: { $regex: query, $options: "i" },
    })
        .limit(limit)
        .lean();
    return c.json({ status: "success", query, count: items.length, items });
});
app.post("/recommend", async (c) => {
    await connectToDatabase();
    const body = await c.req.json().catch(() => null);
    if (!body || typeof body !== "object") {
        return c.json({ status: "error", message: "Body JSON không hợp lệ" }, 400);
    }
    const diff = {
        cal: Number(body.cal ?? 0),
        carb: Number(body.carb ?? 0),
        fat: Number(body.fat ?? 0),
        protein: Number(body.protein ?? 0),
    };
    const result = await queryRecommend(diff);
    return c.json({ status: "success", diff, result });
});
// Initialize DB and seed on startup
(async () => {
    try {
        await connectToDatabase();
        await ensureIngredientsSeeded();
    }
    catch (err) {
        console.error("[startup] error:", err);
    }
})();
serve({
    fetch: app.fetch,
    port: 3000,
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
