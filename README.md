# Project Report

**Prepared For:** Internal Team Discussion
**Author:** Dravid kol
**Date:** April 2025

 **Modernizing Incident Classification using LLM Agents and Vector Search**

---

### Objective

To develop a reliable, scalable, and intelligent classification system for ServiceNow incidents to determine if they should be assigned to the TCS team. The new approach replaces legacy ML methods (KMeans, classical classifiers) with modern LLM-based agents using LangChain and LangGraph.

---

### Background

Currently, the classification system uses KMeans clustering with ~25 clusters. Accuracy is ~50%, which is insufficient for production usage. Team feedback highlights poor reliability and lack of explainability.

---

### Summary of Techniques Explored

| Method | Accuracy | Real-time Use | Explainability | Maintenance | Reliability |
| --- | --- | --- | --- | --- | --- |
| KMeans Clustering | ~50% | ❌ No | ❌ Low | ❌ Hard | ❌ Poor |
| BART | 60–75% | ✅ Yes | ✅ Medium | ❌ Medium | ❌ Medium |
| LLM Agent + Vector DB | 85–95% | ✅ Yes | ✅ High | ✅ Easy | ✅ High |
| LLM Agent + Vector DB + MCP + Classifier (Optional) | > 95% | ✅ Yes | ✅ High | ✅ Hard | ✅ High++ |

Note: LLM Agent + Vector DB + MCP + Classifier(Optional) for Now (Optional) for Later (Highly Recommended)

> Survey Stats:
> 
> - 71% of companies exploring LLMs in enterprise ops found performance improvements over legacy classifiers (Gartner, 2024)
> - 60% reduction in ticket misclassification when switching to retrieval-augmented LLM workflows (OpenAI, 2023)

---

### Some jargon

**LLM (Large Language Model):** A powerful AI model trained on vast text data to understand and generate human-like language.

**Token:** A unit of text (word piece or character chunk) used to process and measure input/output length in LLMs.

**Agents:** Modular systems that use LLMs to make decisions, take actions, and call tools in a goal-directed flow.

Embedding: A numerical representation of text that captures its meaning for semantic comparison or clustering.

