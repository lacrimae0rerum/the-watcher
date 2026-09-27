# Digest Package Portfolio Design

**Status: Proposed design**  
**Approval boundary:** This document is a reviewable design record. It is **not implementation approval**, does not assert that any sibling package exists or runs, and does not approve source lists, deployment, publication, or collection.

## 1. Purpose, scope, and evidence limits

### Purpose

Define six sibling digest packages that preserve the current `ai-builders-digest` package shape while giving each package a distinct editorial job. The design also identifies the minimum repository-level changes required before any sibling can run.

### Non-goals

- Implementing packages, collectors, workflows, feeds, state, or delivery.
- Selecting or endorsing named sources, accounts, publishers, vendors, or institutions.
- Approving collection cost, cadence, retention, privacy policy, or publication.
- Treating a digest, social cluster, popularity signal, or model output as verified truth.
- Introducing a general plugin framework or adding package-internal files.
- Replacing analyst review with automated confidence labels.

### Evidence limits

Repository claims below were checked against the current local checkout. Vault notes are secondary local knowledge records: citations establish what those notes contain, not the truth or currency of their original external sources. No large vault passage is reproduced.

> **NotebookLM gap:** NotebookLM was unavailable in this runtime, and no clearly relevant local NotebookLM export was found. This design contains **no NotebookLM-derived finding**. Any approval that requires notebook evidence remains blocked until the user supplies authorized access or an export.

### Review path

1. Review the executive decisions and taxonomy first.
2. Review the relevant package contract and its negative cases.
3. Review X-Clusters separately because it adds collection, state, privacy, and interpretation risks.
4. Resolve the user-owned decisions before authorizing implementation.
5. Treat repository-enabling work and package implementation as separate review units.

## 2. Executive decision summary

| Decision | Proposed design | Reason |
| --- | --- | --- |
| Portfolio shape | Six sibling packages with the exact 12-file internal structure of `packages/ai-builders-digest` | Preserves a known module interface and keeps thematic policy local. |
| Package seam | Keep the existing exports in `index.js`; vary package descriptors, normalization, configuration, prompts, tests, and example output | The current thematic interface is compact enough to deepen without inventing a new framework. |
| Runtime strategy | Add one validated `--package` selector, dynamically import the selected package, and drive existing orchestration from its descriptors | This is the smallest supported change that makes multiple packages runnable. |
| Storage isolation | Scope feeds, checkpoints, and user paths by canonical package ID | Prevents cross-package deduplication, overwrite, and branding leakage. |
| Editorial overlap | Route by the decision question, not merely by topic keywords | Prevents cyber, conflict, politics, and strategic products from collapsing into one broad news digest. |
| Provenance | Record source reliability and information credibility independently; repeated or viral content is not corroboration | Reliability belongs to a source history, while credibility belongs to a claim or item. |
| X-Clusters | Treat as an observation/context product with one-hop relationship context and durable transition state | It can show who said or amplified what; it cannot establish truth, ideology, or intent. |
| Extensibility | Explicitly reject a speculative plugin framework | One package selector and the existing module interface are sufficient for six known packages. |

## 3. Current project architecture and end-to-end flow

### Current module shape

`packages/ai-builders-digest/index.js` exports the thematic interface: `declaration`, `digestPackage`, `runtime`, `sources`, `config`, `prompts`, `preparation`, `delivery`, `editorialPolicies`, `resolveUserFile`, and `createCollectors` (`packages/ai-builders-digest/index.js:4-87`). `packages/digest-core/index.js` validates normalized content, feed snapshots, preparation input, delivery adapters, and collector execution (`packages/digest-core/index.js:36-191`).

This is a useful seam: `digest-core` owns generic contracts; the package owns thematic policy and adapters. It is not yet a multi-package runtime.

### Observed flow

1. **Generation trigger.** The workflow invokes one fixed generator and stages fixed root feed/state files (`.github/workflows/generate-feed.yml:1-18,36-52`).
2. **Package import.** `scripts/generate-feed.js` directly imports the AI Builders package and reads its source catalog (`scripts/generate-feed.js:16-24,81-85`).
3. **Collection.** The script constructs fixed X, podcast, and web provider functions; the package normalizes them; `digest-core.collectFeed` validates and deduplicates normalized items (`scripts/generate-feed.js:1010-1069`; `packages/ai-builders-digest/collection.js:1-78`; `packages/digest-core/index.js:144-191`).
4. **Persistence.** Generation writes `feed-x.json`, `feed-podcasts.json`, `feed-blogs.json`, and one `state-feed.json` in the repository root (`scripts/generate-feed.js:43-79,1071-1168`).
5. **Preparation.** `scripts/prepare-digest.js` directly imports AI Builders descriptors, fetches package-declared feeds and prompts, then converts the generic preparation result back into a fixed `x`/`podcasts`/`blogs` envelope (`scripts/prepare-digest.js:23-33,68-160`).
6. **Editorial run.** The root skill names AI Builders, assumes those three content keys, and fixes ordering, language, onboarding, paths, and branding (`SKILL.md:1-20,313-419,423-477`).
7. **Delivery.** `scripts/deliver.js` directly imports AI Builders paths and email branding, then delegates the selected adapter to `digest-core.deliver` (`scripts/deliver.js:23-36,156-229`; `packages/digest-core/index.js:118-139`).

### Coupling that blocks siblings

The package seam exists, but generation, preparation, delivery, workflow, root skill, feed paths, state paths, channel keys, stats, and branding select AI Builders directly. Creating sibling directories alone would therefore create inert designs, not runnable packages.

## 4. Exact 12-file parity contract

Every sibling package must contain **exactly these 12 package-internal files**. Repository-level enabling files remain outside package directories.

