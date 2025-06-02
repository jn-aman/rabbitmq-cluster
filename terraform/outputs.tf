output "rabbitmq_asg_name" {
  value = aws_autoscaling_group.rabbitmq_asg.name
}

output "rabbitmq_nlb_dns" {
  value = aws_lb.rabbitmq_nlb.dns_name
}
