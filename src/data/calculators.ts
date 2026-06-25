import type { Service } from "@/data/services";

export type ChipsField = {
  type: "chips";
  id: string;
  label: string;
  cols?: number;
  options: { id: string; label: string; desc?: string; color?: string }[];
};

export type SliderField = {
  type: "slider";
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  suffix: string;
  defaultValue?: number;
};

export type Field = ChipsField | SliderField;
export type CalcState = Record<string, string | number>;
export type CalcResult = { price: number; primary: string; fileFactor?: number };

export type PricingEntry = { id: string; label: string; suffix?: string };
export type PricingGroup = { id: string; title: string; entries: PricingEntry[]; linkedField?: string; valueSuffix?: string };
export type PricingSchema = PricingGroup[];
export type Pricing = Record<string, Record<string, number>>;

export type ServiceCalculatorConfig = {
  title: string;
  tagline: string;
  accept: string;
  showFile: boolean;
  fields: Field[];
  pricing: Pricing;
  pricingSchema: PricingSchema;
  compute: (state: CalcState, file: File | null, p: Pricing) => CalcResult;
  cta?: string;
};

function fileFactorOf(file: File | null) {
  if (!file) return 1;
  const kb = file.size / 1024;
  return Math.max(0.85, Math.min(2.2, 0.6 + Math.log10(Math.max(10, kb)) * 0.35));
}
function rub(n: number) { return Math.max(0, Math.round(n)); }
const num = (v: number | undefined, fb: number) => (typeof v === "number" && !isNaN(v) ? v : fb);

/* ----------------------------- 3D-печать ---------------------------------- */
const PRINT_CALC: ServiceCalculatorConfig = {
  title: "Калькулятор 3D-печати",
  tagline: "Загрузите модель — оценим объём, время и стоимость.",
  accept: ".stl,.obj,.3mf,.step,.stp,image/*",
  showFile: true,
  fields: [
    { type: "chips", id: "printType", label: "Тип печати", cols: 3, options: [
      { id: "FDM", label: "FDM", desc: "Пластиковая печать" },
      { id: "SLA", label: "SLA / Resin", desc: "Фотополимер, 25 мкм" },
      { id: "Carbon", label: "Carbon", desc: "Композит с углеволокном" },
    ]},
    { type: "chips", id: "material", label: "Материал", cols: 3, options: [
      { id: "PLA", label: "PLA", color: "#e7e7e7" },
      { id: "PETG", label: "PETG", color: "#9ad7c7" },
      { id: "ABS", label: "ABS", color: "#cfcfcf" },
      { id: "Resin", label: "Resin", color: "#f3e9d2" },
      { id: "Nylon", label: "Nylon", color: "#b8b8b8" },
      { id: "Carbon", label: "Carbon", color: "#2a2a2a" },
    ]},
    { type: "chips", id: "quality", label: "Качество", cols: 4, options: [
      { id: "Draft", label: "Черновое", desc: "0.3 мм" },
      { id: "Standard", label: "Стандарт", desc: "0.2 мм" },
      { id: "High", label: "Высокое", desc: "0.1 мм" },
      { id: "Ultra", label: "Ультра", desc: "0.05 мм" },
    ]},
    { type: "slider", id: "size", label: "Размер", min: 20, max: 250, step: 5, suffix: " мм", defaultValue: 80 },
    { type: "slider", id: "infill", label: "Заполнение", min: 5, max: 100, step: 5, suffix: " %", defaultValue: 20 },
    { type: "slider", id: "qty", label: "Количество", min: 1, max: 50, step: 1, suffix: " шт", defaultValue: 1 },
  ],
  pricing: {
    materials: { PLA: 12, PETG: 16, ABS: 18, Resin: 38, Nylon: 42, Carbon: 72 },
    printTypes: { FDM: 1.0, SLA: 1.8, Carbon: 2.6 },
    quality: { Draft: 0.7, Standard: 1.0, High: 1.45, Ultra: 2.0 },
    base: { setup: 350, min: 450, workMult: 0.6, slaHoursMult: 1.4 },
  },
  pricingSchema: [
    { id: "materials", title: "Материалы (₽ за грамм)", linkedField: "material", valueSuffix: "₽/г", entries: [
      { id: "PLA", label: "PLA", suffix: "₽/г" },
      { id: "PETG", label: "PETG", suffix: "₽/г" },
      { id: "ABS", label: "ABS", suffix: "₽/г" },
      { id: "Resin", label: "Resin", suffix: "₽/г" },
      { id: "Nylon", label: "Nylon", suffix: "₽/г" },
      { id: "Carbon", label: "Carbon", suffix: "₽/г" },
    ]},
    { id: "printTypes", title: "Множители тип печати", linkedField: "printType", valueSuffix: "×", entries: [
      { id: "FDM", label: "FDM", suffix: "×" },
      { id: "SLA", label: "SLA / Resin", suffix: "×" },
      { id: "Carbon", label: "Carbon", suffix: "×" },
    ]},
    { id: "quality", title: "Множители качество", linkedField: "quality", valueSuffix: "×", entries: [
      { id: "Draft", label: "Черновое", suffix: "×" },
      { id: "Standard", label: "Стандарт", suffix: "×" },
      { id: "High", label: "Высокое", suffix: "×" },
      { id: "Ultra", label: "Ультра", suffix: "×" },
    ]},
    { id: "base", title: "Базовые параметры", entries: [
      { id: "setup", label: "Подготовка / сетап", suffix: "₽" },
      { id: "min", label: "Минимальный заказ", suffix: "₽" },
      { id: "workMult", label: "Доля стоимости работы", suffix: "×" },
      { id: "slaHoursMult", label: "Множитель часов для SLA", suffix: "×" },
    ]},
  ],
  compute: (s, file, p) => {
    const size = Number(s.size ?? 80);
    const infill = Number(s.infill ?? 20);
    const qty = Number(s.qty ?? 1);
    const sizeCm = size / 10;
    const volume = Math.pow(sizeCm, 3) * 0.35;
    const ff = fileFactorOf(file);
    const wGrams = volume * 1.2 * (0.25 + (infill / 100) * 0.75) * ff;
    const matPrice = num(p.materials?.[String(s.material ?? "PLA")], 12);
    const pt = num(p.printTypes?.[String(s.printType ?? "FDM")], 1);
    const q = num(p.quality?.[String(s.quality ?? "Standard")], 1);
    const setup = num(p.base?.setup, 350);
    const min = num(p.base?.min, 450);
    const workMult = num(p.base?.workMult, 0.6);
    const slaH = num(p.base?.slaHoursMult, 1.4);
    const base = wGrams * matPrice;
    const work = base * pt * q * workMult;
    const total = Math.max(min, rub((base + work + setup) * qty));
    const hours = (wGrams / 18) * q * (String(s.printType) === "SLA" ? slaH : 1);
    return { price: total, primary: `≈ ${(wGrams * qty).toFixed(0)} г · ${(hours * qty).toFixed(1)} ч печати · ${qty} шт`, fileFactor: ff };
  },
};

