# URL Migration — Switching OmniTools to a Custom Domain

Current base URL (no custom domain yet): `https://janhazirr7.github.io/allinone`
Live site: GitHub Pages, repo `janhazirr7/allinone`.

## One-step domain switch

Run this **from the repo root**, replacing `https://example.com` with the new
domain. Use the new domain **without a trailing slash** — the paths after it
(e.g. `/age-calculator.html`, and the `/` of the homepage) are preserved by
the replacement as written.

```bash
sed -i 's|https://janhazirr7.github.io/allinone|https://example.com|g' *.html sitemap.xml robots.txt
```

That single command covers all of these, because they all contain the same
base-URL string:

- `sitemap.xml` — every `<loc>` URL.
- `robots.txt` — the `Sitemap:` line.
- Every `*.html` page — canonical URLs and hreflang URLs.
- `404.html` — its `<base>` value is also just this same string inside a
  `*.html` file, so it is replaced by the same command; no separate step
  is needed for it.

Note on `js/main.js`: canonicals, hreflang and the sitemap are static HTML,
so a domain move is **not** done in JS. The only JS value to update is the
single documented constant `SITE_CONFIG.baseUrl` in `js/main.js` — change
that one value to the new domain (with a trailing slash, as it is now).

## Checklist — verify after running the command

- [ ] `sitemap.xml` — all `<loc>` URLs use the new domain; no old-domain URL remains.
- [ ] `robots.txt` — the `Sitemap:` line points to the new sitemap location.
- [ ] Canonicals — every page's canonical link uses the new domain.
- [ ] Hreflang — every hreflang URL uses the new domain (same replacement).
- [ ] `README` — any mention of the old GitHub Pages URL updated to the new domain.
- [ ] Footer text — any footer text or link showing the old domain updated.
- [ ] `404.html` `<base>` — confirmed pointing at the new domain.
- [ ] `js/main.js` — `SITE_CONFIG.baseUrl` updated to the new domain.
- [ ] Re-verify with a grep for the old domain — this must return nothing:
  ```bash
  grep -rn "janhazirr7.github.io/allinone" --include="*.html" --include="*.xml" --include="*.txt" --include="*.js" --include="*.md" . || echo "OK: old domain not found"
  ```
- [ ] Re-check the live site after deploy: homepage, one tool page, sitemap
  and robots.txt all load under the new domain.

## What does NOT need to change

**Relative asset and navigation links need NO change on migration.** Stylesheets,
scripts, images and internal nav links are relative (e.g. `style.css`,
`js/main.js`, `age-calculator.html`), not absolute, so they keep working
unchanged under any domain. Only the absolute base-URL strings listed above
need the replacement.
