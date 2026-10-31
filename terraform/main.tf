terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "4.52.5"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

variable "cloudflare_api_token" {
  type      = string
  sensitive = true
}

resource "cloudflare_workers_kv_namespace" "tasks_kv" {
  account_id = "30462a702c81b1cb09dc7bf74572ec52"
  title      = "student_tasks"
}