Vector (DB/**Search): A system that stores and retrieves embeddings to find semantically similar data using distance metrics.**

LangChain: A framework for building applications that combine LLMs with tools, memory, and structured workflows.

LangGraph: A graph-based orchestration engine that lets you define LLM workflows as nodes and edges (like a DAG)

MCP **(Model Context Protocol):** A protocol or layer to manage memory, decisions, and state across multi-step LLM interactions.

## 🧠 **Vector DB/Search** vs. 🧮 **Classical ML Classification**

If we are dealing with **natural language + fuzzy incident types + unknown future patterns**, like:

- “SAP issue with outbound IDOC 51”
- “Vendor invoice not posting”
- “Mail not triggered from PO”

…then **vector DB is the natural first step**. Why?

> Because meaning > pattern in early-stage
> 

But as **labeled dataset grows (like  > 10k incidents)** :

> vector DB for semantic recall, and ML classifier for confident prediction
> 

| Criteria | Vector Search | ML Classifier |
| --- | --- | --- |
| No labeled data | ✅ Yes | ❌ Needs labeled data |
| Need semantic understanding | ✅ Yes | ❌ Pattern only |
| fast bootstrapping | ✅ Yes | ❌ Needs training |
| Need probability/confidence scores | ❌ Approx only | ✅ Yes |
| Want explainability | ❌ | ✅ With right model |
| Want logical classification / decision | ❌ Retrieval only | ✅ Classifies |
| retraining over time | ✅Add vectors only |  ❌ Needs periodic retraining |
| Adding new label class is common | ✅ Easy | ❌ Painful |

### 🏗️ MCP

We are already working with:

- Vector DBs (incident memory, scope memory)
- LLM decision-making
- Labeling and dynamic updates
- Potentially LangGraph orchestration

Now imagine this:

### 💡 What if the system could **remember**:

- Which incident was seen before?
- How the LLM made the decision?
- Which scope entries were useful?
- Which fallback paths were effective?
- Which incidents got manually corrected later?

Think of it as a **long-term memory server** or a **persistent context manager** across all agent interactions.

| Area | How MCP Helps |
| --- | --- |
| **Incident History** | Keep structured memory per incident or per team |
| **LLM Feedback Tracking** | Track how the LLM judged scope fit — and if it was correct later |
| **Labeling Audit Trail** | Store who (LLM/Human) labeled the incident and why |
| **Agent Execution Memory** | Let agents remember state across multiple steps or calls |
| **Data to Feed Classifier** | Use MCP memory logs as rich training data later |

### System Architecture

```visual-basic
[Incoming Incident]
       ↓
[Summarize Incident Text]
       ↓
[Vector DB1: Search Past Labeled Incidents]
       ↓
┌────────────────────────────────────────────────────┐
│ Is similarity above threshold? (e.g., ≥ 70%)       │
└────────────────────────────────────────────────────┘
       ↓ Yes                                ↓ No
[Use Matched Label: TCS / Not TCS]     [Vector DB2: Search Scope / Team / License]
                                               ↓
           ┌────────────────────────────────────────────────────────────┐
           │ LLM Prompt:                                                │
           │ "Based on the retrieved scope, team responsibilities, and │
           │ licenses, does this incident fall under the TCS team’s    │
           │ scope?"                                                    │
           └────────────────────────────────────────────────────────────┘
                                               ↓
                       [LLM Decision: TCS / Not TCS / Uncertain]
                                               ↓
 ┌──────────────────────────────────────────────────────────────────────┐
 │ If confident: label the incident and embed it into Vector DB1       │
 │ Otherwise: mark for manual triage or feedback loop                  │
 └──────────────────────────────────────────────────────────────────────┘
                                               ↓
                             ✅ [Labeling Complete & System Learns]

```

```visual-basic
   ┌────────────────────────────┐
   │ [Classifier Model (Optional)] ─────────┐
   └────────────────────────────┘          │
                                           ↓
   If confident (e.g., >90%):
     → [Skip vector search and use classifier output directly]

   ┌────────────────────────────┐
   │ [MCP Memory Server (Optional)] ──────┐
   └────────────────────────────┘        │
                                         ↓
   Tracks:
   - Incident ID, LLM decisions, scores
   - Search paths (VDB1/VDB2)
   - History of labels (for audit or retraining)
   - Can even guide LLM behavior (memory augmentation)

```

![image.png](Project%20Report%201dfcbf6282b8809dbc4df36e2909c02f/image.png)

### Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Latency (2–5s per request) | Async execution, local vector DB, caching |
| Model drift (classifier) | Schedule monthly re-training |
| API failure | Retry logic, fallback to base logic |
| Token limits in LLM | Use summarizer step or input reducer |

---

Switch from clustering and classical ML to a LangGraph-powered LLM agent system with vector search for better real-time decision-making, accuracy, and explainability.

> This positions our team at the cutting edge of intelligent IT Ops automation and aligns with industry best practices in LLM orchestration.
> 

---

### Technical Stack

- **LLM Tools**: LangChain, LangGraph (TypeScript)
- **Vector DB**: Redis with vector search / FAISS (local dev)
- **Embeddings**: OpenAI / HuggingFace models
- **APIs**: Classifier API (Python, FastAPI), Vector search API
- **Infra**: Docker + AWS EC2 + GitHub CI/CD

---

## 🚀 Incident Intelligence System – Phased Rollout Plan

### ✅ **Phase 0: Initial Setup & Planning**

> Goal: Lay down the infrastructure and decide data boundaries.
> 
- ✅ Finalize schema of incident data (fields like summary, group, resolution, etc.)
- ✅ Set up incident ingestion pipeline
- ✅ Define labeling criteria (what counts as "TCS" or "not")
- ✅ Decide thresholds (e.g., similarity > 70%)
- ✅ Choose stack:
    - Vector DBs: Redis, FAISS, or Pinecone
    - LLM: OpenAI, Anthropic, or local (LLM interface)
    - Classifier: Scikit-learn, XGBoost, or none for now
    - Optional MCP: LangChain MCP or custom memory store

---

### 🧪 **Phase 1: Vector DB1 — Historical Recall**

> Goal: Use semantic recall to label well-known cases.
> 
- ✅ Preprocess & embed 10k labeled incidents into **Vector DB1**
- ✅ Build summarization logic for incident text (e.g., `short_description + area`)
- ✅ Set up semantic search against Vector DB1
- ✅ Apply similarity threshold (e.g., cosine similarity ≥ 0.7)
- ✅ Label incidents directly if match is confident

> 📦 Deliverable:
> 
- Working **retrieval-based semantic labeler**
- Evaluation dashboard: Hit/miss rate, avg score, fallback rate

---

### 🧠 **Phase 2: Vector DB2 + LLM Reasoning**

> Goal: Use LLM reasoning to judge unknown or fuzzy cases.
> 
- ✅ Create a second DB (Vector DB2) with structured scope/ownership/team data
- ✅ Design a reliable prompt:
    
    ```
    "Based on the retrieved scope, team responsibilities, and licenses, does this incident fall under the TCS team’s scope?"
    ```
    
- ✅ Integrate fallback logic:
    - If Vector DB1 has no strong match → search Vector DB2
    - Call LLM with prompt + search results
- ✅ Use LLM’s decision to label new incident if confident

> 📦 Deliverable:
> 
- Full fallback pipeline: Vector DB1 → Vector DB2 → LLM
- Track LLM confidence levels and rationale (optional)

---

### ⚙️ **Phase 3: Classifier (Optional)**

> Goal: Use classifier to shortcut obvious cases.
> 
- ✅ Train lightweight classifier on 10k labeled incidents
- ✅ Set confidence threshold (e.g., use if prob ≥ 90%)
- ✅ Plug classifier into early decision stage (before VDB search)

> 📦 Deliverable:
> 
- Fast classifier for simple routing
- Fallbacks to semantic + LLM flow if classifier is unsure

---

### 🧠 **Phase 4: Add MCP (Optional, for Memory/Observability)**

> Goal: Track decisions, feedback, and improve memory.
> 
- ✅ Integrate a memory/logging system (e.g., LangChain MCP or Redis JSON)
- ✅ Log:
    - Incident ID, inputs, outputs
    - Search scores, LLM prompts
    - Final labels, embedding updates
- ✅ Use logs for audit, analysis, and retraining triggers

> 📦 Deliverable:
> 
- Memory + traceability
- Possible LLM memory recall or agent optimization

---

### 🔁 **Phase 5: Feedback Loop & Continuous Learning**

> Goal: Create an auto-improving system.
> 
- ✅ Store all LLM-labeled incidents and manual corrections
- ✅ Periodically retrain classifier (weekly/monthly)
- ✅ Add newly labeled incidents to Vector DB1

> 📦 Deliverable:
> 
- Continuous data loop: raw → label → embed → retrain
- Performance dashboards

---

## 📊 Timeline Summary

| Phase | Duration | Milestone |
| --- | --- | --- |
| Phase 0 | Week 0 | Planning complete, architecture chosen |
| Phase 1 | Week 1–2 | Vector DB1 recall & embedding live |
| Phase 2 | Week 2–4 | LLM fallback reasoning live |
| Phase 3 (Opt.) | Week 4–5 | Classifier integrated |
| Phase 4 (Opt.) | Week 6+ | MCP + observability added |
| Phase 5 | Continuous | Active learning + feedback loop in production |

### Understanding Vector DB and Embeddings

### 📊 What is an Embedding?

An "embedding" is a way to convert text into a list of numbers so computers can understand and compare meanings. Think of it like:

- "Login failed" ➞ [0.12, -0.54, 0.87, ...]
- "Unable to sign in" ➞ [0.13, -0.53, 0.88, ...]

These vectors are very close, so the system understands they are **semantically similar**.

### 📏 What is a Vector DB?

A Vector DB stores these numeric vectors. When you search, it finds vectors that are **most similar** to the input. This is like finding people with similar opinions based on a "meaning fingerprint".

### 🌐 Example

1. An incident says: "Payroll login failed."
2. It is embedded into a vector.
3. The vector DB returns 3 similar incidents:
    - "Employees can't sign in to payroll."
    - "Login issues with HR module."
    - "SSO failing for pay stub portal."
4. These are shown to the LLM Agent to help decide: TCS or not?

This mimics how a human would say, "I’ve seen this issue before, here’s how we solved it."

---

### Understanding Tokens and Limitations

### ⌚ What is a Token?

A token is a chunk of text. For example:

- "Login failed" = 2 tokens
- "Cannot access payroll server due to timeout" = 8 tokens

LLMs charge and limit processing by token count, not word count. A GPT model may have a limit of 4096 or 16,384 tokens.

**Rule of thumb:** *Tokens run ~25 % higher than words in average English prose.*

### ⚠️ Token Overload Problem

- Too many long examples? It crashes or truncates
- Cost increases with tokens
- Latency goes up

### ✅ Token Optimization Strategies

- **Summarize long content before sending to LLM**
- **Use only top-3 relevant vector search results**
- **Prune older chat history in workflows**
- **Use token budgeting libraries (like LangChain memory)**

---
