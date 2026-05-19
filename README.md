# CODRATEC — Software House

Site institucional da CODRATEC, desenvolvido com Next.js 14, App Router, TypeScript, Tailwind CSS e i18n (português/inglês/espanhol).

## Características

- ✅ Next.js 14 com App Router
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ Design moderno e responsivo
- ✅ Animações com Framer Motion
- ✅ Carrossel com Swiper
- ✅ SEO otimizado (metadata, OG image dinâmica, JSON-LD, sitemap)
- ✅ i18n — português, inglês e espanhol
- ✅ Responsivo e mobile-first
- ✅ Botão flutuante do WhatsApp
- ✅ Acessibilidade (ARIA labels, contraste adequado)

## Instalação

```bash
npm install
npm run dev
npm run build
npm start
```

## Estrutura do Projeto

```
├── app/
│   ├── layout.tsx              # Layout principal com SEO
│   ├── page.tsx                # Página inicial
│   ├── opengraph-image.tsx     # OG image gerada dinamicamente
│   ├── sitemap.ts              # Sitemap automático (/sitemap.xml)
│   ├── globals.css             # Estilos globais
│   ├── about/page.tsx          # Página sobre
│   └── privacy/page.tsx        # Política de privacidade
├── components/                 # Componentes React
├── public/                     # Arquivos estáticos
│   ├── portfolio/              # Imagens do portfólio
│   ├── victor.png
│   ├── beatriz.png
│   └── favicon.ico
```

## Configuração

### WhatsApp

Número configurado: `5521983573881`. Para alterar, edite:
- `components/Hero.tsx`
- `components/Contact.tsx`
- `components/WhatsAppButton.tsx`

### Links Sociais

Edite os links de GitHub e LinkedIn em `components/Footer.tsx`.

### SEO

Configure as informações de SEO em `app/layout.tsx`.

### Imagens do Portfólio

Adicione imagens na pasta `/public/portfolio/`.

## Deploy

Hospedado na Vercel: [codratec.com](https://codratec.com)

## Licença

Todos os direitos reservados © CODRATEC 2025
