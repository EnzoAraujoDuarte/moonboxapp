import express from 'express';
import { addItem, removeItem, getWishlist } from '../controllers/wishlistController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/wishlist', authMiddleware, addItem);
router.delete('/wishlist/:itemId', authMiddleware, removeItem);
router.get('/wishlist', authMiddleware, getWishlist);

export default router;


