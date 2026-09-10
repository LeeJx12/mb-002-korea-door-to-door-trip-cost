# MB-002 first-100 qualified exposure experiment

Started: 2026-09-10 KST  
Authority: control-plane issue #24  
Cost: KRW0

## Current classification

`NO DISTRIBUTION EVIDENCE` — not `NO DEMAND`.

- A public `site:` search snapshot on 2026-09-10 did not surface any MB-002 URL. This is only a discoverability symptom; `site:` results are incomplete and are not an impression denominator.
- GitHub repository traffic for the available 14-day window was 2 views / 1 unique, with one `github.com` referrer. Repository traffic is not qualified traveler exposure and is excluded from the product denominator.
- The product's acquisition/completion/action hooks are transport-neutral and local-only. They cannot supply aggregate portfolio evidence until an explicitly approved readable mechanism exists.

## Intent surfaces — deliberately held to three routes

No new route was added. The three existing pages are expanded around distinct, maintainable jobs:

| Surface | High-intent job/query cluster | Why it is distinct |
| --- | --- | --- |
| `/seoul-busan/` | 서울 부산 차 KTX 비용, 4인 가족 부산 교통비, 서울 부산 왕복 자차 비용 | Longest distance and highest rail-ticket transaction; party crossover is central. |
| `/seoul-gangneung/` | 서울 강릉 차 KTX 비용, 강릉 1박 자차 대중교통, 강릉 현지 이동비 | Destination movement and short-stay parking can reverse the headline fare comparison. |
| `/seoul-jeonju/` | 서울 전주 차 버스 기차 비용, 전주 당일치기 교통비, 2인 4인 전주 자차 | Bus competitiveness and day-trip parking/local transport are materially different. |

Each page exposes its route-specific decision, a worked two-versus-four-person frame, method boundary, FAQ and related-route links before sending the visitor into the calculator with an allowlisted source bucket.

## Active discovery action

The deployment includes an IndexNow key file at the product path and a reproducible four-URL submission command. IndexNow's official documentation lists both Naver and Bing endpoints and permits a key file below the host root when `keyLocation` is supplied. A 200/202 receipt proves only that the changed URLs were received; it is **not** an exposure or indexing result.

Commands:

```sh
npm run acquisition:preview
npm run acquisition:submit
```

## First-100 denominator

The denominator is **qualified search-result impressions**, not pageviews and not submission receipts. Count only impressions where:

1. the landing URL is one of the three canonical route pages or the root calculator;
2. the query contains a route (`서울 부산`, `서울 강릉`, `서울 전주`) plus a decision term (`차`, `자차`, `KTX`, `기차`, `버스`, `비용`, `교통비`, `비교`); and
3. the impression is reported by an authenticated Google Search Console, Naver Search Advisor, or Bing Webmaster property for this exact GitHub Pages prefix.

Planned tranches:

- 60 impressions from the three strengthened route pages, minimum 15 per route so one route cannot hide two zero-exposure surfaces.
- 25 impressions from the root/2026 Chuseok household-comparison surface.
- 15 impressions from a zero-cost owned-portfolio or legitimate listing referral only after its source exposes views/impressions and the click arrives with the allowlisted `owned-portfolio` attribution. Do not count a link merely because it exists.

If the referral tranche cannot be created inside a separately authorized source repository/listing, replace it with 15 additional qualified search impressions. Never use spam, manual Founder posting or an unmeasured placement.

## Funnel and checkpoint

At 24–72 hours after the IndexNow receipt, read the authenticated property and record:

1. qualified impressions (denominator), split by route/query cluster;
2. clicks and CTR;
3. `comparison_complete / visit`;
4. `result_action / visit`;
5. revenue or monetizable action (currently none).

Decision rules after the first 100 qualified impressions:

- **CONTINUE:** at least 5 clicks, at least 40% calculator completion among attributed visits, and at least 8% result action; choose the strongest route for one further bounded iteration.
- **ITERATE DISTRIBUTION:** 100 impressions but fewer than 5 clicks; revise only title/snippet alignment on the exposed route, then gather a new 100-impression tranche.
- **ITERATE PRODUCT:** at least 5 clicks but completion below 40% or action below 8%; inspect the first-task/result boundary before adding routes.
- **NO DISTRIBUTION EVIDENCE:** fewer than 100 qualified impressions; do not make a demand verdict. Use the highest-information readable exposure channel next.

## Demand, WTP and disconfirming evidence

- Search results contain many fare/how-to pages and operator booking surfaces, which supports the travel-decision job but also creates strong free-substitute competition.
- The embedded operator-published preset values represent real transport transactions: for two people the default round-trip rail or bus totals are roughly KRW138,000–269,200 depending on route/mode. This supports transaction value, not willingness to pay for the calculator itself.
- No direct Korail/Kobus affiliate path was verified during this sprint. Adjacent hotel/activity affiliate programs exist, but they are not yet proven to fit this exact pre-trip transport decision. Revenue therefore remains unproven and no affiliate was added.
- The strongest disconfirming evidence is that free map/operator tools can answer live price/time questions better; MB-002 must win specifically on editable household door-to-door crossover, not generic route information.

## Blocked evidence boundary

The static product can create discovery requests and attributed local events, but it cannot read search impressions or aggregate downstream events without account-bound webmaster access or a separately approved privacy-light aggregate mechanism. That permission boundary must be resolved before any demand interpretation.
