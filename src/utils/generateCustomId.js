const Counter = require("../helper/couter.model");

const generateCustomId = async (prefix) => {
  const counter = await Counter.findByIdAndUpdate(
    { _id: prefix },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const number = counter.seq.toString().padStart(6, "0");
  return `${prefix}${number}`;
};

module.exports = generateCustomId;