| Relative file | Required responsibility |
| --- | --- |
| `index.js` | Export the thematic interface: identity and declaration, runtime identity, source and channel descriptors, config schema URL, prompt URLs, preparation descriptors, delivery branding, editorial policies, user-file resolver, and collector factory. |
| `collection.js` | Normalize provider results into `digest-core` content items and package-specific metadata without embedding editorial prose. |
| `package.json` | Declare package identity, ESM export, version, description, and shipped package files. |
| `index.test.mjs` | Verify manifest exports, local ownership of package assets, collector normalization, policies, paths, preparation topology, branding, and negative contract cases. |
| `config/config-schema.json` | Validate user preferences and package-specific scope controls; reject unknown or unsafe values where material. |
| `config/default-sources.json` | Hold the approved source catalog and collection parameters. Named entries remain unpopulated until the user approves them. |
| `prompts/digest-intro.md` | Define final edition structure, routing, evidence labels, omission rules, and mandatory source links. |
| `prompts/summarize-blogs.md` | Summarize long-form written or documentary material while preserving claim/source distinctions. |
| `prompts/summarize-podcast.md` | Summarize audio/video transcripts, distinguishing speaker claims from verified facts. |
| `prompts/summarize-tweets.md` | Summarize social posts and relationship context without treating engagement as evidence. |
| `prompts/translate.md` | Translate without changing evidence strength, uncertainty, names, identifiers, links, or technical meaning. |
| `examples/sample-digest.md` | Provide a fictional, source-safe review fixture showing the expected final structure and labels. |

The filenames preserve parity. A package may declare that a channel is unused, but it may not delete, rename, or repurpose a file into an unrelated role.

## 5. Evidence ledger

### Evidence classes

| Class | Meaning in this document |
| --- | --- |
| **FACT** | Directly observed in the cited repository file or local note, within the stated scope. |
| **INFERENCE** | Design conclusion reasoned from identified facts and constraints. |
| **HYPOTHESIS** | Plausible design expectation that requires implementation or user testing. |
| **UNKNOWN** | Evidence is missing, inaccessible, undecided, or insufficient. |
| **DISPUTE** | Conflicting evidence requiring resolution; none is silently averaged away. |

### Ledger

| ID | Class | Claim | Evidence and limitation | Design consequence |
| --- | --- | --- | --- | --- |
| E-01 | FACT | The reference package path is plural and has the 12 files listed above. | Local tree under `packages/ai-builders-digest`; file roles inspected directly. | All siblings use exact parity. |
| E-02 | FACT | The package exports a compact thematic interface while `digest-core` owns generic validation, collection, preparation, and delivery contracts. | `packages/ai-builders-digest/index.js:4-87`; `packages/digest-core/index.js:36-191`. | Reuse the seam; do not build a second abstraction layer. |
| E-03 | FACT | Runtime execution is coupled to AI Builders through direct imports, fixed channels, paths, output keys, branding, and workflow files. | `scripts/generate-feed.js:16-24,43-85,1010-1168`; `scripts/prepare-digest.js:23-33,68-160`; `scripts/deliver.js:23-36,156-229`; `.github/workflows/generate-feed.yml:1-18,36-52`; `SKILL.md:313-419`. | Repository enabling work must precede sibling execution. |
| E-04 | FACT | The existing X request excludes replies and reposts, caps a single response, resolves user IDs from handles each run, stores only seen IDs, and records quote IDs without fetching referenced content. | `scripts/generate-feed.js:43-79,552-664`; output construction at `scripts/generate-feed.js:1071-1110`. | X-Clusters requires a deeper collector and durable relation/update state. |
| E-05 | FACT | Local intelligence notes distinguish source reliability from information credibility. | Vault: `Projects/doctrina-inteligencia/entidad-admiralty-system.md:15-56`. Secondary record only. | Store and review the two assessments separately. |
| E-06 | FACT | Local tradecraft notes distinguish evidence, assumptions, judgments, alternatives, implications, and uncertainty. | Vault: `Projects/doctrina-inteligencia/entidad-icd-203.md:17-36`. Secondary record only. | Prompts and examples must label analytical judgment and uncertainty. |
| E-07 | FACT | The local NIE note describes a strategic, long-horizon assessment for senior decisions rather than daily event reporting. | Vault: `Projects/doctrina-inteligencia/entidad-nie.md:14-27`. Secondary record only. | Intelligence/Geopolitics must answer strategic meaning, not reproduce a chronology. |
| E-08 | FACT | The local CTI note describes requirement-led products across strategic, tactical, operational, and technical levels. | Vault: `Projects/cyber-threat-intelligence/Visser2026_cti-fundamentos-lecciones.md:21-76`. Secondary record only. | Cyber Intelligence must be PIR/adversary-led and distinct from general defensive news. |
| E-09 | FACT | The local OSINT synthesis requires an intelligence purpose, legal constraints, source validation, and human judgment. | Vault: `Themes/metodologia-osint.md:14-50`. Secondary record only. | Collection scope and human review must be explicit. |
| E-10 | FACT | The local information-environment note distinguishes misinformation, disinformation, and malinformation and warns about echo chambers. | Vault: `Projects/lisa-institute-mpai/Asignatura 5 - Resumen Consolidado.md:241-270`. Secondary record only. | Do not infer intent from falsity; actively seek contrary and independent evidence. |
| E-11 | FACT | The inspected political-analysis material treats political stability, foreign policy, regulation, economics, society, technology, ecology, and law as distinct macro-environment dimensions. | Vault: `Projects/lisa-institute-mpai/Asignatura 6 - Resumen Consolidado.md:260-280`. Secondary record only. | Spanish Politics should connect institutional decisions to material effects, not collect partisan commentary. |
| E-12 | FACT | The inspected conflict-related material lists force/resource location, damage assessment, peace operations, humanitarian crises, and treaty verification as distinct uses. | Vault: `Projects/lisa-institute-mpai/Asignatura 3 - Resumen Consolidado.md:374-389`. Secondary record only. | Armed Conflicts needs chronology, geolocation, effects, and verification fields. |
| E-13 | INFERENCE | Six packages are justified because their user decisions, evidence thresholds, ordering, and negative cases differ. | Derived from E-05 through E-12 and the user-supplied package constraints. | Keep separate declarations and routing rules. |
| E-14 | HYPOTHESIS | Descriptor-driven iteration can support all six without a plugin framework. | Existing package descriptors and generic core make this plausible; no sibling execution test exists. | Validate through contract tests before package implementation. |
| E-15 | UNKNOWN | Named source lists, licensing, cadence, language, collection budget, and accountable editors are not approved. | No decision record supplied. | Keep source criteria, not source names; block implementation approval. |
| E-16 | UNKNOWN | NotebookLM evidence may add, contradict, or refine this design. | NotebookLM unavailable; no clearly relevant local export found. | Record the gap prominently; do not imply notebook review. |
| E-17 | DISPUTE | No active source dispute was identified in the inspected scope. The generic seam and hard-coded runtime are a capability gap, not contradictory facts. | E-02 and E-03 describe different layers. | Preserve this class for future conflicting evidence rather than manufacturing consensus. |

