// Seed script for lessons — uses pg directly to avoid ESM workspace issues
// Run: pnpm seed:lessons (reads DATABASE_URL from .env.local automatically)

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Pool } = require("/Users/abubaker/projects/graduate-dev/packages/db/node_modules/pg");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { randomUUID } = require("crypto");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("fs");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("path");

// Load .env.local / .env without a dotenv dependency
for (const file of [".env.local", ".env"]) {
  const filePath = path.resolve(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const val = match[2].trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error("DATABASE_URL not set"); process.exit(1); }

function normUrl(url: string): string {
  const u = new URL(url);
  if (u.searchParams.get("sslmode") && u.searchParams.get("uselibpqcompat") !== "true") {
    u.searchParams.set("uselibpqcompat", "true");
  }
  return u.toString();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pool = new Pool({ connectionString: normUrl(DATABASE_URL!), max: 3 }) as any;

type Choice = { id: string; label: string; correct: boolean };
type QuizItem = { question: string; choices: Choice[]; order: number };
type Lesson = {
  slug: string; title: string; description: string; dimension: string;
  difficulty: string; estimatedMinutes: number; order: number;
  content: string; quizzes: QuizItem[];
};

const LESSONS: Lesson[] = [
  {
    slug: "python-pandas-essentials",
    title: "Pandas Essentials for Data Work",
    description: "Master the DataFrame operations every ML engineer uses daily.",
    dimension: "python", difficulty: "beginner", estimatedMinutes: 14, order: 6,
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
merged = pd.merge(orders, users, on="user_id", how="left")
\`\`\`

## Practical Tips

- \`df.copy()\` before mutating to avoid SettingWithCopyWarning.
- \`df.astype({"col": "int32"})\` to reduce memory on large datasets.
- \`pd.read_csv(..., usecols=[...])\` loads only the columns you need.`,
    quizzes: [
      { question: "Which pandas method selects rows by a boolean condition?", order: 1,
        choices: [
          { id: "a", label: ".iloc with a mask", correct: false },
          { id: "b", label: ".loc with a boolean Series", correct: true },
          { id: "c", label: ".select()", correct: false },
          { id: "d", label: ".where() only", correct: false },
        ] },
      { question: "What does df.groupby('dept')['salary'].mean() return?", order: 2,
        choices: [
          { id: "a", label: "The mean salary for each department as a Series", correct: true },
          { id: "b", label: "A single float — the overall mean salary", correct: false },
          { id: "c", label: "A DataFrame with all salary rows grouped", correct: false },
          { id: "d", label: "An error — you must call .agg() instead", correct: false },
        ] },
    ],
  },
  {
    slug: "python-generators-and-iterators",
    title: "Generators & Iterators for Large Data",
    description: "Process datasets that don't fit in memory using Python's lazy evaluation model.",
    dimension: "python", difficulty: "intermediate", estimatedMinutes: 12, order: 7,
    content: `## The Memory Problem

Loading a 10GB CSV into a list puts the entire thing in RAM before you process a single row. Generators let you process one item at a time — constant memory regardless of dataset size.

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
squares_gen = (x**2 for x in range(1_000_000))
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

pipeline = filter_valid(normalize(read_chunks("data.csv")))
for batch in pipeline:
    model.train(batch)
\`\`\`

## When NOT to Use Generators

- When you need random access (indexing by position).
- When you need to iterate multiple times — generators are consumed once.
- When the dataset fits comfortably in memory.`,
    quizzes: [
      { question: "What is the key advantage of a generator over a list?", order: 1,
        choices: [
          { id: "a", label: "Generators are faster to index", correct: false },
          { id: "b", label: "Generators produce values lazily, using constant memory", correct: true },
          { id: "c", label: "Generators can be iterated multiple times", correct: false },
          { id: "d", label: "Generators support slicing", correct: false },
        ] },
      { question: "What keyword turns a function into a generator?", order: 2,
        choices: [
          { id: "a", label: "async", correct: false },
          { id: "b", label: "return", correct: false },
          { id: "c", label: "yield", correct: true },
          { id: "d", label: "generate", correct: false },
        ] },
    ],
  },
  {
    slug: "supervised-vs-unsupervised-learning",
    title: "Supervised vs. Unsupervised Learning",
    description: "Understand the two fundamental paradigms of machine learning and when to apply each.",
    dimension: "ml_basics", difficulty: "beginner", estimatedMinutes: 12, order: 8,
    content: `## The Core Distinction

In **supervised learning**, every training example has a label — the correct output. The model learns a mapping from inputs to outputs and is evaluated on how accurately it predicts labels on unseen data.

In **unsupervised learning**, there are no labels. The model finds structure, patterns, or groupings in the data without being told what to look for.

## Supervised Learning

**Classification** — the output is a category: spam/not spam, which digit (0–9), which objects in a photo.

Common algorithms: logistic regression, decision trees, random forests, SVMs, neural networks.

**Regression** — the output is a continuous number: house price, sales forecast.

Common algorithms: linear regression, gradient boosting (XGBoost, LightGBM), neural networks.

## Unsupervised Learning

**Clustering** — group similar examples without labels:
- K-means: assigns each point to the nearest of k centroids.
- DBSCAN: density-based; handles irregular shapes and identifies outliers as noise.

**Dimensionality Reduction**:
- PCA: linear projection onto directions of maximum variance.
- t-SNE / UMAP: non-linear; excellent for 2D/3D visualisation.

## Choosing the Right Paradigm

| Scenario | Paradigm |
|---|---|
| You have labelled historical outcomes | Supervised |
| You want to discover natural groupings | Unsupervised (clustering) |
| You want to visualise high-dimensional data | Unsupervised (dim. reduction) |
| Labels are rare; unlabelled data is plentiful | Semi-supervised |`,
    quizzes: [
      { question: "What distinguishes supervised from unsupervised learning?", order: 1,
        choices: [
          { id: "a", label: "Supervised learning uses more data", correct: false },
          { id: "b", label: "Supervised learning trains on labelled examples; unsupervised does not", correct: true },
          { id: "c", label: "Unsupervised learning requires a GPU", correct: false },
          { id: "d", label: "Supervised learning can only do classification", correct: false },
        ] },
      { question: "Which algorithm is commonly used for clustering?", order: 2,
        choices: [
          { id: "a", label: "Logistic regression", correct: false },
          { id: "b", label: "PCA", correct: false },
          { id: "c", label: "K-means", correct: true },
          { id: "d", label: "Linear regression", correct: false },
        ] },
    ],
  },
  {
    slug: "bias-variance-tradeoff",
    title: "The Bias-Variance Tradeoff",
    description: "Diagnose underfitting and overfitting and choose the right regularization strategy.",
    dimension: "ml_basics", difficulty: "intermediate", estimatedMinutes: 13, order: 9,
    content: `## Total Prediction Error

**Error = Bias² + Variance + Irreducible Noise**

- **Bias** — error from wrong assumptions. A linear model on non-linear data has high bias.
- **Variance** — sensitivity to training data fluctuations. A model that memorises training has high variance.
- **Irreducible noise** — randomness you cannot remove.

## Underfitting (High Bias)

Symptoms: high training error, train and val errors are similar (both high).

Fixes: more expressive model, more relevant features, reduce regularisation.

## Overfitting (High Variance)

Symptoms: low training error, high validation error (large gap).

Fixes: regularisation (L1/L2/dropout), more data, data augmentation, early stopping, simpler model.

## Regularization Techniques

**L2 (Ridge)** — adds λΣwᵢ² to the loss. Shrinks all weights toward zero uniformly.

**L1 (Lasso)** — adds λΣ|wᵢ|. Can set weights to exactly zero — useful for feature selection.

**Dropout** — randomly zeros neurons during training. Prevents co-adaptation.

**Early stopping** — halt when validation loss stops improving.

## Learning Curves

Plot train vs. val error against training set size:
- Both curves high and close → high bias → need more model capacity.
- Large gap (low train, high val) → high variance → need more data or regularisation.`,
    quizzes: [
      { question: "A model has low training error but high validation error. What is the most likely diagnosis?", order: 1,
        choices: [
          { id: "a", label: "High bias (underfitting)", correct: false },
          { id: "b", label: "High variance (overfitting)", correct: true },
          { id: "c", label: "Irreducible noise", correct: false },
          { id: "d", label: "The learning rate is too high", correct: false },
        ] },
      { question: "Which regularization technique can set weights exactly to zero?", order: 2,
        choices: [
          { id: "a", label: "L2 (Ridge)", correct: false },
          { id: "b", label: "Dropout", correct: false },
          { id: "c", label: "L1 (Lasso)", correct: true },
          { id: "d", label: "Early stopping", correct: false },
        ] },
    ],
  },
  {
    slug: "ml-evaluation-metrics",
    title: "Evaluation Metrics for ML Models",
    description: "Choose the right metric for your task — accuracy is almost never enough.",
    dimension: "ml_basics", difficulty: "intermediate", estimatedMinutes: 14, order: 10,
    content: `## Why Accuracy Fails

On a dataset where 99% of samples are class A, always predicting A gives 99% accuracy — while being completely useless. Accuracy hides class imbalance.

## The Confusion Matrix

| | Predicted Positive | Predicted Negative |
|---|---|---|
| **Actual Positive** | TP | FN |
| **Actual Negative** | FP | TN |

## Precision and Recall

**Precision** = TP / (TP + FP) — of everything called positive, what fraction was actually positive? Optimise when false positives are costly (spam filter).

**Recall** = TP / (TP + FN) — of all actual positives, what fraction did the model catch? Optimise when false negatives are costly (cancer screening).

## F1 Score

Harmonic mean of precision and recall:
F1 = 2 × (Precision × Recall) / (Precision + Recall)

Penalises extreme imbalance: precision=1.0, recall=0.01 → F1=0.02, not 0.5.

## ROC-AUC

The ROC curve plots True Positive Rate vs. False Positive Rate at every threshold. AUC summarises in one number: 0.5 = random, 1.0 = perfect. Measures ranking quality regardless of the operating threshold.

## Metric Selection Guide

| Task | Metric |
|---|---|
| Balanced classification | Accuracy or F1 |
| Imbalanced classification | F1, PR-AUC |
| Medical / safety-critical | Recall |
| Spam / fraud | Precision |
| Regression | RMSE or MAE |`,
    quizzes: [
      { question: "A cancer screening model should optimise for which metric?", order: 1,
        choices: [
          { id: "a", label: "Precision — minimise false positives", correct: false },
          { id: "b", label: "Recall — minimise false negatives", correct: true },
          { id: "c", label: "Accuracy", correct: false },
          { id: "d", label: "AUC — it is always the best metric", correct: false },
        ] },
      { question: "Why does F1 score use the harmonic mean instead of the arithmetic mean?", order: 2,
        choices: [
          { id: "a", label: "It is easier to compute", correct: false },
          { id: "b", label: "It penalises extreme imbalances between precision and recall", correct: true },
          { id: "c", label: "It matches the scale of accuracy", correct: false },
          { id: "d", label: "It handles multi-class problems automatically", correct: false },
        ] },
    ],
  },
  {
    slug: "backpropagation-and-gradient-descent",
    title: "Backpropagation & Gradient Descent",
    description: "Understand exactly how neural networks learn — from loss to weight update.",
    dimension: "deep_learning", difficulty: "intermediate", estimatedMinutes: 15, order: 11,
    content: `## The Goal

Training means finding the parameter values that minimise the loss — the gap between predictions and ground truth. We do this by repeatedly adjusting weights in the direction that reduces the loss.

## Gradient Descent

The gradient of the loss w.r.t. each weight tells us: if I increase this weight, does the loss go up or down?

\`\`\`
weight ← weight − learning_rate × ∂Loss/∂weight
\`\`\`

**Mini-batch SGD** — update on batches of 32–512 samples. The standard; balances speed and stability.

## Backpropagation

Backprop propagates the gradient from the loss backwards through each layer using the chain rule. Modern frameworks (PyTorch, JAX) compute this via autograd:

\`\`\`python
import torch
import torch.nn as nn

model = nn.Linear(10, 1)
loss_fn = nn.MSELoss()

pred = model(x)
loss = loss_fn(pred, y)

loss.backward()       # compute all gradients
optimizer.step()      # update weights
optimizer.zero_grad() # clear gradients
\`\`\`

## Optimisers

**Adam** — combines momentum with adaptive per-parameter learning rates. Default for most tasks.

**AdamW** — Adam with decoupled weight decay. Preferred for transformers.

## Common Problems

| Symptom | Fix |
|---|---|
| Loss does not decrease | Increase learning rate |
| Loss diverges | Decrease learning rate |
| NaN loss | Gradient clipping |`,
    quizzes: [
      { question: "What does the gradient of the loss tell you?", order: 1,
        choices: [
          { id: "a", label: "The current accuracy of the model", correct: false },
          { id: "b", label: "The direction and magnitude to adjust each weight to reduce the loss", correct: true },
          { id: "c", label: "The optimal learning rate", correct: false },
          { id: "d", label: "The number of training steps remaining", correct: false },
        ] },
      { question: "Why is Adam preferred over vanilla SGD for most deep learning tasks?", order: 2,
        choices: [
          { id: "a", label: "Adam uses less memory", correct: false },
          { id: "b", label: "Adam adapts the learning rate per parameter and uses momentum", correct: true },
          { id: "c", label: "Adam avoids the need for backpropagation", correct: false },
          { id: "d", label: "Adam only works for classification", correct: false },
        ] },
    ],
  },
  {
    slug: "fine-tuning-vs-rag",
    title: "Fine-tuning vs. RAG: When to Use Each",
    description: "Make the right architectural choice between fine-tuning and retrieval-augmented generation.",
    dimension: "llms_rag", difficulty: "intermediate", estimatedMinutes: 13, order: 12,
    content: `## Two Ways to Customise an LLM

**Fine-tuning** continues training a pretrained model on your data. Weights are updated.

**RAG** keeps the model frozen and injects retrieved context at inference time.

## Fine-tuning: When It Works

- You need the model to adopt a specific style, tone, or output format consistently.
- Your task is well-defined with thousands of labelled examples.
- Knowledge is stable and doesn't change frequently.
- Latency is critical and retrieval overhead is unacceptable.

## Fine-tuning: When It Fails

- Your knowledge base updates regularly — fine-tuning is expensive to redo.
- You need citations or document provenance.
- You have fewer than ~500 high-quality examples.

**LoRA** (Low-Rank Adaptation) is the standard approach — trains only small adapter matrices, 10–100x fewer parameters than full fine-tuning.

## RAG: When It Works

- Knowledge changes frequently (product docs, internal wikis).
- You need attribution — users can see which document was cited.
- Large, diverse corpus that can't fit in fine-tuning data.

## Combining Both

Fine-tune for domain-specific format and reasoning style. Use RAG to inject up-to-date facts.

## Decision Framework

| Question | RAG | Fine-tune |
|---|---|---|
| Knowledge changes frequently? | Yes | No |
| Need citations? | Yes | No |
| Need consistent output format? | No | Yes |
| Large labelled dataset available? | No | Yes |

When in doubt, start with RAG — faster to iterate and reversible.`,
    quizzes: [
      { question: "When is fine-tuning a better choice than RAG?", order: 1,
        choices: [
          { id: "a", label: "When the knowledge base changes daily", correct: false },
          { id: "b", label: "When you need to teach the model a consistent output format or reasoning style", correct: true },
          { id: "c", label: "When you need document-level attribution", correct: false },
          { id: "d", label: "When you have fewer than 50 training examples", correct: false },
        ] },
      { question: "What is LoRA?", order: 2,
        choices: [
          { id: "a", label: "A retrieval algorithm for vector databases", correct: false },
          { id: "b", label: "A parameter-efficient fine-tuning method using low-rank adapter matrices", correct: true },
          { id: "c", label: "A loss function for sequence classification", correct: false },
          { id: "d", label: "A method for compressing embedding vectors", correct: false },
        ] },
    ],
  },
  {
    slug: "ml-experiment-tracking",
    title: "ML Experiment Tracking",
    description: "Track experiments reproducibly so you can compare runs, share results, and never lose a good model.",
    dimension: "mlops", difficulty: "beginner", estimatedMinutes: 12, order: 13,
    content: `## The Problem

ML development is iterative. Without tracking, you lose which configuration produced your best model.

## What to Track Per Run

- **Parameters**: learning rate, batch size, architecture, regularisation
- **Metrics**: loss, accuracy at each epoch
- **Artifacts**: saved model weights, confusion matrices
- **Environment**: library versions, random seed, git commit

## MLflow

\`\`\`python
import mlflow

mlflow.set_experiment("resnet-classifier")

with mlflow.start_run(run_name="lr-0.001"):
    mlflow.log_params({"learning_rate": 0.001, "batch_size": 64})

    for epoch in range(epochs):
        train_loss = train_one_epoch(model, loader)
        val_acc = evaluate(model, val_loader)
        mlflow.log_metrics({"train_loss": train_loss, "val_accuracy": val_acc}, step=epoch)

    mlflow.pytorch.log_model(model, "model")
\`\`\`

Run \`mlflow ui\` to compare runs in a browser.

## Reproducibility

\`\`\`python
import random, numpy as np, torch

def seed_everything(seed=42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
\`\`\`

Pin library versions, record the git commit, log the data checksum.

## Hyperparameter Search

Use Optuna (Bayesian optimisation) for larger searches — it focuses on promising regions of the hyperparameter space rather than exhaustive grid search.`,
    quizzes: [
      { question: "What should you log per training run to make it reproducible?", order: 1,
        choices: [
          { id: "a", label: "Only the final validation accuracy", correct: false },
          { id: "b", label: "Parameters, metrics, artifacts, and environment (seed, versions, git commit)", correct: true },
          { id: "c", label: "The model architecture diagram", correct: false },
          { id: "d", label: "Training time only", correct: false },
        ] },
      { question: "Which tool is the most widely used open-source option for ML experiment tracking?", order: 2,
        choices: [
          { id: "a", label: "Weights and Biases", correct: false },
          { id: "b", label: "TensorBoard", correct: false },
          { id: "c", label: "MLflow", correct: true },
          { id: "d", label: "Comet", correct: false },
        ] },
    ],
  },
  {
    slug: "model-serving-patterns",
    title: "Model Serving Patterns",
    description: "Deploy ML models as reliable APIs — REST, batch, and streaming patterns compared.",
    dimension: "mlops", difficulty: "intermediate", estimatedMinutes: 14, order: 14,
    content: `## Three Deployment Patterns

### Online Serving (REST API)

A model wrapped in an HTTP endpoint for real-time predictions.

\`\`\`python
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
        score = model(embed(req.text)).item()
    return {"score": score}
\`\`\`

**Use when**: latency matters, predictions are needed one-at-a-time.

### Batch Inference

Run predictions on a large dataset offline, store results in a database.

**Use when**: predictions are pre-computed (recommendations, churn scores), high throughput matters more than latency.

### Streaming Inference

Predictions triggered by events in a message queue (Kafka, SQS).

**Use when**: near-real-time predictions at scale without blocking the caller.

## Model Format Choices

| Format | Portability | Use case |
|---|---|---|
| PyTorch .pt | Low | Development |
| ONNX | High | Cross-framework serving |
| TensorRT | Low | Maximum GPU throughput |

For CPU inference, convert to ONNX — 2–5x faster than PyTorch eager mode.

## Canary Deployments

Route 5% of traffic to the new model. Compare metrics. Gradually increase if they hold. Never replace a production model wholesale.

## Monitoring

Track: data drift, prediction drift, p99 latency, error rate.`,
    quizzes: [
      { question: "When is batch inference preferred over online serving?", order: 1,
        choices: [
          { id: "a", label: "When user-facing latency is critical", correct: false },
          { id: "b", label: "When predictions are pre-computed and high throughput matters more than latency", correct: true },
          { id: "c", label: "When predictions change every millisecond", correct: false },
          { id: "d", label: "When you serve fewer than 10 requests per second", correct: false },
        ] },
      { question: "What is the purpose of a canary deployment?", order: 2,
        choices: [
          { id: "a", label: "To monitor data drift in training data", correct: false },
          { id: "b", label: "To route a small percentage of traffic to a new model before full rollout", correct: true },
          { id: "c", label: "To run batch inference in parallel", correct: false },
          { id: "d", label: "To convert models to ONNX format", correct: false },
        ] },
    ],
  },
  {
    slug: "cap-theorem-and-distributed-systems",
    title: "CAP Theorem & Distributed Systems Trade-offs",
    description: "Understand the fundamental constraints of distributed systems and make principled consistency choices.",
    dimension: "system_design", difficulty: "intermediate", estimatedMinutes: 14, order: 15,
    content: `## The CAP Theorem

A distributed data store can provide at most **two** of three guarantees:

- **Consistency (C)** — every read returns the most recent write (or an error).
- **Availability (A)** — every request receives a non-error response (may not be the latest data).
- **Partition tolerance (P)** — the system continues despite network partitions.

Because partitions are unavoidable in real distributed systems, you always have P. The real choice is **C vs. A** when a partition occurs.

## CP Systems

During a partition, refuse to answer rather than risk stale data.

Examples: HBase, Zookeeper, CockroachDB.

Use when: financial transactions, inventory (can't oversell), distributed locks.

## AP Systems

During a partition, return best available data (may be stale). After healing, nodes eventually converge.

Examples: Cassandra, DynamoDB, CouchDB.

Use when: social feeds, recommendations, shopping carts.

## Consistency Models (Strongest to Weakest)

1. **Linearisability** — reads always reflect the last acknowledged write globally.
2. **Sequential consistency** — consistent order, reads may lag slightly.
3. **Causal consistency** — cause-and-effect ordered; unrelated ops may be concurrent.
4. **Eventual consistency** — replicas converge after writes stop.

## Practical Application

Most production systems use different consistency levels per operation:
- Process a payment → linearisability.
- Read a social timeline → eventual consistency.
- Update user preferences → eventual consistency is fine.`,
    quizzes: [
      { question: "Why is partition tolerance almost always required in distributed systems?", order: 1,
        choices: [
          { id: "a", label: "It improves read latency", correct: false },
          { id: "b", label: "Network partitions are unavoidable in any real distributed deployment", correct: true },
          { id: "c", label: "It is required by cloud providers", correct: false },
          { id: "d", label: "It prevents data loss on node failure", correct: false },
        ] },
      { question: "DynamoDB and Cassandra are examples of which CAP trade-off?", order: 2,
        choices: [
          { id: "a", label: "CP — they prefer consistency over availability", correct: false },
          { id: "b", label: "AP — they prefer availability and eventual consistency", correct: true },
          { id: "c", label: "CA — they sacrifice partition tolerance", correct: false },
          { id: "d", label: "They achieve all three guarantees simultaneously", correct: false },
        ] },
    ],
  },
  {
    slug: "database-indexing-and-query-optimisation",
    title: "Database Indexing & Query Optimisation",
    description: "Write queries that scale: understand B-tree indexes, explain plans, and common traps.",
    dimension: "system_design", difficulty: "intermediate", estimatedMinutes: 15, order: 16,
    content: `## Why Queries Are Slow

Without an index, the database scans every row — O(n). On 10M rows, 1ms with index vs. 30s without.

## B-Tree Indexes

The default index type in Postgres. Stores a sorted copy of indexed column(s) plus a pointer to the full row. Lookup is O(log n).

\`\`\`sql
CREATE INDEX idx_users_email ON users(email);
-- Now this is O(log n) instead of O(n):
SELECT * FROM users WHERE email = 'user@example.com';
\`\`\`

## Composite Indexes

A composite index on (col_a, col_b) supports queries on col_a alone, or both col_a AND col_b. It does NOT support filtering on col_b alone (leftmost prefix rule).

\`\`\`sql
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);

-- Fast — uses full index
SELECT * FROM orders WHERE user_id = 1 AND created_at > '2024-01-01';

-- Slow — skips the left column
SELECT * FROM orders WHERE created_at > '2024-01-01';
\`\`\`

## EXPLAIN ANALYZE

\`\`\`sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 42;
\`\`\`

Look for:
- **Seq Scan** → full table scan, likely a missing index.
- **Index Scan** → using the index correctly.

## Common Anti-Patterns

Function on indexed column defeats the index:
\`\`\`sql
-- Slow
WHERE LOWER(email) = 'user@example.com'
-- Fix: functional index
CREATE INDEX ON users(LOWER(email));
\`\`\`

N+1 queries — one query per loop iteration. Fix with JOIN or IN clause.`,
    quizzes: [
      { question: "Given index on (user_id, created_at), which query will NOT use it efficiently?", order: 1,
        choices: [
          { id: "a", label: "WHERE user_id = 1 AND created_at > '2024-01-01'", correct: false },
          { id: "b", label: "WHERE user_id = 1", correct: false },
          { id: "c", label: "WHERE created_at > '2024-01-01'", correct: true },
          { id: "d", label: "ORDER BY user_id, created_at", correct: false },
        ] },
      { question: "What does 'Seq Scan' in EXPLAIN ANALYZE indicate?", order: 2,
        choices: [
          { id: "a", label: "The query used an index successfully", correct: false },
          { id: "b", label: "The query is performing a full table scan — likely a missing index", correct: true },
          { id: "c", label: "The query is sequential and correct", correct: false },
          { id: "d", label: "The query result was cached", correct: false },
        ] },
    ],
  },
  {
    slug: "api-design-fundamentals",
    title: "API Design Fundamentals",
    description: "Design APIs that are intuitive, versioned, and safe to evolve over time.",
    dimension: "system_design", difficulty: "beginner", estimatedMinutes: 13, order: 17,
    content: `## REST Principles

RESTful APIs use nouns for resource URLs and map HTTP methods to CRUD:

\`\`\`
GET    /users          → list users
GET    /users/42       → get user 42
POST   /users          → create a user
PUT    /users/42       → replace user 42
PATCH  /users/42       → partially update user 42
DELETE /users/42       → delete user 42
\`\`\`

## HTTP Status Codes That Matter

| Code | Meaning |
|---|---|
| 200 OK | Success |
| 201 Created | Resource created (POST) |
| 204 No Content | Success, no body (DELETE) |
| 400 Bad Request | Invalid input |
| 401 Unauthorized | Not authenticated |
| 403 Forbidden | Authenticated but not allowed |
| 404 Not Found | Resource does not exist |
| 429 Too Many Requests | Rate limited |

## Versioning

\`\`\`
/api/v1/users    ← current
/api/v2/users    ← breaking change
\`\`\`

Never change a response field type without a version bump.

## Pagination

Never return unbounded lists. Use cursor-based pagination:

\`\`\`json
GET /posts?after=post_abc123&limit=20

{ "data": [...], "next_cursor": "post_xyz789", "has_more": true }
\`\`\`

Cursor-based is preferred over offset — offset becomes inconsistent when data is inserted between pages.

## Idempotency

GET, PUT, DELETE are inherently idempotent. For POST payment endpoints, accept an Idempotency-Key header to deduplicate retries.`,
    quizzes: [
      { question: "Which HTTP method should be used to partially update a resource?", order: 1,
        choices: [
          { id: "a", label: "PUT", correct: false },
          { id: "b", label: "POST", correct: false },
          { id: "c", label: "PATCH", correct: true },
          { id: "d", label: "UPDATE", correct: false },
        ] },
      { question: "Why is cursor-based pagination preferred over offset pagination for large datasets?", order: 2,
        choices: [
          { id: "a", label: "It is simpler to implement", correct: false },
          { id: "b", label: "Offset pagination becomes inconsistent when rows are inserted between pages", correct: true },
          { id: "c", label: "Cursor pagination is faster on small datasets", correct: false },
          { id: "d", label: "Offset pagination does not support filtering", correct: false },
        ] },
    ],
  },
  {
    slug: "big-o-complexity",
    title: "Big-O Complexity Analysis",
    description: "Reason about algorithm performance and predict how code scales before running it.",
    dimension: "algorithms", difficulty: "beginner", estimatedMinutes: 12, order: 18,
    content: `## What Big-O Measures

Big-O describes how worst-case runtime (or memory) grows as input size n increases. It ignores constants and lower-order terms.

## Common Complexities

| Notation | Name | Example |
|---|---|---|
| O(1) | Constant | Hash table lookup, array index access |
| O(log n) | Logarithmic | Binary search, balanced BST |
| O(n) | Linear | Single loop over array |
| O(n log n) | Linearithmic | Merge sort, heap sort |
| O(n²) | Quadratic | Nested loops over same array |
| O(2ⁿ) | Exponential | Recursive Fibonacci without memoisation |

## Recognising Complexity from Code

\`\`\`python
# O(n) — one loop
def linear_search(arr, target):
    for x in arr:
        if x == target: return True
    return False

# O(n²) — nested loop
def has_pair_naive(arr, target):
    for i in range(len(arr)):
        for j in range(i+1, len(arr)):
            if arr[i] + arr[j] == target: return True
    return False

# O(n) — same problem with a hash set
def has_pair(arr, target):
    seen = set()
    for x in arr:
        if target - x in seen: return True
        seen.add(x)
    return False
\`\`\`

## Practical Rules

1. Nested loops over n → O(n²) unless the inner loop has a fixed bound.
2. Halving the problem each step → O(log n).
3. Sorting the input adds O(n log n).
4. Hash table lookup is O(1) average.`,
    quizzes: [
      { question: "What is the time complexity of binary search on a sorted array of n elements?", order: 1,
        choices: [
          { id: "a", label: "O(n)", correct: false },
          { id: "b", label: "O(n²)", correct: false },
          { id: "c", label: "O(log n)", correct: true },
          { id: "d", label: "O(1)", correct: false },
        ] },
      { question: "Two nested for-loops each iterating over an n-element array gives what complexity?", order: 2,
        choices: [
          { id: "a", label: "O(2n)", correct: false },
          { id: "b", label: "O(n log n)", correct: false },
          { id: "c", label: "O(n²)", correct: true },
          { id: "d", label: "O(n)", correct: false },
        ] },
    ],
  },
  {
    slug: "graph-traversal-bfs-dfs",
    title: "Graph Traversal: BFS & DFS",
    description: "Traverse any graph or tree problem with breadth-first and depth-first search.",
    dimension: "algorithms", difficulty: "intermediate", estimatedMinutes: 15, order: 19,
    content: `## BFS — Breadth-First Search

Explores all nodes at distance 1 before distance 2. Uses a queue (FIFO).

\`\`\`python
from collections import deque

def bfs(graph, start):
    visited = set([start])
    queue = deque([start])
    while queue:
        node = queue.popleft()
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
\`\`\`

**Use BFS when**: shortest path in an unweighted graph, level-order traversal.

## DFS — Depth-First Search

Goes as deep as possible before backtracking. Uses a stack (or recursion).

\`\`\`python
def dfs(graph, start, visited=None):
    if visited is None: visited = set()
    visited.add(start)
    for neighbor in graph[start]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited)
\`\`\`

**Use DFS when**: cycle detection, all paths, topological sort.

## Topological Sort (DFS)

For a DAG, produces a linear ordering where every edge goes from earlier to later:

\`\`\`python
def topo_sort(graph):
    visited, result = set(), []
    def dfs(node):
        visited.add(node)
        for nb in graph[node]:
            if nb not in visited: dfs(nb)
        result.append(node)
    for node in graph:
        if node not in visited: dfs(node)
    return result[::-1]
\`\`\`

## BFS vs DFS

| Property | BFS | DFS |
|---|---|---|
| Data structure | Queue | Stack / recursion |
| Finds shortest path | Yes (unweighted) | No |
| Topological sort | No | Yes |`,
    quizzes: [
      { question: "Why does BFS guarantee the shortest path in an unweighted graph?", order: 1,
        choices: [
          { id: "a", label: "Because it uses a stack", correct: false },
          { id: "b", label: "Because it explores all nodes at distance k before any node at distance k+1", correct: true },
          { id: "c", label: "Because it visits nodes alphabetically", correct: false },
          { id: "d", label: "Because it avoids cycles", correct: false },
        ] },
      { question: "Which traversal is used for topological sorting of a DAG?", order: 2,
        choices: [
          { id: "a", label: "BFS", correct: false },
          { id: "b", label: "DFS with post-order tracking", correct: true },
          { id: "c", label: "Dijkstra's algorithm", correct: false },
          { id: "d", label: "Binary search", correct: false },
        ] },
    ],
  },
  {
    slug: "dynamic-programming-fundamentals",
    title: "Dynamic Programming Fundamentals",
    description: "Solve overlapping-subproblem problems with memoisation or tabulation.",
    dimension: "algorithms", difficulty: "intermediate", estimatedMinutes: 16, order: 20,
    content: `## What is Dynamic Programming?

DP solves problems by breaking them into overlapping subproblems, solving each once, and storing results. It applies when: (1) optimal substructure, (2) overlapping subproblems.

## Memoisation (Top-Down)

\`\`\`python
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    if n <= 1: return n
    return fib(n-1) + fib(n-2)
# Without cache: O(2ⁿ). With cache: O(n).
\`\`\`

## Tabulation (Bottom-Up)

\`\`\`python
def fib(n):
    if n <= 1: return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]
\`\`\`

## Classic: Longest Common Subsequence

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
    return dp[m][n]
\`\`\`

## Identifying DP Problems

1. Asks for minimum, maximum, or count of something.
2. Future decisions depend on past choices.
3. Brute-force involves exponential recursion with repeated subproblems.

## Approach

1. Define what dp[i] or dp[i][j] represents.
2. Find the recurrence relation.
3. Determine base cases.
4. Iterate bottom-up or use a top-down cache.`,
    quizzes: [
      { question: "What two properties must a problem have for DP to apply?", order: 1,
        choices: [
          { id: "a", label: "Greedy choice and polynomial time", correct: false },
          { id: "b", label: "Optimal substructure and overlapping subproblems", correct: true },
          { id: "c", label: "Sorted input and binary search", correct: false },
          { id: "d", label: "Graph structure and DFS traversal", correct: false },
        ] },
      { question: "What does memoisation do to make recursive DP efficient?", order: 2,
        choices: [
          { id: "a", label: "It converts recursion to iteration", correct: false },
          { id: "b", label: "It stores results of subproblems so each is solved only once", correct: true },
          { id: "c", label: "It reduces the problem size by half each call", correct: false },
          { id: "d", label: "It eliminates the need for base cases", correct: false },
        ] },
    ],
  },
  {
    slug: "writing-technical-design-docs",
    title: "Writing Technical Design Documents",
    description: "Write RFCs that get alignment fast: structure, trade-offs, and what reviewers actually read.",
    dimension: "soft_skills", difficulty: "beginner", estimatedMinutes: 11, order: 21,
    content: `## Why Design Docs Exist

1. **Force clarity** — writing exposes gaps in your thinking before you build.
2. **Create alignment** — stakeholders review asynchronously and raise concerns early.

## Structure That Works

**1. Problem / Context** — what is broken or needed? Be specific. "The search endpoint takes 3s p99 for users with over 500 documents."

**2. Goals and Non-Goals** — what this solves, and explicitly what it will NOT solve.

**3. Proposed Solution** — be concrete. "We will add a Redis cache with 5-minute TTL per user" is better than "we will use caching."

**4. Trade-offs and Alternatives Considered** — the most important section for senior reviewers. Show you considered other approaches and explain why you rejected them.

**5. Open Questions** — what you don't know yet. Invites reviewers to contribute.

**6. Implementation Plan** — phases, timeline, dependencies.

## What Reviewers Actually Read

- Put the most controversial choice up front.
- Use clear heading hierarchy.
- Bold the key claim in each section.
- Keep the whole doc under 2 pages.

A 10-page design doc signals the proposal is not well understood by its author.

## Getting Feedback

- Set a deadline: "Please comment by Friday EOD."
- Tag reviewers: FYI (informational), Consulted (input needed), Approved (must sign off).
- When a reviewer raises a valid concern — update the doc, don't defend it.

## After the Doc

Move the decision to a permanent record (DECISIONS.md or ADR in the repo). Docs that live only in Confluence get lost.`,
    quizzes: [
      { question: "Which section of a design doc is most important to senior reviewers?", order: 1,
        choices: [
          { id: "a", label: "The implementation timeline", correct: false },
          { id: "b", label: "Alternatives considered and why they were rejected", correct: true },
          { id: "c", label: "The problem statement", correct: false },
          { id: "d", label: "The open questions", correct: false },
        ] },
      { question: "What should you do when a reviewer raises a valid concern about your design doc?", order: 2,
        choices: [
          { id: "a", label: "Defend the original proposal to show confidence", correct: false },
          { id: "b", label: "Update the doc to reflect the new understanding", correct: true },
          { id: "c", label: "Start a new document from scratch", correct: false },
          { id: "d", label: "Wait until the review period ends before making changes", correct: false },
        ] },
    ],
  },
  {
    slug: "effective-code-review",
    title: "Effective Code Review",
    description: "Review code that makes colleagues better, not defensive — and get your own PRs merged faster.",
    dimension: "soft_skills", difficulty: "beginner", estimatedMinutes: 10, order: 22,
    content: `## The Purpose of Code Review

1. Catch bugs and security issues before production.
2. Share knowledge — both sides learn.
3. Maintain consistency.
4. Improve the author — a teaching opportunity.

## Reviewing Code: Comment Types

Use a clear prefix:

- **[blocking]** — must be resolved before merging: correctness bug, security issue, convention violation.
- **[nit]** — style preference; the author can take it or leave it.
- **[question]** — you don't understand something; not necessarily a problem.
- **[suggestion]** — optional alternative approach.

**Explain why, not just what.** "This will panic if user is nil" is better than "add nil check."

**Approve when it is good enough.** If the PR achieves its goal, is safe, and does not make things worse, approve it.

## Submitting PRs

**Keep PRs small.** Under 400 lines gets reviewed in minutes. Over 1000 lines gets rubber-stamped or ignored.

**Write a clear PR description.** What changed, why, and how to test it.

**Self-review first.** Read your own diff — you will catch 20–30% of issues yourself.

**Respond to all comments.** Even if you don't make the change, acknowledge it and explain why.

## Automate Formatting

If your team argues about tabs vs. spaces — automate it. Prettier, Black, and rustfmt exist so humans don't argue about formatting. Redirect that energy to correctness and design.

## The 24-Hour Rule

Review code within 24 hours. Code sitting in review for 3 days blocks the author and causes context-switching. Treat review as first-class engineering work, not an interruption.`,
    quizzes: [
      { question: "What does a [blocking] comment in a code review mean?", order: 1,
        choices: [
          { id: "a", label: "It is a personal style preference", correct: false },
          { id: "b", label: "The PR must address this before it can be merged", correct: true },
          { id: "c", label: "The reviewer is confused and needs clarification", correct: false },
          { id: "d", label: "The comment blocks the reviewer from reading further", correct: false },
        ] },
      { question: "Why should PRs be kept small (under ~400 lines)?", order: 2,
        choices: [
          { id: "a", label: "Larger PRs exceed the git diff limit", correct: false },
          { id: "b", label: "Small PRs are reviewed thoroughly; large PRs tend to get rubber-stamped or ignored", correct: true },
          { id: "c", label: "Smaller PRs always have fewer bugs", correct: false },
          { id: "d", label: "It is a requirement for CI to pass", correct: false },
        ] },
    ],
  },
  {
    slug: "writing-clear-technical-documentation",
    title: "Writing Clear Technical Documentation",
    description: "Write documentation that developers actually read — precise, structured, and jargon-free.",
    dimension: "english", difficulty: "beginner", estimatedMinutes: 10, order: 23,
    content: `## Why Most Documentation Fails

1. **Too much assumed knowledge** — the author forgets what it was like not to know.
2. **Too little structure** — a wall of text that rewards only those who read every word.
3. **Out of date** — correct when written, wrong six months later.

## Know Your Audience

Before writing, answer: who will read this, and what do they already know?

- A public library README: assume a developer who knows the domain but not your library.
- An internal runbook: assume an on-call engineer at 2am who wants to solve the problem, not understand the architecture.
- An API reference: assume the reader knows the language and needs a specific function signature.

## Structure: The Inverted Pyramid

Put the most important information first. Readers scan before they read.

For a README:
1. One-sentence description.
2. Install and quickstart (copy-paste code).
3. Core concepts (only what is needed for the quickstart).
4. Reference (full API).

## Writing Style

- **Active voice**: "Call db.connect() before querying" not "Queries should be preceded by a connect call."
- **Be concrete**: "reduces query time by 40–60% on tables with over 100k rows" not "can improve performance."
- **Short sentences**. If you need a comma and semicolon in the same sentence, split it.
- **Show, don't tell**. Code examples outperform prose for technical concepts.

## Keeping Docs Current

- Co-locate docs with the code they describe — a README in the repo is updated when the repo changes.
- Add a documentation update checkbox to your PR template.
- Delete docs that are no longer accurate — a wrong doc is worse than no doc.`,
    quizzes: [
      { question: "What is the 'inverted pyramid' structure in technical writing?", order: 1,
        choices: [
          { id: "a", label: "Starting with background context and ending with the key point", correct: false },
          { id: "b", label: "Putting the most important information first, with detail following", correct: true },
          { id: "c", label: "Writing for the most advanced audience first", correct: false },
          { id: "d", label: "Putting code examples at the bottom of the document", correct: false },
        ] },
      { question: "Why should documentation be co-located with the code it describes?", order: 2,
        choices: [
          { id: "a", label: "It makes the repository larger, which signals maturity", correct: false },
          { id: "b", label: "It is more likely to be updated when the code changes", correct: true },
          { id: "c", label: "It prevents the documentation from being shared externally", correct: false },
          { id: "d", label: "Co-location is a requirement of most CI systems", correct: false },
        ] },
    ],
  },
  {
    slug: "presenting-technical-ideas",
    title: "Presenting Technical Ideas Clearly",
    description: "Communicate complex technical decisions to mixed audiences — from engineers to executives.",
    dimension: "english", difficulty: "beginner", estimatedMinutes: 10, order: 24,
    content: `## The Core Problem

Engineers value precision and completeness. In presentations, this becomes a liability. Audiences need to understand the decision and trust that it is right — they do not need every detail.

## Know What Your Audience Needs to Do

Before building slides, answer: **what should the audience do, believe, or decide after this talk?**

- "Approve the migration" → focus on risks, cost, and timeline. Skip implementation details.
- "Understand how RAG works" → focus on the mental model. Skip the math.

## Structure

**The problem (30 seconds)** — make it real with a number or story. "Our p99 latency is 4 seconds. We are losing 12% of users who abandon before the page loads."

**The solution in one sentence** — before explaining how it works, say what it does.

**How it works (optional)** — if the audience needs to trust the mechanism. Use one good diagram instead of five mediocre ones.

**What happens next** — concrete next steps, timeline, who is responsible.

## Adapting to Audience

| Audience | What they care about | What to skip |
|---|---|---|
| Engineers | Correctness, edge cases | Business impact |
| Engineering manager | Timeline, risks | Implementation details |
| Executive | Cost, revenue, strategic fit | Everything technical |

**Bottom-line up front** for executives: lead with the decision and the number. Details are appendix slides.

## Handling Questions You Cannot Answer

"I don't know" is acceptable — followed by "I will find out by Thursday." Speculating rather than admitting uncertainty destroys credibility faster than not knowing.`,
    quizzes: [
      { question: "Before building a technical presentation, what is the most important question to answer?", order: 1,
        choices: [
          { id: "a", label: "How many slides should I include?", correct: false },
          { id: "b", label: "What should the audience do, believe, or decide after this talk?", correct: true },
          { id: "c", label: "How long should the presentation be?", correct: false },
          { id: "d", label: "Which technical details should I explain first?", correct: false },
        ] },
      { question: "What is 'bottom-line up front' and who is it most useful for?", order: 2,
        choices: [
          { id: "a", label: "Stating background context first; useful for engineers", correct: false },
          { id: "b", label: "Leading with the decision and key number; most useful for executives", correct: true },
          { id: "c", label: "Summarising technical details at the end; useful for all audiences", correct: false },
          { id: "d", label: "Explaining implementation details first; useful for product managers", correct: false },
        ] },
    ],
  },
  // ── Backend track lessons ──────────────────────────────────────────────────
  {
    slug: "nodejs-event-loop-and-async",
    title: "Node.js Event Loop & Async Patterns",
    description: "Understand how Node.js handles concurrency and when to use each async pattern.",
    dimension: "core_language", difficulty: "intermediate", estimatedMinutes: 14, order: 25,
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
\`\`\``,
    quizzes: [
      { question: "A CPU-bound task takes 500ms. What is the correct way to handle it in Node.js?", order: 1,
        choices: [
          { id: "a", label: "Run it synchronously — Node.js handles it automatically", correct: false },
          { id: "b", label: "Offload it to a Worker Thread or background queue", correct: true },
          { id: "c", label: "Wrap it in async/await to make it non-blocking", correct: false },
          { id: "d", label: "Use setImmediate to defer it to the next tick", correct: false },
        ] },
      { question: "You need to fetch a user and their orders from the database, and neither depends on the other. What is the most efficient approach?", order: 2,
        choices: [
          { id: "a", label: "await getUser(), then await getOrders()", correct: false },
          { id: "b", label: "Promise.all([getUser(), getOrders()])", correct: true },
          { id: "c", label: "Promise.race([getUser(), getOrders()])", correct: false },
          { id: "d", label: "Run them in separate Worker Threads", correct: false },
        ] },
    ],
  },
  {
    slug: "rest-api-design-best-practices",
    title: "REST API Design: Versioning, Pagination & Errors",
    description: "Design APIs that are easy to consume, backwards-compatible, and production-ready.",
    dimension: "apis", difficulty: "intermediate", estimatedMinutes: 13, order: 26,
    content: `## REST Fundamentals

REST uses HTTP semantics to describe operations on resources. Good REST APIs are predictable: a developer should be able to guess the endpoint and method for any operation.

| Method | Use | Idempotent? |
|--------|-----|-------------|
| GET    | Read resource | Yes |
| POST   | Create resource | No |
| PUT    | Replace entire resource | Yes |
| PATCH  | Partial update | No (typically) |
| DELETE | Remove resource | Yes |

## URL Design

Resources are nouns, not verbs.

\`\`\`
# Good
GET    /users/{id}/orders
POST   /orders
PATCH  /orders/{id}

# Bad — verbs in URLs
POST /createOrder
GET  /getUserOrders?userId=123
\`\`\`

## Versioning

APIs evolve. Break backwards compatibility without warning and clients break.

**URL versioning** (most common):
\`\`\`
GET /v1/users
GET /v2/users
\`\`\`

Rule: Never remove or rename a field in the same major version. Add fields; mark old ones deprecated.

## Pagination

Never return unbounded lists. Two patterns:

**Offset pagination** — simple, but slow on large tables:
\`\`\`
GET /orders?offset=100&limit=20
\`\`\`

**Cursor pagination** — fast even on millions of rows (used by Stripe/GitHub):
\`\`\`
GET /orders?after=cursor_xyz&limit=20

Response: { "data": [...], "next_cursor": "cursor_abc", "has_more": true }
\`\`\`

Use cursor pagination for any list that could exceed a few thousand items.

## Error Modelling

\`\`\`json
{
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "No order found with id 'ord_123'",
    "details": { "orderId": "ord_123" }
  }
}
\`\`\`

Use standard HTTP status codes: 400 (bad input), 401 (unauthenticated), 403 (forbidden), 404 (not found), 409 (conflict), 429 (rate limited), 500 (server error). Never return 200 with \`{"success": false}\`.

## Idempotency Keys

For unsafe operations (POST), accept an idempotency key. If the same key is sent twice (client retry after timeout), return the same response without reprocessing.

\`\`\`
POST /payments
Idempotency-Key: idem_7f3a2b9c
\`\`\`

This prevents double-charges on mobile retries.`,
    quizzes: [
      { question: "A client sends a POST request to create an order and gets a network timeout. Which design prevents the order from being created twice on retry?", order: 1,
        choices: [
          { id: "a", label: "Use PUT instead of POST", correct: false },
          { id: "b", label: "Accept an Idempotency-Key header and deduplicate on it", correct: true },
          { id: "c", label: "Return a 202 Accepted instead of 201 Created", correct: false },
          { id: "d", label: "Use cursor pagination", correct: false },
        ] },
      { question: "You have a table with 10 million orders. Which pagination strategy is most efficient?", order: 2,
        choices: [
          { id: "a", label: "Offset pagination (?offset=5000000&limit=20)", correct: false },
          { id: "b", label: "Page-based pagination (?page=250000)", correct: false },
          { id: "c", label: "Cursor-based pagination (?after=cursor_xyz)", correct: true },
          { id: "d", label: "Return all records and paginate on the client", correct: false },
        ] },
    ],
  },
  {
    slug: "sql-transactions-and-isolation",
    title: "SQL Transactions, ACID & Isolation Levels",
    description: "Master transactions, concurrency anomalies, and when to use each isolation level.",
    dimension: "databases", difficulty: "intermediate", estimatedMinutes: 15, order: 27,
    content: `## What is a Transaction?

A transaction groups multiple SQL statements into a single unit of work. Either all statements succeed and commit, or all are rolled back.

\`\`\`sql
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 'alice';
  UPDATE accounts SET balance = balance + 100 WHERE id = 'bob';
COMMIT;
\`\`\`

## ACID Properties

- **Atomicity** — all or nothing
- **Consistency** — DB moves from one valid state to another; constraints never violated mid-transaction
- **Isolation** — concurrent transactions don't interfere with each other (to a configurable degree)
- **Durability** — once committed, data survives crashes

## Concurrency Anomalies

**Dirty Read** — reading uncommitted data. If that transaction rolls back, you acted on data that never existed.

**Non-repeatable Read** — you read a row twice and get different values because another transaction committed between reads.

**Phantom Read** — a range query returns different rows on second execution because another transaction inserted/deleted rows.

**Lost Update** — two transactions read the same value, both modify it, and the second commit overwrites the first.

## Isolation Levels (Postgres)

| Level | Dirty Read | Non-repeatable | Phantom |
|-------|-----------|----------------|---------|
| Read Committed (default) | No | Yes | Yes |
| Repeatable Read | No | No | No |
| Serializable | No | No | No |

**Read Committed** (default) — safe for most OLTP queries.

**Repeatable Read** — all reads see a consistent snapshot from transaction start. Use when you need to read-then-write based on a consistent view.

**Serializable** — strongest; transactions behave as if they ran one-at-a-time. Use for financial integrity.

## SELECT FOR UPDATE

When you need to read-then-update atomically, lock the row:

\`\`\`sql
BEGIN;
  SELECT balance FROM accounts WHERE id = 'alice' FOR UPDATE;
  UPDATE accounts SET balance = balance - 100 WHERE id = 'alice';
COMMIT;
\`\`\`

Without the lock, two concurrent withdrawals can both see \`balance = 200\` and both allow a \`-100\` withdrawal — one update is lost.

## Practical Rules

1. Keep transactions short — long transactions hold locks and block other queries
2. Never do HTTP calls inside a transaction (locks are held for the duration)
3. Default to Read Committed; step up to Repeatable Read when you need a consistent snapshot
4. Use Serializable for invariants spanning multiple rows (inventory, seat booking)`,
    quizzes: [
      { question: "Two concurrent transactions both read a seat as 'available' and both book it. Which fix prevents this?", order: 1,
        choices: [
          { id: "a", label: "Read Committed isolation", correct: false },
          { id: "b", label: "Repeatable Read without explicit locks", correct: false },
          { id: "c", label: "SELECT FOR UPDATE with Read Committed, or Serializable isolation", correct: true },
          { id: "d", label: "It cannot be prevented at the database level", correct: false },
        ] },
      { question: "Which action is most dangerous to perform inside a database transaction?", order: 2,
        choices: [
          { id: "a", label: "Running two UPDATE statements", correct: false },
          { id: "b", label: "Using SELECT FOR UPDATE", correct: false },
          { id: "c", label: "Making an HTTP call to an external API", correct: true },
          { id: "d", label: "Reading a row twice", correct: false },
        ] },
    ],
  },
  {
    slug: "jwt-authentication-pitfalls",
    title: "JWT Authentication: How It Works & What Goes Wrong",
    description: "Understand JWT structure, validation, and the security mistakes that lead to breaches.",
    dimension: "auth_security", difficulty: "intermediate", estimatedMinutes: 13, order: 28,
    content: `## What is a JWT?

A JSON Web Token (JWT) is a compact token consisting of three base64url-encoded parts:

\`\`\`
header.payload.signature
\`\`\`

**Header** — algorithm: \`{ "alg": "HS256", "typ": "JWT" }\`

**Payload** — claims (do not put secrets here — it's only base64 encoded, not encrypted):
\`\`\`json
{ "sub": "user_123", "email": "alice@example.com", "exp": 1715000000 }
\`\`\`

**Signature** — HMAC or RSA of the header+payload using a secret key.

## How Validation Works

The server recomputes the signature from the header and payload using its secret. If it matches, the token is authentic. No database lookup needed — stateless.

## Critical Security Mistakes

**1. The alg:none attack** — Early JWT libraries accepted \`"alg": "none"\` and skipped signature verification entirely. Always pin your algorithm:
\`\`\`js
jwt.verify(token, secret, { algorithms: ['HS256'] }); // Good
jwt.verify(token, secret); // Bad — accepts alg:none
\`\`\`

**2. HS256 in multi-service architecture** — HS256 uses a shared secret for signing and verifying. Any service that verifies tokens holds the signing key too — a compromised service can forge tokens. Use RS256 instead: private key signs (auth server only), public key verifies (shareable).

**3. No expiration** — Always set \`exp\`. Standard: 15 minutes for access tokens, 7-30 days for refresh tokens in httpOnly cookies.

**4. Storing tokens in localStorage** — localStorage is readable by any JS on the page, including XSS payloads. Store access tokens in memory; store refresh tokens in httpOnly Secure cookies.

**5. Not validating claims** — After verifying the signature, check \`exp\`, \`iss\`, and \`aud\`.

## Token Revocation Problem

JWTs are stateless — you cannot revoke them before expiry without adding state. Solutions:
- Short-lived access tokens (15 min) + refresh token rotation
- A Redis blocklist for critical revocations
- Session-based auth if immediate revocation is a requirement`,
    quizzes: [
      { question: "An attacker modifies a JWT payload to elevate their role to 'admin' and sets alg to 'none'. Which server-side defence prevents this?", order: 1,
        choices: [
          { id: "a", label: "Checking the exp claim", correct: false },
          { id: "b", label: "Pinning the expected algorithm during verification", correct: true },
          { id: "c", label: "Using HS256 instead of RS256", correct: false },
          { id: "d", label: "Storing the token in localStorage", correct: false },
        ] },
      { question: "Three microservices all need to verify user tokens. Which JWT algorithm is most appropriate?", order: 2,
        choices: [
          { id: "a", label: "HS256 — it's faster and simpler", correct: false },
          { id: "b", label: "HS512 — stronger shared secret", correct: false },
          { id: "c", label: "RS256 — private key stays on auth server; services verify with public key only", correct: true },
          { id: "d", label: "alg:none — no secret to manage", correct: false },
        ] },
    ],
  },
  {
    slug: "redis-caching-strategies",
    title: "Redis Caching: Patterns, Invalidation & Pitfalls",
    description: "Learn when and how to cache with Redis, and how to handle the hard problems.",
    dimension: "caching", difficulty: "intermediate", estimatedMinutes: 13, order: 29,
    content: `## Why Cache?

Caching stores the result of an expensive operation (DB query, API call) so future requests can be served faster. A well-placed cache can reduce p99 latency from 200ms to 2ms and cut database load by 90%.

## Cache-Aside (Lazy Loading)

The most common pattern. The application reads and writes the cache:

\`\`\`
1. Request arrives for user_123
2. Check Redis: MISS
3. Query database → get user object
4. Write to Redis: SET user:123 <json> EX 300
5. Return response

Next request: HIT → return immediately (no DB query)
\`\`\`

**Pros:** Only caches requested data. DB failures don't break the cache.
**Cons:** First request after a miss is slow. Cache can become stale.

## Cache Invalidation

Three strategies:

**TTL-based expiry** — set a TTL and let stale data expire. Simplest; tolerate brief staleness.

**Event-driven invalidation** — when \`user_123\` is updated, explicitly \`DEL user:123\` from Redis. Precise but requires discipline across all write paths.

**Cache versioning** — include a version in the key (\`user:123:v2\`). Update the version on write. Old keys expire naturally.

## Cache Stampede (Thundering Herd)

When a popular key expires, many concurrent requests all miss simultaneously and hammer the DB at once.

Fix: the first request acquires a Redis lock; others wait briefly then re-check the cache. Only one DB query fires.

## What NOT to Cache

- **Financial balances** — stale balance leads to double-spend bugs; use DB transactions
- **Data that must be immediately consistent** — short TTLs or skip caching

## Redis Data Structures

- **String** — simple values, counters (\`INCR rate_limit:user:123\`)
- **Hash** — object fields (\`HSET user:123 name "Alice"\`)
- **Sorted Set** — leaderboards, rate limiting windows
- **Set** — unique membership checks

## Measuring Cache Effectiveness

Track hit rate: \`hits / (hits + misses)\`. Aim for >90% on hot paths. Below 50% means you're caching the wrong things.`,
    quizzes: [
      { question: "A popular product page has a 60-second TTL. At T=60s, 500 concurrent requests miss the cache simultaneously. What problem is this and how do you fix it?", order: 1,
        choices: [
          { id: "a", label: "Cache poisoning — use HTTPS", correct: false },
          { id: "b", label: "Cache stampede — use a lock or probabilistic early expiration", correct: true },
          { id: "c", label: "Dirty read — use Serializable isolation", correct: false },
          { id: "d", label: "Memory leak — increase Redis maxmemory", correct: false },
        ] },
      { question: "Which data should you avoid caching?", order: 2,
        choices: [
          { id: "a", label: "Public product catalogue updated once per day", correct: false },
          { id: "b", label: "User profile data read on every request", correct: false },
          { id: "c", label: "Account balances used in financial transactions", correct: true },
          { id: "d", label: "Country list used for address forms", correct: false },
        ] },
    ],
  },
  {
    slug: "observability-logs-metrics-traces",
    title: "Observability: Logs, Metrics & Distributed Traces",
    description: "Build production services you can actually debug — structured logs, custom metrics, and tracing.",
    dimension: "observability", difficulty: "intermediate", estimatedMinutes: 14, order: 30,
    content: `## The Three Pillars

Observability answers "what is my system doing right now?" Three complementary signals:

- **Logs** — discrete events ("order_created", "payment_failed")
- **Metrics** — numeric aggregates over time (request rate, p99 latency, error rate)
- **Traces** — the path of a single request across multiple services

You need all three. Logs tell you *what* happened. Metrics tell you *how often* and whether it's trending. Traces tell you *where* time was spent.

## Structured Logging

Plain text logs are unsearchable at scale. Use structured JSON:

\`\`\`js
// Bad
console.log('Failed to process payment for user 123');

// Good
logger.error({
  event: 'payment_failed',
  userId: 'user_123',
  orderId: 'ord_456',
  errorCode: 'CARD_DECLINED',
  durationMs: 234,
});
\`\`\`

With structured logs you can query: \`event:payment_failed AND errorCode:CARD_DECLINED\` across millions of events in seconds.

Never log secrets or PII (email, phone, SSN) in plaintext.

## Metrics

The four golden signals (Google SRE):

1. **Latency** — how long requests take (p50, p95, p99 — not average)
2. **Traffic** — request rate (req/s)
3. **Errors** — error rate (5xx/s)
4. **Saturation** — how full is the system (CPU %, queue depth)

Prometheus is the standard. You expose a \`/metrics\` endpoint; Prometheus scrapes it periodically.

## Distributed Tracing

A trace represents a single request as it flows through services. Each service adds a **span** — a timed operation with metadata.

\`\`\`
[HTTP request] → [API Gateway] → [Order Service] → [DB query]
                                               → [Payment Service] → [Stripe API]
\`\`\`

A trace ID propagates through all services via headers. When an order is slow, you open the trace: 10ms API gateway, 5ms order service, 220ms payment service waiting for Stripe. Problem found.

**OpenTelemetry** is the standard for instrumentation — works with Jaeger, Datadog, Grafana Tempo.

## SLOs and Error Budgets

A **Service Level Objective (SLO)**: "99.5% of requests return 2xx within 500ms over 30 days."

An **error budget** = 100% minus your SLO = 0.5% (~2 hours/month). When the budget is burned, stop shipping and fix reliability. This creates healthy tension between speed and quality.

## Practical Starting Point

1. Add structured logging (pino/winston) with \`requestId\` on every line
2. Expose \`/health\` and \`/metrics\` endpoints
3. Alert on error rate and p99 latency — not just uptime
4. Add \`X-Request-Id\` to every outgoing response`,
    quizzes: [
      { question: "A payment service is slow. You have logs showing individual errors but can't tell where time is being spent across services. Which signal is missing?", order: 1,
        choices: [
          { id: "a", label: "Metrics — add a Prometheus counter", correct: false },
          { id: "b", label: "Distributed tracing — to see the full request path across services", correct: true },
          { id: "c", label: "More log verbosity — add debug level logs", correct: false },
          { id: "d", label: "Alerts — set up PagerDuty", correct: false },
        ] },
      { question: "Your API logs include raw email addresses. What is the most important fix?", order: 2,
        choices: [
          { id: "a", label: "Switch from JSON logs to plain text to avoid indexing", correct: false },
          { id: "b", label: "Mask or omit PII before logging — raw email in logs is a compliance and security risk", correct: true },
          { id: "c", label: "Set log level to error to reduce volume", correct: false },
          { id: "d", label: "Rotate logs every hour", correct: false },
        ] },
    ],
  },
];

async function main() {
  console.log(`Seeding ${LESSONS.length} lessons...`);
  const client = await pool.connect();

  try {
    for (const l of LESSONS) {
      // Check if lesson already exists
      const existing = await client.query(
        "SELECT id FROM lesson WHERE slug = $1",
        [l.slug]
      );

      if (existing.rows.length > 0) {
        console.log(`  [skip] ${l.slug} already exists`);
        continue;
      }

      const lessonId = randomUUID();
      await client.query(
        `INSERT INTO lesson (id, slug, title, description, content, dimension, difficulty, estimated_minutes, "order", created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
        [lessonId, l.slug, l.title, l.description, l.content, l.dimension, l.difficulty, l.estimatedMinutes, l.order]
      );

      for (const q of l.quizzes) {
        await client.query(
          `INSERT INTO quiz (id, lesson_id, question, choices, "order")
           VALUES ($1, $2, $3, $4::jsonb, $5)`,
          [randomUUID(), lessonId, q.question, JSON.stringify(q.choices), q.order]
        );
      }

      console.log(`  [ok] ${l.slug} (${l.dimension})`);
    }
    console.log("\nDone.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
