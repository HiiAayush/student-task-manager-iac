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

- name: Terraform Apply
        run: terraform apply -auto-approve -input=false
        working-directory: ./terraform
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          TF_VAR_cloudflare_account_id: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          TF_VAR_cloudflare_api_token: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          TF_LOG: DEBUG  # <--- Yeh line add kar dein taaki fresh run force ho