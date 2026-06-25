import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const sourceUrl =
  "https://ru.wikipedia.org/w/api.php?action=parse&page=%D0%A1%D0%BF%D0%B8%D1%81%D0%BE%D0%BA_%D0%B3%D0%BE%D1%80%D0%BE%D0%B4%D0%BE%D0%B2_%D0%A0%D0%BE%D1%81%D1%81%D0%B8%D0%B8&prop=text&format=json&origin=*";

const overrides = {
  "Москва|Москва": { slug: "moscow", prepositional: "Москве", genitive: "Москвы" },
  "Санкт-Петербург|Санкт-Петербург": {
    slug: "saint-petersburg",
    prepositional: "Санкт-Петербурге",
    genitive: "Санкт-Петербурга",
  },
  "Новосибирск|Новосибирская область": { slug: "novosibirsk", prepositional: "Новосибирске", genitive: "Новосибирска" },
  "Екатеринбург|Свердловская область": { slug: "yekaterinburg", prepositional: "Екатеринбурге", genitive: "Екатеринбурга" },
  "Казань|Татарстан": { slug: "kazan", prepositional: "Казани", genitive: "Казани" },
  "Красноярск|Красноярский край": { slug: "krasnoyarsk", prepositional: "Красноярске", genitive: "Красноярска" },
  "Нижний Новгород|Нижегородская область": {
    slug: "nizhny-novgorod",
    prepositional: "Нижнем Новгороде",
    genitive: "Нижнего Новгорода",
  },
  "Челябинск|Челябинская область": { slug: "chelyabinsk", prepositional: "Челябинске", genitive: "Челябинска" },
  "Уфа|Башкортостан": { slug: "ufa", prepositional: "Уфе", genitive: "Уфы" },
  "Краснодар|Краснодарский край": { slug: "krasnodar", prepositional: "Краснодаре", genitive: "Краснодара" },
  "Самара|Самарская область": { slug: "samara", prepositional: "Самаре", genitive: "Самары" },
  "Ростов-на-Дону|Ростовская область": { slug: "rostov-on-don", prepositional: "Ростове-на-Дону", genitive: "Ростова-на-Дону" },
  "Омск|Омская область": { slug: "omsk", prepositional: "Омске", genitive: "Омска" },
  "Воронеж|Воронежская область": { slug: "voronezh", prepositional: "Воронеже", genitive: "Воронежа" },
  "Пермь|Пермский край": { slug: "perm", prepositional: "Перми", genitive: "Перми" },
  "Волгоград|Волгоградская область": { slug: "volgograd", prepositional: "Волгограде", genitive: "Волгограда" },
  "Саратов|Саратовская область": { slug: "saratov", prepositional: "Саратове", genitive: "Саратова" },
  "Тюмень|Тюменская область": { slug: "tyumen", prepositional: "Тюмени", genitive: "Тюмени" },
  "Тольятти|Самарская область": { slug: "tolyatti", prepositional: "Тольятти", genitive: "Тольятти" },
  "Махачкала|Дагестан": { slug: "makhachkala", prepositional: "Махачкале", genitive: "Махачкалы" },
  "Барнаул|Алтайский край": { slug: "barnaul", prepositional: "Барнауле", genitive: "Барнаула" },
  "Ижевск|Удмуртия": { slug: "izhevsk", prepositional: "Ижевске", genitive: "Ижевска" },
  "Хабаровск|Хабаровский край": { slug: "khabarovsk", prepositional: "Хабаровске", genitive: "Хабаровска" },
  "Ульяновск|Ульяновская область": { slug: "ulyanovsk", prepositional: "Ульяновске", genitive: "Ульяновска" },
  "Иркутск|Иркутская область": { slug: "irkutsk", prepositional: "Иркутске", genitive: "Иркутска" },
  "Владивосток|Приморский край": { slug: "vladivostok", prepositional: "Владивостоке", genitive: "Владивостока" },
  "Ярославль|Ярославская область": { slug: "yaroslavl", prepositional: "Ярославле", genitive: "Ярославля" },
  "Ставрополь|Ставропольский край": { slug: "stavropol", prepositional: "Ставрополе", genitive: "Ставрополя" },
  "Севастополь|Севастополь": { slug: "sevastopol", prepositional: "Севастополе", genitive: "Севастополя" },
  "Набережные Челны|Татарстан": {
    slug: "naberezhnye-chelny",
    prepositional: "Набережных Челнах",
    genitive: "Набережных Челнов",
  },
};

