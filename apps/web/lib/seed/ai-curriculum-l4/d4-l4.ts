// AI Engineer — D4: RAG & Retrieval — Level 4
export const D4_L4_LESSON = {
  slug: "production-rag-beyond-the-tutorial",
  title: "Production RAG: beyond the tutorial",
  description:
    "Why naive vector search fails in production, and the four patterns that fix it: hybrid BM25+dense retrieval, cross-encoder reranking, HyDE query rewriting, parent-document retrieval, plus RAGAS to actually measure whether your changes helped.",
  dimension: "rag_retrieval",
  difficulty: "advanced",
  estimatedMinutes: 22,
  order: 4,
  content: `## Why It Matters
Every RAG tutorial ends the same way: chunk your docs, embed them, store in a vector DB, top-k cosine similarity, stuff into the prompt. It works beautifully on the demo and then falls apart the moment real users type real questions. The tutorial recipe has three structural failure modes. First, small chunks lose the context they came from — a paragraph about "the deprecation policy" makes no sense without the section header two pages up. Second, pure semantic search misses exact keyword matches — a user searching for the error code "EACCES" gets back fuzzy paraphrases about "permission issues" while the actual page mentioning EACCES sits at rank 47. Third, top-k retrieval is noisy by construction — the embedding model ranks "related" passages, not "answers this question" passages, so the LLM ends up reasoning over five plausible-but-wrong contexts. Production RAG is the discipline of fixing these three failures one layer at a time, and then measuring whether each layer actually moved the needle.

## Hybrid Search (BM25 + Dense)
Pure vector search misses exact terms. Pure BM25 misses paraphrases. You want both, fused. The standard approach is to run two retrievers in parallel and combine the rankings with Reciprocal Rank Fusion (RRF). Pinecone hybrid search supports this natively; on Postgres you do it yourself with pgvector for the dense side and tsvector for the lexical side.

\`\`\`python
def hybrid_search(query: str, k: int = 20) -> list[Doc]:
    dense = pg.execute(
        "SELECT id, 1 - (embedding <=> %s) AS score FROM docs "
        "ORDER BY embedding <=> %s LIMIT %s",
        (embed(query), embed(query), k),
    ).fetchall()
    lexical = pg.execute(
        "SELECT id, ts_rank(tsv, plainto_tsquery(%s)) AS score FROM docs "
        "WHERE tsv @@ plainto_tsquery(%s) ORDER BY score DESC LIMIT %s",
        (query, query, k),
    ).fetchall()
    # Reciprocal Rank Fusion — robust to score-scale differences
    scores: dict[str, float] = {}
    for rank, (doc_id, _) in enumerate(dense):
        scores[doc_id] = scores.get(doc_id, 0) + 1 / (60 + rank)
    for rank, (doc_id, _) in enumerate(lexical):
        scores[doc_id] = scores.get(doc_id, 0) + 1 / (60 + rank)
    return sorted(scores.items(), key=lambda x: -x[1])[:k]
\`\`\`

The constant 60 is the standard RRF dampener — it stops any single retriever from dominating. Hybrid alone typically lifts recall@10 by 10-20 percentage points on technical content with lots of acronyms, error codes, and product names.

## Cross-Encoder Reranking
After hybrid retrieval you have twenty candidates that are "probably relevant." A cross-encoder reads the query and each candidate together and scores actual relevance — slower than a bi-encoder, but vastly more accurate. Run it on the top 20-50, keep the top 3-5. Cohere Rerank is the managed option; BGE-Reranker (bge-reranker-base for speed, bge-reranker-large for quality) is the open-source standard you can self-host.

\`\`\`python
import cohere

co = cohere.Client(api_key=os.environ["COHERE_API_KEY"])
candidates = hybrid_search(query, k=20)
reranked = co.rerank(
    model="rerank-english-v3.0",
    query=query,
    documents=[c.text for c in candidates],
    top_n=5,
)
top_contexts = [candidates[r.index] for r in reranked.results]
\`\`\`

Reranking is the single highest-leverage change most RAG systems can make — it routinely cuts hallucination rates by 30-50% because the LLM is now reading three high-precision passages instead of ten noisy ones.

## HyDE (Hypothetical Document Embeddings)
Users ask short, ambiguous questions; your indexed documents are long and detailed. The embedding distance between "how do I fix EACCES" and a multi-paragraph troubleshooting page is larger than you'd hope. HyDE flips the script: ask the LLM to write a hypothetical answer first, then embed that hypothetical answer and search with it. The fake answer is wrong on facts but right on shape — it lives in the same embedding neighborhood as the real document. HyDE is cheap (one extra LLM call) and shines on short or vague queries.

## Parent-Document Retrieval
Small chunks (256-512 tokens) embed well — they're focused, so cosine similarity is meaningful. But small chunks make terrible context for an LLM — they're missing the surrounding paragraph, the section header, the table they refer to. Parent-document retrieval splits the difference: you embed and search the small "child" chunks, but when a child wins, you return its larger "parent" (the full section, or the full page). The retriever's precision stays high; the generator's context stays coherent. LangChain calls this ParentDocumentRetriever; the pattern matters more than the library.

## Evaluating With RAGAS
You cannot improve what you cannot measure, and "vibes on five queries" is not measurement. RAGAS gives you three core LLM-judged metrics: **faithfulness** (does the answer only claim things supported by the retrieved context?), **context_recall** (did retrieval pull in everything the ground-truth answer needs?), and **context_precision** (are the retrieved chunks actually used by the answer, or is the prompt full of noise?). Build a small eval set of 50-200 query/ideal-answer pairs, run RAGAS before and after every retrieval change, and only ship the change if at least one metric moves up without another moving down.

## Key Takeaways
- Tutorial RAG fails for three structural reasons: lost context, missed keywords, noisy top-k.
- Hybrid search (BM25 + dense, fused with RRF) fixes the keyword-miss problem.
- Cross-encoder reranking (Cohere Rerank, BGE-Reranker) fixes the noisy top-k problem.
- Parent-document retrieval fixes the lost-context problem — embed small, return large.
- HyDE helps when queries are much shorter than your indexed documents.
- RAGAS (faithfulness, context_recall, context_precision) is how you prove a change helped.`,
  quizzes: [
    {
      question:
        "Your support RAG bot is great at conceptual questions but terrible whenever users paste an exact error code like 'EACCES' or 'ERR_MODULE_NOT_FOUND' — the right page exists in the index but never appears in the top 10. You're using a single dense embedding retriever. What is the most direct fix?",
      choices: [
        {
          id: "a",
          label: "Switch to a larger embedding model and re-index everything.",
          correct: false,
        },
        {
          id: "b",
          label: "Add BM25 lexical search alongside dense retrieval and fuse the two rankings with Reciprocal Rank Fusion — error codes are exact tokens that lexical search nails and dense search blurs.",
          correct: true,
        },
        {
          id: "c",
          label: "Increase top-k from 10 to 100 so the right page eventually appears.",
          correct: false,
        },
        {
          id: "d",
          label: "Fine-tune the embedding model on your error-code pages.",
          correct: false,
        },
      ],
      order: 1,
    },
    {
      question:
        "You add Cohere Rerank to your pipeline. Hallucination rates drop, but p95 latency jumps from 600ms to 2.4 seconds because you're reranking 200 candidates per query. You don't want to give up the quality win. What is the right adjustment?",
      choices: [
        {
          id: "a",
          label: "Drop the reranker entirely — latency matters more than the quality gain.",
          correct: false,
        },
        {
          id: "b",
          label: "Move the reranker to a background job and serve stale answers.",
          correct: false,
        },
        {
          id: "c",
          label: "Lower the rerank candidate set to 20-50 (your hybrid retriever's top results) and keep top_n at 3-5 — reranking is meant for a narrow slate, not the whole index.",
          correct: true,
        },
        {
          id: "d",
          label: "Switch to bge-reranker-large for higher accuracy, which will reduce the need to rerank as many candidates.",
          correct: false,
        },
      ],
      order: 2,
    },
    {
      question:
        "Your RAGAS evaluation on 100 queries shows faithfulness went from 0.78 to 0.86 after adding parent-document retrieval, but context_precision dropped from 0.71 to 0.52. Your stakeholder asks: 'Should we ship this?' What is the correct interpretation?",
      choices: [
        {
          id: "a",
          label: "Ship it — faithfulness is the metric users feel; precision is internal.",
          correct: false,
        },
        {
          id: "b",
          label: "Do not ship as-is. Faithfulness improved because parents give the LLM more grounding, but context_precision crashed because parents include large irrelevant sections — you're paying in tokens and increasing the chance of distractor-driven errors. Tune the parent size or add a reranker on top before shipping.",
          correct: true,
        },
        {
          id: "c",
          label: "Do not ship — any metric regression is a hard block regardless of trade-off.",
          correct: false,
        },
        {
          id: "d",
          label: "Re-run RAGAS with a different judge model until both metrics move the same direction.",
          correct: false,
        },
      ],
      order: 3,
    },
  ],
} as const;
