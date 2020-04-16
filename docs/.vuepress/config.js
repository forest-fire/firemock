module.exports = {
  plugins: {
    "@vuepress/pwa": {
      serviceWorker: true,
      updatePopup: {
        message: "New AbstractedAdmin content is available",
        buttonText: "Refresh"
      }
    },
    "@vuepress/back-to-top": true,
    "@vuepress/last-updated": true,
    "@vuepress/medium-zoom": true,
    autometa: {
      site: {
        name: "Firemock"
      },
      canonical_base: "https://abstracted-admin.com",
      author: {
        name: "Ken Snyder",
        twitter: "yankeeinlondon"
      }
    }
  },
  title: "Firemock",
  description:
    "A simple wrapper for Firebase SDK's (with a view toward mocking)",
  head: [
    ["meta", { name: "apple-mobile-web-app-capable", content: "yes" }],
    ["meta", { name: "application-name", content: "FireModel" }],
    [
      "link",
      {
        rel: "favicon",
        href: "/icon/icon-16.png",
        type: "image/png",
        sizes: "16x16"
      }
    ],
    [
      "link",
      {
        rel: "favicon",
        href: "/icon/icon-32.png",
        type: "image/png",
        sizes: "32x32"
      }
    ],
    [
      "link",
      {
        rel: "favicon",
        href: "/icon/icon-48.png",
        type: "image/png",
        sizes: "48x48"
      }
    ],
    [
      "link",
      { rel: "icon", href: "/icon/icon-rounded-32.png", sizes: "32x32" }
    ],
    [
      "link",
      { rel: "icon", href: "/icon/icon-rounded-48.png", sizes: "48x48" }
    ],
    [
      "link",
      { rel: "icon", href: "/icon/icon-rounded-192.png", sizes: "192x192" }
    ],
    [
      "link",
      { rel: "icon", href: "/icon/icon-rounded-225.png", sizes: "225x225" }
    ],
    [
      "link",
      { rel: "icon", href: "/icon/icon-rounded-512.png", sizes: "512x512" }
    ],
    ["link", { rel: "manifest", href: "manifest.json" }],
    [
      "link",
      {
        rel: "apple-touch-icon-precomposed",
        href: "/icon/icon-rounded-192.png",
        sizes: "192x192"
      }
    ],
    [
      "link",
      {
        rel: "apple-touch-startup-image",
        href: "icons/apple_splash_2048.png",
        sizes: "2048x2732"
      }
    ],
    [
      "link",
      {
        rel: "apple-touch-startup-image",
        href: "icons/apple_splash_1668.png",
        sizes: "1668x2224"
      }
    ],
    [
      "link",
      {
        rel: "apple-touch-startup-image",
        href: "icons/apple_splash_1536.png",
        sizes: "1536x2048"
      }
    ],
    [
      "link",
      {
        rel: "apple-touch-startup-image",
        href: "icons/apple_splash_1125.png",
        sizes: "1125x2436"
      }
    ],
    [
      "link",
      {
        rel: "apple-touch-startup-image",
        href: "icons/apple_splash_1242.png",
        sizes: "1242x2208"
      }
    ],
    [
      "link",
      {
        rel: "apple-touch-startup-image",
        href: "icons/apple_splash_750.png",
        sizes: "750x1334"
      }
    ],
    [
      "link",
      {
        rel: "apple-touch-startup-image",
        href: "icons/apple_splash_640.png",
        sizes: "640x1136"
      }
    ],

    [
      "link",
      { rel: "apple-touch-icon", href: "touch-icon-iphone", sizes: "120x120" }
    ],
    [
      "link",
      { rel: "apple-touch-icon", sizes: "152x152", href: "touch-icon-ipad" }
    ],
    [
      "link",
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "touch-icon-iphone-retina"
      }
    ],
    [
      "link",
      {
        rel: "apple-touch-icon",
        sizes: "167x167",
        href: "touch-icon-ipad-retina"
      }
    ]
  ],
  themeConfig: {
    repo: "forest-fire/abstracted-admin",
    docsDir: "docs",
    nav: [
      {
        text: "RTDB",
        link: "/firebase/"
      },
      {
        text: "Auth",
        link: "/auth/"
      },
      {
        text: "Mocking",
        link: "/deployment/"
      },
      {
        text: "Other",
        link: "/other/"
      },
      {
        text: "Related",
        link: "/related/"
      }
    ],
    sidebar: "auto"
  }
};