## 6. Portfolio taxonomy and overlap routing

### Distinct editorial jobs

| Package | Primary question | Time orientation | Required output |
| --- | --- | --- | --- |
| `intelligence-geopolitics-digest` | What does this development mean for state behavior, institutions, policy, and plausible futures? | Medium to long horizon | Strategic judgments, drivers, alternatives, indicators, implications, uncertainty. |
| `cybersecurity-digest` | What defensive action should an operator or owner take? | Immediate to near term | Exposure, affected assets, mitigations, detection, remediation priority. |
| `cyber-intelligence-digest` | What does the evidence answer about a priority intelligence requirement, adversary, campaign, intent, or capability? | Near to strategic | PIR-linked assessment, TTP/campaign context, confidence, gaps, collection needs. |
| `armed-conflicts-geopolitics-digest` | What happened, where, when, with what verified conflict and humanitarian effects? | Event chronology plus near-term effects | Sourced timeline, actor/action/location, control/effect changes, disputed claims. |
| `spanish-national-politics-digest` | What Spanish institutional decision occurred, or what development has material impact on Spain? | Daily to policy horizon | Decision path, competence, legal status, parliamentary/electoral/policy impact. |
| `x-clusters-digest` | What are configured public X members posting, amplifying, quoting, or replying to, and what context connects those observations? | Poll-to-poll observation | Cluster/member activity, relationship context, changes, availability transitions. |

### Explicit routing rules

1. Route by the **decision question**, not by a shared keyword.
2. Strategic meaning across states or institutions goes to Intelligence/Geopolitics; verified kinetic chronology and conflict effects go to Armed Conflicts.
3. Defensive remediation goes to Cybersecurity; adversary/PIR analysis goes to Cyber Intelligence.
4. Spanish Politics requires a Spanish institutional decision or a demonstrable material Spanish impact. Mere mention of Spain is insufficient.
5. X-originated material goes to X-Clusters only when the product question is networked observation/context. A post may be evidence for another package, but X popularity does not decide routing or credibility.
6. One item receives one primary package. Other relevant packages are references in `relatedPackages`; full duplicate summaries are off by default.
7. When routing remains ambiguous, omit the item from automated publication and send it to human review with both candidate questions.

## 7. Package designs

### 7.1 `intelligence-geopolitics-digest`

**Declaration:** Strategic intelligence on geopolitical drivers, state and institutional behavior, plausible futures, and decision implications, with evidence and uncertainty kept distinct.

| Area | Design |
| --- | --- |
| Audience/job | Decision-makers and analysts who need strategic meaning rather than a news recap. |
| Include | State behavior; alliances and institutions; diplomacy; sanctions; economic or technological leverage; policy shifts; indicators; plausible scenarios; implications. |
| Exclude | Uncontextualized daily events; unsupported prediction; tactical conflict chronology as the primary product; partisan advocacy; social virality. |
| Source-selection criteria | Prefer attributable primary decisions and records, then independent reporting and specialist analysis with transparent method. Require stable locators, timeliness, jurisdictional relevance, legal access, and identifiable upstream dependence. Do not preselect named sources here. |
| Metadata | `countryOrActor`, `region`, `institution`, `eventType`, `decisionDate`, `effectiveDate`, `timeHorizon`, `drivers`, `assumptions`, `alternatives`, `indicators`, `implications`, `sourceReliability`, `informationCredibility`, `confidence`, `relatedPackages`. |
| Digest order | Key judgments; what changed; drivers and constraints; competing explanations; indicators and scenarios; implications; evidence gaps. |

#### Exact file responsibilities

| File | Package-specific responsibility |
| --- | --- |
| `index.js` | Declare strategic purpose, channels, preparation topology, branding, evidence policies, and package-scoped user path. |
| `collection.js` | Normalize official records, long-form analysis, transcripts, and social observations into common items with actor/region/event metadata. |
| `package.json` | Publish the canonical package ID and only the parity assets. |
| `index.test.mjs` | Test exports, path ownership, metadata normalization, strategic routing, and rejection of unsupported judgments. |
| `config/config-schema.json` | Validate language, cadence, delivery, regions, actors, horizons, and approved topic scope. |
| `config/default-sources.json` | Store only user-approved strategic source classes and later approved named entries. |
| `prompts/digest-intro.md` | Require key judgments first, then evidence, alternatives, indicators, implications, and uncertainty. |
| `prompts/summarize-blogs.md` | Extract claims, methods, assumptions, horizon, and policy implications from written analysis. |
| `prompts/summarize-podcast.md` | Separate speaker assertions from evidence and identify strategic relevance without authority-by-status. |
| `prompts/summarize-tweets.md` | Treat posts as attributed observations; preserve context and prohibit trend inference from engagement alone. |
| `prompts/translate.md` | Preserve estimative language, confidence, actor names, and policy/legal terms. |
| `examples/sample-digest.md` | Demonstrate a fictional strategic edition with alternatives and uncertainty, not a daily chronology. |

**Acceptance criteria**

- **IG-AC-01:** Every key judgment links to evidence and labels assumptions, confidence, and time horizon.
- **IG-AC-02:** At least one plausible alternative is retained when evidence supports more than one explanation.
- **IG-AC-03:** Event reporting appears only when it changes a strategic judgment or indicator.
- **IG-AC-04:** No claim is strengthened merely because many dependent outlets repeat it.

**Negative cases**

- A battlefield movement with no strategic analysis routes to Armed Conflicts.
- A viral diplomatic rumor with no attributable evidence is omitted or marked unverified, never promoted to a judgment.
- A confident forecast without assumptions, indicators, or alternatives fails the package contract.

