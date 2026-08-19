// Lichte, simpele vertaalwoordenboek — geen zware i18n-library nodig.
// Taal wordt bijgehouden via de querystring (?lang=en) zodat het werkt
// in server components (page.js) én client components (header).
export const dictionaries = {
  nl: {
    nav: {
      reparaties: "Reparaties",
      prijzen: "Prijzen",
      contact: "Contact",
      afspraak: "Maak afspraak",
      alleModellen: "Alle reparaties →",
      bel: "Bel ons",
    },
    hero: {
      badge: "★ 4,9 op basis van klantreviews",
      title1: "Toestel stuk?",
      title2: "Boek in 2 minuten",
      title3: "hersteld.",
      subtitle:
        "Kies je toestel, kies het probleem en boek meteen een tijdslot. Transparante prijzen, meestal klaar binnen het uur.",
      cta1: "Maak een afspraak",
      cta2: "Bekijk prijzen",
    },
    sections: {
      watTitle: "Wat moet er gerepareerd worden?",
      watSub: "Kies je toestel om alle reparaties en prijzen te zien.",
      hoeTitle: "Hoe het werkt",
      prijzenTitle: "Populaire reparaties",
      contactTitle: "Contact",
    },
    footer: {
      tagline: "Snelle, transparante reparaties voor je smartphone, tablet en laptop.",
      diensten: "Reparaties",
      bedrijf: "Bedrijf",
      contact: "Contact",
    },
  },
  en: {
    nav: {
      reparaties: "Repairs",
      prijzen: "Pricing",
      contact: "Contact",
      afspraak: "Book appointment",
      alleModellen: "All repairs →",
      bel: "Call us",
    },
    hero: {
      badge: "★ 4.9 based on customer reviews",
      title1: "Device broken?",
      title2: "Book in 2 minutes,",
      title3: "fixed fast.",
      subtitle:
        "Pick your device, pick the issue, and book a time slot instantly. Transparent pricing, usually ready within the hour.",
      cta1: "Book an appointment",
      cta2: "View pricing",
    },
    sections: {
      watTitle: "What needs fixing?",
      watSub: "Pick your device to see all repairs and prices.",
      hoeTitle: "How it works",
      prijzenTitle: "Popular repairs",
      contactTitle: "Contact",
    },
    footer: {
      tagline: "Fast, transparent repairs for your smartphone, tablet and laptop.",
      diensten: "Repairs",
      bedrijf: "Company",
      contact: "Contact",
    },
  },
};

export function getLang(searchParams) {
  const l = searchParams?.lang;
  return l === "en" ? "en" : "nl";
}

export function getDict(lang) {
  return dictionaries[lang] || dictionaries.nl;
}