/* --------------------------- Лазерная резка CO₂ --------------------------- */
const LASER_THICKNESSES = ["1 мм","2 мм","3 мм","4 мм","5 мм","6 мм","8 мм","10 мм"];
const LASER_CALC: ServiceCalculatorConfig = {
  title: "Калькулятор лазерной резки",
  tagline: "Прикиньте стоимость по материалу, толщине и метражу.",
  accept: ".dxf,.dwg,.svg,.ai,.pdf,image/*",
  showFile: true,
  fields: [
    { type: "chips", id: "material", label: "Материал", cols: 3, options: [
      { id: "acryl", label: "Акрил" },
      { id: "ply", label: "Фанера / МДФ" },
      { id: "plastic", label: "АБС / поликарбонат" },
      { id: "eva", label: "EVA / поролон" },
      { id: "paper", label: "Бумага / картон" },
    ]},
    { type: "chips", id: "thickness", label: "Толщина", cols: 4,
      options: LASER_THICKNESSES.map((t) => ({ id: t, label: t })) },
    { type: "slider", id: "meters", label: "Длина реза", min: 1, max: 3000, step: 1, suffix: " м.п.", defaultValue: 50 },
    { type: "slider", id: "engrave", label: "Гравировка", min: 0, max: 1000, step: 10, suffix: " см²", defaultValue: 0 },
    { type: "slider", id: "qty", label: "Тираж", min: 1, max: 200, step: 1, suffix: " шт", defaultValue: 1 },
  ],
  pricing: {
    acryl: { "1 мм": 10, "2 мм": 11, "3 мм": 14, "4 мм": 21, "5 мм": 28, "6 мм": 33, "8 мм": 46, "10 мм": 91 },
    ply: { "3 мм": 11, "4 мм": 12, "6 мм": 24, "8 мм": 34, "9 мм": 38, "10 мм": 42 },
    plastic: { "0.5 мм": 10, "1 мм": 11, "1.5 мм": 14, "2 мм": 21, "3 мм": 28, "4 мм": 33, "5 мм": 46, "6 мм": 91 },
    eva: { "до 10 мм": 10, "до 20 мм": 20, "до 30 мм": 50 },
    paper: { "до 200 г/м²": 18, "гофро до 10 мм": 23 },
    base: { setup: 300, min: 300, engravePerCm2: 2.5 },
    discount: { t100: 0.9, t500: 0.82, t1500: 0.7 },
  },
  pricingSchema: [
    { id: "acryl", title: "Акрил (₽/м.п. по толщине)", valueSuffix: "₽/м.п.", entries: [
      { id: "1 мм", label: "1 мм" }, { id: "2 мм", label: "2 мм" }, { id: "3 мм", label: "3 мм" },
      { id: "4 мм", label: "4 мм" }, { id: "5 мм", label: "5 мм" }, { id: "6 мм", label: "6 мм" },
      { id: "8 мм", label: "8 мм" }, { id: "10 мм", label: "10 мм" },
    ]},
    { id: "ply", title: "Фанера / МДФ (₽/м.п.)", valueSuffix: "₽/м.п.", entries: [
      { id: "3 мм", label: "3 мм" }, { id: "4 мм", label: "4 мм" }, { id: "6 мм", label: "6 мм" },
      { id: "8 мм", label: "8 мм" }, { id: "9 мм", label: "9 мм" }, { id: "10 мм", label: "10 мм" },
    ]},
    { id: "plastic", title: "АБС / поликарбонат (₽/м.п.)", valueSuffix: "₽/м.п.", entries: [
      { id: "0.5 мм", label: "0.5 мм" }, { id: "1 мм", label: "1 мм" }, { id: "1.5 мм", label: "1.5 мм" },
      { id: "2 мм", label: "2 мм" }, { id: "3 мм", label: "3 мм" }, { id: "4 мм", label: "4 мм" },
      { id: "5 мм", label: "5 мм" }, { id: "6 мм", label: "6 мм" },
    ]},
    { id: "eva", title: "EVA / поролон (₽/м.п.)", valueSuffix: "₽/м.п.", entries: [
      { id: "до 10 мм", label: "до 10 мм" }, { id: "до 20 мм", label: "до 20 мм" }, { id: "до 30 мм", label: "до 30 мм" },
    ]},
    { id: "paper", title: "Бумага / картон (₽/м.п.)", valueSuffix: "₽/м.п.", entries: [
      { id: "до 200 г/м²", label: "до 200 г/м²" }, { id: "гофро до 10 мм", label: "гофро до 10 мм" },
    ]},
    { id: "base", title: "Базовые параметры", entries: [
      { id: "setup", label: "Подготовка", suffix: "₽" },
      { id: "min", label: "Мин. заказ", suffix: "₽" },
      { id: "engravePerCm2", label: "Гравировка", suffix: "₽/см²" },
    ]},
    { id: "discount", title: "Скидки от объёма (множители)", valueSuffix: "×", entries: [
      { id: "t100", label: ">100 м.п.", suffix: "×" },
      { id: "t500", label: ">500 м.п.", suffix: "×" },
      { id: "t1500", label: ">1500 м.п.", suffix: "×" },
    ]},
  ],
  compute: (s, file, p) => {
    const matId = String(s.material ?? "acryl");
    const tId = String(s.thickness ?? "");
    const matPrices = (p[matId] ?? {}) as Record<string, number>;
    const price = num(matPrices[tId], Object.values(matPrices)[0] ?? 10);
    const meters = Number(s.meters ?? 50);
    const qty = Number(s.qty ?? 1);
    const engrave = Number(s.engrave ?? 0);
    const ff = fileFactorOf(file);
    const totalMeters = meters * qty;
    const d = p.discount ?? {};
    const disc = totalMeters > 1500 ? num(d.t1500, 0.7) : totalMeters > 500 ? num(d.t500, 0.82) : totalMeters > 100 ? num(d.t100, 0.9) : 1;
    const cutCost = totalMeters * price * disc * ff;
    const engraveCost = engrave * qty * num(p.base?.engravePerCm2, 2.5);
    const setup = num(p.base?.setup, 300);
    const min = num(p.base?.min, 300);
    const total = Math.max(min, rub(cutCost + engraveCost + setup));
    return { price: total, primary: `${totalMeters.toFixed(0)} м.п. · скидка ×${disc.toFixed(2)} · ${qty} шт`, fileFactor: ff };
  },
};

