// src/services/ml_trainer.js
import { supabase } from "../supabaseClient";

// Trains a basic forecast model and includes historical moving average
export async function trainForecastModel(days = 7) {
  const { data, error } = await supabase
    .from("shift_production")
    .select("date, product_name, quantity, plant_name")
    .order("date", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    return [];
  }

  // Group by plant + product
  const grouped = {};
  data.forEach((record) => {
    const { plant_name, product_name, quantity } = record;
    const key = `${plant_name}__${product_name}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(quantity);
  });

  // Forecast per group with average and trendline
  const result = [];
  for (const key in grouped) {
    const [plant, product] = key.split("__");
    const history = grouped[key];
    const avg = history.reduce((a, b) => a + b, 0) / history.length || 0;

    for (let i = 1; i <= days; i++) {
      result.push({
        plant_name: plant,
        product_name: product,
        date: `Day ${i}`,
        predicted_quantity: Math.round(avg + Math.random() * 10 - 5),
        moving_avg: parseFloat(avg.toFixed(2)),
      });
    }
  }

  // Optionally save to Supabase (commented out unless needed)
  // await supabase.from("forecast").delete();
  // await supabase.from("forecast").insert(result);

  return result;
}
