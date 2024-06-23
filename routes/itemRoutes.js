const passport = require('passport');
const router = require('express').Router();
const { isAuth } = require('../services/middleware');
const Item = require('../models/Item');

// Ensure the user is authenticated
router.use(isAuth);

// Route to render item creation form page
router.get('/create', isAuth, (req, res) => {
    res.render('create-item');
});

// Route to process form submission and save item
router.post('/create', isAuth, async (req, res) => {
    try {
        const { title, description } = req.body;
        const newItem = new Item({
            userID: req.user._id, // Set the user ID to the current user
            title,
            description,
            creationDate: new Date() // Set the creation date to the current date
        });
        await newItem.save(); // Save the new item to the database
        res.redirect('/success'); // Redirect to success page
    } catch (error) {
        console.error(error);
        res.redirect('/error'); // In case of error, redirect to the error page
    }
});

// Route to get all items created by the authenticated user
router.get('/items', async (req, res) => {
    try {
        const items = await Item.find({ userID: req.user._id });
        res.render('items', { items });
    } catch (error) {
        console.error(error);
        res.redirect('/error');
    }
});

// Route to view a specific item
router.get('/item/:id', isAuth, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (item.userID.equals(req.user._id)) {
            res.render('item', { item });
        } else {
            res.redirect('/error');
        }
    } catch (error) {
        console.error(error);
        res.redirect('/error');
    }
});

// Route to delete a specific item
router.post('/item/:id/delete', isAuth, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (item.userID.equals(req.user._id)) {
            await item.deleteOne();
            res.redirect('/items');
        } else {
            res.redirect('/error');
        }
    } catch (error) {
        console.error(error);
        res.redirect('/error');
    }
});

module.exports = router;