/* ----------------------------- 3D-сканирование --------------------------- */
const SCAN_CALC: ServiceCalculatorConfig = {
  title: "Калькулятор 3D-сканирования",
  tagline: "Оценка по размеру объекта, технологии и пост-обработке.",
  accept: "image/*,.pdf",
  showFile: true,
  fields: [
    { type: "chips", id: "size", label: "Размер объекта", cols: 3, options: [
      { id: "small", label: "Мелкий", desc: "до 30 см" },
      { id: "medium", label: "Средний", desc: "до 1 м" },
      { id: "large", label: "Крупный", desc: "более 1 м" },
    ]},
    { type: "chips", id: "tech", label: "Технология", cols: 2, options: [
      { id: "laser", label: "Лазерное", desc: "до 0.01 мм" },
      { id: "struct", label: "Структ. свет", desc: "0.02–0.1 мм" },
      { id: "photo", label: "Фотограмметрия", desc: "0.1–0.5 мм" },
      { id: "manual", label: "Ручные сканеры", desc: "0.05–0.3 мм" },
    ]},
    { type: "chips", id: "post", label: "Пост-обработка", cols: 3, options: [
      { id: "raw", label: "Сырой скан" },
      { id: "clean", label: "Очистка / mesh" },
      { id: "print", label: "Под 3D-печать" },
    ]},
    { type: "slider", id: "qty", label: "Количество", min: 1, max: 30, step: 1, suffix: " шт", defaultValue: 1 },
  ],
  pricing: {
    size: { small: 2000, medium: 5000, large: 15000 },
    tech: { laser: 1.5, struct: 1.25, photo: 1, manual: 1.1 },
    post: { raw: 0, clean: 1000, print: 2000 },
    base: { min: 2000 },
  },
  pricingSchema: [
    { id: "size", title: "Базовая цена по размеру", linkedField: "size", valueSuffix: "₽", entries: [
      { id: "small", label: "Мелкий", suffix: "₽" },
      { id: "medium", label: "Средний", suffix: "₽" },
      { id: "large", label: "Крупный", suffix: "₽" },
    ]},
    { id: "tech", title: "Множители по технологии", linkedField: "tech", valueSuffix: "×", entries: [
      { id: "laser", label: "Лазерное", suffix: "×" },
      { id: "struct", label: "Структ. свет", suffix: "×" },
      { id: "photo", label: "Фотограмметрия", suffix: "×" },
      { id: "manual", label: "Ручные сканеры", suffix: "×" },
    ]},
    { id: "post", title: "Доплата за пост-обработку", linkedField: "post", valueSuffix: "₽", entries: [
      { id: "raw", label: "Сырой скан", suffix: "₽" },
      { id: "clean", label: "Очистка / mesh", suffix: "₽" },
      { id: "print", label: "Под 3D-печать", suffix: "₽" },
    ]},
    { id: "base", title: "Базовые параметры", entries: [
      { id: "min", label: "Мин. заказ", suffix: "₽" },
    ]},
  ],
  compute: (s, file, p) => {
    const base = num(p.size?.[String(s.size ?? "small")], 2000);
    const tech = num(p.tech?.[String(s.tech ?? "photo")], 1);
    const post = num(p.post?.[String(s.post ?? "raw")], 0);
    const qty = Number(s.qty ?? 1);
    const ff = fileFactorOf(file);
    const min = num(p.base?.min, 2000);
    const total = Math.max(min, rub((base * tech + post) * qty * (file ? ff * 0.5 + 0.5 : 1)));
    return { price: total, primary: `${qty} объект(а/ов) · технология ×${tech.toFixed(2)}`, fileFactor: ff };
  },
};

