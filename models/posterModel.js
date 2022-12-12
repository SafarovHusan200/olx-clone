const { Schema, model } = require("mongoose");

const posterSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    region: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      min: 50,
    },
    image: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    visits: {
      type: Number,
      default: 1,
    },
    category: {
      type: String,
      required: true,
      enum: ["realty", "transport", "electronics", "jobs"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Creating indexes
posterSchema.index({
  title: "text",
  description: "text",
});
posterSchema.statics = {
  searchPartial: function (q, callback) {
    return this.find(
      {
        $or: [
          { title: new RegExp(q, "gi") },
          { description: new RegExp(q, "gi") },
        ],
      },
      callback
    );
  },
  searchFull: function (q, callback) {
    return this.find(
      {
        $text: { $search: q, $caseSensitive: false },
      },
      callback
    );
  },
};

module.exports = model("Poster", posterSchema);
