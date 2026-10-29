# Automated Deployment of a Serverless Student Task Management Application Using Terraform

This mini project provisions a Cloudflare Worker and a Workers KV namespace using Terraform. The Worker serves a browser UI and a REST API for creating, viewing, updating, and deleting student tasks. GitHub Actions runs Terraform validation, planning, and (on pushes to `main`) apply.

## Requirements
- Cloudflare account with Workers enabled
- Terraform >= 1.5
- Git and GitHub account
- Cloudflare API token with **Workers Scripts: Edit** and **Workers KV Storage: Edit** permissions (use least privilege)

## 1. Configure credentials locally
1. Find your Cloudflare Account ID in the Cloudflare dashboard.
2. Create a scoped API token with the required Workers Scripts and Workers KV permissions.
3. Open a terminal in `terraform/` and create a local `terraform.tfvars` from the example:
   - Windows PowerShell: `Copy-Item terraform.tfvars.example terraform.tfvars`
   - macOS/Linux: `cp terraform.tfvars.example terraform.tfvars`
4. Edit `terraform.tfvars` and replace the account ID and token. **Never commit this file or expose your token.**

## 2. Provision the application
From the `terraform/` directory, run these commands in order:

```bash
terraform init
terraform fmt -recursive
terraform validate
terraform plan
terraform apply
```

Review the plan before approving `terraform apply`. The command creates the KV namespace and Worker and binds the Worker to KV. Terraform outputs the Worker name and KV namespace ID. To have Terraform form the public URL, set `workers_dev_subdomain` to your actual Cloudflare `workers.dev` subdomain (not your account ID). Otherwise, copy the URL shown under Workers & Pages in the Cloudflare dashboard and confirm that a `workers.dev` subdomain is enabled.

## 3. Test the application
Open the `application_url` output. Try adding a task, changing its status, editing its title/priority, and deleting it. Tasks are stored in Workers KV.

REST endpoints:
- `GET /api/tasks` — list tasks
- `POST /api/tasks` — create task; JSON body: `{"title":"Submit Project Report","priority":"High","status":"Pending"}`
- `GET /api/tasks/TASK_ID` — get one task
- `PUT /api/tasks/TASK_ID` — update title, priority, and/or status
- `DELETE /api/tasks/TASK_ID` — delete task

## 4. GitHub and CI/CD
1. Create an empty GitHub repository and push this project.
2. In **Settings → Secrets and variables → Actions**, add repository secrets named `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`.
3. Ensure the GitHub Actions workflow has permission to run. Push changes to `main` to trigger the workflow.
4. The workflow runs formatting, init, validate, and plan, then applies on pushes to `main`. For a classroom/production setup, consider requiring environment approval before apply.

## 5. Modify, destroy, and recreate (required demonstration)
Change `environment` or `worker_name` in `terraform.tfvars`, then run:

```bash
terraform plan
terraform apply
terraform show
terraform plan -destroy
terraform destroy
terraform apply
```

`terraform destroy` deletes the Worker and KV namespace managed by this configuration. **All tasks in that KV namespace will be permanently deleted.** Take screenshots of each required step before destroying resources. Do not manually create the Worker or namespace in the dashboard.

## Suggested screenshots for submission
- `terraform --version`
- successful `terraform init`, `terraform validate`, and `terraform plan`
- `terraform apply` output
- Worker and KV namespace visible in Cloudflare dashboard
- application with a created task and CRUD operations demonstrated
- GitHub repository and successful Actions run
- configuration modification plan/apply
- `terraform destroy` and successful recreation

## Notes
- Terraform state contains infrastructure metadata and can contain sensitive values. Keep it private and do not commit state files.
- The example uses local Terraform state. For team use, configure a protected remote backend.
- API tokens are secrets; use local uncommitted `terraform.tfvars` for local work and GitHub Secrets in CI.
