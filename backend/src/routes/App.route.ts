import { analyzeNutrition, queryRecommend } from "@/utils/Nutrition.helper";
import type { Nutrient, User } from "@types";
import { Hono } from "hono";
import vnStr from "vn-str";

const appRoute = new Hono();

appRoute.post("/nutrition/analyze", async (c) => {
  try {
    const body = await c.req.json();

    if (!body || typeof body !== "object") {
      return c.json({
        status: "error",
        message: "Body JSON không hợp lệ",
      });
    }

    const { dish_name, user }: { dish_name: string; user: User } = body;

    if (!dish_name || !user) {
      return c.json({
        status: "error",
        message: "Thiếu thông tin: dish_name, user",
      });
    }

    const result = await analyzeNutrition(vnStr.rmVnTones(dish_name), user);

    if (!result) {
      return c.json({
        status: "error",
        message: `Không tìm thấy thông tin dinh dưỡng cho: ${dish_name}`,
      });
    }

    return c.json({
      status: "success",
      data: result,
    });
  } catch (error) {
    console.error("Lỗi /nutrition/analyze:", error);
    return c.json({
      status: "error",
      message: "Đã xảy ra lỗi trong quá trình xử lý",
    });
  }
});

appRoute.post("/recommend", async (c) => {
  try {
    const body = await c.req.json();

    if (!body || typeof body !== "object") {
      return c.json({
        status: "error",
        message: "Body JSON không hợp lệ",
      });
    }

    const { cal, carb, fat, protein }: Nutrient = body;

    const diff: Nutrient = {
      cal: Number(cal ?? 0),
      carb: Number(carb ?? 0),
      fat: Number(fat ?? 0),
      protein: Number(protein ?? 0),
    };

    const result = await queryRecommend(diff);

    return c.json({
      status: "success",
      diff,
      result,
    });
  } catch (error) {
    console.error("Lỗi /recommend:", error);
    return c.json({
      status: "error",
      message: "Đã xảy ra lỗi trong quá trình xử lý",
    });
  }
});

export default appRoute;
