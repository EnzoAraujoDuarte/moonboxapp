# MoonBox Wishlist - App Block

Este App Block permite que os comerciantes adicionem facilmente botões de wishlist em qualquer lugar do tema da loja Shopify.

## 📦 Instalação do App Block

### 1. Upload do Arquivo
1. Acesse o admin da loja Shopify
2. Vá para **Online Store > Themes**
3. Clique em **Actions > Edit code** no tema ativo
4. Na pasta **blocks**, clique em **Add a new template**
5. Selecione **liquid** e nomeie como `moonbox-wishlist`
6. Cole o conteúdo do arquivo `moonbox-wishlist.liquid`
7. Salve o arquivo

### 2. Configuração no Editor de Temas
1. Vá para **Online Store > Themes**
2. Clique em **Customize** no tema ativo
3. Navegue até uma página de produto
4. Clique em **Add block** ou **Add section**
5. Procure por **"MoonBox Wishlist"** na lista de blocos disponíveis
6. Adicione o bloco onde desejar (produto, coleção, etc.)

## ⚙️ Configurações Disponíveis

### Aparência do Botão
- **Texto do Botão**: Texto exibido no botão (padrão: "Adicionar à Lista")
- **Texto quando Adicionado**: Texto quando item está na wishlist (padrão: "Na Lista ❤️")
- **Cor de Fundo**: Cor de fundo do botão
- **Cor do Texto**: Cor do texto do botão
- **Cor de Fundo (Adicionado)**: Cor quando item está na wishlist
- **Raio da Borda**: Arredondamento das bordas (0-20px)
- **Tamanho da Fonte**: Tamanho do texto (10-24px)
- **Peso da Fonte**: Normal, Médio, Semi-Bold, Bold
- **Largura Mínima**: Largura mínima do botão (80-200px)

### Configurações Mobile
- **Tamanho da Fonte Mobile**: Tamanho do texto em dispositivos móveis
- **Largura Mínima Mobile**: Largura mínima em dispositivos móveis

### Notificações
- **Mostrar Notificações**: Ativar/desativar notificações toast
- **Mensagem de Adicionado**: Texto da notificação ao adicionar
- **Mensagem de Removido**: Texto da notificação ao remover
- **Mensagem de Erro**: Texto da notificação de erro

### Configurações Técnicas
- **URL do Backend**: URL do servidor backend (deixe em branco para desenvolvimento local)

## 🎨 Personalização Avançada

### CSS Customizado
Você pode adicionar CSS personalizado no arquivo `theme.liquid` ou em um arquivo CSS separado:

```css
/* Personalizar o botão de wishlist */
.moonbox-wishlist-btn {
  /* Seus estilos personalizados aqui */
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-transform: uppercase;
}

/* Estilo para estado hover personalizado */
.moonbox-wishlist-btn:hover {
  transform: scale(1.05);
}

/* Estilo para quando item está na wishlist */
.moonbox-wishlist-btn.added {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
```

### JavaScript Customizado
Para funcionalidades avançadas, você pode escutar eventos personalizados:

```javascript
// Escutar quando item é adicionado à wishlist
document.addEventListener('moonbox:item-added', function(e) {
  console.log('Item adicionado:', e.detail);
  // Sua lógica personalizada aqui
});

// Escutar quando item é removido da wishlist
document.addEventListener('moonbox:item-removed', function(e) {
  console.log('Item removido:', e.detail);
  // Sua lógica personalizada aqui
});
```

## 🔧 Desenvolvimento e Testes

### Modo de Desenvolvimento
- O App Block funciona automaticamente com o backend local (`localhost:8081`)
- Use o modo dev sem Supabase para testes rápidos
- Os dados ficam armazenados em memória durante o desenvolvimento

### Variáveis Liquid Disponíveis
O App Block tem acesso às seguintes variáveis do Shopify:
- `{{ product.id }}` - ID do produto
- `{{ product.title }}` - Título do produto
- `{{ product.price }}` - Preço do produto
- `{{ product.featured_image }}` - Imagem principal
- `{{ shop.permanent_domain }}` - Domínio da loja

## 📱 Compatibilidade

### Temas Suportados
- ✅ Dawn (tema padrão do Shopify)
- ✅ Debut
- ✅ Brooklyn
- ✅ Narrative
- ✅ Supply
- ✅ Venture
- ✅ Boundless
- ✅ Minimal
- ✅ Temas customizados (com pequenos ajustes)

### Navegadores Suportados
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile Safari
- ✅ Chrome Mobile

## 🚀 Deploy em Produção

### 1. Configurar Backend URL
1. No editor de temas, selecione o bloco MoonBox Wishlist
2. Em "Configurações Técnicas", defina a **URL do Backend**
3. Use sua URL de produção (ex: `https://sua-api.vercel.app`)

### 2. Testar Funcionalidade
1. Adicione alguns produtos à wishlist
2. Verifique se as notificações aparecem
3. Teste em diferentes dispositivos
4. Confirme que os dados persistem entre sessões

## 🐛 Solução de Problemas

### Botão não aparece
- Verifique se o arquivo foi salvo corretamente na pasta `blocks`
- Confirme que o bloco foi adicionado no editor de temas
- Verifique se há erros no console do navegador

### Erro de CORS
- Configure o backend para aceitar requisições do domínio da loja
- Verifique se a URL do backend está correta nas configurações

### Dados não persistem
- Verifique se o backend está rodando
- Confirme se o Supabase está configurado corretamente
- Teste com o modo dev primeiro

### Estilo não aplicado
- Verifique se não há conflitos com CSS do tema
- Use `!important` se necessário para sobrescrever estilos
- Teste em diferentes temas

## 📞 Suporte

Para suporte técnico ou dúvidas sobre implementação:
1. Verifique os logs do console do navegador
2. Teste primeiro em modo de desenvolvimento
3. Confirme se todas as configurações estão corretas
4. Documente o erro com screenshots se necessário