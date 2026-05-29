export const SHOP = {
  name: "Nonato Barbearia",
  phone: "(31) 99702-6367",
  phoneDigits: "5531997026367",
  whatsappUrl: "https://wa.me/5531997026367",
  instagramUrl: "https://www.instagram.com/nonatobarbeariaoficial",
  instagramHandle: "@nonatobarbeariaoficial",
  mapsEmbed:
    "https://www.google.com/maps?q=Nonato+Barbearia&output=embed",
  mapsDirectionsUrl: "https://maps.app.goo.gl/BzZPtVfDypB34vJL8",
  mapsViewUrl: "https://maps.app.goo.gl/BzZPtVfDypB34vJL8",
  address: "Belo Horizonte, MG",
};

export const WEEKDAYS_PT = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export const formatPrice = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export const formatDuration = (min: number) =>
  min >= 60
    ? `${Math.floor(min / 60)}h${min % 60 ? ` ${min % 60}min` : ""}`
    : `${min} min`;
