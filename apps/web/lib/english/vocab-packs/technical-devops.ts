export type VocabPackItem = {
  phrase: string;
  meaning: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'Daily Life' | 'Work' | 'Technical' | 'Opinion' | 'Social';
  example: string;
};

export const technicalDevopsPack: VocabPackItem[] = [
  {
    phrase: "spin up",
    meaning: "to start a new server or container instance",
    difficulty: "intermediate",
    category: "Technical",
    example: "Let me spin up a new EC2 instance for testing."
  },
  {
    phrase: "roll back",
    meaning: "to revert to a previous version",
    difficulty: "intermediate",
    category: "Technical",
    example: "We had to roll back the deployment after the incident."
  },
  {
    phrase: "blue-green deployment",
    meaning: "running two identical environments, switching traffic between them",
    difficulty: "advanced",
    category: "Technical",
    example: "Blue-green deployment lets us switch traffic instantly."
  },
  {
    phrase: "idempotent",
    meaning: "producing the same result regardless of how many times applied",
    difficulty: "advanced",
    category: "Technical",
    example: "Make sure your provisioning scripts are idempotent."
  },
  {
    phrase: "pipeline",
    meaning: "automated sequence of build/test/deploy steps",
    difficulty: "intermediate",
    category: "Technical",
    example: "The CI pipeline runs on every pull request."
  },
  {
    phrase: "on-call",
    meaning: "scheduled to respond to alerts",
    difficulty: "intermediate",
    category: "Technical",
    example: "I'm on-call this weekend—my phone is always on."
  },
  {
    phrase: "postmortem",
    meaning: "analysis of an incident after it's resolved",
    difficulty: "intermediate",
    category: "Technical",
    example: "We'll write a postmortem after the outage."
  },
  {
    phrase: "canary release",
    meaning: "gradual rollout to a small subset of users first",
    difficulty: "advanced",
    category: "Technical",
    example: "We're doing a canary release to 5% of traffic."
  },
  {
    phrase: "CI/CD",
    meaning: "continuous integration and continuous deployment",
    difficulty: "intermediate",
    category: "Technical",
    example: "We're improving our CI/CD pipeline."
  },
  {
    phrase: "containerized",
    meaning: "packaged in a container like Docker",
    difficulty: "intermediate",
    category: "Technical",
    example: "All our services are containerized now."
  },
  {
    phrase: "orchestration",
    meaning: "automated coordination of multiple containers/services",
    difficulty: "advanced",
    category: "Technical",
    example: "We use Kubernetes for orchestration."
  },
  {
    phrase: "cluster",
    meaning: "a group of connected servers working together",
    difficulty: "intermediate",
    category: "Technical",
    example: "We scaled up the Kubernetes cluster."
  },
  {
    phrase: "node",
    meaning: "a single server or computer in a network",
    difficulty: "intermediate",
    category: "Technical",
    example: "We added three new nodes to the cluster."
  },
  {
    phrase: "pod",
    meaning: "smallest deployable unit in Kubernetes",
    difficulty: "intermediate",
    category: "Technical",
    example: "The pod crashed and restarted."
  },
  {
    phrase: "container image",
    meaning: "a package with all code and dependencies",
    difficulty: "intermediate",
    category: "Technical",
    example: "We pushed a new container image to the registry."
  },
  {
    phrase: "registry",
    meaning: "repository for storing and distributing container images",
    difficulty: "intermediate",
    category: "Technical",
    example: "We use Docker Hub as our image registry."
  },
  {
    phrase: "load balancer",
    meaning: "distributes traffic across multiple servers",
    difficulty: "intermediate",
    category: "Technical",
    example: "The load balancer wasn't distributing traffic evenly."
  },
  {
    phrase: "failover",
    meaning: "automatic switch to backup system on failure",
    difficulty: "intermediate",
    category: "Technical",
    example: "Failover to the backup database happened automatically."
  },
  {
    phrase: "redundancy",
    meaning: "having backup systems in case of failure",
    difficulty: "intermediate",
    category: "Technical",
    example: "We have redundancy across two data centers."
  },
  {
    phrase: "availability",
    meaning: "the proportion of time a system is operational",
    difficulty: "intermediate",
    category: "Technical",
    example: "Our SLA guarantees 99.9% availability."
  },
  {
    phrase: "latency",
    meaning: "the delay between request and response",
    difficulty: "intermediate",
    category: "Technical",
    example: "We need to reduce latency by 100ms."
  },
  {
    phrase: "throughput",
    meaning: "the amount of data processed per unit time",
    difficulty: "intermediate",
    category: "Technical",
    example: "Throughput improved after optimization."
  },
  {
    phrase: "bottleneck",
    meaning: "a point that limits overall performance",
    difficulty: "intermediate",
    category: "Technical",
    example: "Database queries are the bottleneck."
  },
  {
    phrase: "scaling",
    meaning: "increasing capacity to handle more load",
    difficulty: "intermediate",
    category: "Technical",
    example: "We're scaling horizontally by adding more servers."
  },
  {
    phrase: "vertical scaling",
    meaning: "adding more resources to a single server",
    difficulty: "intermediate",
    category: "Technical",
    example: "We scaled vertically by upgrading to a larger instance."
  },
  {
    phrase: "horizontal scaling",
    meaning: "adding more servers to distribute the load",
    difficulty: "intermediate",
    category: "Technical",
    example: "Horizontal scaling is better for our workload."
  },
  {
    phrase: "auto-scaling",
    meaning: "automatically adjusting resources based on demand",
    difficulty: "intermediate",
    category: "Technical",
    example: "Auto-scaling kicked in during peak traffic."
  },
  {
    phrase: "SLA",
    meaning: "service level agreement; uptime guarantee",
    difficulty: "intermediate",
    category: "Technical",
    example: "We commit to 99.99% uptime in our SLA."
  },
  {
    phrase: "SLO",
    meaning: "service level objective; internal performance target",
    difficulty: "advanced",
    category: "Technical",
    example: "Our SLO is 99.95% availability."
  },
  {
    phrase: "SLI",
    meaning: "service level indicator; measured metric",
    difficulty: "advanced",
    category: "Technical",
    example: "We track multiple SLIs to monitor health."
  },
  {
    phrase: "downtime",
    meaning: "period when a system is unavailable",
    difficulty: "intermediate",
    category: "Technical",
    example: "We had 2 hours of downtime yesterday."
  },
  {
    phrase: "uptime",
    meaning: "period when a system is operational",
    difficulty: "intermediate",
    category: "Technical",
    example: "Our uptime this month was 99.95%."
  },
  {
    phrase: "monitoring",
    meaning: "continuous observation of system health",
    difficulty: "intermediate",
    category: "Technical",
    example: "We use Prometheus for monitoring."
  },
  {
    phrase: "alert",
    meaning: "notification of an issue or anomaly",
    difficulty: "beginner",
    category: "Technical",
    example: "We got an alert about high CPU usage."
  },
  {
    phrase: "metric",
    meaning: "a measurable value of system performance",
    difficulty: "intermediate",
    category: "Technical",
    example: "Memory usage is our key metric to watch."
  },
  {
    phrase: "dashboard",
    meaning: "visual display of system metrics",
    difficulty: "intermediate",
    category: "Technical",
    example: "Check the Grafana dashboard for live stats."
  },
  {
    phrase: "telemetry",
    meaning: "data about system performance and behavior",
    difficulty: "advanced",
    category: "Technical",
    example: "We collect telemetry from all our services."
  },
  {
    phrase: "trace",
    meaning: "record of a request's path through the system",
    difficulty: "intermediate",
    category: "Technical",
    example: "Use distributed tracing to debug latency issues."
  },
  {
    phrase: "logging",
    meaning: "recording events and errors for analysis",
    difficulty: "intermediate",
    category: "Technical",
    example: "We centralize logs in Elasticsearch."
  },
  {
    phrase: "log aggregation",
    meaning: "collecting logs from multiple sources",
    difficulty: "intermediate",
    category: "Technical",
    example: "Log aggregation helps us find patterns quickly."
  },
  {
    phrase: "log rotation",
    meaning: "archiving old logs to manage disk space",
    difficulty: "intermediate",
    category: "Technical",
    example: "We rotate logs daily to save storage."
  },
  {
    phrase: "stack trace",
    meaning: "detailed error information showing where it occurred",
    difficulty: "intermediate",
    category: "Technical",
    example: "The stack trace shows the error in line 42."
  },
  {
    phrase: "debug",
    meaning: "to find and fix errors in code",
    difficulty: "beginner",
    category: "Technical",
    example: "I spent hours debugging that issue."
  },
  {
    phrase: "profiling",
    meaning: "analyzing code to find performance issues",
    difficulty: "advanced",
    category: "Technical",
    example: "CPU profiling revealed the bottleneck."
  },
  {
    phrase: "optimization",
    meaning: "improving performance or efficiency",
    difficulty: "intermediate",
    category: "Technical",
    example: "We implemented query optimization."
  },
  {
    phrase: "caching",
    meaning: "storing frequently accessed data for quick retrieval",
    difficulty: "intermediate",
    category: "Technical",
    example: "We use Redis for caching."
  },
  {
    phrase: "cache hit",
    meaning: "when requested data is found in cache",
    difficulty: "intermediate",
    category: "Technical",
    example: "Cache hit rate improved to 95%."
  },
  {
    phrase: "cache miss",
    meaning: "when requested data is not in cache",
    difficulty: "intermediate",
    category: "Technical",
    example: "A cache miss triggers a database query."
  },
  {
    phrase: "CDN",
    meaning: "content delivery network; serves content from locations near users",
    difficulty: "intermediate",
    category: "Technical",
    example: "We use CloudFlare as our CDN."
  },
  {
    phrase: "edge server",
    meaning: "server geographically close to users",
    difficulty: "advanced",
    category: "Technical",
    example: "Edge servers reduce latency significantly."
  },
  {
    phrase: "geographic redundancy",
    meaning: "having servers in multiple locations",
    difficulty: "advanced",
    category: "Technical",
    example: "Geographic redundancy protects against regional outages."
  },
  {
    phrase: "disaster recovery",
    meaning: "plan and processes to restore after catastrophic failure",
    difficulty: "advanced",
    category: "Technical",
    example: "We test our disaster recovery plan annually."
  },
  {
    phrase: "backup",
    meaning: "copy of data for recovery purposes",
    difficulty: "intermediate",
    category: "Technical",
    example: "We backup data every 6 hours."
  },
  {
    phrase: "restore",
    meaning: "to recover data from backup",
    difficulty: "intermediate",
    category: "Technical",
    example: "We restored from backup after the crash."
  },
  {
    phrase: "snapshot",
    meaning: "point-in-time copy of system state",
    difficulty: "intermediate",
    category: "Technical",
    example: "We took a snapshot before the upgrade."
  },
  {
    phrase: "replication",
    meaning: "copying data across multiple systems",
    difficulty: "intermediate",
    category: "Technical",
    example: "Database replication ensures high availability."
  },
  {
    phrase: "synchronization",
    meaning: "keeping multiple copies of data consistent",
    difficulty: "intermediate",
    category: "Technical",
    example: "Synchronization between regions was delayed."
  },
  {
    phrase: "consistency",
    meaning: "all systems showing the same data",
    difficulty: "intermediate",
    category: "Technical",
    example: "We prioritize consistency over availability."
  },
  {
    phrase: "eventual consistency",
    meaning: "data will match across systems given enough time",
    difficulty: "advanced",
    category: "Technical",
    example: "Our distributed system uses eventual consistency."
  },
  {
    phrase: "transaction",
    meaning: "a unit of work that must complete fully or not at all",
    difficulty: "intermediate",
    category: "Technical",
    example: "The transaction failed and rolled back."
  },
  {
    phrase: "ACID",
    meaning: "atomicity, consistency, isolation, durability principles",
    difficulty: "advanced",
    category: "Technical",
    example: "Our database guarantees ACID properties."
  },
  {
    phrase: "commit",
    meaning: "to permanently save changes",
    difficulty: "intermediate",
    category: "Technical",
    example: "Commit your code when ready."
  },
  {
    phrase: "rollback",
    meaning: "to undo changes and revert state",
    difficulty: "intermediate",
    category: "Technical",
    example: "We had to rollback the database migration."
  },
  {
    phrase: "migration",
    meaning: "moving data or systems to new location/version",
    difficulty: "intermediate",
    category: "Technical",
    example: "The database migration took 3 hours."
  },
  {
    phrase: "downtime window",
    meaning: "scheduled time when system will be unavailable",
    difficulty: "intermediate",
    category: "Technical",
    example: "Maintenance window is Sunday 2-4 AM."
  },
  {
    phrase: "hotfix",
    meaning: "urgent patch for critical production issue",
    difficulty: "intermediate",
    category: "Technical",
    example: "We deployed a hotfix for the security bug."
  },
  {
    phrase: "patch",
    meaning: "minor update to fix issues",
    difficulty: "intermediate",
    category: "Technical",
    example: "Install the latest security patch."
  },
  {
    phrase: "upgrade",
    meaning: "move to a newer version",
    difficulty: "beginner",
    category: "Technical",
    example: "We're upgrading to Python 3.11."
  },
  {
    phrase: "downgrade",
    meaning: "move to an older version",
    difficulty: "intermediate",
    category: "Technical",
    example: "We downgraded due to compatibility issues."
  },
  {
    phrase: "version control",
    meaning: "system for tracking code changes",
    difficulty: "intermediate",
    category: "Technical",
    example: "We use Git for version control."
  },
  {
    phrase: "branch",
    meaning: "isolated copy of code for development",
    difficulty: "intermediate",
    category: "Technical",
    example: "Create a feature branch for your work."
  },
  {
    phrase: "merge",
    meaning: "combining code from different branches",
    difficulty: "intermediate",
    category: "Technical",
    example: "We merged the feature branch to main."
  },
  {
    phrase: "pull request",
    meaning: "request to review and merge code changes",
    difficulty: "intermediate",
    category: "Technical",
    example: "Your pull request is awaiting review."
  },
  {
    phrase: "code review",
    meaning: "examining code for quality and correctness",
    difficulty: "intermediate",
    category: "Technical",
    example: "Code review is required before merge."
  },
  {
    phrase: "integration test",
    meaning: "testing how components work together",
    difficulty: "intermediate",
    category: "Technical",
    example: "Our integration tests catch API issues."
  },
  {
    phrase: "unit test",
    meaning: "testing individual functions in isolation",
    difficulty: "intermediate",
    category: "Technical",
    example: "Write unit tests for all critical functions."
  },
  {
    phrase: "end-to-end test",
    meaning: "testing complete user workflows",
    difficulty: "intermediate",
    category: "Technical",
    example: "E2E tests verify the entire purchase flow."
  },
  {
    phrase: "regression test",
    meaning: "testing that previous fixes still work",
    difficulty: "intermediate",
    category: "Technical",
    example: "Regression tests caught a reintroduced bug."
  },
  {
    phrase: "load testing",
    meaning: "testing system performance under high traffic",
    difficulty: "intermediate",
    category: "Technical",
    example: "Load testing revealed our capacity limits."
  },
  {
    phrase: "stress testing",
    meaning: "pushing system beyond normal limits",
    difficulty: "advanced",
    category: "Technical",
    example: "Stress testing found failure points."
  },
  {
    phrase: "smoke test",
    meaning: "basic test to verify system starts correctly",
    difficulty: "intermediate",
    category: "Technical",
    example: "Run smoke tests after deployment."
  },
  {
    phrase: "coverage",
    meaning: "percentage of code exercised by tests",
    difficulty: "intermediate",
    category: "Technical",
    example: "We have 85% test coverage."
  },
  {
    phrase: "infrastructure as code",
    meaning: "defining infrastructure using code files",
    difficulty: "advanced",
    category: "Technical",
    example: "We use Terraform for infrastructure as code."
  },
  {
    phrase: "configuration management",
    meaning: "automating server configuration and deployment",
    difficulty: "advanced",
    category: "Technical",
    example: "Ansible handles configuration management."
  },
  {
    phrase: "provisioning",
    meaning: "setting up and preparing infrastructure",
    difficulty: "intermediate",
    category: "Technical",
    example: "Provisioning a new server takes 5 minutes."
  },
  {
    phrase: "deployment strategy",
    meaning: "approach to releasing new versions",
    difficulty: "advanced",
    category: "Technical",
    example: "Our deployment strategy uses canary releases."
  },
  {
    phrase: "zero-downtime deployment",
    meaning: "releasing without interrupting service",
    difficulty: "advanced",
    category: "Technical",
    example: "Blue-green enables zero-downtime deployment."
  },
  {
    phrase: "health check",
    meaning: "verifying that a service is running correctly",
    difficulty: "intermediate",
    category: "Technical",
    example: "Health checks run every 10 seconds."
  },
  {
    phrase: "heartbeat",
    meaning: "periodic signal that a service is alive",
    difficulty: "intermediate",
    category: "Technical",
    example: "If heartbeat stops, failover triggers."
  },
  {
    phrase: "circuit breaker",
    meaning: "stopping requests to failing service temporarily",
    difficulty: "advanced",
    category: "Technical",
    example: "Circuit breaker prevents cascading failures."
  },
  {
    phrase: "rate limiting",
    meaning: "restricting number of requests per time period",
    difficulty: "intermediate",
    category: "Technical",
    example: "We rate limit API calls to 1000/minute."
  },
  {
    phrase: "throttling",
    meaning: "slowing down requests when limits approached",
    difficulty: "intermediate",
    category: "Technical",
    example: "Throttling kicks in before service overload."
  },
  {
    phrase: "backoff",
    meaning: "increasing delay between retries",
    difficulty: "intermediate",
    category: "Technical",
    example: "Exponential backoff prevents overwhelming failed services."
  },
  {
    phrase: "retry logic",
    meaning: "automatically attempting failed operations again",
    difficulty: "intermediate",
    category: "Technical",
    example: "Implement retry logic for network calls."
  },
  {
    phrase: "timeout",
    meaning: "maximum time to wait for a response",
    difficulty: "intermediate",
    category: "Technical",
    example: "Set a 30-second timeout for API calls."
  },
  {
    phrase: "connection pool",
    meaning: "reusing database connections for efficiency",
    difficulty: "advanced",
    category: "Technical",
    example: "Connection pooling improved throughput."
  },
  {
    phrase: "memory leak",
    meaning: "program consuming more memory over time",
    difficulty: "intermediate",
    category: "Technical",
    example: "We fixed a memory leak in the service."
  },
  {
    phrase: "garbage collection",
    meaning: "automatic cleanup of unused memory",
    difficulty: "intermediate",
    category: "Technical",
    example: "GC pauses were causing performance issues."
  },
  {
    phrase: "CPU usage",
    meaning: "processor resources being consumed",
    difficulty: "intermediate",
    category: "Technical",
    example: "CPU usage spiked to 95%."
  },
  {
    phrase: "memory usage",
    meaning: "RAM being consumed by a process",
    difficulty: "intermediate",
    category: "Technical",
    example: "Memory usage keeps growing over time."
  },
  {
    phrase: "disk I/O",
    meaning: "reading/writing data to disk",
    difficulty: "intermediate",
    category: "Technical",
    example: "High disk I/O is slowing us down."
  },
  {
    phrase: "network I/O",
    meaning: "sending/receiving data over network",
    difficulty: "intermediate",
    category: "Technical",
    example: "Network I/O is our performance bottleneck."
  },
  {
    phrase: "bandwidth",
    meaning: "maximum data transfer rate",
    difficulty: "intermediate",
    category: "Technical",
    example: "We exceeded our bandwidth limit."
  },
  {
    phrase: "throughput optimization",
    meaning: "increasing data processing speed",
    difficulty: "advanced",
    category: "Technical",
    example: "Throughput optimization doubled our capacity."
  },
  {
    phrase: "request queuing",
    meaning: "holding requests until service ready",
    difficulty: "intermediate",
    category: "Technical",
    example: "Request queuing prevented errors during surge."
  },
  {
    phrase: "dead letter queue",
    meaning: "holding failed messages for analysis",
    difficulty: "advanced",
    category: "Technical",
    example: "Messages in the DLQ indicate processing issues."
  },
  {
    phrase: "webhook",
    meaning: "callback from external service when event occurs",
    difficulty: "intermediate",
    category: "Technical",
    example: "We use webhooks to trigger deployments."
  },
  {
    phrase: "API gateway",
    meaning: "central entry point for API requests",
    difficulty: "advanced",
    category: "Technical",
    example: "API gateway routes requests to microservices."
  },
  {
    phrase: "service mesh",
    meaning: "managing communication between microservices",
    difficulty: "advanced",
    category: "Technical",
    example: "We use Istio for service mesh."
  }
];