### 7.2 `cybersecurity-digest`

**Declaration:** Defensive cybersecurity updates translated into prioritized actions for reducing exposure, detecting abuse, and restoring systems.

| Area | Design |
| --- | --- |
| Audience/job | Security operations, engineering, vulnerability management, IT owners, and leaders who must decide what to do. |
| Include | Vulnerabilities, exploit conditions, affected products, patches, mitigations, detections, secure configuration, incident lessons, defensive tooling, recovery guidance. |
| Exclude | Adversary speculation with no defensive consequence; generic fear; exploit instructions that add avoidable harm; product marketing without evidence; raw indicator dumps without use context. |
| Source-selection criteria | Prefer maintainers, coordinated advisories, standards bodies, and reproducible technical research; require affected-version clarity, update history, safe disclosure, stable identifiers, and actionable defensive value. Named sources remain undecided. |
| Metadata | `vulnerabilityIds`, `affectedProducts`, `affectedVersions`, `exploitPrerequisites`, `exploitationStatus`, `severityBasis`, `patchStatus`, `mitigations`, `detections`, `recoveryActions`, `publishedAt`, `updatedAt`, `sourceReliability`, `informationCredibility`. |
| Digest order | Act now; assess exposure; detect; remediate; recover/verify; watchlist and unresolved claims. |

#### Exact file responsibilities

| File | Package-specific responsibility |
| --- | --- |
| `index.js` | Declare defensive-action purpose, source channels, preparation descriptors, branding, safety rules, and local path. |
| `collection.js` | Normalize advisories, technical articles, transcripts, and social disclosures with product/version/action metadata. |
| `package.json` | Publish the canonical package ID and parity assets. |
| `index.test.mjs` | Test manifest ownership, identifier normalization, action fields, safe omissions, and package path isolation. |
| `config/config-schema.json` | Validate asset/product scope, risk tolerance, language, cadence, delivery, and action-window preferences. |
| `config/default-sources.json` | Hold approved advisory and research source definitions without inventing vendors or publishers. |
| `prompts/digest-intro.md` | Order by defensive urgency and separate confirmed exploitation from possibility. |
| `prompts/summarize-blogs.md` | Extract affected scope, prerequisites, evidence, patches, mitigations, and verification steps. |
| `prompts/summarize-podcast.md` | Convert discussion into bounded defensive lessons while identifying unsupported speaker claims. |
| `prompts/summarize-tweets.md` | Treat short disclosures as leads until corroborated; preserve identifiers and original links. |
| `prompts/translate.md` | Preserve product names, versions, identifiers, commands, uncertainty, and safety meaning. |
| `examples/sample-digest.md` | Demonstrate a fictional action-first edition with exposure and remediation sections. |

**Acceptance criteria**

- **CS-AC-01:** Every urgent item states affected scope, evidence basis, and the next defensive action.
- **CS-AC-02:** Confirmed exploitation, proof of concept, exploit availability, and theoretical exploitability remain distinct.
- **CS-AC-03:** Mitigation and patch guidance identifies its source and verification condition.
- **CS-AC-04:** Severity does not override relevance to the configured asset scope.

**Negative cases**

- A threat-actor profile without an operator action routes to Cyber Intelligence.
- A social claim about exploitation without supporting evidence remains a lead, not an alert.
- Raw offensive steps that are unnecessary for defense are excluded.

### 7.3 `cyber-intelligence-digest`

**Declaration:** Requirement-led cyber intelligence that assesses adversaries, campaigns, capabilities, and implications against explicit priority intelligence requirements.

| Area | Design |
| --- | --- |
| Audience/job | CTI analysts, incident leaders, risk owners, and decision-makers answering defined PIRs. |
| Include | Adversary and campaign observations; TTPs; infrastructure and malware relationships; intent/capability judgments; strategic, tactical, operational, and technical implications; collection gaps. |
| Exclude | General patch news with no PIR relevance; attribution by repetition; raw indicators without provenance, time, or use; vendor branding as evidence; actor naming without an observed basis. |
| Source-selection criteria | Select against PIR coverage, access legality, provenance, timeliness, historical reliability, technical reproducibility, and independence from upstream reporting. Named providers and feeds remain user-owned. |
| Metadata | `pirIds`, `intelligenceLevel`, `actorAliases`, `campaignIds`, `observedTtps`, `infrastructure`, `malwareFamilies`, `victimology`, `firstSeen`, `lastSeen`, `attributionStatus`, `assumptions`, `alternatives`, `collectionGaps`, `sourceReliability`, `informationCredibility`, `confidence`. |
| Digest order | PIR answers; key judgments; new observations; campaign/TTP changes; implications; indicators with use constraints; gaps and collection requirements. |

#### Exact file responsibilities

| File | Package-specific responsibility |
| --- | --- |
| `index.js` | Declare PIR-led purpose, channels, preparation descriptors, branding, tradecraft policies, and user path. |
| `collection.js` | Normalize reports, advisories, transcripts, social observations, and technical records with PIR and campaign metadata. |
| `package.json` | Publish the canonical package ID and parity assets. |
| `index.test.mjs` | Test PIR linkage, provenance, alias handling, confidence fields, package paths, and rejection of unsupported attribution. |
| `config/config-schema.json` | Validate PIRs, priority actors/campaigns, asset context, intelligence levels, cadence, language, and delivery. |
| `config/default-sources.json` | Store approved CTI source definitions and machine-readable feed parameters after user selection. |
| `prompts/digest-intro.md` | Lead with PIR answers and separate observations, judgments, implications, and gaps. |
| `prompts/summarize-blogs.md` | Extract campaign evidence, TTPs, victimology, attribution basis, alternatives, and actionable implications. |
| `prompts/summarize-podcast.md` | Capture analyst claims and experience while preventing credential-based confidence inflation. |
| `prompts/summarize-tweets.md` | Preserve technical leads and relations but require corroboration before analytical elevation. |
| `prompts/translate.md` | Preserve identifiers, actor aliases, ATT&CK-style terminology, confidence, and caveats. |
| `examples/sample-digest.md` | Demonstrate a fictional PIR-led product across strategic through technical levels. |

