mkdir -p docs

cat > docs/cold-email-template.md << 'EOF'
# Cold Email Templates — LotLeads Outreach

## Template A: Photo Hook (Primary — highest open rate)

**Subject:** Found a parking lot in [City] that needs work — photo attached

---

Hi [First Name],

We scanned every commercial parking lot in [City] using aerial imagery AI.

[ATTACH: aerial-crop-blurred.jpg — cracked lot, condition score visible, address blurred]

This lot scored **8/10** on our deterioration index. We estimate the resurfacing job at **$55,000–$90,000**.

Address + property manager contact are unlocked here → [link]

Leads start at $65. No subscription.

— [Your name]
[Company]

---

## Template B: Direct Value (Follow-up #1, day 3)

**Subject:** Re: parking lot lead in [City]

---

[First Name] —

Following up. We have [X] commercial lots available in [City] right now, scored and ready with property manager contacts.

Highest priority: Score 9/10 lot near [Landmark/Major road] — est. job $75K–$120K. Only 2 shared slots left.

Preview → [link]

---

## Template C: Scarcity (Follow-up #2, day 7)

**Subject:** Only 1 shared slot left on the [City] lot

---

[First Name],

Quick note — the [City] lot I sent last week now has 2 of 3 shared slots filled.

If you want exclusive access (only you, 72 hours), that's still available at $149.

[Unlock exclusive →]

---

## Sequence Setup in Instantly.ai:

1. **Day 1**: Template A (attach blurred aerial crop image)
2. **Day 3**: Template B (follow-up, mention specific lot)
3. **Day 7**: Template C (scarcity close)
4. **Day 14**: Break-up email ("Closing your file — last chance")

**Target list**: Upload prospects.csv from /data/prospects.csv

**Personalization variables**:
- {{company}} = company name
- {{city}} = their city
- {{first_name}} = contact first name (enrich via Apollo/Hunter)
- {{lot_score}} = lead score for their market
- {{job_min}} = estimated job min
- {{job_max}} = estimated job max

## Recommended Instantly Settings:
- Sending limit: 40 emails/day per inbox
- Warm-up: Enable (minimum 2 weeks before full send)
- Tracking: Opens + clicks only (no reply tracking to avoid spam flags)
- From name: [Your name] at [Company]
- Reply-to: Use a real monitored inbox
EOF
