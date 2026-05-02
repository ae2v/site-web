/**
 * Tailwind config to ensure dynamic department classes are preserved
 * Tailwind purges unknown classes when building — add safelist patterns
 * for department utilities and for the arbitrary `bg-[color:var(--color-...)]` forms.
 */
module.exports = {
  content: [
    './app/**/*.{vue,js,ts,jsx,tsx}',
    './pages/**/*.{vue,js,ts,jsx,tsx}',
    './server/**/*.{ts,js}',
    './shared/**/*.{ts,js}'
  ],
  safelist: [
    // plain utilities like `bg-MMI`, `text-INFO-light`, `border-RT/50` etc.
    {
      pattern: /^(bg|text|border)-(MMI|GEII|INFO|RT|MRIT)(-(faded|light|lighter))?(\/\d+)?$/,
    },

    // arbitrary color utilities that use CSS variables, e.g.
    // bg-[color:var(--color-MMI)] or bg-[color:var(--color-MMI-faded)]
    {
      pattern: /^\w+-\[color:var\(--color-(MMI|GEII|INFO|RT|MRIT)(-(faded|light|lighter))?\)\]$/,
    },
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