**Acceptance criteria**

- **CI-AC-01:** Every included item answers or changes a named PIR, indicator requirement, or collection gap.
- **CI-AC-02:** Attribution states evidence, alternatives, confidence, and scope; aliases never imply identity by name similarity alone.
- **CI-AC-03:** Indicators carry provenance, observation time, and intended defensive use.
- **CI-AC-04:** Strategic, tactical, operational, and technical outputs are labelled rather than mixed.

**Negative cases**

- A patch release with no adversary/PIR relevance routes to Cybersecurity.
- Ten reports repeating one upstream attribution count as one dependency chain, not ten confirmations.
- An unlabeled list of domains or hashes fails the contract.

### 7.4 `armed-conflicts-geopolitics-digest`

**Declaration:** Evidence-bounded reporting of armed-conflict chronology, actor actions, territorial and operational changes, and humanitarian or geopolitical effects.

| Area | Design |
| --- | --- |
| Audience/job | Analysts and decision-makers who need a verified chronology and effects baseline before strategic interpretation. |
| Include | Time/location-bounded incidents; actor claims; force or control changes; damage; displacement and humanitarian effects; ceasefires; negotiations; treaty or mandate implications; verification status. |
| Exclude | Unsupported casualty precision; graphic material without analytical necessity; operationally sensitive real-time targeting detail; strategic forecasts as chronology; propaganda repetition without attribution. |
| Source-selection criteria | Prefer primary records where safe, independent corroboration, transparent geolocation/chronolocation methods, correction history, stable media provenance, legal and ethical access, and conflict-sensitivity review. No named sources are selected here. |
| Metadata | `conflictId`, `eventId`, `eventType`, `actors`, `claimedBy`, `eventTime`, `observationTime`, `location`, `geolocationPrecision`, `controlStatus`, `casualtyClaim`, `humanitarianEffects`, `verificationStatus`, `mediaProvenance`, `sourceReliability`, `informationCredibility`, `confidence`, `disputeIds`. |
| Digest order | Verified changes; sourced chronology; territorial/operational effects; humanitarian effects; diplomatic/legal effects; disputed and unverified claims; gaps. |

#### Exact file responsibilities

| File | Package-specific responsibility |
| --- | --- |
| `index.js` | Declare chronology/effects purpose, channels, preparation descriptors, branding, safety policies, and user path. |
| `collection.js` | Normalize reports, records, transcripts, and social observations with event, actor, time, location, and verification metadata. |
| `package.json` | Publish the canonical package ID and parity assets. |
| `index.test.mjs` | Test chronology ordering, location precision, dispute handling, source links, sensitive-detail exclusion, and path isolation. |
| `config/config-schema.json` | Validate conflict scope, geography, delay windows, sensitivity controls, language, cadence, and delivery. |
| `config/default-sources.json` | Hold only approved conflict-information sources and collection constraints. |
| `prompts/digest-intro.md` | Separate verified changes, claims, disputes, humanitarian effects, and strategic references. |
| `prompts/summarize-blogs.md` | Extract event assertions, methods, dates, locations, actor claims, and correction status from long-form reports. |
| `prompts/summarize-podcast.md` | Summarize testimony or analysis with role, proximity, limitations, and claim status explicit. |
| `prompts/summarize-tweets.md` | Preserve post/relation context, avoid graphic amplification, and prevent unverified media from becoming fact. |
| `prompts/translate.md` | Preserve place names, actor distinctions, legal terms, uncertainty, and casualty attribution. |
| `examples/sample-digest.md` | Demonstrate a fictional chronology with disputed claims and bounded location precision. |

**Acceptance criteria**

- **ACG-AC-01:** Every event has event time or an explicit unknown, observation time, location precision, actor attribution, and verification status.
- **ACG-AC-02:** Casualty and control claims remain attributed and ranges are not collapsed into false precision.
- **ACG-AC-03:** Strategic meaning is referenced to Intelligence/Geopolitics when it exceeds the verified event baseline.
- **ACG-AC-04:** Publication excludes real-time detail that creates avoidable operational or personal risk.

**Negative cases**

- A strategic alliance forecast without a conflict event routes to Intelligence/Geopolitics.
- A single-party battlefield claim is labelled as a claim, not a verified change.
- Graphic or identifying victim material with no decision value is excluded.

### 7.5 `spanish-national-politics-digest`

**Declaration:** Evidence-led coverage of Spanish institutional decisions and developments with material legal, political, economic, social, territorial, European, or foreign-policy impact on Spain.

| Area | Design |
| --- | --- |
| Audience/job | Readers who need to understand what Spanish institutions decided, how the decision proceeds, and its material impact. |
| Include | Executive, legislative, judicial, electoral, regulatory, budgetary, territorial, coalition, treaty, European, and foreign-policy developments with a Spanish institutional decision or material Spanish impact. |
| Exclude | Party messaging without a decision or material effect; personality coverage; polling as prediction; foreign news with only a rhetorical Spain mention; ideological profiling. |
| Source-selection criteria | Prefer official records and legal text, then transparent independent reporting and domain analysis. Require institutional competence, procedural stage, effective date, correction practice, plural coverage, and identifiable upstream evidence. Named outlets remain user-owned. |
| Metadata | `institution`, `institutionLevel`, `competence`, `procedure`, `procedureStage`, `legalInstrument`, `decisionDate`, `effectiveDate`, `territorialScope`, `partiesOrCoalitions`, `voteOrRuling`, `electionId`, `materialSpanishImpact`, `euOrTreatyDimension`, `sourceReliability`, `informationCredibility`, `confidence`. |
| Digest order | Decisions in force; parliamentary/judicial/regulatory pipeline; elections and coalitions; territorial and socioeconomic impact; EU/foreign-policy effects; disputes and watchlist. |

#### Exact file responsibilities

