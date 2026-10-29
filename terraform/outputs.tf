output "kv_namespace_id" {
  value = cloudflare_workers_kv_namespace.tasks_kv.id
}

output "worker_name" {
  value = cloudflare_workers_script.app.name
}