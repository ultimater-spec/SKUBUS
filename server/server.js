import app from './app.js';
import connectDB from './config/db.js';
import { env } from './config/env.js';

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || env.port || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server is running on port ${PORT}`);
});
