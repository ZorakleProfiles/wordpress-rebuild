// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";


import icon from "astro-icon";
// https://astro.build/config

export default defineConfig({
    site: "https://zorakleprofiles.github.io",
    base: "/wordpress-rebuild/",
    vite: {
        plugins: [tailwindcss()],
    },

    integrations: [icon()],
    fonts: [{
        provider: fontProviders.local(),
        name: "Monterey",
        cssVariable: "--font-monterey",
        options: {
            variants: [{
                src: ['./src/assets/fonts/montereyflf-webfont.woff2'],
                weight: 'normal',
                style: 'normal'
            }]
        }
    }]
});
