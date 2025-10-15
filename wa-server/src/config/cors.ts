import cors from "cors";
import { CorsOptions } from "cors";

const corsOptions: CorsOptions = {
  origin: "*",
  credentials: false, // Must be false when origin is "*"
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key"]
};

export default cors(corsOptions);
