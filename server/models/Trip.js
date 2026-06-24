import mongoose from "mongoose";

// A Trip is stored flexibly so it can hold BOTH:
//  - manual trips (name, totalDays, cities, activitiesMap)
//  - AI trips (tripName, destination, days[], budgetBreakdown, etc.)
//
// strict: false  -> Mongoose accepts any fields you send, not just declared ones.
// timestamps: true -> auto-adds createdAt / updatedAt.
const tripSchema = new mongoose.Schema(
  {
    // We declare the two most-used fields so they're queryable/required-ish,
    // but everything else is allowed through thanks to strict: false.
    name: { type: String },
    tripName: { type: String },
  },
  { strict: false, timestamps: true }
);

const Trip = mongoose.model("Trip", tripSchema);

export default Trip;
