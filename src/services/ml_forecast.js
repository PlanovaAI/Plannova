// src/services/ml_forecast.js

// Simulated ML-based forecast engine for 7-day prediction
export async function generateMLForecast(data, days = 7) {
  // Extract past quantities
  const pastQuantities = data.map((item) => item.quantity);
  const average = pastQuantities.reduce((a, b) => a + b, 0) / pastQuantities.length || 0;

  // Create a basic forecast with ±10 variance
  const forecast = Array.from({ length: days }, (_, i) => ({
    date: `Day ${i + 1}`,
    predicted_quantity: Math.round(average + Math.random() * 20 - 10),
  }));

  return forecast;
}
