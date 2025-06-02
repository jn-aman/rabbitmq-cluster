variable "vpc_id" {
  description = "VPC ID where RabbitMQ instances will be deployed"
  type        = string
  default     = "vpc-0a581ebf519d7ea6e"
}

variable "ami_name" {
  default = "rabbitmq-server-3.12.12"
}

variable "instance_type" {
  default = "t3a.medium"
}

variable "min_size" {
  default = 2
}

variable "max_size" {
  default = 5
}

variable "desired_capacity" {
  default = 3
}

variable "disk_size" {
  default = 50
}

variable "rabbitmq_username" {
  default = "default-user"
}

variable "rabbitmq_monitoring_username" {
  default = "monitoring-user"
}

variable "vhost" {
  default = "rabbitmq_vhost"
}
