const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Database setup
const db = new sqlite3.Database('./database.sqlite');

// Initialize database tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        is_admin BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        price REAL,
        platform TEXT,
        download_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS promos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE,
        discount_percent INTEGER,
        expires_at DATETIME,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS global_promo (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        discount_percent INTEGER,
        expires_at DATETIME,
        is_active BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS purchases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        product_id INTEGER,
        promo_code TEXT,
        final_price REAL,
        stripe_payment_id TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS updates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        app_name TEXT,
        version TEXT,
        file_path TEXT,
        release_notes TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Insert default admin user (password: 24092017)
    const hashedPassword = crypto.createHash('sha256').update('24092017').digest('hex');
    db.run(`INSERT OR IGNORE INTO users (email, password, is_admin) VALUES (?, ?, 1)`, 
           ['admin@myapps.com', hashedPassword]);

    // Insert default products
    db.run(`INSERT OR IGNORE INTO products (name, price, platform, download_url) VALUES 
           ('MyTracks Windows', 5.00, 'windows', '/downloads/mytracks-windows.exe'),
           ('MyTracks Mac', 5.00, 'mac', '/downloads/mytracks-mac.dmg'),
           ('MyTracks Linux', 5.00, 'linux', '/downloads/mytracks-linux.AppImage'),
           ('MyTracks Android', 5.00, 'android', '/downloads/mytracks-android.apk'),
           ('Tracks Infox Windows', 0.00, 'windows', '/downloads/tracksinfox-windows.exe'),
           ('Tracks Infox Mac', 0.00, 'mac', '/downloads/tracksinfox-mac.dmg'),
           ('Tracks Infox Linux', 0.00, 'linux', '/downloads/tracksinfox-linux.AppImage'),
           ('Tracks Infox Android', 0.00, 'android', '/downloads/tracksinfox-android.apk')`);
});

// Middleware to verify admin
const verifyAdmin = (req, res, next) => {
    const token = req.headers.authorization;
    if (token === 'admin-token-123') {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// API Routes

// Get products
app.get('/api/products', (req, res) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Get global promo
app.get('/api/global-promo', (req, res) => {
    db.get('SELECT * FROM global_promo WHERE is_active = 1 AND expires_at > datetime("now")', [], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(row || { discount_percent: 0, is_active: false });
        }
    });
});

// Validate promo code
app.post('/api/validate-promo', (req, res) => {
    const { code } = req.body;
    db.get('SELECT * FROM promos WHERE code = ? AND is_active = 1 AND expires_at > datetime("now")', 
           [code], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (row) {
            res.json({ valid: true, discount_percent: row.discount_percent });
        } else {
            res.json({ valid: false });
        }
    });
});

// Admin routes

// Update product price
app.put('/api/admin/products/:id', verifyAdmin, (req, res) => {
    const { price } = req.body;
    db.run('UPDATE products SET price = ? WHERE id = ?', [price, req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ success: true });
        }
    });
});

// Set global promo
app.post('/api/admin/global-promo', verifyAdmin, (req, res) => {
    const { discount_percent, duration_hours } = req.body;
    const expires_at = new Date(Date.now() + duration_hours * 60 * 60 * 1000).toISOString();
    
    db.run('UPDATE global_promo SET is_active = 0', [], () => {
        db.run('INSERT INTO global_promo (discount_percent, expires_at, is_active) VALUES (?, ?, 1)',
               [discount_percent, expires_at], function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ success: true, id: this.lastID });
            }
        });
    });
});

// Add promo code
app.post('/api/admin/promo-codes', verifyAdmin, (req, res) => {
    const { code, discount_percent, duration_hours } = req.body;
    const expires_at = new Date(Date.now() + duration_hours * 60 * 60 * 1000).toISOString();
    
    db.run('INSERT INTO promos (code, discount_percent, expires_at) VALUES (?, ?, ?)',
           [code, discount_percent, expires_at], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ success: true, id: this.lastID });
        }
    });
});

