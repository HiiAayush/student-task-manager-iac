terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "cloudflare" {
  account_id = "30462a702c81b1cb09dc7bf74572ec52"
}

resource "cloudflare_workers_kv_namespace" "tasks_kv" {
  title = "student_tasks"
}