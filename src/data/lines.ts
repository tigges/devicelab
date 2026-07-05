import type { PersonaId } from './schema';

export interface LineMeta {
  desc: string;
  preset: PersonaId;
}

/**
 * Per-brand line metadata. When exactly one brand is filtered `in`,
 * these become the line-chip strip below the persona chips.
 */
export const LINES: Record<string, Record<string, LineMeta>> = {
  Lenovo: {
    ThinkPad:  { desc: 'Business-grade: legendary keyboards, MIL-SPEC durability, enterprise security.', preset: 'Business' },
    ThinkBook: { desc: 'Small-business value: modern design, business features, friendlier prices.', preset: 'Business' },
    Yoga:      { desc: 'Premium consumer & creator: OLED displays, thin metal builds, 2-in-1s.', preset: 'Creator' },
    IdeaPad:   { desc: 'Everyday value: solid basics for study, streaming and browsing.', preset: 'Student' },
    Legion:    { desc: 'Gaming & performance: dedicated GPUs, high-refresh displays, serious cooling.', preset: 'Gamer' },
  },
  Apple: {
    'MacBook Pro': { desc: 'Creator & pro flagship: top performance, best-in-class displays.', preset: 'Creator' },
    'MacBook Air': { desc: 'Everyday premium: thin, silent, all-day battery.', preset: 'Student' },
    'MacBook Neo': { desc: 'Budget MacBook: the essentials of macOS at the lowest entry price.', preset: 'Value' },
    iPad:          { desc: 'Tablets: from note-taking to pro drawing and editing.', preset: 'Creator' },
    Mac:           { desc: 'Desktops: compact powerhouses from mini to Studio.', preset: 'Creator' },
  },
  Dell: {
    XPS:        { desc: 'Premium thin-and-light: near-borderless displays, refined builds.', preset: 'Creator' },
    Inspiron:   { desc: 'Everyday value: dependable basics for home and study.', preset: 'Student' },
    Alienware:  { desc: 'Gaming flagship: top GPUs, distinctive design, serious cooling.', preset: 'Gamer' },
    'Dell Pro': { desc: 'Business line: manageability, security and durability for work.', preset: 'Business' },
  },
  HP: {
    OmniBook:   { desc: 'Premium consumer AI laptops: thin, long battery life.', preset: 'Student' },
    EliteBook:  { desc: 'Business-grade: security, durability and enterprise features.', preset: 'Business' },
    Omen:       { desc: 'Gaming: high-refresh displays and desktop-class GPUs.', preset: 'Gamer' },
    Victus:     { desc: 'Budget gaming: entry GPUs at accessible prices.', preset: 'Value' },
    Spectre:    { desc: 'Premium consumer & 2-in-1 flagship: OLED displays, machined chassis.', preset: 'Creator' },
    Chromebook: { desc: 'ChromeOS value: long battery, secure by default, cheap to run.', preset: 'Value' },
  },
  ASUS: {
    Zenbook:  { desc: 'Premium ultraportable: OLED displays in featherweight builds.', preset: 'Student' },
    Vivobook: { desc: 'Everyday mainstream: balanced specs at friendly prices.', preset: 'Value' },
    ROG:      { desc: 'Gaming flagship: maximum performance and refresh rates.', preset: 'Gamer' },
    TUF:      { desc: 'Durable value gaming: rugged builds, sensible prices.', preset: 'Gamer' },
    ProArt:   { desc: 'Creator line: colour-accurate displays, studio-grade performance.', preset: 'Creator' },
  },
  Samsung: {
    'Galaxy Book': { desc: 'Thin premium laptops, tight Galaxy phone integration.', preset: 'Business' },
    'Galaxy Tab':  { desc: 'Android tablets from budget FE to Ultra flagships.', preset: 'Student' },
  },
  Microsoft: {
    'Surface Laptop':        { desc: 'Clean premium clamshells with class-leading battery.', preset: 'Business' },
    'Surface Pro':           { desc: '2-in-1 tablets that replace a laptop with the keyboard on.', preset: 'Business' },
    'Surface Laptop Studio': { desc: 'Creator flagship with a hinged pull-forward display.', preset: 'Creator' },
  },
  Acer: {
    Swift:      { desc: 'Thin premium AI laptops: light builds, long battery.', preset: 'Student' },
    Aspire:     { desc: 'Everyday basics at entry prices.', preset: 'Value' },
    Predator:   { desc: 'Gaming flagship: top GPUs and cooling.', preset: 'Gamer' },
    Nitro:      { desc: 'Budget gaming: entry GPUs, accessible prices.', preset: 'Value' },
    Chromebook: { desc: 'ChromeOS value: simple, secure, long battery.', preset: 'Value' },
  },
  MSI: {
    Raider:   { desc: 'Flagship gaming: desktop-class power, no compromises.', preset: 'Gamer' },
    Stealth:  { desc: 'Thin gaming: high performance in slimmer builds.', preset: 'Gamer' },
    Prestige: { desc: 'Business & creator: efficiency and marathon battery life.', preset: 'Business' },
    Katana:   { desc: 'Budget gaming: solid frame rates at sensible prices.', preset: 'Value' },
  },
  Razer: {
    Blade: { desc: 'Premium gaming: MacBook-grade builds with top GPUs.', preset: 'Gamer' },
  },
  LG: {
    gram: { desc: 'Ultralight: the lightest large-screen laptops made.', preset: 'Student' },
  },
  Huawei: {
    MateBook: { desc: 'Premium ultraportables with standout displays.', preset: 'Business' },
    MatePad:  { desc: 'Tablets with strong displays and stylus support.', preset: 'Creator' },
  },
  Framework: {
    'Framework Laptop 13': { desc: 'Small repairable laptop: socketed everything, modular ports.', preset: 'Business' },
    'Framework Laptop 16': { desc: 'Larger repairable laptop with a modular expansion bay for a GPU or storage.', preset: 'Creator' },
  },
  Amazon: {
    Fire: { desc: 'Budget Android tablets locked to the Amazon services ecosystem.', preset: 'Value' },
  },
};