| File | Package-specific responsibility |
| --- | --- |
| `index.js` | Declare Spain-impact threshold, channels, preparation descriptors, branding, neutrality policies, and user path. |
| `collection.js` | Normalize official records, reporting, analysis, transcripts, and social posts with institution/procedure/impact metadata. |
| `package.json` | Publish the canonical package ID and parity assets. |
| `index.test.mjs` | Test Spain-impact routing, institutional competence, procedural status, neutrality, source ownership, and path isolation. |
| `config/config-schema.json` | Validate national/territorial scope, institutions, policy domains, language, cadence, delivery, and duplicate policy. |
| `config/default-sources.json` | Store approved institutional and reporting sources only after user review. |
| `prompts/digest-intro.md` | Lead with decisions and status; separate enacted, proposed, challenged, suspended, and speculative outcomes. |
| `prompts/summarize-blogs.md` | Extract institutional actor, legal basis, procedure, decision, impact, opposition, and unresolved questions. |
| `prompts/summarize-podcast.md` | Separate participant opinion from institutional fact and disclose partisan or professional role when available. |
| `prompts/summarize-tweets.md` | Treat party and official posts as attributable statements, not independent confirmation. |
| `prompts/translate.md` | Preserve Spanish institutional and legal terms, official names, procedure status, and uncertainty. |
| `examples/sample-digest.md` | Demonstrate a fictional institution-first edition with procedural stages and material-impact tests. |

**Acceptance criteria**

- **SP-AC-01:** Every included item names the Spanish institutional decision or explains the material Spanish impact.
- **SP-AC-02:** Competence, procedure stage, legal status, decision date, and effective date are distinct where applicable.
- **SP-AC-03:** Party statements are attributed; ideological balance is not simulated by counting quotations.
- **SP-AC-04:** Foreign-policy items explain the concrete Spanish or Spanish-institutional consequence.

**Negative cases**

- A foreign election with no material Spanish impact routes elsewhere.
- A party leader's viral statement with no institutional or policy consequence is excluded.
- A bill, judgment, or regulation is not described as effective before its actual procedural stage supports that claim.

### 7.6 `x-clusters-digest`

**Declaration:** Contextual observation of configured public X clusters, showing member posts and one-hop repost, quote, reply, and parent relationships without claiming truth, ideology, or intent.

| Area | Design |
| --- | --- |
| Audience/job | Researchers and analysts who need a bounded view of what configured public accounts said or amplified and how those observations relate. |
| Include | Posts, reposts, quotes, replies, immediate referenced posts, edits observed across polls, and availability transitions for configured members. |
| Exclude | Private or protected content; follower-graph expansion; inferred political ideology, protected traits, mental state, coordination, or intent; truth scores; engagement-based credibility; recursive conversation crawling. |
| Source-selection criteria | Membership is an explicit user decision tied to a documented research purpose. Require public status, stable platform user ID, lawful access, minimization, reviewable cluster rationale, and bounded retention. No member is named by this design. |
| Metadata | The relation and lifecycle model in Section 8 is normative for this proposal. |
| Digest order | Cluster overview; original posts; repost/quote/reply relationships; one-hop context; edits and availability transitions; limitations and unanswered questions. |

#### Exact file responsibilities

| File | Package-specific responsibility |
| --- | --- |
| `index.js` | Declare observation-only purpose, X channel descriptors, preparation topology, privacy/editorial policies, branding, and package path. |
| `collection.js` | Normalize posts, reposts, quotes, replies, parent snapshots, relation edges, revisions, and availability transitions. |
| `package.json` | Publish the canonical package ID and parity assets. |
| `index.test.mjs` | Test stable-ID membership, relation keys, one-hop limits, pagination, update semantics, tombstones, privacy exclusions, and path isolation. |
| `config/config-schema.json` | Validate enabled cluster IDs, polling window, page budget, retention, tombstone behavior, language, cadence, and delivery. |
| `config/default-sources.json` | Store approved cluster definitions and members keyed by stable user ID; handles are mutable labels. |
| `prompts/digest-intro.md` | Require observation language, relationship grouping, transition notes, and explicit non-truth/non-profile caveats. |
| `prompts/summarize-blogs.md` | Summarize linked long-form context only when a declared source descriptor supplies it; otherwise remain present but unused. |
| `prompts/summarize-podcast.md` | Summarize declared transcript context only when configured; otherwise remain present but unused. |
| `prompts/summarize-tweets.md` | Summarize member activity and one-hop relations without inferring ideology, intent, or corroboration from amplification. |
| `prompts/translate.md` | Preserve IDs, handles, relation kinds, observation language, uncertainty, and availability status. |
| `examples/sample-digest.md` | Demonstrate fictional clusters, relation context, edits, and tombstones without real-person profiling. |

**Acceptance criteria**

- **XC-AC-01:** Membership uses stable configured user IDs; handle changes do not create a new member.
- **XC-AC-02:** Original, repost, quote, and reply kinds remain distinct and point to durable relation targets.
- **XC-AC-03:** Context traversal stops after one referenced hop and records unavailable context explicitly.
- **XC-AC-04:** Polling paginates within configured bounds, upserts changes, and does not emit unchanged observations as new posts.
- **XC-AC-05:** Deleted, unavailable, or withheld items emit a tombstone by default without republishing unavailable text.
- **XC-AC-06:** No output assigns truth, ideology, protected traits, intent, or coordination from cluster membership or engagement.

**Negative cases**

- Many reposts of one claim represent amplification, not independent corroboration.
- A handle-only match does not establish member identity.
- A reply does not inherit the truth or stance of its parent.
- A deleted post is not silently removed from state, quoted from cache, or presented as currently available.

## 8. X-Clusters deep design

### 8.1 Cluster and member configuration

`config/default-sources.json` owns approved defaults; `config/config-schema.json` controls user-selectable scope. Proposed records:

- **Cluster:** `clusterId`, `label`, `purpose`, `memberUserIds`, `inclusionRationale`, `active`, and optional collection bounds.
- **Member:** `xUserId` (required stable key), `handle` (mutable display/routing label), `displayName`, `clusterIds`, `active`, `addedAt`, and `membershipRationale`.

Cluster membership is editorial configuration, not an analytical finding. Handle resolution may refresh labels, but a handle alone cannot add, merge, or replace a member.

### 8.2 Post and relation model

Each observed post record should contain:

