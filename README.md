# CLUUF Daily Site Report

A React web app for filling in the **CLUUF Daily Site Report: Refurbishment & Renovation** every day and exporting it as a PDF in the original layout.

- Fill in Parts A to D on phone or desktop. Changes are saved in the browser as you type.
- **New report** carries over the site details, stage tracker and stock from the previous report, and increments the report and day numbers.
- **Export PDF** opens the print dialog with the report laid out like the original form. Choose "Save as PDF".
- **Backup** downloads every report as JSON, and **Restore** loads that file on another device.

## Develop

```bash
npm install
npm run dev
```

## Deploy

Import the repository in Vercel. It detects Vite, runs `npm run build` and serves `dist`.