// Get promo codes
app.get('/api/admin/promo-codes', verifyAdmin, (req, res) => {
    db.all('SELECT * FROM promos ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Delete promo code
app.delete('/api/admin/promo-codes/:id', verifyAdmin, (req, res) => {
    db.run('DELETE FROM promos WHERE id = ?', [req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ success: true });
        }
    });
});

// Upload update
app.post('/api/admin/updates', verifyAdmin, (req, res) => {
    const { app_name, version, release_notes } = req.body;
    
    db.run('INSERT INTO updates (app_name, version, release_notes) VALUES (?, ?, ?)',
           [app_name, version, release_notes], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ success: true, id: this.lastID });
        }
    });
});

// Get updates for auto-updater
app.get('/api/updates/:app_name', (req, res) => {
    const { app_name } = req.params;
    db.get('SELECT * FROM updates WHERE app_name = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1',
           [app_name], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(row || null);
        }
    });
});

// Get all updates (admin)
app.get('/api/admin/updates', verifyAdmin, (req, res) => {
    db.all('SELECT * FROM updates ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// File upload endpoint for updates
app.post('/api/admin/upload-update', verifyAdmin, (req, res) => {
    // This would handle file upload in a real implementation
    res.json({ success: true, message: 'File upload endpoint - implement multer for actual file handling' });
});

// Stripe payment integration
app.post('/api/create-payment-intent', async (req, res) => {
    const { product_id, promo_code } = req.body;
    
    try {
        // Get product price
        const product = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM products WHERE id = ?', [product_id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!product) {
            return res.status(400).json({ error: 'Product not found' });
        }
        
        let finalPrice = product.price;
        let appliedPromo = null;
        
        // Check global promo
        const globalPromo = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM global_promo WHERE is_active = 1 AND expires_at > datetime("now")', [], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (globalPromo) {
            finalPrice = product.price * (1 - globalPromo.discount_percent / 100);
            appliedPromo = { type: 'global', discount: globalPromo.discount_percent };
        }
        
        // Check promo code
        if (promo_code) {
            const promo = await new Promise((resolve, reject) => {
                db.get('SELECT * FROM promos WHERE code = ? AND is_active = 1 AND expires_at > datetime("now")',
                       [promo_code], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            
            if (promo) {
                finalPrice = product.price * (1 - promo.discount_percent / 100);
                appliedPromo = { type: 'code', code: promo.code, discount: promo.discount_percent };
            }
        }
        
        // Create payment intent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(finalPrice * 100),
            currency: 'eur',
            metadata: {
                product_id: product_id,
                product_name: product.name,
                promo_code: promo_code || '',
                original_price: product.price
            }
        });
        
        res.json({
            clientSecret: paymentIntent.client_secret,
            amount: Math.round(finalPrice * 100),
            currency: 'eur',
            appliedPromo
        });
    } catch (error) {
        console.error('Stripe error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Stripe webhook handler
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'
        );
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const { product_id, product_name, promo_code, original_price } = paymentIntent.metadata;
        
        // Save purchase to database
        db.run(`INSERT INTO purchases (product_id, promo_code, final_price, stripe_payment_id, status)
               VALUES (?, ?, ?, ?, 'completed')`,
               [product_id, promo_code, paymentIntent.amount / 100, paymentIntent.id],
               function(err) {
            if (err) {
                console.error('Database error:', err);
            }
        });
        
        console.log('Payment succeeded:', paymentIntent.id);
    }
    
    res.json({ received: true });
});

// Download endpoint (protected)
app.get('/api/download/:product_id', (req, res) => {
    const { product_id } = req.params;
    const { payment_id } = req.query;
    
    // Verify payment before allowing download
    db.get('SELECT * FROM purchases WHERE stripe_payment_id = ? AND status = "completed"',
           [payment_id], (err, purchase) => {
        if (err || !purchase) {
            res.status(403).json({ error: 'Payment not verified' });
            return;
        }
        
        // Get product download URL
        db.get('SELECT * FROM products WHERE id = ?', [product_id], (err, product) => {
            if (err || !product) {
                res.status(404).json({ error: 'Product not found' });
                return;
            }
            
            // Send file (placeholder)
            res.json({ download_url: product.download_url });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
