# Google Labs Jules - Integration & Workflows

A guide to managing, automating, and parallelizing Google Labs Jules tasks inside this repository.

---

## 1. Quick Start (Avoiding CLI Hangs)

When running the `jules` CLI autonomously or inside an agentic workspace, **never run it interactively**. Close standard input and explicitly specify the repository to prevent the command from hanging:

```bash
# Correct syntax to kick off a new task:
jules new --repo Kolajy/cooking_alchemist "Task Description Here" < /dev/null
```

---

## 2. Parallelizing Tasks

Jules supports parallel execution in two ways:

### A. Multi-Task Concurrency
Since each task runs in its own isolated Google Cloud VM, you can spin up multiple different tasks simultaneously. They will run in parallel on the Google Cloud backend without blocking each other.

```bash
jules new --repo Kolajy/cooking_alchemist "Optimize state machine" < /dev/null
jules new --repo Kolajy/cooking_alchemist "Sanitize HTML dialogs" < /dev/null
```

### B. Same-Task Parallel Attempts (Alternative Solutions)
AI generation is probabilistic. You can command Jules to perform the **same task** across multiple parallel instances (up to 5) to generate different implementations, allowing you to choose the cleanest solution:

```bash
# Spin up 3 parallel VM instances for the same task:
jules new --repo Kolajy/cooking_alchemist --parallel 3 "Add a smooth fade transition" < /dev/null
```

---

## 3. Session Lifecycle & Statuses

You can check the status of your tasks from the terminal or on the [Jules Dashboard](https://jules.google.com):

```bash
jules remote list --session < /dev/null
```

### Common Statuses:
* **`Planning` / `Awaiting Plan Approval`**: Jules has analyzed the codebase and is waiting for you to approve the plan on the web dashboard before it writes any code.
* **`In Progress`**: Jules is actively writing code and running tests on the remote VM.
* **`Awaiting User Feedback`**: Jules requires input or manual intervention.
* **`Completed`**: Jules has completed the task and pushed the branch to origin.

---

## 4. REST API & Programmatic Deletion

If you need to programmatically delete or cancel a session, you can use the REST API with your Jules API key (available in your profile settings on the dashboard):

```bash
# Delete a session programmatically
curl -X DELETE \
  -H "x-goog-api-key: $JULES_API_KEY" \
  https://jules.googleapis.com/v1alpha/sessions/YOUR_SESSION_ID
```

---

## 5. Reviewing & Merging PRs Programmatically

Once Jules pushes the branch, you can create a PR directly using the GitHub CLI (`gh`) without downloading the code locally:

```bash
# Open a PR directly from the branch Jules pushed:
gh pr create --head <JULES_BRANCH_NAME> --base main --title "Your Title" --body "Your Description"
```