- Identity: `platform: "x"`, `postId`, canonical dedupe key `x:<postId>`, `authorUserId`, current `authorHandle`.
- Content: `postKind` as `post`, `repost`, `quote`, or `reply`; `text` when available; `canonicalUrl`; `createdAt`; `conversationId` when supplied.
- Observation: `firstSeenAt`, `lastSeenAt`, `lastFetchedAt`, `contentHash`, and bounded `versions` containing observation time and prior hash; text retention follows the approved policy.
- Availability: `available`, `deleted`, `withheld`, `protected`, or `unknown`, plus `statusObservedAt` and a reason when the platform supplies one.
- Metrics: timestamped public metrics as context only. Metrics never contribute to reliability, credibility, or corroboration.

Relations use `relationKey = x:<fromPostId>:<relationKind>:<toPostId>` and one of:

- `repost_of`
- `quote_of`
- `reply_to`

The immediate target is the **parent/reference context**. The inverse `parent_of` relationship is derived at read time rather than persisted as a second authoritative edge. This avoids two mutable copies of one fact.

### 8.3 One-hop context

For each configured member post, collect the immediate referenced post for a repost, quote, or reply when lawfully available. Store a bounded context snapshot with its own author ID, post ID, time, availability, locator, and content hash. Do not recursively fetch grandparents, full threads, follower graphs, or all replies. A missing parent remains `unknown` or unavailable; it is never reconstructed from the child.

### 8.4 Polling, pagination, updates, and deduplication

1. Poll by stable user ID, not by handle.
2. Follow pagination tokens until the oldest item is outside the configured window, no token remains, or the configured page/request budget is reached.
3. Persist the high-water mark and pagination outcome per member and collection mode.
4. Upsert by `x:<postId>`; do not use author-plus-text or URL as the identity key.
5. Upsert relation edges by the relation key above.
6. A changed content hash creates an observed revision and an `edited` transition. It does not create a new post.
7. Changed metrics update a metrics snapshot but do not create an editorial item by themselves.
8. An unchanged post only advances `lastSeenAt`; it is not re-emitted as new.
9. Failed or budget-limited pagination records an incomplete poll. Absence during an incomplete poll is not an availability transition.

### 8.5 Availability, deletion, withholding, and tombstones

The default is a tombstone:

- Preserve post ID, author ID, relation edges, first/last observation times, prior digest references, status, and content hash.
- Do not republish unavailable text in new feeds or summaries.
- Distinguish platform-deleted, withheld, protected, and fetch-unknown when the evidence permits; otherwise use `unknown`.
- Emit a transition only after a direct status response or a user-approved confirmation rule. Missing from one timeline poll is insufficient.
- If a previous edition quoted the post, the next relevant edition may note the availability change without implying why it occurred.
- Retaining prior text beyond a hash is a user-owned legal/privacy decision, not a default in this design.

### 8.6 Privacy and ethical limits

- Collect only public content from explicitly configured accounts and immediate public references.
- Do not circumvent protected, blocked, deleted, withheld, authenticated, or rate-limited access.
- Do not infer or score ideology, ethnicity, religion, health, sexuality, intent, mental state, or other sensitive traits.
- Do not label coordination, authenticity, or deception from timing or shared links alone.
- Do not expand through followers, likes, private lists, contact data, or unrelated conversation participants.
- Keep cluster purpose, membership rationale, retention, access, correction, and deletion policy reviewable by a human owner.
- Use labels that describe observed behavior: “posted,” “reposted,” “quoted,” or “replied.” Avoid “supports,” “believes,” “coordinates,” or “is part of” unless separately evidenced and explicitly in scope.

### 8.7 Current collector gaps

The current collector cannot satisfy this design because it:

- Excludes reposts and replies in the request (`scripts/generate-feed.js:594-605`).
- Does not paginate (`scripts/generate-feed.js:600-621`).
- Resolves IDs from configured handles on every run instead of requiring stable configured user IDs (`scripts/generate-feed.js:556-597`).
- Records a quote target ID but does not fetch quoted or parent content (`scripts/generate-feed.js:629-642`).
- Stores a seven-day seen-ID map rather than durable records, relations, revisions, or availability transitions (`scripts/generate-feed.js:43-79,623-646`).
- Produces one current grouped feed without tombstones or transition events (`scripts/generate-feed.js:1071-1110`).

## 9. Shared provenance and confidence rules

### Required evidence record

Each publishable claim or observation should retain, directly or by reference:

- original locator and native source ID;
- publisher/account and author/speaker when known;
- publication time, observation time, and retrieval time;
- content type and whether it is primary material, reporting, analysis, testimony, or social observation;
- upstream dependency or corroboration group;
- source reliability assessment with rationale;
- information credibility assessment with rationale;
- analytical confidence with coverage and known gaps;
- assumptions, alternatives, implications, and corrections where applicable.

### Rules

1. Assess **source reliability** and **information credibility** independently. A historically reliable source can publish a weak claim; a new or poor-history source can expose a claim later confirmed elsewhere.
2. Confidence is an analytical judgment about the evidence set, not a conversion from likes, reposts, source prestige, or a single score.
3. Virality, repetition, quote volume, and cluster density are not corroboration.
4. Sources repeating one upstream report belong to one dependency chain unless they add independent evidence.
5. Distinguish observed evidence, reported claims, assumptions, judgments, alternatives, implications, and unknowns in prompts and output.
6. Preserve disputes. Do not resolve incompatible claims by majority count.
7. Corrections and availability changes update provenance; they do not silently rewrite prior evidence history.
8. Translation must preserve uncertainty and evidence strength.

## 10. Minimum repository enabling design

This work is repository-level and must be reviewed separately from the six package designs.

### Required enabling changes