const translitMap = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "kh",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ы: "y",
  э: "e",
  ю: "yu",
  я: "ya",
  ъ: "",
  ь: "",
};

function translit(value) {
  return value
    .toLowerCase()
    .split("")
    .map((char) => translitMap[char] ?? char)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function decode(text) {
  return text
    .replace(/&#(x?[0-9a-fA-F]+);/g, (_, raw) =>
      String.fromCharCode(parseInt(raw.replace(/^x/i, ""), raw.startsWith("x") || raw.startsWith("X") ? 16 : 10)),
    )
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—");
}

function strip(html) {
  return decode(
    html
      .replace(/<sup[\s\S]*?<\/sup>/g, "")
      .replace(/<style[\s\S]*?<\/style>/g, "")
      .replace(/<script[\s\S]*?<\/script>/g, "")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\[[^\]]*]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseRows(table) {
  return [...table.matchAll(/<tr[\s\S]*?<\/tr>/g)]
    .slice(1)
    .map((row) => [...row[0].matchAll(/<t[dh][^>]*>[\s\S]*?<\/t[dh]>/g)].map((cell) => strip(cell[0])))
    .filter((cells) => /^\d+$/.test(cells[0] ?? ""))
    .map((cells) => ({ name: cells[2], region: cells[3] }))
    .filter((city) => city.name && city.region);
}

function uniqueSlug(baseSlug, region, used) {
  let slug = baseSlug || translit(region);
  if (!used.has(slug)) {
    used.add(slug);
    return slug;
  }

  const regionSlug = translit(region);
  slug = `${baseSlug}-${regionSlug}`;
  if (!used.has(slug)) {
    used.add(slug);
    return slug;
  }

  let counter = 2;
  while (used.has(`${slug}-${counter}`)) {
    counter += 1;
  }
  slug = `${slug}-${counter}`;
  used.add(slug);
  return slug;
}

const response = await fetch(sourceUrl, { headers: { "User-Agent": "Codex city data generation" } });
if (!response.ok) {
  throw new Error(`Failed to fetch city source: ${response.status} ${response.statusText}`);
}

const payload = await response.json();
const html = payload.parse.text["*"];
const tables = [...html.matchAll(/<table[\s\S]*?<\/table>/g)].map((match) => match[0]);
const rows = [...parseRows(tables[0]), ...parseRows(tables[1])];
const usedSlugs = new Set();

const cities = rows.map((city) => {
  const key = `${city.name}|${city.region}`;
  const override = overrides[key];
  const baseSlug = override?.slug ?? translit(city.name);

  return {
    slug: uniqueSlug(baseSlug, city.region, usedSlugs),
    name: city.name,
    prepositional: override?.prepositional ?? `городе ${city.name}`,
    genitive: override?.genitive ?? `города ${city.name}`,
    region: city.region,
  };
});

const content = `export type City = {
  slug: string;
  name: string;
  prepositional: string;
  genitive: string;
  region: string;
};

export const CITIES: City[] = ${JSON.stringify(cities, null, 2)};

export function getCity(slug: string) {
  return CITIES.find((city) => city.slug === slug);
}

export function cityPath(city: City, path = "") {
  const normalizedPath = path.startsWith("/") ? path : \`/\${path}\`;
  return normalizedPath === "/" ? \`/\${city.slug}\` : \`/\${city.slug}\${normalizedPath}\`;
}
`;

await writeFile(resolve("src/data/cities.ts"), content, "utf8");
console.log(`Generated src/data/cities.ts with ${cities.length} cities.`);
