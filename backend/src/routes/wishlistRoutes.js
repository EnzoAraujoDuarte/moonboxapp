const express = require('express');
const { addItem, removeItem, getWishlist } = require('../controllers/wishlistController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/wishlist', authMiddleware, addItem);
router.delete('/wishlist/:itemId', authMiddleware, removeItem);
router.get('/wishlist', authMiddleware, getWishlist);

module.exports = router;