1. **Validated `--package`.** Accept one canonical package ID, reject absent values where ambiguity matters, reject path separators/traversal, and fail closed on unknown IDs.
2. **Dynamic import.** Resolve the selected ID to `packages/<canonical-id>/index.js` and validate the existing thematic interface before use.
3. **Descriptor-driven collection.** Iterate package-declared channels/source descriptors instead of fixed `x_accounts`, `podcasts`, and `blogs` branches. Reuse the existing known provider functions and package `createCollectors` adapter.
4. **Package-scoped state and feeds.** Derive all checkpoint and feed paths from the validated package ID. Never share a dedupe namespace across packages by accident.
5. **Dynamic preparation envelope.** Return package identity, generic `content`, per-channel stats, prompts, preferences, and errors. Do not flatten every package back into fixed `x`, `podcasts`, and `blogs` keys.
6. **Package-owned paths and branding.** Use selected-package `resolveUserFile`, delivery descriptors, prompt base, declaration, and subject branding throughout preparation, onboarding, and delivery.
7. **Workflow parameterization.** Add a validated package input or explicit package matrix, stage only that package's feed/state outputs, and preserve independent failure/reporting boundaries.
8. **Package-aware root skill.** Select the package before onboarding or execution; read package descriptors and prompts rather than naming AI Builders or fixed channels.
9. **Contract tests.** Cover selector validation, unknown/path-traversal rejection, dynamic imports, exact 12-file parity, descriptor iteration, package-scoped paths, generic preparation output, branding isolation, AI Builders regression, and X relation/update semantics.

### Explicit rejection: speculative plugin framework

Do not add plugin discovery, lifecycle hooks, dependency injection containers, event buses, registration manifests, or a generic extension SDK. Six known packages need one validated selector and one existing module interface. Add a new seam only when a second concrete implementation requires it; otherwise the framework would increase interface surface without proven leverage.

## 11. Recommended implementation order

1. **Resolve user-owned decisions.** Source governance, IDs, retention, cadence, language, and editorial ownership affect every later test.
2. **Write repository contract tests around current AI Builders behavior.** Freeze the regression baseline and the selected-package interface before changing orchestration.
3. **Implement selector, dynamic import, and package-scoped paths.** These are the minimum isolation controls.
4. **Make generation and preparation descriptor-driven.** Keep provider functions concrete; do not generalize beyond observed package needs.
5. **Parameterize delivery, workflow, and root skill.** Complete the end-to-end selected-package path and rerun AI Builders regression checks.
6. **Implement `cybersecurity-digest`.** Its action-first boundary is comparatively testable and exercises non-AI-builder content without the deepest relation state.
7. **Implement `cyber-intelligence-digest`.** Reuse cyber collection classes while adding PIR and adversary tradecraft.
8. **Implement `intelligence-geopolitics-digest`.** Add strategic judgments, alternatives, indicators, and horizon controls.
9. **Implement `armed-conflicts-geopolitics-digest`.** Add stricter chronology, geolocation, dispute, safety, and humanitarian handling.
10. **Implement `spanish-national-politics-digest`.** Proceed only after Spanish source governance, neutrality, institutional scope, and legal-status review are owned.
11. **Implement `x-clusters-digest` last.** It requires pagination, stable IDs, relation storage, edits, tombstones, retention policy, and privacy review beyond the current collector.

This order minimizes simultaneous novelty. It does not authorize any step.

## 12. User-owned decisions before implementation

| Decision | Why the user must own it |
| --- | --- |
| Approve the six canonical IDs and declarations | IDs become paths, state namespaces, commands, and public product names. |
| Approve named source lists and accountable source owners | Source selection encodes editorial scope, cost, licensing, and risk. |
| Set language, cadence, edition length, and delivery channels per package | These determine collection windows, cost, and user experience. |
| Choose cross-package duplicate/reference policy | Affects storage, editorial repetition, and reader expectations. |
| Approve confidence vocabulary and whether to expose reliability/credibility labels | Labels can imply more certainty than the evidence supports. |
| Define political neutrality, territorial scope, and material-Spain threshold | These are product and governance choices, not technical defaults. |
| Define conflict delay, precision, casualty, graphic-content, and operational-safety rules | Publication can create personal, legal, and operational harm. |
| Define PIRs, priority assets, and authorized CTI sharing | Cyber Intelligence is not requirement-led without them. |
| Define X clusters, purpose, members, stable IDs, polling budget, and correction path | Membership and collection scope must not be inferred by the implementation. |
| Approve X retention, edit history, tombstone, unavailable-text, and deletion policy | These choices carry privacy, legal, and evidentiary consequences. |
| Decide whether NotebookLM evidence is required for approval | The current design did not inspect any notebook evidence. |
| Name reviewers and approval gates | Design acceptance, implementation verification, and publication authorization are separate. |

## 13. Acceptance checklist and remaining evidence limitations

### Document acceptance checklist

- [x] Status is `Proposed design` and explicitly not implementation approval.
- [x] Current architecture and end-to-end coupling are cited to repository files.
- [x] The exact 12-file package contract is preserved with no proposed package-internal additions.
- [x] FACT / INFERENCE / HYPOTHESIS / UNKNOWN / DISPUTE are defined and used.
- [x] All six canonical package IDs have distinct jobs and explicit overlap routing.
- [x] Every package has a declaration, audience/job, inclusion/exclusion rules, unnamed source criteria, metadata, digest order, 12 file responsibilities, acceptance criteria, and negative cases.
- [x] X-Clusters defines clusters, stable member IDs, relation context, one-hop bounds, pagination, updates, dedupe, edits, availability, tombstones, privacy limits, and current gaps.
- [x] Shared provenance separates source reliability from information credibility and rejects virality as corroboration.
- [x] Repository enabling work is separate from package design and rejects a speculative plugin framework.
- [x] Implementation order and user-owned decisions are explicit.
- [x] Vault material is paraphrased with vault-relative paths and line ranges; no large passage is copied.
- [x] No named source list is invented.
- [x] The NotebookLM gap is prominent and no notebook finding is claimed.

### Remaining limitations

- No sibling package, runtime selector, state model, feed layout, or contract test has been implemented or executed.
- No independent reviewer has approved this document.
- Vault records were not independently checked against their original external sources.
- Named sources, access rights, licensing, collection budgets, retention, privacy, and publication policy remain undecided.
- NotebookLM evidence was unavailable and may materially change the design.
- Platform behavior for edits, deletions, withholding, pagination, and historical access requires current provider documentation and empirical testing during an authorized implementation phase.

### Approval gate

Implementation may begin only after the relevant user-owned decisions are recorded and an implementation scope is separately authorized. Approval of this document alone would approve a design direction, not collection, code changes, remote access, deployment, or publication.
