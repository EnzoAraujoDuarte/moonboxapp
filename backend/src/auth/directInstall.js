import 'dotenv/config';
import express from 'express';
import { supabase } from '../db/supabaseClient.js';

const router = express.Router();

// Instalação direta para Custom Apps
router.post('/install', async (req, res) => {
  try {
    const { shop_domain, access_token } = req.body;
    
    if (!shop_domain || !access_token) {
      return res.status(400).json({ error: 'Missing shop_domain or access_token' });
    }

    // Salvar na tabela shops
    const payload = { 
      shop_domain, 
      access_token, 
      is_active: true 
    };
    
    const { error } = await supabase
      .from('shops')
      .upsert(payload, { onConflict: 'shop_domain' });
    
    if (error) throw error;

    return res.json({ 
      ok: true, 
      message: 'App installed successfully',
      redirect_url: process.env.FRONTEND_URL + '/?installed=true'
    });
  } catch (err) {
    console.error('Install error', err);
    return res.status(500).json({ error: 'Installation failed' });
  }
});

// Página de instalação manual
router.get('/install', (req, res) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Moonbox - Instalação Manual</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        button { background: #5cb85c; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        .instructions { background: #f0f8ff; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <h1>Moonbox - Instalação Manual</h1>
    <div class="instructions">
        <h3>Como obter o Access Token:</h3>
        <ol>
            <li>Vá para Admin da sua loja > Apps > Develop apps</li>
            <li>Clique em "Create an app"</li>
            <li>Configure os scopes: read_products, write_products, read_customers</li>
            <li>Instale o app e copie o Access Token</li>
        </ol>
    </div>
    
    <form id="installForm">
        <div class="form-group">
            <label>Shop Domain:</label>
            <input type="text" id="shop_domain" placeholder="sua-loja.myshopify.com" required>
        </div>
        <div class="form-group">
            <label>Access Token:</label>
            <input type="text" id="access_token" placeholder="shpat_..." required>
        </div>
        <button type="submit">Instalar App</button>
    </form>

    <script>
        document.getElementById('installForm').onsubmit = async function(e) {
            e.preventDefault();
            const shop_domain = document.getElementById('shop_domain').value;
            const access_token = document.getElementById('access_token').value;
            
            try {
                const response = await fetch('/install', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ shop_domain, access_token })
                });
                
                const result = await response.json();
                if (result.ok) {
                    alert('App instalado com sucesso!');
                    window.location.href = result.redirect_url;
                } else {
                    alert('Erro: ' + result.error);
                }
            } catch (err) {
                alert('Erro na instalação: ' + err.message);
            }
        };
    </script>
</body>
</html>`;
  res.send(html);
});

export { router };