/* --------------------------- 3D-моделирование ---------------------------- */
const MODEL_DAYS: Record<string, string> = { cad: "1–3 дня", industrial: "2–5 дней", arch: "3–7 дней", organic: "5–10 дней", reverse: "3–5 дней" };
const MODEL_CALC: ServiceCalculatorConfig = {
  title: "Калькулятор 3D-моделирования",
  tagline: "Оценка по направлению, сложности и срокам.",
  accept: "image/*,.pdf,.dwg,.dxf,.step,.stp",
  showFile: true,
  fields: [
    { type: "chips", id: "type", label: "Направление", cols: 3, options: [
      { id: "cad", label: "Технические CAD", desc: "детали, чертежи" },
      { id: "industrial", label: "Промдизайн", desc: "продукт, корпус" },
      { id: "arch", label: "Архитектура", desc: "визуализация" },
      { id: "organic", label: "Органика / персонажи", desc: "скульпт" },
      { id: "reverse", label: "Реверс-инжиниринг", desc: "по образцу" },
    ]},
    { type: "chips", id: "complexity", label: "Сложность", cols: 3, options: [
      { id: "simple", label: "Простое" },
      { id: "medium", label: "Средняя" },
      { id: "complex", label: "Сложная" },
    ]},
    { type: "chips", id: "extras", label: "Доп. услуги", cols: 3, options: [
      { id: "none", label: "Без доп." },
      { id: "draw", label: "+ Чертежи" },
      { id: "print", label: "+ Подготовка к печати" },
    ]},
    { type: "slider", id: "revisions", label: "Правки", min: 0, max: 10, step: 1, suffix: " шт", defaultValue: 2 },
  ],
  pricing: {
    typeBase: { cad: 3000, industrial: 8000, arch: 12000, organic: 18000, reverse: 12000 },
    complexity: { simple: 1, medium: 1.6, complex: 2.4 },
    extras: { none: 0, draw: 4000, print: 5000 },
    base: { revisionExtra: 1500, freeRevisions: 2, min: 3000 },
  },
  pricingSchema: [
    { id: "typeBase", title: "Базовая цена по направлению", linkedField: "type", valueSuffix: "₽", entries: [
      { id: "cad", label: "Технические CAD", suffix: "₽" },
      { id: "industrial", label: "Промдизайн", suffix: "₽" },
      { id: "arch", label: "Архитектура", suffix: "₽" },
      { id: "organic", label: "Органика / персонажи", suffix: "₽" },
      { id: "reverse", label: "Реверс-инжиниринг", suffix: "₽" },
    ]},
    { id: "complexity", title: "Множители сложности", linkedField: "complexity", valueSuffix: "×", entries: [
      { id: "simple", label: "Простое", suffix: "×" },
      { id: "medium", label: "Средняя", suffix: "×" },
      { id: "complex", label: "Сложная", suffix: "×" },
    ]},
    { id: "extras", title: "Доп. услуги", linkedField: "extras", valueSuffix: "₽", entries: [
      { id: "none", label: "Без доп.", suffix: "₽" },
      { id: "draw", label: "+ Чертежи", suffix: "₽" },
      { id: "print", label: "+ Подготовка к печати", suffix: "₽" },
    ]},
    { id: "base", title: "Базовые параметры", entries: [
      { id: "revisionExtra", label: "Цена доп. правки", suffix: "₽" },
      { id: "freeRevisions", label: "Бесплатных правок", suffix: "шт" },
      { id: "min", label: "Мин. заказ", suffix: "₽" },
    ]},
  ],
  compute: (s, file, p) => {
    const typeId = String(s.type ?? "cad");
    const base = num(p.typeBase?.[typeId], 3000);
    const c = num(p.complexity?.[String(s.complexity ?? "simple")], 1);
    const ex = num(p.extras?.[String(s.extras ?? "none")], 0);
    const freeR = num(p.base?.freeRevisions, 2);
    const rev = Math.max(0, Number(s.revisions ?? 2) - freeR) * num(p.base?.revisionExtra, 1500);
    const ff = fileFactorOf(file);
    const min = num(p.base?.min, 3000);
    const total = Math.max(min, rub((base * c + ex + rev) * (file ? 0.55 + ff * 0.45 : 1)));
    return { price: total, primary: `Срок: ${MODEL_DAYS[typeId] ?? "—"} · сложность ×${c.toFixed(1)}`, fileFactor: ff };
  },
};

