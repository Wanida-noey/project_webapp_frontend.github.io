export default function handler(req, res) {
  res.status(200).json({
    droneId: "66010730",
    droneName: "Tuba",
    light: "OFF",
    country: "Japan"
  });
}