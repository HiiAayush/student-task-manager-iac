variable "cloudflare_account_id" {
  type = string
}

resource "cloudflare_workers_kv_namespace" "tasks_kv" {
  account_id = "30462a702c81b1cb09dc7bf74572ec52"
  title      = "student_tasks"
}