/* ---------------------------- Прототипирование --------------------------- */
const PROTO_CALC: ServiceCalculatorConfig = {
  title: "Калькулятор прототипа",
  tagline: "От концепта до функционального прототипа.",
  accept: ".stl,.obj,.step,.stp,image/*,.pdf",
  showFile: true,
  fields: [
    { type: "chips", id: "type", label: "Тип прототипа", cols: 3, options: [
      { id: "visual", label: "Визуальный", desc: "макет, образец" },
      { id: "functional", label: "Функциональный", desc: "тест механики" },
      { id: "hybrid", label: "Гибридный", desc: "вид + функция" },
    ]},
    { type: "chips", id: "tech", label: "Технология", cols: 4, options: [
      { id: "fdm", label: "FDM" },
      { id: "sla", label: "SLA" },
      { id: "cnc", label: "ЧПУ-фрезеровка" },
      { id: "mix", label: "Комбинированно" },
    ]},
    { type: "chips", id: "finish", label: "Постобработка", cols: 3, options: [
      { id: "none", label: "Без обработки" },
      { id: "paint", label: "Покраска" },
      { id: "assembly", label: "Сборка узла" },
    ]},
    { type: "slider", id: "iter", label: "Итерации", min: 1, max: 6, step: 1, suffix: " шт", defaultValue: 1 },
    { type: "slider", id: "size", label: "Габарит", min: 30, max: 400, step: 10, suffix: " мм", defaultValue: 120 },
  ],
  pricing: {
    type: { visual: 5000, functional: 12000, hybrid: 18000 },
    tech: { fdm: 1, sla: 1.4, cnc: 1.8, mix: 1.6 },
    finish: { none: 0, paint: 2500, assembly: 4500 },
    base: { min: 5000 },
  },
  pricingSchema: [
    { id: "type", title: "База по типу", linkedField: "type", valueSuffix: "₽", entries: [
      { id: "visual", label: "Визуальный", suffix: "₽" },
      { id: "functional", label: "Функциональный", suffix: "₽" },
      { id: "hybrid", label: "Гибридный", suffix: "₽" },
    ]},
    { id: "tech", title: "Множители технологии", linkedField: "tech", valueSuffix: "×", entries: [
      { id: "fdm", label: "FDM", suffix: "×" },
      { id: "sla", label: "SLA", suffix: "×" },
      { id: "cnc", label: "ЧПУ-фрезеровка", suffix: "×" },
      { id: "mix", label: "Комбинированно", suffix: "×" },
    ]},
    { id: "finish", title: "Постобработка", linkedField: "finish", valueSuffix: "₽", entries: [
      { id: "none", label: "Без обработки", suffix: "₽" },
      { id: "paint", label: "Покраска", suffix: "₽" },
      { id: "assembly", label: "Сборка узла", suffix: "₽" },
    ]},
    { id: "base", title: "Базовые параметры", entries: [
      { id: "min", label: "Мин. заказ", suffix: "₽" },
    ]},
  ],
  compute: (s, file, p) => {
    const base = num(p.type?.[String(s.type ?? "visual")], 5000);
    const tech = num(p.tech?.[String(s.tech ?? "fdm")], 1);
    const fin = num(p.finish?.[String(s.finish ?? "none")], 0);
    const iter = Number(s.iter ?? 1);
    const size = Number(s.size ?? 120);
    const sizeMult = 0.6 + (size / 400) * 1.4;
    const ff = fileFactorOf(file);
    const min = num(p.base?.min, 5000);
    const total = Math.max(min, rub((base * tech * sizeMult + fin) * iter * (file ? 0.6 + ff * 0.4 : 1)));
    return { price: total, primary: `${iter} итерац. · габарит ×${sizeMult.toFixed(2)} · технология ×${tech.toFixed(1)}`, fileFactor: ff };
  },
};

/* -------------------------------- Export -------------------------------- */
export const SERVICE_CALCULATORS: Record<Service["slug"], ServiceCalculatorConfig> = {
  "3dpechat": PRINT_CALC,
  rezkaco2: LASER_CALC,
  scan: SCAN_CALC,
  model: MODEL_CALC,
  prototip: PROTO_CALC,
};

/* ---------------------- Merge DB overrides into config ------------------ */
export function mergeCalcOverride(base: ServiceCalculatorConfig, override: Partial<ServiceCalculatorConfig> | null | undefined): ServiceCalculatorConfig {
  if (!override) return base;
  const pricing: Pricing = { ...base.pricing };
  if (override.pricing) {
    for (const k of Object.keys(override.pricing)) {
      pricing[k] = { ...(base.pricing[k] ?? {}), ...(override.pricing[k] ?? {}) };
    }
  }
  return {
    ...base,
    ...override,
    pricing,
    pricingSchema: base.pricingSchema,
    compute: base.compute,
    fields: override.fields ?? base.fields,
  };
}
