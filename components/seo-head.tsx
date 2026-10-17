import Head from 'expo-router/head';
import { usePathname } from 'expo-router';
import React from 'react';

interface SeoHeadProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  keywords?: string;
}

export function SeoHead({ title, description, image, url, keywords }: SeoHeadProps) {
  const siteName = "Secret Notez";
  const pathname = usePathname();
  const defaultDescription =
    "Secret Notez is a zero-signup encrypted notes app for private writing, shared notes, and image attachments across web, iOS, and Android.";
  const defaultImage = "https://secretnotez.com/og-image.webp";
  const canonicalUrl = url || `https://secretnotez.com${pathname || "/"}`;
  const fullTitle = `${title} | ${siteName}`;
  const metaDescription = description || defaultDescription;
  const ogImage = image || defaultImage;
  const metaKeywords =
    keywords ||
    [
      "secret notez",
      "secure notes",
      "encrypted notes",
      "realtime notes",
      "secret notes",
      "private pastebin",
      "anonymous notes",
      "encrypted messaging",
      "dead drop",
      "no signup",
    ].join(", ");

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Secret Notez",
    "applicationCategory": "SecurityApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": metaDescription,
    "image": ogImage,
    "url": canonicalUrl,
    "featureList": [
      "Client-side AES-256-GCM encryption",
      "Encrypted image attachments",
      "Realtime note synchronization",
      "No account required"
    ],
    "publisher": {
      "@type": "Organization",
      "name": "LugeTech",
      "url": "https://www.lugetech.com",
      "logo": "https://secretnotez.com/icon-512.png",
      "sameAs": [
        "https://github.com/LugeTech/secretnotes-mobile",
        "https://github.com/ktappdev/secretnotes-go-backend"
      ]
    }
  };

  return (
    <Head>
      <title>{fullTitle}</title>
      <link rel="canonical" href={canonicalUrl} />
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="alternate" type="text/plain" href="/llms.txt" title="AI-readable site information" />
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      <meta name="author" content="LugeTech" />
      <meta name="application-name" content={siteName} />
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="theme-color" content="#0B1020" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content="Secret Notez encrypted notes logo" />
      <meta property="og:image:type" content="image/webp" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content="Secret Notez encrypted notes logo" />
      
      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Head>
  );
}
