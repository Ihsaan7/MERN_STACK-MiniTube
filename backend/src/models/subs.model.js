import mongoose from "mongoose";
import mongooseAggregatePagination from "mongoose-aggregate-paginate-v2";

const subscriptionSchema = new mongoose.Schema(
  {
    subscriber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

subscriptionSchema.plugin(mongooseAggregatePagination);
const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
