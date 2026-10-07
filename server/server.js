import app from './app.js';
import connectDB from './config/db.js';
import { env } from './config/env.js';

// Connect to MongoDB
connectDB();

const PORT = env.port || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
