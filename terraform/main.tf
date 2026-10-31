terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "cloudflare" {
  # Yeh automatic environment variables (CLOUDFLARE_API_TOKEN) se authenticate ho jayega
}

resource "cloudflare_workers_kv_namespace" "tasks_kv" {
  account_id = "30462a702c81b1cb09dc7bf74572ec52"
  title      = "student_tasks"
}