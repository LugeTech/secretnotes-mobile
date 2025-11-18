import React from 'react';
import Head from 'expo-router/head';

interface SeoHeadProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  keywords?: string;
}

export function SeoHead({ title, description, image, url, keywords }: SeoHeadProps) {
  const siteName = "Secret Notes Mobile";
  const defaultDescription = "Instantly create notes by entering a title. Use short titles for public boards or complex ones for private, encrypted vaults. No signup required.";
  const defaultImage = "/assets/images/icon.png"; // We'll need to ensure this works on web
  
  const fullTitle = `${title} | ${siteName}`;
  const metaDescription = description || defaultDescription;
  const ogImage = image || defaultImage;
  const metaKeywords = keywords || "secure notes, encrypted storage, public board, pastebin, anonymous chat, dead drop, zero knowledge, privacy";

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Secret Notes",
    "applicationCategory": "SecurityApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": metaDescription,
    "image": "https://secretnotes.app/assets/images/icon.png",
    "url": "https://secretnotes.app"
  };

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url || "https://secretnotes.app"} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url || "https://secretnotes.app"} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={metaDescription} />
      <meta property="twitter:image" content={ogImage} />
      
      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Head>
  );
}
