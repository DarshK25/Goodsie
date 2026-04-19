import express from 'express';
import { createProduct, deleteProduct, getProducts, updateProduct } from '../controllers/product.controller.js';
import { upload } from '../config/s3.js';

const router = express.Router();

// upload.single("image") reads the multipart field named "image"
router.post('/',   upload.single('image'), createProduct);
router.get('/',    getProducts);
router.put('/:id', upload.single('image'), updateProduct);
router.delete('/:id', deleteProduct);

export default router;