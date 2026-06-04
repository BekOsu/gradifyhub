import { VocabPackItem } from './index';

export const technicalFullstackPack: VocabPackItem[] = [
  {
    phrase: "race condition",
    meaning: "a bug where timing between operations causes unpredictable behavior",
    difficulty: "advanced",
    category: "Technical",
    example: "The file upload has a race condition when two users submit simultaneously."
  },
  {
    phrase: "idempotent",
    meaning: "safe to call multiple times with same result",
    difficulty: "advanced",
    category: "Technical",
    example: "Make your API endpoints idempotent to handle retries safely."
  },
  {
    phrase: "webhook",
    meaning: "HTTP callback triggered by an event",
    difficulty: "intermediate",
    category: "Technical",
    example: "We use a webhook to notify our backend when payment completes."
  },
  {
    phrase: "rate limiting",
    meaning: "restricting how many requests a client can make",
    difficulty: "intermediate",
    category: "Technical",
    example: "Add rate limiting to prevent API abuse."
  },
  {
    phrase: "cache invalidation",
    meaning: "removing or updating stale cached data",
    difficulty: "advanced",
    category: "Technical",
    example: "Cache invalidation is one of the hardest problems in computer science."
  },
  {
    phrase: "optimistic update",
    meaning: "updating UI before server confirms",
    difficulty: "intermediate",
    category: "Technical",
    example: "Optimistic updates make the app feel instant."
  },
  {
    phrase: "hydration",
    meaning: "client-side JS taking over server-rendered HTML",
    difficulty: "advanced",
    category: "Technical",
    example: "Hydration errors happen when server and client HTML don't match."
  },
  {
    phrase: "connection pooling",
    meaning: "reusing DB connections instead of creating new ones",
    difficulty: "advanced",
    category: "Technical",
    example: "Use connection pooling to avoid exhausting database connections under load."
  },
  {
    phrase: "N+1 query",
    meaning: "inefficient pattern fetching one row then N related rows",
    difficulty: "advanced",
    category: "Technical",
    example: "The N+1 query problem caused 200 database calls for a single page."
  },
  {
    phrase: "debounce",
    meaning: "delay execution until a pause in user input",
    difficulty: "intermediate",
    category: "Technical",
    example: "Use debounce on the search input to reduce API calls."
  },
  {
    phrase: "throttle",
    meaning: "limit execution to once per time interval",
    difficulty: "intermediate",
    category: "Technical",
    example: "Throttle the scroll event handler to improve performance."
  },
  {
    phrase: "memoization",
    meaning: "caching function results to avoid recalculation",
    difficulty: "intermediate",
    category: "Technical",
    example: "Memoization reduced the render time by 40%."
  },
  {
    phrase: "lazy loading",
    meaning: "deferring resource loading until actually needed",
    difficulty: "beginner",
    category: "Technical",
    example: "Lazy loading images above the fold significantly improved page speed."
  },
  {
    phrase: "tree shaking",
    meaning: "removing unused code from bundles",
    difficulty: "intermediate",
    category: "Technical",
    example: "Ensure your library exports are proper ESM for tree shaking."
  },
  {
    phrase: "dead code",
    meaning: "code that is never executed or reached",
    difficulty: "beginner",
    category: "Technical",
    example: "We found dead code in the legacy module that should be removed."
  },
  {
    phrase: "refactoring",
    meaning: "restructuring code without changing external behavior",
    difficulty: "beginner",
    category: "Technical",
    example: "We spent a sprint on refactoring the authentication module."
  },
  {
    phrase: "technical debt",
    meaning: "shortcuts or poor decisions that cost more to fix later",
    difficulty: "beginner",
    category: "Technical",
    example: "We took on some technical debt to ship the MVP faster."
  },
  {
    phrase: "regression",
    meaning: "a bug that reappears after being fixed before",
    difficulty: "intermediate",
    category: "Technical",
    example: "The regression test suite catches regressions before production."
  },
  {
    phrase: "pagination",
    meaning: "splitting results into pages to limit data transfer",
    difficulty: "beginner",
    category: "Technical",
    example: "Implement pagination for the user list to handle millions of records."
  },
  {
    phrase: "serialization",
    meaning: "converting data structures into a stream format",
    difficulty: "intermediate",
    category: "Technical",
    example: "JSON serialization is the standard for API responses."
  },
  {
    phrase: "deserialization",
    meaning: "converting a stream back into data structures",
    difficulty: "intermediate",
    category: "Technical",
    example: "Deserialization happens automatically when receiving JSON."
  },
  {
    phrase: "middleware",
    meaning: "software layer that processes requests/responses",
    difficulty: "intermediate",
    category: "Technical",
    example: "We use CORS middleware to handle cross-origin requests."
  },
  {
    phrase: "dependency injection",
    meaning: "passing dependencies into a function/class instead of creating them",
    difficulty: "advanced",
    category: "Technical",
    example: "Dependency injection makes testing easier."
  },
  {
    phrase: "singleton",
    meaning: "a pattern ensuring only one instance of a class exists",
    difficulty: "intermediate",
    category: "Technical",
    example: "The database connection is a singleton to avoid multiple connections."
  },
  {
    phrase: "factory pattern",
    meaning: "creating objects without specifying exact classes",
    difficulty: "intermediate",
    category: "Technical",
    example: "Use a factory to create different types of database adapters."
  },
  {
    phrase: "closure",
    meaning: "a function that accesses variables from its outer scope",
    difficulty: "intermediate",
    category: "Technical",
    example: "Closures are how we implement data privacy in JavaScript."
  },
  {
    phrase: "async/await",
    meaning: "syntax for handling asynchronous operations",
    difficulty: "intermediate",
    category: "Technical",
    example: "Always await database queries to ensure they complete."
  },
  {
    phrase: "promise",
    meaning: "object representing eventual completion of async operation",
    difficulty: "intermediate",
    category: "Technical",
    example: "Chain promises with .then() or use async/await."
  },
  {
    phrase: "callback hell",
    meaning: "deeply nested callbacks making code hard to read",
    difficulty: "intermediate",
    category: "Technical",
    example: "We refactored out of callback hell by switching to promises."
  },
  {
    phrase: "event loop",
    meaning: "mechanism executing async code in JavaScript",
    difficulty: "advanced",
    category: "Technical",
    example: "Understanding the event loop is crucial for debugging async bugs."
  },
  {
    phrase: "prototype",
    meaning: "object from which other objects inherit properties",
    difficulty: "advanced",
    category: "Technical",
    example: "JavaScript uses prototypal inheritance instead of classes."
  },
  {
    phrase: "polymorphism",
    meaning: "ability of objects to take multiple forms",
    difficulty: "advanced",
    category: "Technical",
    example: "Polymorphism allows different handlers for the same message type."
  },
  {
    phrase: "encapsulation",
    meaning: "bundling data and methods together, hiding internals",
    difficulty: "advanced",
    category: "Technical",
    example: "Encapsulation prevents direct access to private fields."
  },
  {
    phrase: "inheritance",
    meaning: "acquiring properties/methods from a parent class",
    difficulty: "intermediate",
    category: "Technical",
    example: "Use composition over inheritance for flexibility."
  },
  {
    phrase: "composition",
    meaning: "building complex objects from simpler components",
    difficulty: "advanced",
    category: "Technical",
    example: "Composition is more flexible than inheritance."
  },
  {
    phrase: "DRY principle",
    meaning: "avoid repeating code — keep it single-source-of-truth",
    difficulty: "beginner",
    category: "Technical",
    example: "Extract the repeated validation logic into a utility function to follow DRY."
  },
  {
    phrase: "SOLID principles",
    meaning: "five design principles for better OOP code",
    difficulty: "advanced",
    category: "Technical",
    example: "Following SOLID principles makes code more maintainable."
  },
  {
    phrase: "convention over configuration",
    meaning: "default behavior reduces explicit setup",
    difficulty: "intermediate",
    category: "Technical",
    example: "Rails uses convention over configuration to minimize boilerplate."
  },
  {
    phrase: "mutation",
    meaning: "modifying state directly instead of creating new copies",
    difficulty: "intermediate",
    category: "Technical",
    example: "Avoid mutations in React components to prevent bugs."
  },
  {
    phrase: "immutable",
    meaning: "cannot be changed after creation",
    difficulty: "intermediate",
    category: "Technical",
    example: "Immutable data structures prevent accidental state changes."
  },
  {
    phrase: "state management",
    meaning: "managing data changes across an application",
    difficulty: "intermediate",
    category: "Technical",
    example: "Redux provides centralized state management."
  },
  {
    phrase: "reducer",
    meaning: "function that takes state and action and returns new state",
    difficulty: "intermediate",
    category: "Technical",
    example: "Write pure reducers to make state transitions predictable."
  },
  {
    phrase: "side effect",
    meaning: "code that affects external state or has observable impact",
    difficulty: "intermediate",
    category: "Technical",
    example: "Use useEffect to handle side effects in React."
  },
  {
    phrase: "pure function",
    meaning: "function that produces same output for same input with no side effects",
    difficulty: "intermediate",
    category: "Technical",
    example: "Keep components pure to make them predictable and testable."
  },
  {
    phrase: "impure function",
    meaning: "function with side effects or non-deterministic behavior",
    difficulty: "intermediate",
    category: "Technical",
    example: "API calls are impure functions that depend on external state."
  },
  {
    phrase: "higher-order function",
    meaning: "function that returns a function or accepts functions as args",
    difficulty: "advanced",
    category: "Technical",
    example: "Higher-order functions like map() and filter() are foundational."
  },
  {
    phrase: "currying",
    meaning: "transforming a function to take args one at a time",
    difficulty: "advanced",
    category: "Technical",
    example: "Currying allows partial application for more flexible functions."
  },
  {
    phrase: "monadic composition",
    meaning: "composing operations that wrap values",
    difficulty: "advanced",
    category: "Technical",
    example: "Monadic composition is powerful but has a steep learning curve."
  },
  {
    phrase: "type coercion",
    meaning: "automatic conversion between data types",
    difficulty: "intermediate",
    category: "Technical",
    example: "JavaScript type coercion is confusing — use strict equality."
  },
  {
    phrase: "type checking",
    meaning: "verifying data types match expectations",
    difficulty: "beginner",
    category: "Technical",
    example: "TypeScript provides compile-time type checking."
  },
  {
    phrase: "generic types",
    meaning: "reusable types that work with any data type",
    difficulty: "advanced",
    category: "Technical",
    example: "Use generics to write flexible, reusable components."
  },
  {
    phrase: "union type",
    meaning: "type that can be one of several specified types",
    difficulty: "intermediate",
    category: "Technical",
    example: "Union types let you represent 'either this or that' precisely."
  },
  {
    phrase: "intersection type",
    meaning: "type that combines multiple types into one",
    difficulty: "advanced",
    category: "Technical",
    example: "Intersection types merge multiple interfaces together."
  },
  {
    phrase: "conditional type",
    meaning: "type that varies based on a condition",
    difficulty: "advanced",
    category: "Technical",
    example: "Conditional types enable complex type transformations."
  },
  {
    phrase: "overloading",
    meaning: "defining multiple signatures for same function",
    difficulty: "intermediate",
    category: "Technical",
    example: "Function overloading allows different argument combinations."
  },
  {
    phrase: "variance",
    meaning: "how subtype relationships work in generic types",
    difficulty: "advanced",
    category: "Technical",
    example: "Understanding variance prevents type errors with generics."
  },
  {
    phrase: "DSL",
    meaning: "domain-specific language for specific problem domain",
    difficulty: "advanced",
    category: "Technical",
    example: "GraphQL is a DSL for querying APIs efficiently."
  },
  {
    phrase: "JSON",
    meaning: "JavaScript Object Notation — standard data format",
    difficulty: "beginner",
    category: "Technical",
    example: "Our API returns data as JSON for easy parsing."
  },
  {
    phrase: "XML",
    meaning: "eXtensible Markup Language for structured data",
    difficulty: "beginner",
    category: "Technical",
    example: "We migrated from XML to JSON for simpler parsing."
  },
  {
    phrase: "YAML",
    meaning: "human-readable data format often used for config",
    difficulty: "beginner",
    category: "Technical",
    example: "Docker Compose files use YAML for configuration."
  },
  {
    phrase: "REST",
    meaning: "architectural style for building web APIs",
    difficulty: "beginner",
    category: "Technical",
    example: "Our REST API uses standard HTTP methods."
  },
  {
    phrase: "CRUD",
    meaning: "Create, Read, Update, Delete — basic data operations",
    difficulty: "beginner",
    category: "Technical",
    example: "Every REST endpoint implements at least CRUD operations."
  },
  {
    phrase: "SOAP",
    meaning: "protocol for structured info exchange in web services",
    difficulty: "intermediate",
    category: "Technical",
    example: "SOAP is verbose compared to modern REST APIs."
  },
  {
    phrase: "GraphQL",
    meaning: "query language allowing clients to request exact data",
    difficulty: "intermediate",
    category: "Technical",
    example: "GraphQL prevents over-fetching by letting clients specify fields."
  },
  {
    phrase: "endpoint",
    meaning: "specific URL providing access to an API resource",
    difficulty: "beginner",
    category: "Technical",
    example: "The /users endpoint returns a list of all users."
  },
  {
    phrase: "HTTP method",
    meaning: "verb indicating what action to take on a resource",
    difficulty: "beginner",
    category: "Technical",
    example: "Use GET for retrieval and POST for creating resources."
  },
  {
    phrase: "status code",
    meaning: "numeric response indicating result of HTTP request",
    difficulty: "beginner",
    category: "Technical",
    example: "A 404 status code means the resource was not found."
  },
  {
    phrase: "header",
    meaning: "metadata sent with HTTP requests and responses",
    difficulty: "beginner",
    category: "Technical",
    example: "Set the Content-Type header to indicate response format."
  },
  {
    phrase: "query parameter",
    meaning: "key-value pairs in URL after the question mark",
    difficulty: "beginner",
    category: "Technical",
    example: "Use query parameters to filter results: /users?role=admin."
  },
  {
    phrase: "path parameter",
    meaning: "variable segment in URL path identifying a resource",
    difficulty: "beginner",
    category: "Technical",
    example: "The path /users/:id uses id as a path parameter."
  },
  {
    phrase: "request body",
    meaning: "data sent to server with POST/PUT requests",
    difficulty: "beginner",
    category: "Technical",
    example: "The request body contains the new user data."
  },
  {
    phrase: "response body",
    meaning: "data sent back from server to client",
    difficulty: "beginner",
    category: "Technical",
    example: "The response body contains the requested user information."
  },
  {
    phrase: "authentication",
    meaning: "verifying the identity of a user or service",
    difficulty: "beginner",
    category: "Technical",
    example: "Use JWT tokens for stateless authentication."
  },
  {
    phrase: "authorization",
    meaning: "determining what an authenticated user can do",
    difficulty: "beginner",
    category: "Technical",
    example: "Authorization checks prevent unauthorized access to resources."
  },
  {
    phrase: "OAuth",
    meaning: "open standard for delegated access authorization",
    difficulty: "intermediate",
    category: "Technical",
    example: "Our app uses OAuth to let users login with Google."
  },
  {
    phrase: "JWT",
    meaning: "JSON Web Token — compact token for stateless auth",
    difficulty: "intermediate",
    category: "Technical",
    example: "JWT tokens contain encoded claims about the user."
  },
  {
    phrase: "session",
    meaning: "period of user interaction with application",
    difficulty: "intermediate",
    category: "Technical",
    example: "Store session data server-side for security."
  },
  {
    phrase: "cookie",
    meaning: "small file storing data on client's browser",
    difficulty: "beginner",
    category: "Technical",
    example: "Cookies automatically send session tokens with requests."
  },
  {
    phrase: "CORS",
    meaning: "Cross-Origin Resource Sharing — allowing cross-origin requests",
    difficulty: "intermediate",
    category: "Technical",
    example: "Configure CORS headers to allow your frontend domain."
  },
  {
    phrase: "CSRF",
    meaning: "Cross-Site Request Forgery — security vulnerability",
    difficulty: "intermediate",
    category: "Technical",
    example: "Use CSRF tokens to prevent unauthorized actions."
  },
  {
    phrase: "XSS",
    meaning: "Cross-Site Scripting — injection attack vulnerability",
    difficulty: "intermediate",
    category: "Technical",
    example: "Sanitize user input to prevent XSS attacks."
  },
  {
    phrase: "SQL injection",
    meaning: "attack inserting malicious SQL into input fields",
    difficulty: "intermediate",
    category: "Technical",
    example: "Use parameterized queries to prevent SQL injection."
  },
  {
    phrase: "buffer overflow",
    meaning: "writing data beyond allocated memory boundary",
    difficulty: "advanced",
    category: "Technical",
    example: "Buffer overflow is a critical security vulnerability in C."
  },
  {
    phrase: "encryption",
    meaning: "converting data to unreadable form with a key",
    difficulty: "beginner",
    category: "Technical",
    example: "Use encryption for sensitive data at rest."
  },
  {
    phrase: "hashing",
    meaning: "converting input to fixed-size fingerprint",
    difficulty: "intermediate",
    category: "Technical",
    example: "Hash passwords instead of storing them in plain text."
  },
  {
    phrase: "salt",
    meaning: "random data added before hashing",
    difficulty: "intermediate",
    category: "Technical",
    example: "Always use salt when hashing passwords."
  },
  {
    phrase: "digest",
    meaning: "hash output of data",
    difficulty: "intermediate",
    category: "Technical",
    example: "MD5 digests are no longer considered secure."
  },
  {
    phrase: "signature",
    meaning: "cryptographic proof of authenticity",
    difficulty: "advanced",
    category: "Technical",
    example: "Digital signatures prove the message came from the sender."
  },
  {
    phrase: "certificate",
    meaning: "digital document binding identity to public key",
    difficulty: "intermediate",
    category: "Technical",
    example: "SSL certificates encrypt communication between client and server."
  },
  {
    phrase: "SSL/TLS",
    meaning: "protocols providing secure communication",
    difficulty: "intermediate",
    category: "Technical",
    example: "Always use TLS for sensitive data transmission."
  },
  {
    phrase: "HTTPS",
    meaning: "HTTP with TLS encryption",
    difficulty: "beginner",
    category: "Technical",
    example: "Switch to HTTPS to protect user data."
  },
  {
    phrase: "public key",
    meaning: "key that can be shared to receive encrypted messages",
    difficulty: "intermediate",
    category: "Technical",
    example: "Distribute public keys to allow encryption."
  },
  {
    phrase: "private key",
    meaning: "secret key used to decrypt messages",
    difficulty: "intermediate",
    category: "Technical",
    example: "Keep private keys secure and never share them."
  },
  {
    phrase: "asymmetric encryption",
    meaning: "using different keys for encryption and decryption",
    difficulty: "advanced",
    category: "Technical",
    example: "Asymmetric encryption enables secure key exchange."
  },
  {
    phrase: "symmetric encryption",
    meaning: "using same key for encryption and decryption",
    difficulty: "intermediate",
    category: "Technical",
    example: "Symmetric encryption is faster but requires secure key sharing."
  },
  {
    phrase: "hash map",
    meaning: "data structure mapping keys to values",
    difficulty: "intermediate",
    category: "Technical",
    example: "Hash maps provide O(1) lookup time."
  },
  {
    phrase: "collision",
    meaning: "hash function producing same output for different inputs",
    difficulty: "intermediate",
    category: "Technical",
    example: "Handle hash collisions with chaining or probing."
  },
  {
    phrase: "B-tree",
    meaning: "self-balancing tree data structure for databases",
    difficulty: "advanced",
    category: "Technical",
    example: "Most databases use B-trees for indexing."
  },
  {
    phrase: "linked list",
    meaning: "data structure where elements point to next element",
    difficulty: "intermediate",
    category: "Technical",
    example: "Linked lists provide O(1) insertion at head."
  },
  {
    phrase: "graph",
    meaning: "data structure of nodes connected by edges",
    difficulty: "intermediate",
    category: "Technical",
    example: "Social networks are often represented as graphs."
  },
  {
    phrase: "algorithm",
    meaning: "step-by-step procedure to solve a problem",
    difficulty: "beginner",
    category: "Technical",
    example: "Choose the right algorithm for optimal performance."
  },
  {
    phrase: "Big O notation",
    meaning: "describes algorithm's time/space complexity",
    difficulty: "intermediate",
    category: "Technical",
    example: "This algorithm runs in O(n log n) time."
  },
  {
    phrase: "time complexity",
    meaning: "how running time grows with input size",
    difficulty: "intermediate",
    category: "Technical",
    example: "Optimize for better time complexity."
  },
  {
    phrase: "space complexity",
    meaning: "how memory usage grows with input size",
    difficulty: "intermediate",
    category: "Technical",
    example: "This solution has high space complexity."
  },
  {
    phrase: "recursion",
    meaning: "function calling itself with smaller input",
    difficulty: "intermediate",
    category: "Technical",
    example: "Use recursion carefully to avoid stack overflow."
  },
  {
    phrase: "tail recursion",
    meaning: "recursion where recursive call is last operation",
    difficulty: "advanced",
    category: "Technical",
    example: "Tail recursion can be optimized into iteration."
  },
  {
    phrase: "stack",
    meaning: "data structure with Last-In-First-Out order",
    difficulty: "intermediate",
    category: "Technical",
    example: "Function calls use the call stack."
  },
  {
    phrase: "queue",
    meaning: "data structure with First-In-First-Out order",
    difficulty: "intermediate",
    category: "Technical",
    example: "Use a queue for job processing."
  },
  {
    phrase: "heap",
    meaning: "specialized tree structure for priority queue",
    difficulty: "advanced",
    category: "Technical",
    example: "Heaps enable efficient priority queue operations."
  },
  {
    phrase: "priority queue",
    meaning: "queue returning elements by priority not order",
    difficulty: "intermediate",
    category: "Technical",
    example: "Use a priority queue for task scheduling."
  },
  {
    phrase: "sorting algorithm",
    meaning: "algorithm that puts elements in order",
    difficulty: "beginner",
    category: "Technical",
    example: "Quicksort is often faster than merge sort in practice."
  },
  {
    phrase: "search algorithm",
    meaning: "algorithm that finds element in data",
    difficulty: "beginner",
    category: "Technical",
    example: "Binary search is faster than linear search."
  },
  {
    phrase: "dynamic programming",
    meaning: "solving problems by breaking into subproblems",
    difficulty: "advanced",
    category: "Technical",
    example: "Dynamic programming solved the optimization problem efficiently."
  },
  {
    phrase: "greedy algorithm",
    meaning: "making locally optimal choices at each step",
    difficulty: "intermediate",
    category: "Technical",
    example: "The greedy algorithm doesn't always find the global optimum."
  },
  {
    phrase: "backtracking",
    meaning: "exploring possibilities and undoing if they fail",
    difficulty: "advanced",
    category: "Technical",
    example: "Backtracking solves the maze-finding problem elegantly."
  },
  {
    phrase: "divide and conquer",
    meaning: "breaking problem into subproblems, solving, combining",
    difficulty: "intermediate",
    category: "Technical",
    example: "Merge sort uses divide and conquer."
  },
  {
    phrase: "brute force",
    meaning: "trying all possibilities without optimization",
    difficulty: "beginner",
    category: "Technical",
    example: "Brute force password cracking takes exponential time."
  },
  {
    phrase: "heuristic",
    meaning: "problem-solving technique using practical rules",
    difficulty: "intermediate",
    category: "Technical",
    example: "A* uses heuristics for efficient pathfinding."
  },
  {
    phrase: "machine learning",
    meaning: "training models to learn from data",
    difficulty: "intermediate",
    category: "Technical",
    example: "Machine learning powers our recommendation system."
  },
  {
    phrase: "model training",
    meaning: "process of adjusting parameters using data",
    difficulty: "intermediate",
    category: "Technical",
    example: "Model training requires lots of data."
  },
  {
    phrase: "overfitting",
    meaning: "model memorizing training data instead of generalizing",
    difficulty: "intermediate",
    category: "Technical",
    example: "Overfitting happens when the model is too complex."
  },
  {
    phrase: "underfitting",
    meaning: "model too simple to capture data patterns",
    difficulty: "intermediate",
    category: "Technical",
    example: "Underfitting results in poor accuracy."
  },
  {
    phrase: "validation set",
    meaning: "data used to evaluate model during training",
    difficulty: "intermediate",
    category: "Technical",
    example: "Use a validation set to tune hyperparameters."
  },
  {
    phrase: "test set",
    meaning: "held-out data for final model evaluation",
    difficulty: "intermediate",
    category: "Technical",
    example: "Never train on test set data."
  },
  {
    phrase: "feature engineering",
    meaning: "creating meaningful input features for models",
    difficulty: "advanced",
    category: "Technical",
    example: "Feature engineering is crucial for model performance."
  },
  {
    phrase: "normalization",
    meaning: "scaling features to similar ranges",
    difficulty: "intermediate",
    category: "Technical",
    example: "Normalize features to improve training stability."
  },
  {
    phrase: "regression",
    meaning: "predicting continuous numerical values",
    difficulty: "intermediate",
    category: "Technical",
    example: "Linear regression is the simplest regression model."
  },
  {
    phrase: "classification",
    meaning: "predicting discrete categories",
    difficulty: "intermediate",
    category: "Technical",
    example: "Use classification to predict email spam."
  },
  {
    phrase: "clustering",
    meaning: "grouping similar data points without labels",
    difficulty: "intermediate",
    category: "Technical",
    example: "K-means clustering identifies user segments."
  },
  {
    phrase: "supervised learning",
    meaning: "learning from labeled training examples",
    difficulty: "intermediate",
    category: "Technical",
    example: "Supervised learning requires lots of labeled data."
  },
  {
    phrase: "unsupervised learning",
    meaning: "finding patterns in unlabeled data",
    difficulty: "intermediate",
    category: "Technical",
    example: "Unsupervised learning discovers hidden patterns."
  },
  {
    phrase: "reinforcement learning",
    meaning: "learning from rewards and penalties",
    difficulty: "advanced",
    category: "Technical",
    example: "Reinforcement learning trained our game-playing AI."
  },
  {
    phrase: "loss function",
    meaning: "measure of how wrong predictions are",
    difficulty: "intermediate",
    category: "Technical",
    example: "Choose the right loss function for your problem."
  },
  {
    phrase: "gradient descent",
    meaning: "optimization algorithm moving toward lower loss",
    difficulty: "advanced",
    category: "Technical",
    example: "Gradient descent finds the minimum efficiently."
  },
  {
    phrase: "learning rate",
    meaning: "how much to adjust parameters per iteration",
    difficulty: "intermediate",
    category: "Technical",
    example: "Too high a learning rate can cause divergence."
  },
  {
    phrase: "hyperparameter",
    meaning: "parameter set before training, not learned",
    difficulty: "intermediate",
    category: "Technical",
    example: "Tune hyperparameters using a validation set."
  },
  {
    phrase: "batch size",
    meaning: "number of examples processed together",
    difficulty: "intermediate",
    category: "Technical",
    example: "Larger batch sizes train faster but use more memory."
  },
  {
    phrase: "epoch",
    meaning: "complete pass through training data",
    difficulty: "intermediate",
    category: "Technical",
    example: "Train for multiple epochs to converge."
  },
  {
    phrase: "backpropagation",
    meaning: "algorithm computing gradients in neural networks",
    difficulty: "advanced",
    category: "Technical",
    example: "Backpropagation enables efficient neural network training."
  },
  {
    phrase: "neural network",
    meaning: "model inspired by biological neurons",
    difficulty: "intermediate",
    category: "Technical",
    example: "Deep neural networks power modern AI."
  },
  {
    phrase: "deep learning",
    meaning: "neural networks with many layers",
    difficulty: "intermediate",
    category: "Technical",
    example: "Deep learning achieves state-of-the-art results on many tasks."
  },
  {
    phrase: "activation function",
    meaning: "non-linear function in neural network layers",
    difficulty: "advanced",
    category: "Technical",
    example: "ReLU is a popular activation function."
  },
  {
    phrase: "convolutional layer",
    meaning: "layer extracting local features using filters",
    difficulty: "advanced",
    category: "Technical",
    example: "Convolutional layers excel at image recognition."
  },
  {
    phrase: "pooling",
    meaning: "downsampling feature maps",
    difficulty: "intermediate",
    category: "Technical",
    example: "Max pooling reduces dimensionality while preserving features."
  },
  {
    phrase: "attention mechanism",
    meaning: "weighting different input parts differently",
    difficulty: "advanced",
    category: "Technical",
    example: "Attention mechanisms power modern transformers."
  },
  {
    phrase: "transformer",
    meaning: "neural architecture using attention instead of recurrence",
    difficulty: "advanced",
    category: "Technical",
    example: "Transformers achieve state-of-the-art NLP results."
  },
  {
    phrase: "embedding",
    meaning: "representing discrete items as vectors",
    difficulty: "intermediate",
    category: "Technical",
    example: "Word embeddings capture semantic relationships."
  },
  {
    phrase: "vector database",
    meaning: "database optimized for storing and searching vectors",
    difficulty: "advanced",
    category: "Technical",
    example: "Vector databases enable semantic search."
  },
  {
    phrase: "LLM",
    meaning: "Large Language Model trained on text data",
    difficulty: "beginner",
    category: "Technical",
    example: "We integrated an LLM into our application."
  },
  {
    phrase: "prompt engineering",
    meaning: "crafting inputs to get better LLM outputs",
    difficulty: "intermediate",
    category: "Technical",
    example: "Prompt engineering significantly improved response quality."
  },
  {
    phrase: "fine-tuning",
    meaning: "further training a model on specific data",
    difficulty: "intermediate",
    category: "Technical",
    example: "Fine-tune the model for domain-specific tasks."
  },
  {
    phrase: "inference",
    meaning: "using trained model to make predictions",
    difficulty: "intermediate",
    category: "Technical",
    example: "Inference latency is critical for user-facing features."
  },
  {
    phrase: "quantization",
    meaning: "reducing precision of model weights",
    difficulty: "advanced",
    category: "Technical",
    example: "Quantization speeds up inference without much accuracy loss."
  },
  {
    phrase: "containerization",
    meaning: "packaging application with dependencies",
    difficulty: "intermediate",
    category: "Technical",
    example: "Docker containerization ensures consistency across environments."
  },
  {
    phrase: "Docker",
    meaning: "containerization platform for apps and services",
    difficulty: "intermediate",
    category: "Technical",
    example: "Use Docker to package your application."
  },
  {
    phrase: "Kubernetes",
    meaning: "container orchestration platform",
    difficulty: "advanced",
    category: "Technical",
    example: "Kubernetes manages container deployment at scale."
  },
  {
    phrase: "microservices",
    meaning: "architecture of small independent services",
    difficulty: "intermediate",
    category: "Technical",
    example: "Microservices add operational complexity."
  },
  {
    phrase: "monolith",
    meaning: "single-codebase application",
    difficulty: "beginner",
    category: "Technical",
    example: "Monoliths are simpler but harder to scale."
  },
  {
    phrase: "CI/CD",
    meaning: "Continuous Integration and Continuous Deployment",
    difficulty: "beginner",
    category: "Technical",
    example: "Implement CI/CD to deploy frequently and safely."
  },
  {
    phrase: "deployment",
    meaning: "releasing code to production",
    difficulty: "beginner",
    category: "Technical",
    example: "Automate deployments to reduce human error."
  },
  {
    phrase: "rollback",
    meaning: "reverting to previous version",
    difficulty: "beginner",
    category: "Technical",
    example: "Quick rollback prevented an outage."
  },
  {
    phrase: "blue-green deployment",
    meaning: "running two versions simultaneously for safe switching",
    difficulty: "advanced",
    category: "Technical",
    example: "Blue-green deployment eliminates downtime."
  },
  {
    phrase: "canary deployment",
    meaning: "gradually rolling out changes to subset of users",
    difficulty: "advanced",
    category: "Technical",
    example: "Canary deployments catch bugs before full rollout."
  },
  {
    phrase: "feature flag",
    meaning: "toggle controlling feature availability",
    difficulty: "intermediate",
    category: "Technical",
    example: "Use feature flags to deploy incomplete features."
  },
  {
    phrase: "monitoring",
    meaning: "observing application performance and health",
    difficulty: "beginner",
    category: "Technical",
    example: "Monitoring alerts us to problems before users notice."
  },
  {
    phrase: "logging",
    meaning: "recording events for debugging and analysis",
    difficulty: "beginner",
    category: "Technical",
    example: "Structured logging makes debugging easier."
  },
  {
    phrase: "tracing",
    meaning: "tracking requests through system components",
    difficulty: "intermediate",
    category: "Technical",
    example: "Distributed tracing helps identify bottlenecks."
  },
  {
    phrase: "metrics",
    meaning: "quantitative measurements of system behavior",
    difficulty: "beginner",
    category: "Technical",
    example: "Track metrics to understand system health."
  },
  {
    phrase: "alerts",
    meaning: "notifications when metrics exceed thresholds",
    difficulty: "beginner",
    category: "Technical",
    example: "Set up alerts for critical metrics."
  },
  {
    phrase: "SLA",
    meaning: "Service Level Agreement defining availability guarantees",
    difficulty: "intermediate",
    category: "Technical",
    example: "Our SLA guarantees 99.9% uptime."
  },
  {
    phrase: "SLO",
    meaning: "Service Level Objective — target availability level",
    difficulty: "intermediate",
    category: "Technical",
    example: "We have an SLO of 99.95% availability."
  },
  {
    phrase: "uptime",
    meaning: "percentage of time service is available",
    difficulty: "beginner",
    category: "Technical",
    example: "High uptime is critical for production systems."
  },
  {
    phrase: "latency",
    meaning: "delay between request and response",
    difficulty: "beginner",
    category: "Technical",
    example: "Reduce latency to improve user experience."
  },
  {
    phrase: "throughput",
    meaning: "amount of work completed per unit time",
    difficulty: "beginner",
    category: "Technical",
    example: "Increase throughput to handle more users."
  },
  {
    phrase: "bottleneck",
    meaning: "component limiting overall system performance",
    difficulty: "beginner",
    category: "Technical",
    example: "The database is the performance bottleneck."
  },
  {
    phrase: "load balancing",
    meaning: "distributing traffic across multiple servers",
    difficulty: "intermediate",
    category: "Technical",
    example: "Load balancing prevents any single server from overloading."
  },
  {
    phrase: "horizontal scaling",
    meaning: "adding more machines to handle load",
    difficulty: "intermediate",
    category: "Technical",
    example: "Horizontal scaling distributes load across servers."
  },
  {
    phrase: "vertical scaling",
    meaning: "upgrading existing machine with more resources",
    difficulty: "intermediate",
    category: "Technical",
    example: "Vertical scaling has limits but is simpler than horizontal."
  },
  {
    phrase: "CDN",
    meaning: "Content Delivery Network for geographically distributed content",
    difficulty: "intermediate",
    category: "Technical",
    example: "Use a CDN to serve static content worldwide."
  },
  {
    phrase: "edge computing",
    meaning: "processing at network edge closer to users",
    difficulty: "advanced",
    category: "Technical",
    example: "Edge computing reduces latency for global users."
  },
  {
    phrase: "WAF",
    meaning: "Web Application Firewall protecting from attacks",
    difficulty: "intermediate",
    category: "Technical",
    example: "Enable WAF protection against common attacks."
  },
  {
    phrase: "DDoS",
    meaning: "Distributed Denial of Service attack",
    difficulty: "intermediate",
    category: "Technical",
    example: "DDoS attacks can bring down unprotected services."
  },
  {
    phrase: "API key",
    meaning: "secret token for API authentication",
    difficulty: "beginner",
    category: "Technical",
    example: "Rotate API keys regularly."
  },
  {
    phrase: "rate limiting",
    meaning: "restricting request frequency per user",
    difficulty: "intermediate",
    category: "Technical",
    example: "Implement rate limiting to prevent abuse."
  },
  {
    phrase: "versioning",
    meaning: "managing different versions of software",
    difficulty: "beginner",
    category: "Technical",
    example: "Use semantic versioning for clarity."
  },
  {
    phrase: "backward compatibility",
    meaning: "new version works with old code",
    difficulty: "intermediate",
    category: "Technical",
    example: "Maintain backward compatibility when possible."
  },
  {
    phrase: "deprecation",
    meaning: "marking feature as outdated to be removed",
    difficulty: "intermediate",
    category: "Technical",
    example: "Deprecate old APIs before removing them."
  }
];
