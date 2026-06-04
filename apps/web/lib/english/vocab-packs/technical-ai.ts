export type VocabPackItem = {
  phrase: string;
  meaning: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'Daily Life' | 'Work' | 'Technical' | 'Opinion' | 'Social';
  example: string;
};

export const technicalAIPack: VocabPackItem[] = [
  {
    phrase: "hallucinate",
    meaning: "when an LLM generates confident but false information",
    difficulty: "intermediate",
    category: "Technical",
    example: "The model hallucinated a library that doesn't exist."
  },
  {
    phrase: "prompt injection",
    meaning: "manipulating an LLM through crafted input",
    difficulty: "advanced",
    category: "Technical",
    example: "The app is vulnerable to prompt injection attacks."
  },
  {
    phrase: "context window",
    meaning: "the maximum amount of text an LLM can process at once",
    difficulty: "intermediate",
    category: "Technical",
    example: "GPT-4's context window is 128k tokens."
  },
  {
    phrase: "grounding",
    meaning: "connecting LLM outputs to real, verifiable data",
    difficulty: "advanced",
    category: "Technical",
    example: "RAG provides grounding by retrieving actual documents."
  },
  {
    phrase: "temperature",
    meaning: "a parameter controlling response randomness",
    difficulty: "intermediate",
    category: "Technical",
    example: "Set temperature to 0 for deterministic outputs."
  },
  {
    phrase: "fine-tuning",
    meaning: "adapting a pre-trained model to a specific task",
    difficulty: "intermediate",
    category: "Technical",
    example: "We fine-tuned the model on our company's documents."
  },
  {
    phrase: "embedding",
    meaning: "a numerical vector representation of text",
    difficulty: "intermediate",
    category: "Technical",
    example: "We store embeddings in pgvector for semantic search."
  },
  {
    phrase: "retrieval-augmented generation",
    meaning: "combining retrieval with LLM generation",
    difficulty: "advanced",
    category: "Technical",
    example: "RAG reduces hallucination by grounding responses in documents."
  },
  {
    phrase: "chain-of-thought",
    meaning: "prompting technique that encourages step-by-step reasoning",
    difficulty: "advanced",
    category: "Technical",
    example: "Chain-of-thought prompting improved accuracy by 15%."
  },
  {
    phrase: "token",
    meaning: "a unit of text processed by an LLM",
    difficulty: "intermediate",
    category: "Technical",
    example: "This message is about 50 tokens."
  },
  {
    phrase: "tokenization",
    meaning: "breaking text into tokens",
    difficulty: "intermediate",
    category: "Technical",
    example: "Different models use different tokenization methods."
  },
  {
    phrase: "vocabulary",
    meaning: "the set of tokens a model knows",
    difficulty: "beginner",
    category: "Technical",
    example: "The model's vocabulary includes 100k tokens."
  },
  {
    phrase: "transformer",
    meaning: "neural network architecture used in modern LLMs",
    difficulty: "advanced",
    category: "Technical",
    example: "Most modern LLMs use transformer architecture."
  },
  {
    phrase: "attention mechanism",
    meaning: "neural network component that focuses on relevant parts",
    difficulty: "advanced",
    category: "Technical",
    example: "Multi-head attention helps the model focus on key parts."
  },
  {
    phrase: "prompt engineering",
    meaning: "crafting inputs to get better LLM outputs",
    difficulty: "intermediate",
    category: "Technical",
    example: "Good prompt engineering is crucial for quality results."
  },
  {
    phrase: "few-shot prompting",
    meaning: "providing examples in the prompt to guide behavior",
    difficulty: "intermediate",
    category: "Technical",
    example: "Few-shot prompting improved performance significantly."
  },
  {
    phrase: "zero-shot",
    meaning: "performing a task without any examples provided",
    difficulty: "intermediate",
    category: "Technical",
    example: "The model did well on zero-shot classification."
  },
  {
    phrase: "instruction fine-tuning",
    meaning: "training model to follow instructions better",
    difficulty: "advanced",
    category: "Technical",
    example: "Instruction fine-tuning made the model more helpful."
  },
  {
    phrase: "RLHF",
    meaning: "reinforcement learning from human feedback",
    difficulty: "advanced",
    category: "Technical",
    example: "RLHF helps align the model with human preferences."
  },
  {
    phrase: "alignment",
    meaning: "ensuring AI behavior matches human values",
    difficulty: "advanced",
    category: "Technical",
    example: "Model alignment is critical for safety."
  },
  {
    phrase: "jailbreak",
    meaning: "tricking an AI into ignoring safety guidelines",
    difficulty: "intermediate",
    category: "Technical",
    example: "The jailbreak prompt bypassed safety measures."
  },
  {
    phrase: "safety guardrails",
    meaning: "protections to prevent harmful outputs",
    difficulty: "intermediate",
    category: "Technical",
    example: "Safety guardrails prevent the model from generating harmful content."
  },
  {
    phrase: "toxic content detection",
    meaning: "identifying harmful or offensive output",
    difficulty: "intermediate",
    category: "Technical",
    example: "We filter outputs through toxic content detection."
  },
  {
    phrase: "bias in AI",
    meaning: "systematic prejudice in model outputs",
    difficulty: "intermediate",
    category: "Technical",
    example: "We need to address bias in our training data."
  },
  {
    phrase: "fairness",
    meaning: "ensuring equitable treatment across groups",
    difficulty: "intermediate",
    category: "Technical",
    example: "Fairness metrics help us evaluate model bias."
  },
  {
    phrase: "interpretability",
    meaning: "understanding why an AI makes certain decisions",
    difficulty: "advanced",
    category: "Technical",
    example: "LLM interpretability is an active research area."
  },
  {
    phrase: "black box",
    meaning: "system whose internal workings are not understood",
    difficulty: "intermediate",
    category: "Technical",
    example: "LLMs are often treated as black boxes."
  },
  {
    phrase: "explainability",
    meaning: "ability to explain AI decisions to users",
    difficulty: "advanced",
    category: "Technical",
    example: "We need explainability for regulated use cases."
  },
  {
    phrase: "training data",
    meaning: "the examples used to train a model",
    difficulty: "intermediate",
    category: "Technical",
    example: "Our training data includes 100 million examples."
  },
  {
    phrase: "benchmark",
    meaning: "standardized test to measure model performance",
    difficulty: "intermediate",
    category: "Technical",
    example: "The model scores well on common benchmarks."
  },
  {
    phrase: "evaluation metric",
    meaning: "measurement of model accuracy or quality",
    difficulty: "intermediate",
    category: "Technical",
    example: "We use BLEU score as an evaluation metric."
  },
  {
    phrase: "BLEU score",
    meaning: "metric comparing generated text to reference",
    difficulty: "advanced",
    category: "Technical",
    example: "The BLEU score improved from 0.28 to 0.35."
  },
  {
    phrase: "F1 score",
    meaning: "harmonic mean of precision and recall",
    difficulty: "advanced",
    category: "Technical",
    example: "The F1 score indicates good classification performance."
  },
  {
    phrase: "accuracy",
    meaning: "percentage of correct predictions",
    difficulty: "beginner",
    category: "Technical",
    example: "The model achieved 95% accuracy on the test set."
  },
  {
    phrase: "precision",
    meaning: "percentage of positive predictions that are correct",
    difficulty: "advanced",
    category: "Technical",
    example: "High precision means few false positives."
  },
  {
    phrase: "recall",
    meaning: "percentage of actual positives correctly identified",
    difficulty: "advanced",
    category: "Technical",
    example: "High recall means we catch most positives."
  },
  {
    phrase: "overfitting",
    meaning: "model memorizing training data instead of generalizing",
    difficulty: "intermediate",
    category: "Technical",
    example: "Overfitting causes poor performance on new data."
  },
  {
    phrase: "underfitting",
    meaning: "model too simple to capture patterns",
    difficulty: "intermediate",
    category: "Technical",
    example: "The model is underfitting—let's increase complexity."
  },
  {
    phrase: "regularization",
    meaning: "technique to prevent overfitting",
    difficulty: "advanced",
    category: "Technical",
    example: "L2 regularization helps prevent overfitting."
  },
  {
    phrase: "validation set",
    meaning: "data used to tune hyperparameters",
    difficulty: "intermediate",
    category: "Technical",
    example: "We use 20% of data as validation set."
  },
  {
    phrase: "test set",
    meaning: "data used to evaluate final model performance",
    difficulty: "intermediate",
    category: "Technical",
    example: "Only check performance on the held-out test set."
  },
  {
    phrase: "cross-validation",
    meaning: "technique to evaluate model using multiple data splits",
    difficulty: "advanced",
    category: "Technical",
    example: "K-fold cross-validation ensures robust evaluation."
  },
  {
    phrase: "hyperparameter",
    meaning: "setting controlled before training",
    difficulty: "intermediate",
    category: "Technical",
    example: "Learning rate is a key hyperparameter."
  },
  {
    phrase: "learning rate",
    meaning: "step size for updating weights during training",
    difficulty: "intermediate",
    category: "Technical",
    example: "A high learning rate caused training to diverge."
  },
  {
    phrase: "batch size",
    meaning: "number of examples processed before update",
    difficulty: "intermediate",
    category: "Technical",
    example: "We increased batch size to 256."
  },
  {
    phrase: "epoch",
    meaning: "one complete pass through training data",
    difficulty: "intermediate",
    category: "Technical",
    example: "We trained for 100 epochs."
  },
  {
    phrase: "loss function",
    meaning: "metric measuring how wrong predictions are",
    difficulty: "advanced",
    category: "Technical",
    example: "Cross-entropy is a common loss function."
  },
  {
    phrase: "gradient descent",
    meaning: "optimization algorithm that reduces loss",
    difficulty: "advanced",
    category: "Technical",
    example: "Gradient descent updates weights iteratively."
  },
  {
    phrase: "backpropagation",
    meaning: "algorithm for calculating gradients",
    difficulty: "advanced",
    category: "Technical",
    example: "Backpropagation enables training of deep networks."
  },
  {
    phrase: "convergence",
    meaning: "when training loss stops decreasing",
    difficulty: "intermediate",
    category: "Technical",
    example: "The model converged after 50 epochs."
  },
  {
    phrase: "divergence",
    meaning: "when training loss increases instead of decreases",
    difficulty: "intermediate",
    category: "Technical",
    example: "High learning rate caused divergence."
  },
  {
    phrase: "semantic search",
    meaning: "finding similar text based on meaning",
    difficulty: "intermediate",
    category: "Technical",
    example: "Semantic search understands intent, not just keywords."
  },
  {
    phrase: "vector database",
    meaning: "database optimized for storing embeddings",
    difficulty: "intermediate",
    category: "Technical",
    example: "We store document embeddings in Pinecone."
  },
  {
    phrase: "similarity score",
    meaning: "numerical measure of how similar two items are",
    difficulty: "intermediate",
    category: "Technical",
    example: "Cosine similarity scored 0.95."
  },
  {
    phrase: "cosine similarity",
    meaning: "angle-based similarity between vectors",
    difficulty: "advanced",
    category: "Technical",
    example: "Cosine similarity is popular for embeddings."
  },
  {
    phrase: "dimensionality reduction",
    meaning: "reducing number of features while preserving information",
    difficulty: "advanced",
    category: "Technical",
    example: "PCA provides dimensionality reduction."
  },
  {
    phrase: "clustering",
    meaning: "grouping similar items together",
    difficulty: "intermediate",
    category: "Technical",
    example: "K-means clustering identified 5 customer segments."
  },
  {
    phrase: "classification",
    meaning: "assigning items to predefined categories",
    difficulty: "intermediate",
    category: "Technical",
    example: "Text classification categorizes sentiment."
  },
  {
    phrase: "named entity recognition",
    meaning: "identifying people, places, and organizations",
    difficulty: "intermediate",
    category: "Technical",
    example: "NER extracted person names from documents."
  },
  {
    phrase: "sentiment analysis",
    meaning: "determining emotional tone of text",
    difficulty: "intermediate",
    category: "Technical",
    example: "Sentiment analysis revealed mostly positive feedback."
  },
  {
    phrase: "machine translation",
    meaning: "automatically translating between languages",
    difficulty: "intermediate",
    category: "Technical",
    example: "Machine translation now supports 100 languages."
  },
  {
    phrase: "question answering",
    meaning: "answering natural language questions",
    difficulty: "intermediate",
    category: "Technical",
    example: "Our QA system handles customer inquiries."
  },
  {
    phrase: "summarization",
    meaning: "condensing text into shorter version",
    difficulty: "intermediate",
    category: "Technical",
    example: "Abstractive summarization generates new text."
  },
  {
    phrase: "abstractive summarization",
    meaning: "generating summary in own words",
    difficulty: "advanced",
    category: "Technical",
    example: "Abstractive summarization is harder than extractive."
  },
  {
    phrase: "extractive summarization",
    meaning: "selecting key sentences from original text",
    difficulty: "advanced",
    category: "Technical",
    example: "Extractive summarization is simpler but less flexible."
  },
  {
    phrase: "information retrieval",
    meaning: "finding relevant documents for a query",
    difficulty: "intermediate",
    category: "Technical",
    example: "Information retrieval powers our search feature."
  },
  {
    phrase: "relevance ranking",
    meaning: "ordering results by how well they match query",
    difficulty: "intermediate",
    category: "Technical",
    example: "Relevance ranking improved search quality."
  },
  {
    phrase: "neural IR",
    meaning: "using neural networks for information retrieval",
    difficulty: "advanced",
    category: "Technical",
    example: "Neural IR models outperform traditional methods."
  },
  {
    phrase: "knowledge base",
    meaning: "structured collection of information",
    difficulty: "intermediate",
    category: "Technical",
    example: "Our knowledge base has 10,000 articles."
  },
  {
    phrase: "knowledge graph",
    meaning: "representation of facts and relationships",
    difficulty: "advanced",
    category: "Technical",
    example: "Knowledge graphs enable semantic search."
  },
  {
    phrase: "graph neural network",
    meaning: "neural network operating on graph data",
    difficulty: "advanced",
    category: "Technical",
    example: "GNNs excel at relationship prediction."
  },
  {
    phrase: "multimodal",
    meaning: "processing multiple types of data (text, image, audio)",
    difficulty: "intermediate",
    category: "Technical",
    example: "Multimodal models understand images and text."
  },
  {
    phrase: "vision transformer",
    meaning: "transformer architecture for image understanding",
    difficulty: "advanced",
    category: "Technical",
    example: "Vision transformers revolutionized computer vision."
  },
  {
    phrase: "object detection",
    meaning: "identifying and locating objects in images",
    difficulty: "intermediate",
    category: "Technical",
    example: "Object detection found 50 people in the photo."
  },
  {
    phrase: "image segmentation",
    meaning: "partitioning image into semantic regions",
    difficulty: "advanced",
    category: "Technical",
    example: "Image segmentation identifies object boundaries."
  },
  {
    phrase: "optical character recognition",
    meaning: "extracting text from images",
    difficulty: "intermediate",
    category: "Technical",
    example: "OCR digitized the scanned documents."
  },
  {
    phrase: "speech recognition",
    meaning: "converting spoken words to text",
    difficulty: "intermediate",
    category: "Technical",
    example: "Speech recognition enabled voice commands."
  },
  {
    phrase: "text-to-speech",
    meaning: "converting written text to audio",
    difficulty: "intermediate",
    category: "Technical",
    example: "Text-to-speech reads articles aloud."
  },
  {
    phrase: "generative model",
    meaning: "model that creates new content",
    difficulty: "intermediate",
    category: "Technical",
    example: "GPT is a generative language model."
  },
  {
    phrase: "discriminative model",
    meaning: "model that classifies existing items",
    difficulty: "advanced",
    category: "Technical",
    example: "Classification models are discriminative."
  },
  {
    phrase: "diffusion model",
    meaning: "generative model based on noise diffusion",
    difficulty: "advanced",
    category: "Technical",
    example: "Diffusion models generate high-quality images."
  },
  {
    phrase: "variational autoencoder",
    meaning: "generative model that learns compressed representation",
    difficulty: "advanced",
    category: "Technical",
    example: "VAEs can generate and interpolate data."
  },
  {
    phrase: "generative adversarial network",
    meaning: "two networks competing to generate realistic data",
    difficulty: "advanced",
    category: "Technical",
    example: "GANs create photorealistic faces."
  },
  {
    phrase: "agent",
    meaning: "AI system that takes actions in an environment",
    difficulty: "intermediate",
    category: "Technical",
    example: "Autonomous agents complete complex tasks."
  },
  {
    phrase: "tool use",
    meaning: "LLM using external tools to accomplish tasks",
    difficulty: "intermediate",
    category: "Technical",
    example: "Tool use allows the agent to call APIs."
  },
  {
    phrase: "function calling",
    meaning: "LLM invoking specific functions programmatically",
    difficulty: "intermediate",
    category: "Technical",
    example: "Function calling enables structured outputs."
  },
  {
    phrase: "agentic workflow",
    meaning: "iterative process where agent plans and executes",
    difficulty: "advanced",
    category: "Technical",
    example: "Agentic workflows enable complex reasoning."
  },
  {
    phrase: "reasoning",
    meaning: "applying logic to solve problems",
    difficulty: "intermediate",
    category: "Technical",
    example: "The model shows strong reasoning ability."
  },
  {
    phrase: "multi-step reasoning",
    meaning: "breaking complex problems into steps",
    difficulty: "advanced",
    category: "Technical",
    example: "Multi-step reasoning improved accuracy."
  },
  {
    phrase: "inference",
    meaning: "using a trained model to make predictions",
    difficulty: "intermediate",
    category: "Technical",
    example: "Inference time is critical for user experience."
  },
  {
    phrase: "batch inference",
    meaning: "processing multiple inputs at once",
    difficulty: "intermediate",
    category: "Technical",
    example: "Batch inference improved throughput 10x."
  },
  {
    phrase: "streaming inference",
    meaning: "generating output tokens incrementally",
    difficulty: "intermediate",
    category: "Technical",
    example: "Streaming inference provides real-time responses."
  },
  {
    phrase: "quantization",
    meaning: "reducing precision to compress model",
    difficulty: "advanced",
    category: "Technical",
    example: "Quantization reduced model size by 4x."
  },
  {
    phrase: "distillation",
    meaning: "training smaller model to mimic larger one",
    difficulty: "advanced",
    category: "Technical",
    example: "Knowledge distillation created a smaller model."
  },
  {
    phrase: "pruning",
    meaning: "removing unnecessary weights from model",
    difficulty: "advanced",
    category: "Technical",
    example: "Pruning removed 50% of parameters."
  },
  {
    phrase: "model serving",
    meaning: "deploying model to serve predictions",
    difficulty: "intermediate",
    category: "Technical",
    example: "We use TensorFlow Serving for model serving."
  },
  {
    phrase: "model monitoring",
    meaning: "tracking model performance in production",
    difficulty: "intermediate",
    category: "Technical",
    example: "Model monitoring detected performance degradation."
  },
  {
    phrase: "data drift",
    meaning: "when input data distribution changes over time",
    difficulty: "advanced",
    category: "Technical",
    example: "Data drift caused accuracy to drop."
  },
  {
    phrase: "model drift",
    meaning: "when model performance degrades over time",
    difficulty: "advanced",
    category: "Technical",
    example: "Model drift requires retraining."
  },
  {
    phrase: "active learning",
    meaning: "training by selecting most informative examples",
    difficulty: "advanced",
    category: "Technical",
    example: "Active learning reduced annotation costs."
  },
  {
    phrase: "transfer learning",
    meaning: "using knowledge from one task for another",
    difficulty: "intermediate",
    category: "Technical",
    example: "Transfer learning accelerated our training."
  },
  {
    phrase: "domain adaptation",
    meaning: "adapting model to new domain",
    difficulty: "advanced",
    category: "Technical",
    example: "Domain adaptation improved performance."
  },
  {
    phrase: "zero-knowledge proof",
    meaning: "proving knowledge without revealing information",
    difficulty: "advanced",
    category: "Technical",
    example: "Zero-knowledge proofs enable privacy-preserving AI."
  },
  {
    phrase: "federated learning",
    meaning: "training distributed models without centralizing data",
    difficulty: "advanced",
    category: "Technical",
    example: "Federated learning protects user privacy."
  },
  {
    phrase: "differential privacy",
    meaning: "adding noise to protect individual data points",
    difficulty: "advanced",
    category: "Technical",
    example: "Differential privacy prevents membership inference."
  },
  {
    phrase: "adversarial examples",
    meaning: "inputs designed to fool the model",
    difficulty: "advanced",
    category: "Technical",
    example: "Adversarial examples expose model weaknesses."
  },
  {
    phrase: "robustness",
    meaning: "ability to handle unexpected inputs",
    difficulty: "intermediate",
    category: "Technical",
    example: "Robustness testing found edge cases."
  },
  {
    phrase: "anomaly detection",
    meaning: "identifying unusual patterns in data",
    difficulty: "intermediate",
    category: "Technical",
    example: "Anomaly detection flags suspicious transactions."
  },
  {
    phrase: "outlier detection",
    meaning: "finding data points that deviate from norm",
    difficulty: "intermediate",
    category: "Technical",
    example: "Outlier detection improved data quality."
  },
  {
    phrase: "recommendation system",
    meaning: "suggesting items user might like",
    difficulty: "intermediate",
    category: "Technical",
    example: "Our recommendation system increased engagement."
  },
  {
    phrase: "collaborative filtering",
    meaning: "recommendations based on similar users",
    difficulty: "advanced",
    category: "Technical",
    example: "Collaborative filtering powers Netflix suggestions."
  },
  {
    phrase: "content-based filtering",
    meaning: "recommendations based on item attributes",
    difficulty: "advanced",
    category: "Technical",
    example: "Content-based filtering avoids cold-start issues."
  },
  {
    phrase: "reinforcement learning",
    meaning: "training by reward and penalty signals",
    difficulty: "advanced",
    category: "Technical",
    example: "RL trained the AI to play games."
  },
  {
    phrase: "policy gradient",
    meaning: "RL algorithm that directly optimizes policy",
    difficulty: "advanced",
    category: "Technical",
    example: "Policy gradient methods are effective for control."
  },
  {
    phrase: "value function",
    meaning: "predicting expected reward from state",
    difficulty: "advanced",
    category: "Technical",
    example: "Value functions guide decision-making."
  }
];
