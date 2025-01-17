import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import path from 'path';
import productRoutes from "./routes/product.route.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json()); // To allow json data to be sent in the request body
//Send data along with the request   

app.use('/api/products', productRoutes)

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'frontend', 'dist')));  // Adjust the path if necessary
  
    // For any request that doesn't match an API route, serve the React app
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));  // Adjust the path if necessary
    });
  }

app.listen(port, ()=> {
    connectDB();
    console.log(`Server is running on port: ${port}`);
});
