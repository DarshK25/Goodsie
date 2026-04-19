import Product from '../models/product.models.js';
import mongoose from 'mongoose';
import { s3 } from '../config/s3.js';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

// Helper: extract S3 key from a full S3 URL
const getS3KeyFromUrl = (url) => {
  try {
    const parsed = new URL(url);
    // pathname starts with "/" — strip leading slash
    return parsed.pathname.slice(1);
  } catch {
    return null;
  }
};

export const createProduct = async (req, res) => {
  const { name, price, description } = req.body;

  // Image comes from S3 upload (req.file) or fallback URL (req.body.image)
  const imageUrl = req.file ? req.file.location : req.body.image;

  if (!name || !price || !description || !imageUrl) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  const newProduct = new Product({ name, price, description, image: imageUrl });

  try {
    await newProduct.save();
    res.status(201).json({ success: true, message: "Product created successfully", data: newProduct });
  } catch (error) {
    console.log(`Error in Creating Product: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.log(`Error in Fetching Products: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateProduct = async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  // If a new file was uploaded, use its S3 URL; else keep existing image
  const imageUrl = req.file ? req.file.location : req.body.image;

  const productData = {
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
    image: imageUrl,
  };

  try {
    // If a new S3 image was uploaded, try to delete the old one from S3
    if (req.file) {
      const existing = await Product.findById(id);
      if (existing && existing.image) {
        const oldKey = getS3KeyFromUrl(existing.image);
        if (oldKey) {
          try {
            await s3.send(new DeleteObjectCommand({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: oldKey,
            }));
          } catch (s3Err) {
            console.warn(`Could not delete old S3 image: ${s3Err.message}`);
          }
        }
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, productData, { new: true });
    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    console.log(`Error in Updating Product: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteProduct = async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  try {
    const product = await Product.findById(id);

    // Delete image from S3 if it is an S3 URL
    if (product && product.image && product.image.includes('amazonaws.com')) {
      const key = getS3KeyFromUrl(product.image);
      if (key) {
        try {
          await s3.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
          }));
        } catch (s3Err) {
          console.warn(`Could not delete S3 image: ${s3Err.message}`);
        }
      }
    }

    await Product.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.log(`Error in Deleting Product: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};