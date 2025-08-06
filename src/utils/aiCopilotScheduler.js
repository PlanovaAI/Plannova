// src/utils/aiCopilotScheduler.js

export function suggestBestSlot(order, schedules, plantCapacities) {
  const candidates = [];

  plantCapacities.forEach((cap) => {
    const scheduled = schedules.filter(
      (s) => s.plant === cap.plant_name && s.shift === cap.shift
    );

    const totalScheduled = scheduled.length;
    const available = cap.max_capacity - totalScheduled;

    if (available > 0) {
      candidates.push({
        plant: cap.plant_name,
        shift: cap.shift,
        load: totalScheduled,
        available,
      });
    }
  });

  // Sort by lowest load (highest availability)
  candidates.sort((a, b) => a.load - b.load);

  // Return top suggestion
  if (candidates.length > 0) {
    return {
      plant: candidates[0].plant,
      shift: candidates[0].shift,
      date: getNextAvailableDate(candidates[0], schedules),
    };
  }

  return null;
}

function getNextAvailableDate(candidate, schedules) {
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() + i);
    const dateStr = checkDate.toISOString().split("T")[0];

    const matching = schedules.filter(
      (s) =>
        s.plant === candidate.plant &&
        s.shift === candidate.shift &&
        s.date === dateStr
    );

    if (matching.length < candidate.available) {
      return dateStr;
    }
  }

  return today.toISOString().split("T")[0];
}
