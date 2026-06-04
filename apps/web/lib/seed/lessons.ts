import { eq } from "@repo/db/drizzle";
import { db } from "@repo/db/client";
import { lesson, quiz } from "@repo/db/schema";

const LESSONS = [
  {
    id: crypto.randomUUID(),
    slug: "intro-to-transformers",
    title: "Introduction to Transformers",
    description: "Understand the transformer architecture that powers modern AI systems.",
    dimension: "rag_retrieval",
    difficulty: "beginner",
    estimatedMinutes: 12,
    order: 1,
    content: `## What is a Transformer?

The transformer is a neural network architecture introduced in the 2017 paper *Attention Is All You Need*. It replaced recurrent neural networks (RNNs) as the dominant architecture for sequence modeling tasks like translation, summarization, and language modeling.

## The Self-Attention Mechanism

The core innovation is **self-attention**, which lets every token in a sequence directly attend to every other token. Unlike RNNs, which process tokens one at a time, transformers compute attention in parallel — making them much faster to train on modern GPUs.

Self-attention computes three vectors for each token: a Query, a Key, and a Value. The dot product of Queries and Keys produces attention weights, which determine how much each token should "look at" every other token when building its representation.

## Encoder and Decoder

Transformers can be configured in three ways:

- **Encoder-only** (e.g., BERT): Reads the full input sequence and produces contextual embeddings. Best for classification and understanding tasks.
- **Decoder-only** (e.g., GPT): Generates tokens autoregressively, each token attending only to previous ones. Best for text generation.
- **Encoder-decoder** (e.g., T5, BART): Uses an encoder to process the input and a decoder to generate the output. Best for translation and summarization.

## Why Transformers Beat RNNs

RNNs suffer from the vanishing gradient problem — information from early tokens is diluted by the time it reaches later tokens. Transformers solve this with direct attention connections between any two positions, regardless of distance.

The positional encoding (either fixed sinusoidal or learned) injects token position information since attention itself is order-agnostic.

## Scale and Modern LLMs

Transformers scale predictably with data and compute. GPT-4, Claude, and Gemini are all transformer-based decoder models with billions of parameters. The architecture has remained largely the same since 2017 — the gains have come from scale, data quality, and RLHF training.`,
    quizzes: [
      {
        question: "What is the core mechanism that makes transformers powerful?",
        choices: [
          { id: "a", label: "Recurrence", correct: false },
          { id: "b", label: "Self-attention", correct: true },
          { id: "c", label: "Convolution", correct: false },
          { id: "d", label: "Dropout", correct: false },
        ],
        order: 1,
      },
      {
        question: "Which architecture uses both encoder and decoder?",
        choices: [
          { id: "a", label: "GPT", correct: false },
          { id: "b", label: "BERT", correct: false },
          { id: "c", label: "T5", correct: true },
          { id: "d", label: "ResNet", correct: false },
        ],
        order: 2,
      },
      {
        question: "What does positional encoding do in a transformer?",
        choices: [
          { id: "a", label: "Encodes the token values into binary", correct: false },
          { id: "b", label: "Injects position information since attention is order-agnostic", correct: true },
          { id: "c", label: "Compresses the sequence length", correct: false },
          { id: "d", label: "Reduces the number of parameters", correct: false },
        ],
        order: 3,
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    slug: "prompt-engineering-basics",
    title: "Prompt Engineering Basics",
    description: "Learn the fundamental techniques for writing effective prompts for LLMs.",
    dimension: "rag_retrieval",
    difficulty: "beginner",
    estimatedMinutes: 10,
    order: 2,
    content: `## What is Prompt Engineering?

Prompt engineering is the practice of designing inputs to language models to elicit desired outputs. As LLMs become core infrastructure, the ability to communicate clearly with them is a foundational skill for AI engineers.

## Zero-Shot Prompting

A **zero-shot** prompt asks the model to perform a task with no examples. The model relies entirely on its pretraining knowledge:

\`\`\`
Classify the sentiment of this review: "The product broke after two days."
\`\`\`

## Few-Shot Prompting

**Few-shot** prompting provides one or more input/output examples before the actual query. This demonstrates the desired format and reasoning style:

\`\`\`
Review: "Amazing quality!" → Positive
Review: "Arrived damaged." → Negative
Review: "Works as expected." → ?
\`\`\`

## Chain-of-Thought (CoT) Prompting

For reasoning tasks, asking the model to **think step by step** significantly improves accuracy. Instead of asking for the final answer directly, you prompt the model to show its work:

\`\`\`
Q: If a train travels 60 mph for 2.5 hours, how far does it go?
A: Let's think step by step. Speed × time = distance. 60 × 2.5 = 150 miles.
\`\`\`

## System Prompts

Most production LLM APIs support a **system prompt** — a hidden instruction that shapes the model's persona, tone, and constraints for the entire conversation. System prompts are processed before user messages and are generally given higher weight.

## Temperature and Sampling

**Temperature** controls randomness. At temperature 0, the model always picks the most probable token (deterministic). At temperature 1, output is more varied and creative. For structured extraction tasks, use 0. For brainstorming, use 0.7–1.0.

## Practical Tips

- Be specific about output format (JSON, bullet points, one sentence).
- Constrain with negative instructions ("Do not include preamble").
- Test prompts against edge cases before deploying.`,
    quizzes: [
      {
        question: "What is chain-of-thought prompting?",
        choices: [
          { id: "a", label: "Asking the model to think step by step", correct: true },
          { id: "b", label: "Providing many examples", correct: false },
          { id: "c", label: "Reducing temperature", correct: false },
          { id: "d", label: "Using a system prompt", correct: false },
        ],
        order: 1,
      },
      {
        question: "Which technique gives the model examples in the prompt?",
        choices: [
          { id: "a", label: "Zero-shot", correct: false },
          { id: "b", label: "Few-shot", correct: true },
          { id: "c", label: "Fine-tuning", correct: false },
          { id: "d", label: "RLHF", correct: false },
        ],
        order: 2,
      },
      {
        question: "What does temperature control in LLM prompting?",
        choices: [
          { id: "a", label: "How fast the model processes text", correct: false },
          { id: "b", label: "How much the model is heated during training", correct: false },
          { id: "c", label: "The randomness of the output (0=deterministic, 1+=creative)", correct: true },
          { id: "d", label: "How many tokens the model can generate", correct: false },
        ],
        order: 3,
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    slug: "python-numpy-basics",
    title: "NumPy Fundamentals for ML",
    description: "Master the NumPy operations that underpin all of machine learning.",
    dimension: "python",
    difficulty: "beginner",
    estimatedMinutes: 15,
    order: 3,
    content: `## Why NumPy?

Python lists are convenient but slow for numerical computation. NumPy provides an **ndarray** — a contiguous block of typed memory — that supports vectorized operations executed in compiled C code. Every major ML library (PyTorch, TensorFlow, scikit-learn) is built on top of NumPy arrays or its conventions.

## Creating Arrays

\`\`\`python
import numpy as np

a = np.array([1, 2, 3])          # 1D array
b = np.zeros((3, 4))             # 3×4 matrix of zeros
c = np.arange(0, 10, 2)         # [0, 2, 4, 6, 8]
d = np.linspace(0, 1, 5)        # [0.0, 0.25, 0.5, 0.75, 1.0]
\`\`\`

## Vectorization vs. Loops

Python loops call interpreted bytecode on every iteration. NumPy operations run the same loop in C, which is 50–200x faster for large arrays:

\`\`\`python
# Slow: Python loop
result = [x * 2 for x in data]

# Fast: NumPy vectorization
result = np.array(data) * 2
\`\`\`

Rule: if you find yourself writing a \`for\` loop over array elements, there is almost always a vectorized NumPy equivalent.

## Broadcasting

**Broadcasting** lets NumPy automatically expand array dimensions to make shapes compatible for element-wise operations:

\`\`\`python
a = np.array([[1, 2, 3],
              [4, 5, 6]])   # shape (2, 3)
b = np.array([10, 20, 30]) # shape (3,)

a + b  # b is broadcast to (2, 3) — adds row-wise
\`\`\`

Broadcasting rules: dimensions are compared right-to-left; a dimension of 1 is stretched to match the other.

## Common Operations

| Operation | Code |
|---|---|
| Matrix multiply | \`A @ B\` |
| Element-wise multiply | \`A * B\` |
| Transpose | \`A.T\` |
| Reshape | \`A.reshape(rows, cols)\` |
| Axis sum | \`A.sum(axis=0)\` |
| Boolean mask | \`A[A > 0]\` |

## Practical Tips

- Always check \`.shape\` when debugging — shape mismatches are the #1 NumPy error.
- Prefer \`@\` over \`np.dot\` for readability.
- Use \`np.random.default_rng(seed)\` for reproducible random numbers.`,
    quizzes: [
      {
        question: "What is broadcasting in NumPy?",
        choices: [
          { id: "a", label: "Sending data over a network", correct: false },
          { id: "b", label: "Automatically expanding array dimensions for operations", correct: true },
          { id: "c", label: "Parallel processing", correct: false },
          { id: "d", label: "A type of loop", correct: false },
        ],
        order: 1,
      },
      {
        question: "Why is NumPy vectorization faster than Python loops?",
        choices: [
          { id: "a", label: "It uses multiple CPUs", correct: false },
          { id: "b", label: "It executes operations in compiled C code", correct: true },
          { id: "c", label: "It avoids memory allocation", correct: false },
          { id: "d", label: "It caches results", correct: false },
        ],
        order: 2,
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    slug: "vector-databases-and-embeddings",
    title: "Vector Databases & Embeddings",
    description: "Understand embeddings and how vector databases power semantic search and RAG systems.",
    dimension: "rag_retrieval",
    difficulty: "intermediate",
    estimatedMinutes: 14,
    order: 4,
    content: `## What is an Embedding?

An **embedding** is a dense numerical vector that represents a piece of text (or image, audio, etc.) in a high-dimensional space. The key property: semantically similar inputs produce vectors that are close together in that space.

For example, the sentences "How do I reverse a list in Python?" and "What's the Python way to flip a list?" will produce embeddings with a high cosine similarity, even though they share no words.

Embedding models like \`text-embedding-3-small\` (OpenAI), \`voyage-3\` (Voyage AI), or \`nomic-embed-text\` (open source) are trained specifically to produce these representations — they are distinct from generative models.

## Why Vector Search?

Traditional keyword search matches exact or stemmed words. Vector search matches *meaning*. This is critical for building AI systems that need to retrieve relevant context — even when users don't use the exact keywords present in your data.

The query \`"explain backpropagation"\` will surface a document about \`"how neural networks learn via gradient descent"\` because the embeddings are close, even though not a single word matches.

## How Vector Databases Work

A vector database stores embeddings alongside their source documents and provides an **approximate nearest-neighbour (ANN)** index — typically HNSW (Hierarchical Navigable Small World) — that can search millions of vectors in milliseconds.

Popular options:

| Database | Hosted? | Notes |
|---|---|---|
| Pinecone | Yes | Managed, easy to start |
| Weaviate | Self-host or cloud | GraphQL API, rich filtering |
| Qdrant | Self-host or cloud | Fast, Rust-based |
| pgvector | Postgres extension | Best if you're already on Postgres |
| Chroma | Self-host | Developer-friendly, good for prototyping |

For a production Next.js app already on Neon Postgres, **pgvector** is the zero-friction choice.

## Storing and Querying Embeddings

\`\`\`python
# Generate an embedding
import openai
client = openai.OpenAI()

response = client.embeddings.create(
    input="What is retrieval-augmented generation?",
    model="text-embedding-3-small",
)
vector = response.data[0].embedding  # list of 1536 floats

# Store in pgvector (Postgres)
# Column type: vector(1536)
cursor.execute(
    "INSERT INTO docs (content, embedding) VALUES (%s, %s)",
    (text, vector)
)

# Query: find 5 most similar docs
cursor.execute("""
    SELECT content, 1 - (embedding <=> %s::vector) AS similarity
    FROM docs
    ORDER BY embedding <=> %s::vector
    LIMIT 5
""", (vector, vector))
\`\`\`

The \`<=>\` operator is cosine distance in pgvector. Subtract from 1 to get cosine *similarity*.

## Chunking Strategy

You rarely embed an entire document. Instead you split it into **chunks** — typically 256–512 tokens with 10–20% overlap. Smaller chunks produce more precise retrieval; larger chunks provide more context per result. The right size depends on your document structure and query patterns.

## Practical Tips

- Normalize your text before embedding (lowercase, remove boilerplate) for consistent results.
- Store the embedding model name alongside the vector — if you switch models, existing vectors are incompatible.
- Re-embed your corpus when you upgrade the embedding model.
- For pgvector, create an \`ivfflat\` index once you have >10k rows to keep queries fast.`,
    quizzes: [
      {
        question: "What property makes embeddings useful for semantic search?",
        choices: [
          { id: "a", label: "They compress text to save storage", correct: false },
          { id: "b", label: "Semantically similar inputs produce vectors that are close in space", correct: true },
          { id: "c", label: "They enable exact keyword matching", correct: false },
          { id: "d", label: "They translate text to other languages", correct: false },
        ],
        order: 1,
      },
      {
        question: "Which pgvector operator computes cosine distance?",
        choices: [
          { id: "a", label: "<->", correct: false },
          { id: "b", label: "<#>", correct: false },
          { id: "c", label: "<=>", correct: true },
          { id: "d", label: "<+>", correct: false },
        ],
        order: 2,
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    slug: "building-a-rag-pipeline",
    title: "Building a RAG Pipeline",
    description: "Build a retrieval-augmented generation system from scratch — ingest, retrieve, and generate.",
    dimension: "rag_retrieval",
    difficulty: "intermediate",
    estimatedMinutes: 18,
    order: 5,
    content: `## What is RAG?

**Retrieval-Augmented Generation (RAG)** is an architecture that improves LLM answers by injecting relevant external context into the prompt at inference time. Instead of relying solely on the model's training data, you retrieve the most relevant documents from your own knowledge base and include them in the prompt.

RAG solves three problems:
1. **Hallucination** — the model answers from retrieved facts, not guesses.
2. **Knowledge cutoff** — your data is always current; the model's training data is not.
3. **Privacy** — sensitive data never leaves your infrastructure and is never in model training.

## The Two Phases

### Phase 1: Indexing (offline)

1. Load documents (PDFs, markdown, database rows, web pages).
2. Split into chunks (256–512 tokens with overlap).
3. Generate an embedding for each chunk.
4. Store (chunk text + embedding + metadata) in a vector database.

### Phase 2: Retrieval + Generation (online, per query)

1. Embed the user's query using the same embedding model.
2. Run an ANN search to find the top-k most similar chunks (k = 3–10).
3. Insert the retrieved chunks into the LLM prompt as context.
4. Generate the final answer.

## A Minimal Pipeline in Python

\`\`\`python
import openai

client = openai.OpenAI()

def embed(text: str) -> list[float]:
    res = client.embeddings.create(input=text, model="text-embedding-3-small")
    return res.data[0].embedding

def retrieve(query: str, db_cursor, k: int = 5) -> list[str]:
    q_vec = embed(query)
    db_cursor.execute("""
        SELECT content FROM docs
        ORDER BY embedding <=> %s::vector
        LIMIT %s
    """, (q_vec, k))
    return [row[0] for row in db_cursor.fetchall()]

def answer(query: str, db_cursor) -> str:
    chunks = retrieve(query, db_cursor)
    context = "\\n\\n".join(chunks)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": f"Answer using only the context below.\\n\\n{context}"},
            {"role": "user", "content": query},
        ],
    )
    return response.choices[0].message.content
\`\`\`

## Improving Retrieval Quality

**Hybrid search** — combine vector search (semantic) with BM25 keyword search, then re-rank with a cross-encoder. This outperforms either approach alone.

**Re-ranking** — after retrieving top-20 candidates, pass them through a cross-encoder re-ranker (e.g., Cohere Rerank, BGE-Reranker) to re-order by relevance. Return only the top 5.

**Metadata filtering** — add \`WHERE\` clauses to narrow the search space before computing distances. For example: \`WHERE doc_type = 'api_reference'\` before ranking by vector similarity.

**Query rewriting** — use an LLM to rewrite the user's query into a more retrieval-friendly form before embedding. Especially useful for conversational queries that reference prior context ("what about the other method?").

## Evaluating RAG

The three metrics that matter most:
- **Context recall**: were the correct chunks retrieved?
- **Faithfulness**: did the generated answer stay within the retrieved context?
- **Answer relevance**: did the answer actually address the question?

Tools like RAGAS (open source) automate these evaluations using an LLM as a judge.

## Common Failure Modes

| Problem | Cause | Fix |
|---|---|---|
| Retrieved wrong chunks | Poor chunking | Smaller chunks, add overlap |
| Answer contradicts context | Model ignores context | Stronger system prompt, reduce temperature |
| Slow retrieval at scale | No ANN index | Add ivfflat or HNSW index |
| Stale answers | Corpus not updated | Re-index on document change events |`,
    quizzes: [
      {
        question: "What is the primary problem RAG solves compared to a plain LLM?",
        choices: [
          { id: "a", label: "It makes the model faster", correct: false },
          { id: "b", label: "It grounds answers in retrieved facts, reducing hallucination", correct: true },
          { id: "c", label: "It removes the need for a prompt", correct: false },
          { id: "d", label: "It fine-tunes the model on your data", correct: false },
        ],
        order: 1,
      },
      {
        question: "In the retrieval phase, what is the first step?",
        choices: [
          { id: "a", label: "Generate the final answer", correct: false },
          { id: "b", label: "Insert context into the prompt", correct: false },
          { id: "c", label: "Embed the user query using the same model used for indexing", correct: true },
          { id: "d", label: "Re-rank the results", correct: false },
        ],
        order: 2,
      },
    ],
  },
  // ─── python ───────────────────────────────────────────────────
  {
    id: crypto.randomUUID(),
    slug: "python-pandas-essentials",
    title: "Pandas Essentials for Data Work",
    description: "Master the DataFrame operations every ML engineer uses daily.",
    dimension: "python",
    difficulty: "beginner",
    estimatedMinutes: 14,
    order: 6,
    content: `## Why Pandas?

Pandas is the standard library for structured data in Python. Before any model training, you'll spend significant time loading, cleaning, and transforming tabular data — that's where pandas excels.

## DataFrames and Series

\`\`\`python
import pandas as pd

df = pd.read_csv("data.csv")
print(df.shape)          # (rows, cols)
print(df.dtypes)         # column types
print(df.head(3))        # first 3 rows
print(df.describe())     # count, mean, std, percentiles
\`\`\`

A **DataFrame** is a 2D table; a **Series** is a single column. Most operations return a new DataFrame (immutable by default).

## Selection

\`\`\`python
df["age"]                    # single column → Series
df[["age", "salary"]]        # multiple columns → DataFrame
df.iloc[0]                   # first row by integer position
df.loc[df["age"] > 30]       # rows where age > 30
df.loc[df["city"] == "NYC", "salary"]  # column of filtered rows
\`\`\`

Prefer \`.loc\` (label-based) over \`.iloc\` (position-based) when the label is meaningful.

## Cleaning

\`\`\`python
df.isnull().sum()               # count NaN per column
df.dropna(subset=["salary"])    # drop rows with NaN salary
df["age"].fillna(df["age"].median(), inplace=True)
df.drop_duplicates(inplace=True)
df["city"] = df["city"].str.strip().str.lower()
\`\`\`

## Grouping and Aggregation

\`\`\`python
# Average salary by department
df.groupby("department")["salary"].mean()

# Multiple aggregations
df.groupby("department").agg(
    avg_salary=("salary", "mean"),
    headcount=("id", "count"),
)
\`\`\`

## Merging

\`\`\`python
# Left join on user_id
merged = pd.merge(orders, users, on="user_id", how="left")
\`\`\`

## Practical Tips

- \`df.copy()\` before mutating to avoid the SettingWithCopyWarning.
- \`df.astype({"col": "int32"})\` to reduce memory on large datasets.
- \`pd.read_csv(..., usecols=[...])\` loads only the columns you need.
- For datasets >1M rows, profile with \`df.memory_usage(deep=True)\` and switch to chunked reading or Polars.`,
    quizzes: [
      {
        question: "Which pandas method selects rows by a boolean condition?",
        choices: [
          { id: "a", label: ".iloc with a mask", correct: false },
          { id: "b", label: ".loc with a boolean Series", correct: true },
          { id: "c", label: ".select()", correct: false },
          { id: "d", label: ".where() only", correct: false },
        ],
        order: 1,
      },
      {
        question: "What does df.groupby('dept')['salary'].mean() return?",
        choices: [
          { id: "a", label: "The mean salary for each department as a Series", correct: true },
          { id: "b", label: "A single float — the overall mean salary", correct: false },
          { id: "c", label: "A DataFrame with all salary rows grouped", correct: false },
          { id: "d", label: "An error — you must call .agg() instead", correct: false },
        ],
        order: 2,
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    slug: "python-generators-and-iterators",
    title: "Generators & Iterators for Large Data",
    description: "Process datasets that don't fit in memory using Python's lazy evaluation model.",
    dimension: "python",
    difficulty: "intermediate",
    estimatedMinutes: 12,
    order: 7,
    content: `## The Memory Problem

Loading a 10GB CSV into a list puts the entire thing in RAM before you process a single row. Generators let you process one item at a time — constant memory regardless of dataset size.

## Iterators vs. Iterables

An **iterable** is anything you can loop over (\`list\`, \`str\`, \`dict\`). An **iterator** is an object that produces values lazily via \`__next__()\`. When you call \`iter()\` on an iterable, you get an iterator.

## Generator Functions

Replace \`return\` with \`yield\` to turn a function into a generator:

\`\`\`python
def read_chunks(filepath, chunksize=10_000):
    import pandas as pd
    for chunk in pd.read_csv(filepath, chunksize=chunksize):
        yield chunk

for chunk in read_chunks("big.csv"):
    process(chunk)   # only one chunk in memory at a time
\`\`\`

The function body does not execute until you iterate. Each \`yield\` suspends the function and passes the value to the caller.

## Generator Expressions

Like list comprehensions, but lazy:

\`\`\`python
# List comprehension — all squares in memory at once
squares = [x**2 for x in range(1_000_000)]

# Generator — produces one square at a time
squares_gen = (x**2 for x in range(1_000_000))

# Compose for efficient pipelines
total = sum(x**2 for x in range(1_000_000))  # no intermediate list
\`\`\`

## Chaining Generators

\`\`\`python
def normalize(records):
    for r in records:
        yield {k: v.strip() if isinstance(v, str) else v for k, v in r.items()}

def filter_valid(records):
    for r in records:
        if r.get("age") and r["age"] > 0:
            yield r

# Pipeline: file → normalize → filter → process
pipeline = filter_valid(normalize(read_chunks("data.csv")))
for batch in pipeline:
    model.train(batch)
\`\`\`

Each stage pulls from the previous only when needed. Data flows through the pipeline row by row.

## When NOT to Use Generators

- When you need random access (indexing by position).
- When you need to iterate multiple times — generators are consumed once.
- When the dataset fits comfortably in memory — list comprehensions are simpler.

## Practical Tip

Use \`itertools.islice(generator, n)\` to peek at the first \`n\` items from a generator without consuming it.`,
    quizzes: [
      {
        question: "What is the key advantage of a generator over a list?",
        choices: [
          { id: "a", label: "Generators are faster to index", correct: false },
          { id: "b", label: "Generators produce values lazily, using constant memory", correct: true },
          { id: "c", label: "Generators can be iterated multiple times", correct: false },
          { id: "d", label: "Generators support slicing", correct: false },
        ],
        order: 1,
      },
      {
        question: "What keyword turns a function into a generator?",
        choices: [
          { id: "a", label: "async", correct: false },
          { id: "b", label: "return", correct: false },
          { id: "c", label: "yield", correct: true },
          { id: "d", label: "generate", correct: false },
        ],
        order: 2,
      },
    ],
  },

  // ─── ml_basics ────────────────────────────────────────────────
  {
    id: crypto.randomUUID(),
    slug: "supervised-vs-unsupervised-learning",
    title: "Supervised vs. Unsupervised Learning",
    description: "Understand the two fundamental paradigms of machine learning and when to apply each.",
    dimension: "llm_fundamentals_evals",
    difficulty: "beginner",
    estimatedMinutes: 12,
    order: 8,
    content: `## The Core Distinction

In **supervised learning**, every training example has a label — the correct output. The model learns a mapping from inputs to outputs and is evaluated on how accurately it predicts labels on unseen data.

In **unsupervised learning**, there are no labels. The model finds structure, patterns, or groupings in the data without being told what to look for.

## Supervised Learning

Two main task types:

**Classification** — the output is a category:
- Is this email spam or not? (binary)
- Which digit is in this image? (multi-class)
- What objects are in this photo? (multi-label)

Common algorithms: logistic regression, decision trees, random forests, SVMs, neural networks.

**Regression** — the output is a continuous number:
- What will this house sell for?
- How many units will we sell next month?

Common algorithms: linear regression, gradient boosting (XGBoost, LightGBM), neural networks.

## Unsupervised Learning

**Clustering** — group similar examples together without labels:
- K-means: assigns each point to the nearest of k centroids. Fast but assumes spherical clusters.
- DBSCAN: density-based; handles irregular shapes and identifies outliers as noise.
- Hierarchical clustering: builds a tree of clusters (dendogram); you choose cut level after the fact.

**Dimensionality Reduction** — compress high-dimensional data while preserving structure:
- PCA (Principal Component Analysis): linear projection onto directions of maximum variance.
- t-SNE / UMAP: non-linear; excellent for 2D/3D visualization of embeddings.

**Anomaly Detection** — identify unusual examples:
- Isolation Forest, Autoencoders, One-class SVM.

## Semi-Supervised and Self-Supervised

Real-world data is rarely fully labelled. **Semi-supervised** learning uses a small labelled set plus a large unlabelled set. **Self-supervised** learning (used in LLM pretraining) creates labels automatically from the data itself — e.g., "predict the next token."

## Choosing the Right Paradigm

| Scenario | Paradigm |
|---|---|
| You have labelled historical outcomes | Supervised |
| You want to discover natural groupings | Unsupervised (clustering) |
| You want to visualize high-dimensional data | Unsupervised (dim. reduction) |
| Labels are rare; unlabelled data is plentiful | Semi-supervised |
| You're pretraining a foundation model | Self-supervised |`,
    quizzes: [
      {
        question: "What distinguishes supervised from unsupervised learning?",
        choices: [
          { id: "a", label: "Supervised learning uses more data", correct: false },
          { id: "b", label: "Supervised learning trains on labelled examples; unsupervised does not", correct: true },
          { id: "c", label: "Unsupervised learning requires a GPU", correct: false },
          { id: "d", label: "Supervised learning can only do classification", correct: false },
        ],
        order: 1,
      },
      {
        question: "Which algorithm is commonly used for clustering?",
        choices: [
          { id: "a", label: "Logistic regression", correct: false },
          { id: "b", label: "PCA", correct: false },
          { id: "c", label: "K-means", correct: true },
          { id: "d", label: "Linear regression", correct: false },
        ],
        order: 2,
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    slug: "bias-variance-tradeoff",
    title: "The Bias-Variance Tradeoff",
    description: "Diagnose underfitting and overfitting and choose the right regularization strategy.",
    dimension: "llm_fundamentals_evals",
    difficulty: "intermediate",
    estimatedMinutes: 13,
    order: 9,
    content: `## Total Prediction Error

The expected prediction error of a model decomposes into three parts:

**Error = Bias² + Variance + Irreducible Noise**

- **Bias** — error from wrong assumptions in the model. A linear model fitted to non-linear data has high bias.
- **Variance** — sensitivity to fluctuations in the training data. A model that memorises the training set has high variance.
- **Irreducible noise** — randomness in the data you cannot remove regardless of the model.

## Underfitting (High Bias)

The model is too simple: it misses the true structure.

Symptoms:
- High training error
- Training and validation errors are similar (both high)

Fixes:
- Use a more expressive model (deeper network, higher-degree polynomial)
- Add more relevant features
- Reduce regularization strength

## Overfitting (High Variance)

The model is too complex: it memorises the training set and fails to generalise.

Symptoms:
- Low training error
- High validation error (large gap between train and val)

Fixes:
- Regularization (L1, L2, dropout)
- More training data
- Data augmentation
- Early stopping
- Simpler model / fewer features

## Regularization Techniques

**L2 (Ridge)** — adds λΣwᵢ² to the loss. Shrinks weights toward zero uniformly. Rarely sets weights to exactly zero.

**L1 (Lasso)** — adds λΣ|wᵢ| to the loss. Can set weights exactly to zero, producing sparse models. Useful for feature selection.

**Elastic Net** — combination of L1 and L2. Balances sparsity and smooth shrinkage.

**Dropout** — randomly zeros out neurons during training. Prevents co-adaptation; acts as ensemble of many subnetworks.

**Early stopping** — halt training when validation loss stops improving. Avoids overfitting by limiting the number of training iterations.

## The Learning Curve

Plot training and validation error vs. training set size:

- Both curves high and close → high bias → need more capacity.
- Large gap (low train, high val) → high variance → need more data or regularization.
- Both low and close → good fit — you're done.

## Practical Heuristic

Start with the simplest model that could work. Add complexity only when learning curves show high bias. Regularize when you see a train/val gap. Always track both metrics together.`,
    quizzes: [
      {
        question: "A model has low training error but high validation error. What is the most likely diagnosis?",
        choices: [
          { id: "a", label: "High bias (underfitting)", correct: false },
          { id: "b", label: "High variance (overfitting)", correct: true },
          { id: "c", label: "Irreducible noise", correct: false },
          { id: "d", label: "The learning rate is too high", correct: false },
        ],
        order: 1,
      },
      {
        question: "Which regularization technique can set weights exactly to zero?",
        choices: [
          { id: "a", label: "L2 (Ridge)", correct: false },
          { id: "b", label: "Dropout", correct: false },
          { id: "c", label: "L1 (Lasso)", correct: true },
          { id: "d", label: "Early stopping", correct: false },
        ],
        order: 2,
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    slug: "ml-evaluation-metrics",
    title: "Evaluation Metrics for ML Models",
    description: "Choose the right metric for your task — accuracy is almost never enough.",
    dimension: "llm_fundamentals_evals",
    difficulty: "intermediate",
    estimatedMinutes: 14,
    order: 10,
    content: `## Why Accuracy Fails

On a dataset where 99% of samples belong to class A, a model that always predicts A achieves 99% accuracy — while being completely useless. Accuracy hides class imbalance. Understanding the confusion matrix unlocks the metrics that actually matter.

## The Confusion Matrix

For binary classification (positive vs. negative):

| | Predicted Positive | Predicted Negative |
|---|---|---|
| **Actual Positive** | TP (true positive) | FN (false negative) |
| **Actual Negative** | FP (false positive) | TN (true negative) |

## Precision and Recall

**Precision** = TP / (TP + FP) — of everything the model called positive, what fraction was actually positive? Optimise when false positives are costly (e.g., spam filter — don't block legitimate email).

**Recall (Sensitivity)** = TP / (TP + FN) — of all actual positives, what fraction did the model catch? Optimise when false negatives are costly (e.g., cancer screening — don't miss sick patients).

They trade off against each other. A classifier that calls everything positive has perfect recall but terrible precision.

## F1 Score

The harmonic mean of precision and recall:

F1 = 2 × (Precision × Recall) / (Precision + Recall)

Harmonic mean penalises extreme imbalance: a model with precision=1.0 and recall=0.01 gets F1=0.02 — not 0.5.

Use F1 when you need to balance both and neither false positives nor false negatives clearly dominate.

## ROC-AUC

The **ROC curve** plots True Positive Rate (recall) vs. False Positive Rate at every classification threshold. **AUC** (Area Under the Curve) summarises this in a single number: 0.5 is random chance; 1.0 is perfect.

AUC measures ranking quality — how well the model separates classes regardless of the threshold you choose. Useful when the operating point (threshold) isn't fixed.

## For Regression

| Metric | Formula | When |
|---|---|---|
| MAE | mean(|y - ŷ|) | Robust to outliers |
| MSE | mean((y - ŷ)²) | Penalises large errors heavily |
| RMSE | √MSE | Same units as target |
| R² | 1 - SS_res/SS_tot | Fraction of variance explained |

## Metric Selection Guide

| Task | Recommended Metric |
|---|---|
| Balanced classification | Accuracy or F1 |
| Imbalanced classification | F1, PR-AUC |
| Ranking / scoring | ROC-AUC |
| Medical / safety-critical | Recall (minimise FN) |
| Spam / fraud detection | Precision (minimise FP) |
| Regression | RMSE or MAE depending on outlier sensitivity |`,
    quizzes: [
      {
        question: "A cancer screening model should optimise for which metric?",
        choices: [
          { id: "a", label: "Precision — minimise false positives", correct: false },
          { id: "b", label: "Recall — minimise false negatives", correct: true },
          { id: "c", label: "Accuracy", correct: false },
          { id: "d", label: "AUC — it's always the best metric", correct: false },
        ],
        order: 1,
      },
      {
        question: "Why does F1 score use the harmonic mean instead of the arithmetic mean?",
        choices: [
          { id: "a", label: "It's easier to compute", correct: false },
          { id: "b", label: "It penalises extreme imbalances between precision and recall", correct: true },
          { id: "c", label: "It matches the scale of accuracy", correct: false },
          { id: "d", label: "It handles multi-class problems automatically", correct: false },
        ],
        order: 2,
      },
    ],
  },

  // ─── deep_learning ────────────────────────────────────────────
  {
    id: crypto.randomUUID(),
    slug: "backpropagation-and-gradient-descent",
    title: "Backpropagation & Gradient Descent",
    description: "Understand exactly how neural networks learn — from loss to weight update.",
    dimension: "context_engineering",
    difficulty: "intermediate",
    estimatedMinutes: 15,
    order: 11,
    content: `## The Goal

A neural network is a function with millions of parameters (weights). Training means finding the parameter values that minimise the loss — the gap between predictions and ground truth. We do this by repeatedly adjusting weights in the direction that reduces the loss.

## Loss Functions

The loss quantifies prediction error:

- **Cross-entropy** for classification: −Σ yᵢ log(ŷᵢ). Penalises confident wrong predictions heavily.
- **Mean Squared Error** for regression: (y − ŷ)² / n.

## Gradient Descent

The gradient of the loss with respect to each weight tells us: "if I increase this weight, does the loss go up or down?"

\`\`\`
weight ← weight − learning_rate × ∂Loss/∂weight
\`\`\`

We move weights *against* the gradient (downhill). The learning rate controls step size.

**Batch gradient descent** — compute gradient on the entire dataset. Stable but slow for large datasets.
**Stochastic gradient descent (SGD)** — update on one sample at a time. Fast but noisy.
**Mini-batch SGD** — update on batches of 32–512 samples. The standard; balances speed and stability.

## Backpropagation

Computing the gradient analytically via the chain rule:

\`\`\`
∂Loss/∂w₁ = (∂Loss/∂output) × (∂output/∂w₁)
\`\`\`

Backprop propagates the gradient from the loss backwards through each layer using this chain rule. Modern frameworks (PyTorch, JAX) compute this automatically via **autograd** — you never implement it by hand.

\`\`\`python
import torch
import torch.nn as nn

model = nn.Linear(10, 1)
loss_fn = nn.MSELoss()

pred = model(x)
loss = loss_fn(pred, y)

loss.backward()       # backprop: compute all gradients
optimizer.step()      # update weights
optimizer.zero_grad() # clear gradients for next iteration
\`\`\`

## Optimisers Beyond SGD

**Momentum** — accumulates a velocity vector in the direction of persistent gradients. Helps escape shallow local minima.

**Adam** — combines momentum with adaptive per-parameter learning rates. Default choice for most deep learning tasks.

**AdamW** — Adam with decoupled weight decay. Preferred for transformers.

## Common Training Problems

| Symptom | Likely Cause | Fix |
|---|---|---|
| Loss doesn't decrease | Learning rate too low | Increase lr |
| Loss diverges | Learning rate too high | Decrease lr or use scheduler |
| Loss decreases then stalls | Local minimum or dying ReLU | LR schedule, different init |
| NaN loss | Exploding gradients | Gradient clipping |

## Learning Rate Schedules

Warm-up then decay is the standard recipe for transformers: start low, ramp up over ~4% of training steps, then decay (cosine or linear). This prevents early instability while ensuring convergence.`,
    quizzes: [
      {
        question: "What does the gradient of the loss tell you?",
        choices: [
          { id: "a", label: "The current accuracy of the model", correct: false },
          { id: "b", label: "The direction and magnitude to adjust each weight to reduce the loss", correct: true },
          { id: "c", label: "The optimal learning rate", correct: false },
          { id: "d", label: "The number of training steps remaining", correct: false },
        ],
        order: 1,
      },
      {
        question: "Why is Adam preferred over vanilla SGD for most deep learning tasks?",
        choices: [
          { id: "a", label: "Adam uses less memory", correct: false },
          { id: "b", label: "Adam adapts the learning rate per parameter and uses momentum", correct: true },
          { id: "c", label: "Adam avoids the need for backpropagation", correct: false },
          { id: "d", label: "Adam only works for classification", correct: false },
        ],
        order: 2,
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    slug: "fine-tuning-vs-rag",
    title: "Fine-tuning vs. RAG: When to Use Each",
    description: "Make the right architectural choice between fine-tuning and retrieval-augmented generation.",
    dimension: "rag_retrieval",
    difficulty: "intermediate",
    estimatedMinutes: 13,
    order: 12,
    content: `## Two Ways to Customise an LLM

When a base model doesn't behave exactly how you need, there are two primary strategies: fine-tuning and RAG. They solve different problems. Using the wrong one is a common and expensive mistake.

## Fine-tuning

Fine-tuning continues training a pretrained model on your specific data. The model's weights are updated to better match your task.

**When it's the right choice:**
- You need the model to adopt a specific style, tone, or output format consistently.
- Your task is well-defined and data is readily available (thousands of examples).
- Latency is critical and you can't afford per-request retrieval.
- The knowledge is stable and doesn't change frequently.

**When it fails:**
- Your knowledge base updates regularly — fine-tuning is expensive to redo.
- You need the model to cite specific documents or show provenance.
- You have fewer than ~500 high-quality examples — you'll likely overfit.

**Approaches:** Full fine-tuning, LoRA (Low-Rank Adaptation), QLoRA. LoRA is the standard — it trains only a small set of adapter matrices, reducing compute by 10–100x.

## RAG

RAG keeps the model frozen and injects retrieved context at inference time.

**When it's the right choice:**
- Your knowledge changes frequently (product docs, news, internal wikis).
- You need attribution — users can see exactly which document was cited.
- You have a large, diverse corpus that can't fit in fine-tuning data.
- You want to update the knowledge base without retraining.

**When it fails:**
- The model needs to deeply understand domain-specific reasoning patterns, not just facts.
- Retrieval latency is unacceptable for the use case.
- The corpus is poorly structured or documents are too long to chunk well.

## Combining Both

Production systems often use both together:

1. Fine-tune the model on domain-specific format and reasoning style.
2. Use RAG to inject up-to-date facts at inference time.

Example: A legal assistant fine-tuned to produce precise, formal responses, with RAG pulling the current case law for each query.

## Decision Framework

| Question | RAG | Fine-tune |
|---|---|---|
| Knowledge changes frequently? | ✓ | ✗ |
| Need citations / provenance? | ✓ | ✗ |
| Need consistent output format? | ✗ | ✓ |
| Large labelled dataset available? | ✗ | ✓ |
| Latency budget: < 200ms? | ✗ | ✓ |
| Budget for retraining? | ✗ | ✓ |

When in doubt, start with RAG — it's faster to iterate, reversible, and doesn't require labelled data.`,
    quizzes: [
      {
        question: "When is fine-tuning a better choice than RAG?",
        choices: [
          { id: "a", label: "When the knowledge base changes daily", correct: false },
          { id: "b", label: "When you need to teach the model a consistent output format or reasoning style", correct: true },
          { id: "c", label: "When you need document-level attribution", correct: false },
          { id: "d", label: "When you have fewer than 50 training examples", correct: false },
        ],
        order: 1,
      },
      {
        question: "What is LoRA?",
        choices: [
          { id: "a", label: "A retrieval algorithm for vector databases", correct: false },
          { id: "b", label: "A parameter-efficient fine-tuning method using low-rank adapter matrices", correct: true },
          { id: "c", label: "A loss function for sequence classification", correct: false },
          { id: "d", label: "A method for compressing embedding vectors", correct: false },
        ],
        order: 2,
      },
    ],
  },

  // ─── mlops ────────────────────────────────────────────────────
  {
    id: crypto.randomUUID(),
    slug: "ml-experiment-tracking",
    title: "ML Experiment Tracking",
    description: "Track experiments reproducibly so you can compare runs, share results, and never lose a good model.",
    dimension: "agentic_systems",
    difficulty: "beginner",
    estimatedMinutes: 12,
    order: 13,
    content: `## The Problem

ML development is inherently iterative. You run dozens of experiments — different architectures, hyperparameters, datasets, preprocessing steps. Without tracking, you lose which configuration produced your best model. Notebooks and print statements don't scale.

## What to Track

For each training run, capture:
- **Parameters**: learning rate, batch size, model architecture, regularisation
- **Metrics**: loss, accuracy, precision/recall at each epoch
- **Artifacts**: saved model weights, confusion matrices, sample predictions
- **Environment**: library versions, random seed, git commit hash

## MLflow

MLflow is the most widely used open-source tracking tool.

\`\`\`python
import mlflow
import mlflow.pytorch

mlflow.set_experiment("resnet-classifier")

with mlflow.start_run(run_name="lr-0.001-wd-0.01"):
    mlflow.log_params({
        "learning_rate": 0.001,
        "weight_decay": 0.01,
        "batch_size": 64,
        "epochs": 20,
    })

    for epoch in range(epochs):
        train_loss = train_one_epoch(model, loader)
        val_acc = evaluate(model, val_loader)

        mlflow.log_metrics({
            "train_loss": train_loss,
            "val_accuracy": val_acc,
        }, step=epoch)

    mlflow.pytorch.log_model(model, "model")
\`\`\`

Run \`mlflow ui\` to compare runs in a browser.

## Weights & Biases (W&B)

W&B is the cloud-hosted alternative — more polished UI, better collaboration features, free tier available.

\`\`\`python
import wandb

wandb.init(project="resnet-classifier", config={
    "lr": 0.001,
    "batch_size": 64,
})

for epoch in range(epochs):
    wandb.log({"train_loss": loss, "val_acc": acc})

wandb.finish()
\`\`\`

## Reproducibility

Tracking metrics is not enough. A run is truly reproducible only if you also capture:

\`\`\`python
import random, numpy as np, torch

def seed_everything(seed=42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
\`\`\`

Pin library versions (\`pip freeze > requirements.txt\`), record the git commit, and log the data checksum.

## Hyperparameter Search

Once you have tracking, add a hyperparameter search loop:

\`\`\`python
from itertools import product

for lr, wd in product([1e-3, 1e-4], [0.0, 0.01]):
    with mlflow.start_run():
        mlflow.log_params({"lr": lr, "wd": wd})
        val_acc = train_and_eval(lr=lr, weight_decay=wd)
        mlflow.log_metric("val_accuracy", val_acc)
\`\`\`

For larger searches, use Optuna (Bayesian optimisation) to focus on promising regions.`,
    quizzes: [
      {
        question: "What should you log per training run to make an experiment reproducible?",
        choices: [
          { id: "a", label: "Only the final validation accuracy", correct: false },
          { id: "b", label: "Parameters, metrics, artifacts, and environment (seed, versions, git commit)", correct: true },
          { id: "c", label: "The model architecture diagram", correct: false },
          { id: "d", label: "The training time only", correct: false },
        ],
        order: 1,
      },
      {
        question: "Which tool is the most widely used open-source option for ML experiment tracking?",
        choices: [
          { id: "a", label: "Weights & Biases", correct: false },
          { id: "b", label: "TensorBoard", correct: false },
          { id: "c", label: "MLflow", correct: true },
          { id: "d", label: "Comet", correct: false },
        ],
        order: 2,
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    slug: "model-serving-patterns",
    title: "Model Serving Patterns",
    description: "Deploy ML models as reliable APIs — REST, batch, and streaming patterns compared.",
    dimension: "agentic_systems",
    difficulty: "intermediate",
    estimatedMinutes: 14,
    order: 14,
    content: `## Three Deployment Patterns

### 1. Online Serving (REST API)

A model wrapped in an HTTP endpoint that returns predictions in real time.

\`\`\`python
# FastAPI example
from fastapi import FastAPI
from pydantic import BaseModel
import torch

app = FastAPI()
model = load_model("model.pt")
model.eval()

class Request(BaseModel):
    text: str

@app.post("/predict")
def predict(req: Request):
    with torch.no_grad():
        embedding = embed(req.text)
        score = model(embedding).item()
    return {"score": score}
\`\`\`

**Use when**: latency matters, predictions are needed one-at-a-time (user-facing apps, real-time fraud detection).

**Gotchas**: model loading time on cold start (pre-load at startup); GPU contention under high concurrency (batching middleware).

### 2. Batch Inference

Run predictions on a large dataset offline, store results in a database.

\`\`\`python
# Nightly batch job
import pandas as pd

df = pd.read_sql("SELECT id, text FROM users", conn)
df["score"] = model.predict(df["text"].tolist())
df[["id", "score"]].to_sql("user_scores", conn, if_exists="replace")
\`\`\`

**Use when**: predictions are pre-computed (recommendation systems, churn scores, search rankings), high throughput is more important than latency.

### 3. Streaming Inference

Predictions triggered by events in a message queue (Kafka, SQS).

**Use when**: you want near-real-time predictions at scale without blocking the caller (IoT sensors, clickstream processing).

## Model Format Choices

| Format | Framework | Portability |
|---|---|---|
| PyTorch \`.pt\` | PyTorch only | Low |
| TorchScript | PyTorch → C++ | Medium |
| ONNX | Any → runtime | High |
| TensorRT | NVIDIA GPU only | Low, but fastest |

For CPU inference in production, convert to ONNX and run via ONNX Runtime — it's 2–5x faster than PyTorch's eager mode.

## Canary Deployments

Never replace a production model wholesale. Route 5% of traffic to the new model, compare metrics against the old one, and gradually increase if metrics hold:

\`\`\`
v1 (95% traffic) → stable model
v2 (5% traffic)  → candidate model — monitoring p99 latency + accuracy
\`\`\`

Shadow mode first if you can: route all traffic to v1, but also run v2 and log its predictions without serving them to users.

## Monitoring

Track in production:
- **Data drift** — are inputs shifting from the training distribution?
- **Prediction drift** — is the output distribution changing?
- **Latency p50/p99** — is the model slowing down?
- **Error rate** — are predictions degrading on labelled ground-truth (if available)?`,
    quizzes: [
      {
        question: "When is batch inference preferred over online serving?",
        choices: [
          { id: "a", label: "When user-facing latency is critical", correct: false },
          { id: "b", label: "When predictions are pre-computed and high throughput matters more than latency", correct: true },
          { id: "c", label: "When predictions change every millisecond", correct: false },
          { id: "d", label: "When you need to serve fewer than 10 requests per second", correct: false },
        ],
        order: 1,
      },
      {
        question: "What is the purpose of a canary deployment?",
        choices: [
          { id: "a", label: "To monitor data drift in training data", correct: false },
          { id: "b", label: "To route a small percentage of traffic to a new model before full rollout", correct: true },
          { id: "c", label: "To run batch inference in parallel", correct: false },
          { id: "d", label: "To convert models to ONNX format", correct: false },
        ],
        order: 2,
      },
    ],
  },

  // ─── system_design ────────────────────────────────────────────
  {
    id: crypto.randomUUID(),
    slug: "cap-theorem-and-distributed-systems",
    title: "CAP Theorem & Distributed Systems Trade-offs",
    description: "Understand the fundamental constraints of distributed systems and make principled consistency choices.",
    dimension: "system_design",
    difficulty: "intermediate",
    estimatedMinutes: 14,
    order: 15,
    content: `## The CAP Theorem

A distributed data store can provide at most **two** of the following three guarantees simultaneously:

- **Consistency (C)** — every read returns the most recent write (or an error).
- **Availability (A)** — every request receives a non-error response (no guarantee it's the latest data).
- **Partition tolerance (P)** — the system continues to operate despite network partitions between nodes.

Because network partitions are unavoidable in any real distributed system, you always have P. The real choice is **C vs. A** when a partition occurs.

## CP Systems (Consistency over Availability)

During a partition, the system refuses to answer rather than risk returning stale data.

**Examples**: HBase, Zookeeper, CockroachDB (default).

**Use when**: correctness is non-negotiable — financial transactions, inventory (you can't oversell), leader election.

## AP Systems (Availability over Consistency)

During a partition, the system returns its best available data, which may be stale. After the partition heals, nodes **eventually** converge (eventual consistency).

**Examples**: Cassandra, DynamoDB, CouchDB.

**Use when**: availability matters more than absolute correctness — social feeds, product recommendations, shopping carts (minor stale reads are acceptable).

## Consistency Models

From strongest to weakest:

1. **Linearisability** — reads always reflect the last acknowledged write, globally ordered. Most expensive.
2. **Sequential consistency** — operations happen in a consistent global order, but reads may lag slightly.
3. **Causal consistency** — operations related by cause-and-effect are ordered correctly; unrelated operations may be concurrent.
4. **Eventual consistency** — if writes stop, all replicas will converge. No guarantee on when.

## Practical Trade-offs

| Scenario | Recommended model |
|---|---|
| Bank account balance | Linearisability (CP) |
| User profile updates | Causal consistency |
| Unread notification count | Eventual consistency (AP) |
| Shopping cart | Eventual consistency (AP) |
| Distributed lock | Linearisability (CP) |

## PACELC Extension

CAP only covers partition scenarios. PACELC adds: *else* (when no partition), there's a latency (L) vs. consistency (C) trade-off.

Every replication scheme adds latency to achieve consistency. DynamoDB lets you choose: strong consistency (1 node, low latency) or eventual consistency (quorum, higher latency but more durable).

## Key Insight

Don't design systems as "consistent" or "available" monolithically. Most production systems use **different consistency levels per operation**:
- Write user preferences → eventual consistency is fine.
- Process a payment → require linearisability.
- Read a social timeline → eventual consistency + client-side cache.`,
    quizzes: [
      {
        question: "Why is 'partition tolerance' almost always required in distributed systems?",
        choices: [
          { id: "a", label: "It improves read latency", correct: false },
          { id: "b", label: "Network partitions are unavoidable in any real distributed deployment", correct: true },
          { id: "c", label: "It's required by cloud providers", correct: false },
          { id: "d", label: "It prevents data loss on node failure", correct: false },
        ],
        order: 1,
      },
      {
        question: "DynamoDB and Cassandra are examples of which CAP trade-off?",
        choices: [
          { id: "a", label: "CP — they prefer consistency over availability", correct: false },
          { id: "b", label: "AP — they prefer availability and eventual consistency", correct: true },
          { id: "c", label: "CA — they sacrifice partition tolerance", correct: false },
          { id: "d", label: "They achieve all three guarantees simultaneously", correct: false },
        ],
        order: 2,
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    slug: "database-indexing-and-query-optimisation",
    title: "Database Indexing & Query Optimisation",
    description: "Write queries that scale: understand B-tree indexes, explain plans, and common performance traps.",
    dimension: "system_design",
    difficulty: "intermediate",
    estimatedMinutes: 15,
    order: 16,
    content: `## Why Queries Are Slow

Without an index, a database must scan every row to find matching records — an O(n) full table scan. On a table of 10M rows, a query that could take 1ms with an index might take 30 seconds without one.

## How B-Tree Indexes Work

The default index type in Postgres and MySQL is a **B-tree** (balanced tree). It stores a sorted copy of the indexed column(s) plus a pointer to the full row.

A lookup on an indexed column is O(log n) — the engine traverses the tree to find matching rows, then jumps directly to the heap.

\`\`\`sql
CREATE INDEX idx_users_email ON users(email);
-- Now this is fast:
SELECT * FROM users WHERE email = 'user@example.com';
\`\`\`

## Multi-Column Indexes

A composite index on (col_a, col_b) supports queries filtering on col_a alone, or on both col_a AND col_b. It does **not** support filtering on col_b alone (leftmost prefix rule).

\`\`\`sql
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);

-- Fast — uses the full index
SELECT * FROM orders WHERE user_id = 1 AND created_at > '2024-01-01';

-- Fast — uses the prefix (user_id)
SELECT * FROM orders WHERE user_id = 1;

-- Slow — skips the left column, can't use the index
SELECT * FROM orders WHERE created_at > '2024-01-01';
\`\`\`

## EXPLAIN ANALYZE

Always validate your indexing assumptions:

\`\`\`sql
EXPLAIN ANALYZE
SELECT * FROM orders WHERE user_id = 42 ORDER BY created_at DESC LIMIT 10;
\`\`\`

Look for:
- **Seq Scan** → missing index, full table scan.
- **Index Scan** → using the index correctly.
- **Bitmap Heap Scan** → multiple index conditions merged.
- High **rows** estimate vs. actual → stale statistics, run \`ANALYZE\`.

## Common Query Anti-Patterns

**Function on indexed column** — defeats the index:
\`\`\`sql
-- Slow: function wraps the column — can't use index
WHERE LOWER(email) = 'user@example.com'

-- Fix: store lowercase values, or use a functional index
CREATE INDEX idx_lower_email ON users(LOWER(email));
\`\`\`

**LIKE with leading wildcard**:
\`\`\`sql
WHERE name LIKE '%smith%'  -- can't use B-tree, needs full-text search
WHERE name LIKE 'smith%'   -- can use B-tree (prefix match)
\`\`\`

**N+1 queries** — a loop in application code that runs one query per item:
\`\`\`python
# N+1: 1 query to get orders, then 1 per order to get user
orders = db.query("SELECT * FROM orders")
for o in orders:
    user = db.query("SELECT * FROM users WHERE id = ?", o.user_id)

# Fix: JOIN or IN clause
orders = db.query("""
    SELECT o.*, u.name FROM orders o
    JOIN users u ON u.id = o.user_id
""")
\`\`\`

## Index Maintenance Trade-offs

Indexes speed up reads but slow down writes (every INSERT, UPDATE, DELETE must update the index). On write-heavy tables, measure before indexing everything — too many indexes can hurt overall throughput.`,
    quizzes: [
      {
        question: "Given a composite index on (user_id, created_at), which query will NOT use the index efficiently?",
        choices: [
          { id: "a", label: "WHERE user_id = 1 AND created_at > '2024-01-01'", correct: false },
          { id: "b", label: "WHERE user_id = 1", correct: false },
          { id: "c", label: "WHERE created_at > '2024-01-01'", correct: true },
          { id: "d", label: "ORDER BY user_id, created_at", correct: false },
        ],
        order: 1,
      },
      {
        question: "What does 'Seq Scan' in an EXPLAIN ANALYZE output indicate?",
        choices: [
          { id: "a", label: "The query used an index successfully", correct: false },
          { id: "b", label: "The query is performing a full table scan — likely a missing index", correct: true },
          { id: "c", label: "The query is sequential and correct", correct: false },
          { id: "d", label: "The query was cached", correct: false },
        ],
        order: 2,
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    slug: "api-design-fundamentals",
    title: "API Design Fundamentals",
    description: "Design APIs that are intuitive, versioned, and safe to evolve over time.",
    dimension: "system_design",
    difficulty: "beginner",
    estimatedMinutes: 13,
    order: 17,
    content: `## REST Principles

REST (Representational State Transfer) is a set of architectural constraints, not a protocol. A RESTful API:

- Uses **nouns** for resource URLs, not verbs.
- Maps HTTP methods to CRUD operations.
- Returns standard HTTP status codes.
- Is **stateless** — each request contains all information needed; no server-side session.

\`\`\`
GET    /users          → list users
GET    /users/42       → get user 42
POST   /users          → create a user
PUT    /users/42       → replace user 42
PATCH  /users/42       → partially update user 42
DELETE /users/42       → delete user 42
\`\`\`

## HTTP Status Codes That Matter

| Code | Meaning | When |
|---|---|---|
| 200 OK | Success | GET, PUT, PATCH |
| 201 Created | Resource created | POST |
| 204 No Content | Success, no body | DELETE |
| 400 Bad Request | Invalid input | Missing required field |
| 401 Unauthorized | Not authenticated | No/bad token |
| 403 Forbidden | Authenticated but not allowed | Wrong role |
| 404 Not Found | Resource doesn't exist | |
| 409 Conflict | State conflict | Duplicate key |
| 422 Unprocessable Entity | Validation failed | Invalid data shape |
| 429 Too Many Requests | Rate limited | |
| 500 Internal Server Error | Bug in your code | |

## Versioning

Breaking changes happen. Version your API from day one:

\`\`\`
/api/v1/users    ← current
/api/v2/users    ← breaking change: different response shape
\`\`\`

Alternatives: header versioning (\`Accept: application/vnd.myapp.v2+json\`) or query param (\`?version=2\`). URL versioning is the most discoverable.

**Never change a response field type without a version bump.** Renaming, removing, or retyping fields breaks clients silently.

## Idempotency

A request is **idempotent** if calling it multiple times has the same effect as calling it once.

- GET, PUT, DELETE — inherently idempotent.
- POST — not idempotent by default. For payment APIs, accept an Idempotency-Key header to deduplicate retries.

## Pagination

Never return unbounded lists:

\`\`\`json
// Cursor-based (preferred for large datasets)
GET /posts?after=post_abc123&limit=20

{
  "data": [...],
  "next_cursor": "post_xyz789",
  "has_more": true
}
\`\`\`

Prefer cursor-based over offset pagination — offset pagination becomes inconsistent when data is inserted between pages.

## Rate Limiting

Include rate limit headers so clients can self-throttle:

\`\`\`
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 942
X-RateLimit-Reset: 1716307200
\`\`\`

## Error Response Shape

Be consistent. One schema for all errors:

\`\`\`json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "email is required",
    "field": "email"
  }
}
\`\`\``,
    quizzes: [
      {
        question: "Which HTTP method should be used to partially update a resource?",
        choices: [
          { id: "a", label: "PUT", correct: false },
          { id: "b", label: "POST", correct: false },
          { id: "c", label: "PATCH", correct: true },
          { id: "d", label: "UPDATE", correct: false },
        ],
        order: 1,
      },
      {
        question: "Why is cursor-based pagination preferred over offset pagination for large datasets?",
        choices: [
          { id: "a", label: "It's simpler to implement", correct: false },
          { id: "b", label: "Offset pagination becomes inconsistent when rows are inserted between pages", correct: true },
          { id: "c", label: "Cursor pagination is faster on small datasets", correct: false },
          { id: "d", label: "Offset pagination doesn't support filtering", correct: false },
        ],
        order: 2,
      },
    ],
  },

  // ─── algorithms ───────────────────────────────────────────────
  {
    id: crypto.randomUUID(),
    slug: "big-o-complexity",
    title: "Big-O Complexity Analysis",
    description: "Reason about algorithm performance and predict how code scales before running it.",
    dimension: "tooling_observability",
    difficulty: "beginner",
    estimatedMinutes: 12,
    order: 18,
    content: `## What Big-O Measures

Big-O notation describes how the **worst-case** runtime (or memory) of an algorithm grows as the input size n increases. It ignores constants and lower-order terms — we care about the growth rate, not the exact time.

O(2n) and O(5n) are both O(n). O(n² + n) is O(n²).

## Common Complexities

| Notation | Name | Example |
|---|---|---|
| O(1) | Constant | Hash table lookup, array access by index |
| O(log n) | Logarithmic | Binary search, balanced BST lookup |
| O(n) | Linear | Linear search, single loop over array |
| O(n log n) | Linearithmic | Merge sort, heap sort, most efficient comparison sort |
| O(n²) | Quadratic | Bubble sort, nested loops over the same array |
| O(2ⁿ) | Exponential | Recursive Fibonacci without memoisation |
| O(n!) | Factorial | Brute-force travelling salesman |

## Recognising Complexity from Code

\`\`\`python
# O(1) — no loops, fixed operations
def get_first(arr): return arr[0]

# O(n) — one loop
def linear_search(arr, target):
    for x in arr:
        if x == target: return True
    return False

# O(n²) — nested loop over same data
def has_pair(arr, target):
    for i in range(len(arr)):
        for j in range(i+1, len(arr)):
            if arr[i] + arr[j] == target:
                return True
    return False

# O(n log n) — divide-and-conquer sort
def merge_sort(arr): ...
\`\`\`

The same problem (find a pair summing to target) can be solved in O(n) with a hash set:

\`\`\`python
def has_pair(arr, target):      # O(n) time, O(n) space
    seen = set()
    for x in arr:
        if target - x in seen:
            return True
        seen.add(x)
    return False
\`\`\`

## Space Complexity

Big-O applies to memory too. The pair-finding hash set uses O(n) extra space. A recursive function uses O(depth) stack space — a naive DFS on a path graph uses O(n) stack.

## Amortised Complexity

Some operations are occasionally expensive but cheap on average. Python list \`.append()\` is O(1) amortised — most appends are instant; occasionally the list doubles, but the cost is spread across all appends.

## Practical Rules

1. Nested loops over n → O(n²) unless the inner loop has a fixed upper bound.
2. Halving the problem each step → O(log n).
3. Sorting the input adds O(n log n) overhead.
4. A hash table lookup is O(1) average, O(n) worst (hash collisions) — the average is what matters in practice.
5. For interview problems, aim for: O(n) time, O(1) or O(n) space.`,
    quizzes: [
      {
        question: "What is the time complexity of a binary search on a sorted array of n elements?",
        choices: [
          { id: "a", label: "O(n)", correct: false },
          { id: "b", label: "O(n²)", correct: false },
          { id: "c", label: "O(log n)", correct: true },
          { id: "d", label: "O(1)", correct: false },
        ],
        order: 1,
      },
      {
        question: "Two nested for-loops each iterating over an n-element array gives what complexity?",
        choices: [
          { id: "a", label: "O(2n)", correct: false },
          { id: "b", label: "O(n log n)", correct: false },
          { id: "c", label: "O(n²)", correct: true },
          { id: "d", label: "O(n)", correct: false },
        ],
        order: 2,
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    slug: "graph-traversal-bfs-dfs",
    title: "Graph Traversal: BFS & DFS",
    description: "Traverse any graph or tree problem with breadth-first and depth-first search.",
    dimension: "tooling_observability",
    difficulty: "intermediate",
    estimatedMinutes: 15,
    order: 19,
    content: `## Graphs in Practice

Graphs model relationships: social networks, road maps, dependency trees, web page links. Most graph problems reduce to one of two traversals — BFS or DFS.

A graph G = (V, E): vertices (nodes) + edges (connections). Can be directed or undirected, weighted or unweighted.

## Breadth-First Search (BFS)

BFS explores all nodes at distance 1 before nodes at distance 2, and so on. It uses a **queue** (FIFO).

\`\`\`python
from collections import deque

def bfs(graph, start):
    visited = set([start])
    queue = deque([start])

    while queue:
        node = queue.popleft()
        print(node)

        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
\`\`\`

**Use BFS when**: you need the shortest path in an unweighted graph, or you want to process nodes level by level.

## Depth-First Search (DFS)

DFS goes as deep as possible before backtracking. It uses a **stack** (or call stack for recursion).

\`\`\`python
def dfs(graph, start, visited=None):
    if visited is None:
        visited = set()
    visited.add(start)
    print(start)

    for neighbor in graph[start]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited)

# Iterative version (avoids recursion limit on deep graphs)
def dfs_iter(graph, start):
    visited = set()
    stack = [start]
    while stack:
        node = stack.pop()
        if node not in visited:
            visited.add(node)
            print(node)
            stack.extend(graph[node])
\`\`\`

**Use DFS when**: you need to detect cycles, find all paths, or perform topological sort.

## Shortest Path (BFS)

BFS naturally finds the shortest path in an unweighted graph:

\`\`\`python
def shortest_path(graph, start, end):
    queue = deque([(start, [start])])
    visited = set([start])

    while queue:
        node, path = queue.popleft()
        if node == end:
            return path
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, path + [neighbor]))
    return None
\`\`\`

## Topological Sort (DFS)

For a DAG (directed acyclic graph), topological sort produces a linear ordering where every edge goes from earlier to later. Used for build systems, task scheduling.

\`\`\`python
def topo_sort(graph):
    visited, result = set(), []

    def dfs(node):
        visited.add(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                dfs(neighbor)
        result.append(node)

    for node in graph:
        if node not in visited:
            dfs(node)
    return result[::-1]
\`\`\`

## BFS vs. DFS Quick Reference

| Property | BFS | DFS |
|---|---|---|
| Data structure | Queue | Stack / recursion |
| Finds shortest path | ✓ (unweighted) | ✗ |
| Memory | O(width) | O(depth) |
| Cycle detection | ✓ | ✓ |
| Topological sort | ✗ | ✓ |
| Good for trees | Level-order traversal | Pre/in/post-order |`,
    quizzes: [
      {
        question: "Why does BFS guarantee the shortest path in an unweighted graph?",
        choices: [
          { id: "a", label: "Because it uses a stack", correct: false },
          { id: "b", label: "Because it explores all nodes at distance k before any node at distance k+1", correct: true },
          { id: "c", label: "Because it visits nodes alphabetically", correct: false },
          { id: "d", label: "Because it avoids cycles", correct: false },
        ],
        order: 1,
      },
      {
        question: "Which traversal is used for topological sorting of a DAG?",
        choices: [
          { id: "a", label: "BFS", correct: false },
          { id: "b", label: "DFS with post-order tracking", correct: true },
          { id: "c", label: "Dijkstra's algorithm", correct: false },
          { id: "d", label: "Binary search", correct: false },
        ],
        order: 2,
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    slug: "dynamic-programming-fundamentals",
    title: "Dynamic Programming Fundamentals",
    description: "Break down DP problems into overlapping subproblems and solve them with memoisation or tabulation.",
    dimension: "tooling_observability",
    difficulty: "intermediate",
    estimatedMinutes: 16,
    order: 20,
    content: `## What is Dynamic Programming?

Dynamic programming (DP) solves problems by breaking them into **overlapping subproblems**, solving each once, and storing the result. It's applicable when:

1. The problem has **optimal substructure** — the optimal solution contains optimal solutions to subproblems.
2. Subproblems **overlap** — the same subproblem recurs multiple times.

## Memoisation (Top-Down)

Add a cache to a recursive solution:

\`\`\`python
from functools import lru_cache

# Without DP: O(2ⁿ)
def fib(n):
    if n <= 1: return n
    return fib(n-1) + fib(n-2)

# With memoisation: O(n)
@lru_cache(maxsize=None)
def fib(n):
    if n <= 1: return n
    return fib(n-1) + fib(n-2)
\`\`\`

\`@lru_cache\` stores every (n,) → result pair. Each subproblem is solved once.

## Tabulation (Bottom-Up)

Fill a table iteratively, smallest subproblem first:

\`\`\`python
def fib(n):
    if n <= 1: return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]

# Space-optimised: O(1) space
def fib(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
\`\`\`

## Classic Problem: Longest Common Subsequence

\`\`\`python
def lcs(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n+1) for _ in range(m+1)]

    for i in range(1, m+1):
        for j in range(1, n+1):
            if s1[i-1] == s2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])

    return dp[m][n]  # O(mn) time and space
\`\`\`

## Classic Problem: 0/1 Knapsack

Given items with weights and values, maximise value within a weight capacity:

\`\`\`python
def knapsack(weights, values, capacity):
    n = len(weights)
    dp = [[0] * (capacity+1) for _ in range(n+1)]

    for i in range(1, n+1):
        for w in range(capacity+1):
            # Don't take item i
            dp[i][w] = dp[i-1][w]
            # Take item i (if it fits)
            if weights[i-1] <= w:
                dp[i][w] = max(dp[i][w], dp[i-1][w - weights[i-1]] + values[i-1])

    return dp[n][capacity]
\`\`\`

## How to Identify DP Problems

1. The problem asks for a minimum, maximum, or count of something.
2. Future decisions depend on past choices.
3. A brute-force solution involves exponential recursion with repeated subproblems.

Common DP patterns: linear (Fibonacci), grid (unique paths), intervals (burst balloons), subsequence (LCS, edit distance), partition (subset sum).

## Approach

1. Define the subproblem: what does dp[i] or dp[i][j] represent?
2. Find the recurrence relation.
3. Determine base cases.
4. Decide iteration order (top-down with cache, or bottom-up filling the table).`,
    quizzes: [
      {
        question: "What two properties must a problem have for dynamic programming to apply?",
        choices: [
          { id: "a", label: "Greedy choice and polynomial time", correct: false },
          { id: "b", label: "Optimal substructure and overlapping subproblems", correct: true },
          { id: "c", label: "Sorted input and binary search", correct: false },
          { id: "d", label: "Graph structure and DFS traversal", correct: false },
        ],
        order: 1,
      },
      {
        question: "What does memoisation do that makes recursive DP efficient?",
        choices: [
          { id: "a", label: "It converts recursion to iteration", correct: false },
          { id: "b", label: "It stores results of subproblems so each is solved only once", correct: true },
          { id: "c", label: "It reduces the problem size by half each call", correct: false },
          { id: "d", label: "It eliminates the need for base cases", correct: false },
        ],
        order: 2,
      },
    ],
  },

  // ─── soft_skills ──────────────────────────────────────────────
  {
    id: crypto.randomUUID(),
    slug: "writing-technical-design-docs",
    title: "Writing Technical Design Documents",
    description: "Write RFCs that get alignment fast: structure, trade-offs, and what reviewers actually read.",
    dimension: "soft_skills",
    difficulty: "beginner",
    estimatedMinutes: 11,
    order: 21,
    content: `## Why Design Docs Exist

A design document (also called RFC, tech spec, or design proposal) serves two purposes:
1. **Force clarity** — writing a doc exposes gaps in your own thinking before you build.
2. **Create alignment** — stakeholders review asynchronously and raise concerns early, not after 3 weeks of coding.

A well-written doc prevents rework. A missing doc causes it.

## Structure That Works

**1. Problem / Context** (1–3 sentences)
What is broken, missing, or needed? Be specific. "The search endpoint takes 3s on p99 for users with > 500 documents."

**2. Goals and Non-Goals**
What this proposal will solve. Equally important: what it explicitly will NOT solve. "Non-goal: this doesn't address search relevance ranking — only latency."

**3. Proposed Solution**
How you will solve it. Include a diagram if the data flow or architecture is non-trivial. Be concrete — "we will add a Redis cache with 5-minute TTL per user" is better than "we will use caching."

**4. Trade-offs and Alternatives Considered**
This is the most important section for senior reviewers. Show that you considered other approaches and explain why you rejected them. "We considered Elasticsearch, but operational overhead exceeds the benefit for our scale."

**5. Open Questions**
What you don't know yet. Invites reviewers to contribute expertise.

**6. Implementation Plan**
Phases or milestones, rough timeline, dependencies.

## What Reviewers Actually Read

Reviewers scan docs, they don't read them. Make the key decision and its rationale visible at a glance:

- Put the most controversial choice up front.
- Use a clear heading hierarchy.
- Bold the key claim in each section.
- Keep the whole doc under 2 pages.

A 10-page design doc is a sign the proposal isn't well understood by its author.

## Getting Feedback

**Set a deadline.** "Please comment by Friday EOD" produces more reviews than an open-ended request.

**Distinguish approval from information.** Tag reviewers as: FYI (informational), Consulted (input needed), Approved (must sign off).

**Don't defend the doc — update it.** When a reviewer raises a valid concern, update the doc to reflect the new understanding. The doc is a living artefact until work begins.

## After the Doc

Once approved, move the decision to a permanent record (decisions log, DECISIONS.md, or ADR — Architecture Decision Record). Docs that live only in Confluence get lost. ADRs that live in the repo stay findable forever.`,
    quizzes: [
      {
        question: "Which section of a design doc is most important to senior reviewers?",
        choices: [
          { id: "a", label: "The implementation timeline", correct: false },
          { id: "b", label: "Alternatives considered and why they were rejected", correct: true },
          { id: "c", label: "The problem statement", correct: false },
          { id: "d", label: "The open questions", correct: false },
        ],
        order: 1,
      },
      {
        question: "What should you do when a reviewer raises a valid concern about your design doc?",
        choices: [
          { id: "a", label: "Defend the original proposal to show confidence", correct: false },
          { id: "b", label: "Update the doc to reflect the new understanding", correct: true },
          { id: "c", label: "Start a new document from scratch", correct: false },
          { id: "d", label: "Wait until the review period ends before making changes", correct: false },
        ],
        order: 2,
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    slug: "effective-code-review",
    title: "Effective Code Review",
    description: "Review code that makes colleagues better, not defensive — and get your own PRs merged faster.",
    dimension: "soft_skills",
    difficulty: "beginner",
    estimatedMinutes: 10,
    order: 22,
    content: `## The Purpose of Code Review

Code review exists for four reasons, in rough priority order:
1. Catch bugs and security issues before they reach production.
2. Share knowledge — both reviewer and author learn.
3. Maintain consistency — the codebase should look like one person wrote it.
4. Improve the author — the review is a teaching opportunity.

What code review is NOT for: asserting dominance, enforcing personal preferences unrelated to correctness, or achieving a gatekeeping role.

## Reviewing Others' Code

**Distinguish blocking from non-blocking comments.** Use a clear prefix:

- **[blocking]** — this must be resolved before merging: security issue, correctness bug, violates a project convention.
- **[nit]** — style/formatting; the author can take it or leave it.
- **[question]** — you don't understand something; not necessarily a problem.
- **[suggestion]** — "here's a way I'd approach this" — optional.

**Explain why, not just what.** "This will panic if user is nil" is better than "add nil check." The author learns a principle, not just a fix.

**Be specific, not sweeping.** "This function is confusing" is not actionable. "I had to read this three times before understanding the early-return condition — could you add a comment explaining why we check length before nil?" is.

**Approve when it's good enough.** Perfection is the enemy of shipped code. If the PR achieves its stated goal, is safe, and doesn't make things worse, approve it. Request changes only when you'd be uncomfortable if this shipped as-is.

## Submitting PRs for Review

**Keep PRs small.** A PR under 400 lines gets reviewed in minutes. A PR over 1000 lines gets a rubber-stamp or ignored. Split large changes into independent, reviewable units.

**Write a clear PR description.** Include: what changed, why, and how to test it. Reviewers shouldn't have to infer context.

**Self-review first.** Read your own diff before requesting review. You'll catch 20–30% of issues yourself.

**Respond to all comments.** Even if you don't make the change, acknowledge the comment: "Left as-is — this function is only called from tests and the verbosity aids readability." This closes the loop.

## Nitpick Culture

If your team is spending review cycles on tabs vs. spaces or single vs. double quotes — automate it. Prettier, Black, and rustfmt exist so humans don't have to argue about formatting. Redirect that energy to correctness and design.

## The 24-Hour Rule

Review code within 24 hours of the request. Code that sits in review for 3 days blocks the author, causes context-switching, and creates merge conflicts. Treat code review as a first-class engineering responsibility, not an interruption.`,
    quizzes: [
      {
        question: "What does a [blocking] comment in a code review mean?",
        choices: [
          { id: "a", label: "It is a personal style preference", correct: false },
          { id: "b", label: "The PR must address this before it can be merged", correct: true },
          { id: "c", label: "The reviewer is confused and needs clarification", correct: false },
          { id: "d", label: "The comment blocks the reviewer from reading further", correct: false },
        ],
        order: 1,
      },
      {
        question: "Why should PRs be kept small (under ~400 lines)?",
        choices: [
          { id: "a", label: "Larger PRs exceed the git diff limit", correct: false },
          { id: "b", label: "Small PRs are reviewed thoroughly; large PRs tend to get rubber-stamped or ignored", correct: true },
          { id: "c", label: "Smaller PRs always have fewer bugs", correct: false },
          { id: "d", label: "It is a requirement for CI to pass", correct: false },
        ],
        order: 2,
      },
    ],
  },

  // ─── english ──────────────────────────────────────────────────
  {
    id: crypto.randomUUID(),
    slug: "writing-clear-technical-documentation",
    title: "Writing Clear Technical Documentation",
    description: "Write documentation that developers actually read — precise, structured, and jargon-free.",
    dimension: "soft_skills",
    difficulty: "beginner",
    estimatedMinutes: 10,
    order: 23,
    content: `## Why Most Documentation Fails

Technical documentation fails for one of three reasons:
1. **Too much assumed knowledge** — the author forgets what it was like not to know.
2. **Too little structure** — a wall of text that rewards only those who read every word.
3. **Out of date** — correct when written, wrong six months later.

Good documentation treats the reader's time as valuable and their context as limited.

## Know Your Audience

Before writing, answer: who will read this, and what do they already know?

- A README for a public library: assume the reader is a developer who understands the problem domain but not your library.
- An internal runbook: assume the reader is an on-call engineer at 2am who is stressed and wants to solve the problem, not understand the architecture.
- An API reference: assume the reader knows the language and is looking for a specific function signature.

Different audiences require different documents. Don't try to serve all of them in one doc.

## Structure: The Inverted Pyramid

Put the most important information first. Readers scan before they read.

For a README:
1. One-sentence description of what it does.
2. Install and quickstart (code you can copy).
3. Core concepts (only what's needed to understand the quickstart).
4. Reference (full API, config options).

For a how-to guide:
1. What you will achieve by the end.
2. Prerequisites.
3. Steps — numbered, one action per step.
4. Expected output after each step.

## Writing Style

**Use active voice.** "Call \`db.connect()\` before querying" > "Queries should be preceded by a call to \`db.connect()\`."

**Be concrete, not abstract.** "This can improve performance in some cases" → "This reduces query time by 40–60% on tables with more than 100k rows."

**Short sentences win.** If you need a comma and a semicolon in the same sentence, split it.

**Show, don't tell.** Code examples outperform prose for technical concepts. Every claim about behaviour should be demonstrable with a runnable example.

## Keeping Docs Current

The #1 doc failure is staleness. Treat docs like tests — they break when the code changes.

- Co-locate docs with the code they describe. A README in the repo is updated when the repo changes. A doc in a separate Confluence space isn't.
- Add documentation updates to the PR template: "Does this PR require a doc update?"
- Delete docs that are no longer accurate — a wrong doc is worse than no doc.`,
    quizzes: [
      {
        question: "What is the 'inverted pyramid' structure in technical writing?",
        choices: [
          { id: "a", label: "Starting with background context and ending with the key point", correct: false },
          { id: "b", label: "Putting the most important information first, with detail following", correct: true },
          { id: "c", label: "Writing for the most advanced audience first", correct: false },
          { id: "d", label: "Putting code examples at the bottom of the document", correct: false },
        ],
        order: 1,
      },
      {
        question: "Why should documentation be co-located with the code it describes?",
        choices: [
          { id: "a", label: "It makes the repository larger, which signals maturity", correct: false },
          { id: "b", label: "It is more likely to be updated when the code changes", correct: true },
          { id: "c", label: "It prevents the documentation from being shared externally", correct: false },
          { id: "d", label: "Co-location is a hard requirement of most CI systems", correct: false },
        ],
        order: 2,
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    slug: "presenting-technical-ideas",
    title: "Presenting Technical Ideas Clearly",
    description: "Communicate complex technical decisions to mixed audiences — from engineers to executives.",
    dimension: "soft_skills",
    difficulty: "beginner",
    estimatedMinutes: 10,
    order: 24,
    content: `## The Core Problem

Engineers are trained to value precision and completeness. In presentations, this becomes a liability. Audiences — especially mixed technical/non-technical ones — don't need every detail. They need to understand the decision and trust that it's right.

## Know What Your Audience Needs to Do

Every presentation has a desired outcome. Before building slides, answer: **what should the audience do, believe, or decide after this talk?**

- "Approve the proposed migration" → focus on risks, cost, and timeline. Skip the implementation details.
- "Understand how RAG works" → focus on the mental model. Skip the math.
- "Buy in to the architectural change" → focus on the problem it solves. Skip the how.

## Structure for Technical Presentations

**The problem (30 seconds)** — what hurts, what's broken, what's the opportunity. Make this real with a number or a story. "Our p99 latency is 4 seconds. We're losing 12% of users who abandon before the page loads."

**The solution in one sentence** — before explaining how it works, say what it does. "We're replacing the monolith search with a dedicated Elasticsearch cluster, reducing p99 to under 300ms."

**How it works (optional)** — if the audience needs to trust the mechanism. Keep this section short. Use one good diagram instead of five mediocre ones.

**What happens next** — concrete next steps, timeline, who is responsible for what. Never end a presentation with "any questions?" as the only call to action.

## Adapting to Audience

| Audience | What they care about | What to skip |
|---|---|---|
| Engineers | Correctness, edge cases, implementation | Business impact numbers |
| Engineering manager | Timeline, risks, team impact | Implementation details |
| Product manager | User impact, what changes | Internal architecture |
| Executive | Cost, revenue, strategic fit | Everything technical |

**Bottom-line up front** for executives. Lead with the decision and the number. The details are appendix slides they may never see.

## Handling Questions You Can't Answer

"I don't know" is a complete, acceptable answer — followed by "I'll find out by Thursday." The engineering instinct to speculate rather than admit uncertainty destroys credibility faster than not knowing.

Prepare for the two hardest questions in advance:
- "What's the biggest risk?" — have a specific, honest answer.
- "What happens if we do nothing?" — the cost of inaction is often overlooked.`,
    quizzes: [
      {
        question: "Before building a technical presentation, what is the most important question to answer?",
        choices: [
          { id: "a", label: "How many slides should I include?", correct: false },
          { id: "b", label: "What should the audience do, believe, or decide after this talk?", correct: true },
          { id: "c", label: "How long should the presentation be?", correct: false },
          { id: "d", label: "Which technical details should I explain first?", correct: false },
        ],
        order: 1,
      },
      {
        question: "What is 'bottom-line up front' and who is it most useful for?",
        choices: [
          { id: "a", label: "Stating background context first; useful for engineers", correct: false },
          { id: "b", label: "Leading with the decision and key number; most useful for executives", correct: true },
          { id: "c", label: "Ending the presentation with a summary; useful for all audiences", correct: false },
          { id: "d", label: "Summarising the technical details; most useful for product managers", correct: false },
        ],
        order: 2,
      },
    ],
  },
  // ── Backend track lessons ──────────────────────────────────────────────────
  {
    id: crypto.randomUUID(),
    slug: "nodejs-event-loop-and-async",
    title: "Node.js Event Loop & Async Patterns",
    description: "Understand how Node.js handles concurrency and when to use each async pattern.",
    dimension: "core_language",
    difficulty: "intermediate",
    estimatedMinutes: 14,
    order: 25,
    content: `## How Node.js Handles Concurrency

Node.js runs JavaScript on a single thread. It achieves high concurrency not through parallelism but through **non-blocking I/O** and the event loop. Understanding this model is essential for writing performant backend services.

## The Event Loop

The event loop is a loop that continuously checks whether there are tasks to process. It has several phases:

1. **Timers** — executes \`setTimeout\` and \`setInterval\` callbacks whose delay has elapsed
2. **I/O callbacks** — handles most I/O completion callbacks (network, disk)
3. **Poll** — waits for new I/O events (this is where Node spends most of its time)
4. **Check** — executes \`setImmediate\` callbacks
5. **Close callbacks** — handles cleanup like \`socket.on('close', ...)\`

Between each phase, Node checks for microtasks: \`Promise.then\` and \`process.nextTick\` (which runs before anything else).

## Blocking the Event Loop

If you run CPU-intensive code synchronously, you **block the event loop** — no other requests are served until it finishes. This is the most common Node.js performance mistake.

\`\`\`js
// BAD: blocks the event loop for every request
app.get('/compute', (req, res) => {
  const result = heavyCpuWork(); // 500ms of CPU
  res.json({ result });
});
\`\`\`

Fixes:
- Move CPU work to a **Worker Thread** (cpu-bound parallelism)
- Offload to a background job queue (Inngest, BullMQ)
- Use a separate process/service for heavy computation

## Async/Await vs Callbacks vs Promises

Modern Node.js code uses \`async/await\` everywhere. The key rule: **always await every Promise you create**, or attach a \`.catch()\` to it. Unhandled rejections crash Node in production.

\`\`\`js
// Correct: awaits the promise
async function fetchUser(id) {
  const user = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  return user.rows[0];
}

// Wrong: fire-and-forget without error handling
async function sendEmail(to) {
  emailClient.send(to); // rejected promise goes unhandled
}
\`\`\`

## Parallel vs Sequential Async

\`\`\`js
// Sequential: 300ms total (100ms + 200ms)
const user = await getUser(id);
const orders = await getOrders(id);

// Parallel: 200ms total (max of 100ms, 200ms)
const [user, orders] = await Promise.all([getUser(id), getOrders(id)]);
\`\`\`

Use \`Promise.all\` when operations are independent. Use sequential await when one depends on the other's result.

## Common Pitfalls

**Missing await in a loop:**
\`\`\`js
// BAD: all inserts fire at once, no backpressure
for (const item of items) {
  insertItem(item); // missing await
}

// OK: sequential
for (const item of items) {
  await insertItem(item);
}

// Better for large sets: batched
await Promise.all(items.map(insertItem)); // fine for small N
\`\`\`

**Event emitters + async:**
Event emitter callbacks are synchronous by default. If you throw inside an event handler, it propagates synchronously. Wrap async event handlers in try/catch.`,
    quizzes: [
      {
        question: "A CPU-bound task takes 500ms. What is the correct way to handle it in Node.js?",
        choices: [
          { id: "a", label: "Run it synchronously — Node.js handles it automatically", correct: false },
          { id: "b", label: "Offload it to a Worker Thread or background queue", correct: true },
          { id: "c", label: "Wrap it in async/await to make it non-blocking", correct: false },
          { id: "d", label: "Use setImmediate to defer it to the next tick", correct: false },
        ],
        order: 1,
      },
      {
        question: "You need to fetch a user and their orders from the database, and neither depends on the other. What is the most efficient approach?",
        choices: [
          { id: "a", label: "await getUser(), then await getOrders()", correct: false },
          { id: "b", label: "Promise.all([getUser(), getOrders()])", correct: true },
          { id: "c", label: "Promise.race([getUser(), getOrders()])", correct: false },
          { id: "d", label: "Run them in separate Worker Threads", correct: false },
        ],
        order: 2,
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    slug: "rest-api-design-best-practices",
    title: "REST API Design: Versioning, Pagination & Errors",
    description: "Design APIs that are easy to consume, backwards-compatible, and production-ready.",
    dimension: "apis",
    difficulty: "intermediate",
    estimatedMinutes: 13,
    order: 26,
    content: `## REST Fundamentals

REST (Representational State Transfer) uses HTTP semantics to describe operations on resources. Good REST APIs are predictable: a developer should be able to guess the endpoint and method for any operation.

| Method | Use | Idempotent? |
|--------|-----|-------------|
| GET    | Read resource | Yes |
| POST   | Create resource | No |
| PUT    | Replace entire resource | Yes |
| PATCH  | Partial update | No (typically) |
| DELETE | Remove resource | Yes |

## URL Design

Resources are nouns, not verbs. Actions are expressed through HTTP methods.

\`\`\`
# Good
GET    /users/{id}/orders
POST   /orders
PATCH  /orders/{id}
DELETE /orders/{id}

# Bad — verbs in URLs
POST /createOrder
GET  /getUserOrders?userId=123
POST /cancelOrder
\`\`\`

## Versioning

APIs evolve. Break backwards compatibility without warning and clients break. Two common strategies:

**URL versioning** (most common, most explicit):
\`\`\`
GET /v1/users
GET /v2/users
\`\`\`

**Header versioning** (cleaner URLs, harder to test in a browser):
\`\`\`
Accept: application/vnd.api+json;version=2
\`\`\`

Rule: Never remove or rename a field in the same major version. Add fields; mark old ones deprecated.

## Pagination

Never return unbounded lists. Three patterns:

**Offset pagination** — simple, but slow on large tables (DB must scan and skip rows):
\`\`\`
GET /orders?offset=100&limit=20
\`\`\`

**Cursor pagination** — fast even on millions of rows, used by Stripe/GitHub:
\`\`\`
GET /orders?after=cursor_xyz&limit=20

Response:
{
  "data": [...],
  "next_cursor": "cursor_abc",
  "has_more": true
}
\`\`\`

**Page-based** — like offset but human-readable. Same performance problem.

Use cursor pagination for any list that could exceed a few thousand items.

## Error Modelling

Consistent error shapes let clients handle failures generically.

\`\`\`json
{
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "No order found with id 'ord_123'",
    "details": { "orderId": "ord_123" }
  }
}
\`\`\`

Use standard HTTP status codes correctly:
- **400** — client sent invalid data (validation error)
- **401** — not authenticated
- **403** — authenticated but not authorised
- **404** — resource not found
- **409** — conflict (e.g., duplicate creation)
- **422** — valid syntax but semantic error
- **429** — rate limited
- **500** — your bug

Never return 200 with \`{"success": false}\` in the body — status codes exist for a reason.

## Idempotency Keys

For unsafe operations (POST, PATCH), accept an idempotency key header. If the same key is sent twice (e.g., client retry after network failure), return the same response instead of processing twice.

\`\`\`
POST /payments
Idempotency-Key: idem_7f3a2b9c
\`\`\`

Stripe popularised this pattern. It prevents double-charges on mobile retries.`,
    quizzes: [
      {
        question: "A client sends a POST request to create an order and gets a network timeout. Which design prevents the order from being created twice on retry?",
        choices: [
          { id: "a", label: "Use PUT instead of POST", correct: false },
          { id: "b", label: "Accept an Idempotency-Key header and deduplicate on it", correct: true },
          { id: "c", label: "Return a 202 Accepted instead of 201 Created", correct: false },
          { id: "d", label: "Use cursor pagination", correct: false },
        ],
        order: 1,
      },
      {
        question: "You have a table with 10 million orders. Which pagination strategy is most efficient?",
        choices: [
          { id: "a", label: "Offset pagination (?offset=5000000&limit=20)", correct: false },
          { id: "b", label: "Page-based pagination (?page=250000)", correct: false },
          { id: "c", label: "Cursor-based pagination (?after=cursor_xyz)", correct: true },
          { id: "d", label: "Return all records and paginate on the client", correct: false },
        ],
        order: 2,
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    slug: "sql-transactions-and-isolation",
    title: "SQL Transactions, ACID & Isolation Levels",
    description: "Master transactions, concurrency anomalies, and when to use each isolation level.",
    dimension: "databases",
    difficulty: "intermediate",
    estimatedMinutes: 15,
    order: 27,
    content: `## What is a Transaction?

A transaction groups multiple SQL statements into a single unit of work. Either all statements succeed and commit, or all are rolled back. This is the foundation of data consistency.

\`\`\`sql
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 'alice';
  UPDATE accounts SET balance = balance + 100 WHERE id = 'bob';
COMMIT;
\`\`\`

If the server crashes between the two UPDATEs, the rollback on restart ensures Alice is not debited without Bob being credited.

## ACID Properties

- **Atomicity** — all or nothing; partial updates are impossible
- **Consistency** — the DB moves from one valid state to another; constraints never violated mid-transaction
- **Isolation** — concurrent transactions don't interfere with each other (to a configurable degree)
- **Durability** — once committed, data survives crashes (written to disk/WAL)

## Concurrency Anomalies

Without isolation, concurrent transactions cause several problems:

**Dirty Read** — reading uncommitted data from another transaction. If that transaction rolls back, you acted on data that never existed.

**Non-repeatable Read** — you read a row twice in the same transaction and get different values because another transaction committed between your reads.

**Phantom Read** — a range query returns different rows on second execution because another transaction inserted/deleted rows.

**Lost Update** — two transactions read the same value, both modify it, and the second commit overwrites the first.

## Isolation Levels (Postgres)

| Level | Dirty Read | Non-repeatable | Phantom |
|-------|-----------|----------------|---------|
| Read Committed (default) | No | Yes | Yes |
| Repeatable Read | No | No | No* |
| Serializable | No | No | No |

*Postgres Repeatable Read prevents phantoms too (SSI implementation).

**Read Committed** (Postgres default) — sees only committed data. Safe for most OLTP queries. Use for simple reads and updates.

**Repeatable Read** — all reads in the transaction see a consistent snapshot from when the transaction started. Use when you need to read-then-write based on a consistent view (e.g., computing a balance before crediting).

**Serializable** — strongest guarantee; transactions behave as if they ran one-at-a-time. Highest overhead. Use for financial integrity or complex invariants.

## SELECT FOR UPDATE

When you need to read a row and then update it atomically, use \`SELECT FOR UPDATE\` to lock the row:

\`\`\`sql
BEGIN;
  SELECT balance FROM accounts WHERE id = 'alice' FOR UPDATE;
  -- Other transactions block here until this transaction commits
  UPDATE accounts SET balance = balance - 100 WHERE id = 'alice';
COMMIT;
\`\`\`

Without the lock, two concurrent withdrawals could both see \`balance = 200\` and each allow a \`-100\` withdrawal, resulting in \`balance = 100\` (one update lost).

## Deadlocks

When two transactions each hold a lock the other needs, Postgres detects the cycle and aborts one with error code \`40P01\`. Always handle this in application code with a retry.

Prevent deadlocks by acquiring locks in a consistent order across all code paths.

## Practical Rules

1. Keep transactions short — long transactions hold locks and block other queries
2. Never do HTTP calls or external I/O inside a transaction (locks are held for the duration)
3. Default to Read Committed; step up to Repeatable Read only when you need a consistent snapshot
4. Use Serializable for invariants that span multiple rows (inventory checks, seat booking)`,
    quizzes: [
      {
        question: "Two concurrent transactions both read a seat as 'available' and both book it. Which isolation level prevents this anomaly?",
        choices: [
          { id: "a", label: "Read Committed", correct: false },
          { id: "b", label: "Repeatable Read without explicit locks", correct: false },
          { id: "c", label: "SELECT FOR UPDATE with Read Committed, or Serializable", correct: true },
          { id: "d", label: "It cannot be prevented at the database level", correct: false },
        ],
        order: 1,
      },
      {
        question: "Which action is most dangerous to perform inside a database transaction?",
        choices: [
          { id: "a", label: "Running two UPDATE statements", correct: false },
          { id: "b", label: "Using SELECT FOR UPDATE", correct: false },
          { id: "c", label: "Making an HTTP call to an external API", correct: true },
          { id: "d", label: "Reading a row twice", correct: false },
        ],
        order: 2,
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    slug: "jwt-authentication-pitfalls",
    title: "JWT Authentication: How It Works & What Goes Wrong",
    description: "Understand JWT structure, validation, and the security mistakes that lead to breaches.",
    dimension: "auth_security",
    difficulty: "intermediate",
    estimatedMinutes: 13,
    order: 28,
    content: `## What is a JWT?

A JSON Web Token (JWT) is a compact, URL-safe token format used to represent claims between two parties. It consists of three base64url-encoded parts separated by dots:

\`\`\`
header.payload.signature
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyXzEyMyIsImV4cCI6MTcxNTAwMDAwMH0.abc123
\`\`\`

**Header** — algorithm and token type:
\`\`\`json
{ "alg": "HS256", "typ": "JWT" }
\`\`\`

**Payload** — claims (do not put secrets here — it's only base64 encoded, not encrypted):
\`\`\`json
{ "sub": "user_123", "email": "alice@example.com", "exp": 1715000000 }
\`\`\`

**Signature** — HMAC or RSA/ECDSA of the header+payload using a secret key.

## How Validation Works

The server recomputes the signature from the header and payload using its secret key. If it matches the signature in the token, the token is authentic and unmodified. No database lookup needed — this is what makes JWTs stateless.

## Critical Security Mistakes

**1. The alg:none attack**

Early JWT libraries accepted \`"alg": "none"\` and skipped signature verification entirely. Always pin to your expected algorithm explicitly:

\`\`\`js
jwt.verify(token, secret, { algorithms: ['HS256'] }); // Good
jwt.verify(token, secret); // Bad — attacker can send alg:none
\`\`\`

**2. Using HS256 when you need RS256**

HS256 is a shared-secret algorithm — the same key signs and verifies. If your resource server needs to verify tokens, it must have the secret, and if it's compromised, the attacker can forge tokens.

RS256 uses a private key (on auth server only) to sign, and a public key (shareable) to verify. Use RS256 for multi-service architectures.

**3. No expiration**

Always set \`exp\`. JWTs with no expiry are essentially permanent credentials. Standard is 15 minutes for access tokens, 7-30 days for refresh tokens stored in httpOnly cookies.

**4. Storing tokens in localStorage**

localStorage is accessible by any JavaScript on the page — including malicious scripts injected via XSS. Store access tokens in memory; store refresh tokens in httpOnly, Secure cookies.

**5. Not validating claims**

After verifying the signature, you must check:
- \`exp\` — token has not expired
- \`iss\` — issued by the expected authority
- \`aud\` — intended for your service

## Token Revocation Problem

JWTs are stateless — once issued, you cannot easily revoke them before expiry. Solutions:
- Short-lived access tokens (15 min) + refresh token rotation
- A token blocklist (Redis) for critical revocations — but this adds state
- Session-based auth if revocation is critical (logout must work immediately)

## OAuth2 and OIDC

JWTs are commonly used as **ID tokens** in OpenID Connect (OIDC) — an authentication layer on top of OAuth2. The provider issues a signed JWT containing user identity claims after the user authenticates. Your app verifies the signature against the provider's public keys (fetched from their JWKS endpoint).`,
    quizzes: [
      {
        question: "An attacker modifies a JWT payload to elevate their role to 'admin', then sets alg to 'none' in the header. Which server-side defence prevents this?",
        choices: [
          { id: "a", label: "Checking the exp claim", correct: false },
          { id: "b", label: "Pinning the expected algorithm during verification", correct: true },
          { id: "c", label: "Using HS256 instead of RS256", correct: false },
          { id: "d", label: "Storing the token in localStorage", correct: false },
        ],
        order: 1,
      },
      {
        question: "You have three microservices that all need to verify user tokens. Which JWT algorithm is most appropriate and why?",
        choices: [
          { id: "a", label: "HS256 — it's faster and simpler", correct: false },
          { id: "b", label: "HS512 — stronger shared secret", correct: false },
          { id: "c", label: "RS256 — private key stays on auth server; services verify with public key only", correct: true },
          { id: "d", label: "alg:none — no secret to manage", correct: false },
        ],
        order: 2,
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    slug: "redis-caching-strategies",
    title: "Redis Caching: Patterns, Invalidation & Pitfalls",
    description: "Learn when and how to cache with Redis, and how to handle the hard problems.",
    dimension: "caching",
    difficulty: "intermediate",
    estimatedMinutes: 13,
    order: 29,
    content: `## Why Cache?

Caching stores the result of an expensive operation (DB query, API call, computation) so future requests can be served faster. A well-placed cache can reduce p99 latency from 200ms to 2ms and cut database load by 90%.

Redis is the de facto standard for caching in backend services — it stores data in memory, supports atomic operations, has built-in TTLs, and handles thousands of operations per second on a single node.

## Cache-Aside (Lazy Loading)

The most common pattern. The application is responsible for reading and writing the cache:

\`\`\`
1. Request arrives for user_123
2. Check Redis: MISS
3. Query database → get user object
4. Write to Redis: SET user:123 <json> EX 300
5. Return response

Next request:
1. Check Redis: HIT → return immediately (no DB query)
\`\`\`

**Pros:** Only caches data that's actually requested. DB failures don't break the cache.
**Cons:** First request after a miss is slow. Cache can become stale.

## Write-Through

Write to cache and DB simultaneously on every write. Cache is always warm.

**Pros:** No stale data after writes.
**Cons:** Every write pays the cache write overhead. Cache fills with data that may never be read again.

## Cache Invalidation

The classic hard problem. Three strategies:

**TTL-based expiry** — set a short TTL and let stale data expire. Simplest; tolerate brief staleness.

**Event-driven invalidation** — when user_123 is updated, explicitly \`DEL user:123\` from Redis. Precise but requires discipline across all write paths.

**Cache versioning** — include a version number in the key (\`user:123:v2\`). Update the version on write. Old keys expire naturally.

## Cache Stampede (Thundering Herd)

When a popular cache key expires, many concurrent requests all miss the cache simultaneously and all query the DB at once. This can overwhelm the database.

Fix with **probabilistic early expiration** or a **lock**:
\`\`\`
1. First request gets cache miss, acquires a Redis lock
2. Other requests see the lock, wait briefly, then re-check the cache
3. Lock holder populates the cache and releases the lock
4. All waiting requests serve from cache
\`\`\`

## What NOT to Cache

- **Highly personalised data** — if every user has unique data, cache hit rate is low
- **Financial balances** — stale balance leads to double-spend bugs; use DB transactions instead
- **Data that must be consistent** — prefer short TTLs and accept some staleness, or skip caching

## Redis Data Structures

Redis is more than a key-value store:

- **String** — simple values, counters (\`INCR rate_limit:user:123\`)
- **Hash** — object fields without serialising the whole object (\`HSET user:123 name "Alice"\`)
- **List** — queues, activity feeds (\`LPUSH\`, \`RPOP\`)
- **Sorted Set** — leaderboards, rate limiting windows (\`ZADD\`, \`ZRANGE\`)
- **Set** — unique membership (\`SADD\`, \`SISMEMBER\`)

## Measuring Cache Effectiveness

Track your hit rate: \`hits / (hits + misses)\`. Aim for >90% on hot paths. A hit rate below 50% means you're caching the wrong things or TTLs are too short.`,
    quizzes: [
      {
        question: "A popular product page has a 60-second cache TTL. At exactly T=60s, 500 concurrent requests miss the cache. What problem is this and how do you fix it?",
        choices: [
          { id: "a", label: "Cache poisoning — use HTTPS", correct: false },
          { id: "b", label: "Cache stampede — use a lock or probabilistic early expiration", correct: true },
          { id: "c", label: "Dirty read — use Serializable isolation", correct: false },
          { id: "d", label: "Memory leak — increase Redis maxmemory", correct: false },
        ],
        order: 1,
      },
      {
        question: "Which data should you avoid caching?",
        choices: [
          { id: "a", label: "Public product catalogue updated once per day", correct: false },
          { id: "b", label: "User profile data read on every request", correct: false },
          { id: "c", label: "Account balances used in financial transactions", correct: true },
          { id: "d", label: "Country list used for address forms", correct: false },
        ],
        order: 2,
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    slug: "observability-logs-metrics-traces",
    title: "Observability: Logs, Metrics & Distributed Traces",
    description: "Build production services you can actually debug — structured logs, custom metrics, and distributed tracing.",
    dimension: "observability",
    difficulty: "intermediate",
    estimatedMinutes: 14,
    order: 30,
    content: `## The Three Pillars

Observability answers "what is my system doing right now?" It's made up of three complementary signals:

- **Logs** — discrete events ("order_created", "payment_failed")
- **Metrics** — numeric aggregates over time (request rate, p99 latency, error rate)
- **Traces** — the path of a single request through multiple services

You need all three. Logs tell you *what* happened. Metrics tell you *how often* and whether it's trending. Traces tell you *where* time was spent.

## Structured Logging

Plain text logs are unsearchable at scale. Use structured JSON logs instead:

\`\`\`js
// Bad
console.log('Failed to process payment for user 123, order 456');

// Good
logger.error({
  event: 'payment_failed',
  userId: 'user_123',
  orderId: 'ord_456',
  errorCode: 'CARD_DECLINED',
  durationMs: 234,
});
\`\`\`

With structured logs, you can query: \`event:payment_failed AND errorCode:CARD_DECLINED\` across millions of events in seconds.

**Log levels:**
- \`error\` — something broke, requires attention
- \`warn\` — unexpected but handled; worth monitoring
- \`info\` — significant business events (order created, user signed up)
- \`debug\` — developer detail; disable in production

Never log secrets, PII (email, phone, SSN) in plaintext. Mask or omit.

## Metrics

Metrics are numeric measurements sampled over time. The four golden signals (Google SRE):

1. **Latency** — how long requests take (p50, p95, p99 — not average)
2. **Traffic** — request rate (req/s)
3. **Errors** — error rate (5xx/s, failed payments/min)
4. **Saturation** — how full is the system (CPU %, queue depth, DB connections)

Prometheus is the standard for metrics. You expose a \`/metrics\` endpoint; Prometheus scrapes it.

\`\`\`js
const histogram = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
});
\`\`\`

## Distributed Tracing

A trace represents a single request as it flows through your services. Each service adds a **span** — a timed operation with metadata.

\`\`\`
[HTTP request] → [API Gateway] → [Order Service] → [DB query]
                                               → [Payment Service] → [Stripe API]
\`\`\`

A trace ID propagates through all services via HTTP headers (\`traceparent\` in W3C format). When an order is slow, you open the trace and see: 10ms in the API gateway, 5ms in the order service, 220ms in the payment service waiting for Stripe. Problem identified.

**OpenTelemetry** is the standard for instrumentation — vendor-neutral, works with Jaeger, Datadog, Grafana Tempo, etc.

## SLOs and Error Budgets

A **Service Level Objective (SLO)** is a target for how reliable your service should be:
- "99.5% of requests return 2xx within 500ms over a 30-day window"

An **error budget** is 100% minus your SLO. If your SLO is 99.5%, your error budget is 0.5% (about 2 hours/month of downtime).

When you've burned your error budget, you stop shipping features and focus on reliability. This creates healthy tension between shipping speed and quality.

## Practical Starting Point

1. Add structured logging (pino or winston) with \`requestId\` on every log line
2. Expose a \`/health\` endpoint (for load balancers) and a \`/metrics\` endpoint
3. Set up alerting on error rate and p99 latency, not just uptime
4. Add a trace ID to every outgoing HTTP response header (\`X-Request-Id\`)`,
    quizzes: [
      {
        question: "A payment service is slow. You have logs showing individual errors, but can't tell where time is being spent across services. Which observability signal is missing?",
        choices: [
          { id: "a", label: "Metrics — add a Prometheus counter", correct: false },
          { id: "b", label: "Distributed tracing — to see the request path across services", correct: true },
          { id: "c", label: "More log verbosity — add debug level logs", correct: false },
          { id: "d", label: "Alerts — set up PagerDuty", correct: false },
        ],
        order: 1,
      },
      {
        question: "Your API logs include raw email addresses in the request body. What is the most important fix?",
        choices: [
          { id: "a", label: "Switch from JSON logs to plain text to avoid indexing", correct: false },
          { id: "b", label: "Mask or omit PII before logging — storing raw email in logs is a compliance and security risk", correct: true },
          { id: "c", label: "Set log level to error to reduce volume", correct: false },
          { id: "d", label: "Rotate logs every hour", correct: false },
        ],
        order: 2,
      },
    ],
  },
] as const;

export async function seedLessons() {
  for (const l of LESSONS) {
    const exists = await db.query.lesson.findFirst({
      where: eq(lesson.slug, l.slug),
    });
    if (exists) continue;

    const lessonId = crypto.randomUUID();
    await db.insert(lesson).values({
      id: lessonId,
      slug: l.slug,
      title: l.title,
      description: l.description,
      content: l.content,
      dimension: l.dimension,
      difficulty: l.difficulty,
      estimatedMinutes: l.estimatedMinutes,
      order: l.order,
    });

    for (const q of l.quizzes) {
      await db.insert(quiz).values({
        id: crypto.randomUUID(),
        lessonId,
        question: q.question,
        choices: q.choices,
        order: q.order,
      });
    }
  }
}
