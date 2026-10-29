variable "cloudflare_account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "cloudflare_api_token" {
  description = "Cloudflare API token with Workers Scripts and Workers KV permissions"
  type        = string
  sensitive   = true
}

variable "worker_name" {
  description = "Name of the Cloudflare Worker"
  type        = string
  default     = "student-task-manager-iac"
}

variable "kv_namespace_name" {
  description = "Title for the Workers KV namespace"
  type        = string
  default     = "student_tasks"
}

variable "environment" {
  description = "Deployment environment label"
  type        = string
  default     = "development"
}

variable "workers_dev_subdomain" {
  description = "Your Cloudflare workers.dev subdomain (without .workers.dev); leave blank to look up the URL in the dashboard"
  type        = string
  default     = ""
}
