
terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "4.52.9"
    }
  }
}

variable "cloudflare_api_token" {
  description = "Cloudflare API Token"
  type        = string
  sensitive   = true
}

provider "cloudflare" {
  api_token  = var.cloudflare_api_token
  account_id = "30462a702c81b1cb09dc7bf74572ec52"
}

resource "cloudflare_workers_kv_namespace" "tasks_kv" {
  account_id = "30462a702c81b1cb09dc7bf74572ec52"
  title      = "student_tasks"
}

output "kv_namespace_id" {
  value = cloudflare_workers_kv_namespace.tasks_kv.id
}

output "kv_namespace_title" {
  value = cloudflare_workers_kv_namespace.tasks_kv.title
}
