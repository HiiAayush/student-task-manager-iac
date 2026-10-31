resource "cloudflare_workers_kv_namespace" "tasks_kv" {
  account_id = var.cloudflare_account_id
  title      = var.kv_namespace_name
}

# main.tf se yeh lines remove kar do:
output "kv_namespace_id" {
  value = cloudflare_workers_kv_namespace.student_tasks.id
}