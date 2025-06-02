resource "aws_secretsmanager_secret" "rabbitmq_credentials" {
  name = "rabbitmq-cluster-credentials"
}
resource "random_password" "rabbitmq_admin_password" {
  length  = 16
  special = true
}

resource "random_password" "rabbitmq_monitoring_password" {
  length  = 16
  special = true
}
resource "aws_secretsmanager_secret_version" "rabbitmq_credentials_version" {
  secret_id = aws_secretsmanager_secret.rabbitmq_credentials.id
  secret_string = jsonencode({
    username = var.rabbitmq_username,
    password = random_password.rabbitmq_admin_password.result
  })
}

resource "aws_secretsmanager_secret" "rabbitmq_monitoring_credentials" {
  name = "rabbitmq-cluster-monitoring-credentials"

}

resource "aws_secretsmanager_secret_version" "rabbitmq_monitoring_credentials_version" {
  secret_id = aws_secretsmanager_secret.rabbitmq_monitoring_credentials.id
  secret_string = jsonencode({
    username = var.rabbitmq_monitoring_username,
    password = random_password.rabbitmq_monitoring_password.result
  })
}
